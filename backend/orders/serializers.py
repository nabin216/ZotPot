from rest_framework import serializers
from django.db import transaction
from .models import Order, OrderItem, OrderTracking, Payment
from users.serializers import UserSerializer, AddressSerializer
from products.serializers import ProductSerializer, ProductVariantSerializer

class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    variant = ProductVariantSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        source='product',
        queryset=Product.objects.all(),
        write_only=True
    )
    variant_id = serializers.PrimaryKeyRelatedField(
        source='variant',
        queryset=ProductVariant.objects.all(),
        write_only=True,
        required=False
    )

    class Meta:
        model = OrderItem
        fields = [
            'id',
            'product',
            'product_id',
            'variant',
            'variant_id',
            'quantity',
            'price',
            'total',
        ]
        read_only_fields = ['price', 'total']

class OrderTrackingSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderTracking
        fields = [
            'id',
            'status',
            'location',
            'description',
            'created_at',
        ]
        read_only_fields = ['created_at']

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            'id',
            'provider',
            'payment_id',
            'amount',
            'status',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']

class OrderSerializer(serializers.ModelSerializer):
    customer = UserSerializer(read_only=True)
    delivery_agent = UserSerializer(read_only=True)
    delivery_address = AddressSerializer(read_only=True)
    items = OrderItemSerializer(many=True, read_only=True)
    tracking_updates = OrderTrackingSerializer(many=True, read_only=True)
    payments = PaymentSerializer(many=True, read_only=True)

    # Write-only fields
    delivery_address_id = serializers.PrimaryKeyRelatedField(
        source='delivery_address',
        queryset=Address.objects.all(),
        write_only=True
    )
    order_items = OrderItemSerializer(many=True, write_only=True)

    class Meta:
        model = Order
        fields = [
            'id',
            'customer',
            'delivery_agent',
            'status',
            'payment_status',
            'delivery_address',
            'delivery_address_id',
            'subtotal',
            'delivery_fee',
            'total',
            'notes',
            'estimated_delivery_time',
            'items',
            'order_items',
            'tracking_updates',
            'payments',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'customer',
            'delivery_agent',
            'status',
            'payment_status',
            'subtotal',
            'total',
            'created_at',
            'updated_at',
        ]

    @transaction.atomic
    def create(self, validated_data):
        order_items = validated_data.pop('order_items')
        delivery_fee = validated_data.get('delivery_fee', 40.00)  # Default delivery fee
        
        # Create order
        order = Order.objects.create(
            customer=self.context['request'].user,
            delivery_fee=delivery_fee,
            subtotal=0,  # Will be calculated after adding items
            total=0,  # Will be calculated after adding items
            **validated_data
        )

        # Create order items
        for item_data in order_items:
            OrderItem.objects.create(order=order, **item_data)

        # The total will be calculated automatically through the OrderItem save method
        return order

class OrderStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['status']

    def update(self, instance, validated_data):
        old_status = instance.status
        new_status = validated_data.get('status')
        
        if old_status != new_status:
            # Create tracking update
            OrderTracking.objects.create(
                order=instance,
                status=new_status,
                description=f"Order status changed from {old_status} to {new_status}"
            )
        
        return super().update(instance, validated_data) 