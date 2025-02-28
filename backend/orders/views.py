from rest_framework import viewsets, status, mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from django.utils import timezone
from .models import Order, OrderItem, OrderTracking, Payment
from .serializers import (
    OrderSerializer,
    OrderItemSerializer,
    OrderTrackingSerializer,
    PaymentSerializer,
    OrderStatusUpdateSerializer,
)
from users.models import DeliveryAgent

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'customer':
            return Order.objects.filter(customer=user)
        elif user.role == 'delivery_agent':
            return Order.objects.filter(delivery_agent=user)
        return Order.objects.all()  # For admin users

    def get_serializer_class(self):
        if self.action == 'update_status':
            return OrderStatusUpdateSerializer
        return self.serializer_class

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        order = self.get_object()
        serializer = self.get_serializer(order, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(OrderSerializer(order).data)

    @action(detail=True, methods=['post'])
    def assign_delivery_agent(self, request, pk=None):
        order = self.get_object()
        
        # Find available delivery agent
        available_agent = DeliveryAgent.objects.filter(
            is_available=True
        ).order_by('total_deliveries').first()

        if not available_agent:
            return Response(
                {'error': 'No delivery agents available'},
                status=status.HTTP_400_BAD_REQUEST
            )

        order.delivery_agent = available_agent.user
        order.status = Order.Status.CONFIRMED
        order.save()

        # Create tracking update
        OrderTracking.objects.create(
            order=order,
            status=order.status,
            description=f"Order assigned to {available_agent.user.get_full_name()}"
        )

        # Update delivery agent status
        available_agent.is_available = False
        available_agent.total_deliveries += 1
        available_agent.save()

        return Response(OrderSerializer(order).data)

    @action(detail=True, methods=['post'])
    def update_location(self, request, pk=None):
        order = self.get_object()
        location = request.data.get('location')

        if not location:
            return Response(
                {'error': 'Location data is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create tracking update with location
        OrderTracking.objects.create(
            order=order,
            status=order.status,
            location=location,
            description="Location updated"
        )

        return Response({'status': 'location updated'})

class OrderItemViewSet(mixins.RetrieveModelMixin,
                      mixins.UpdateModelMixin,
                      mixins.DestroyModelMixin,
                      viewsets.GenericViewSet):
    serializer_class = OrderItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return OrderItem.objects.filter(
            order_id=self.kwargs['order_pk'],
            order__customer=self.request.user
        )

class OrderTrackingViewSet(mixins.ListModelMixin,
                          mixins.RetrieveModelMixin,
                          viewsets.GenericViewSet):
    serializer_class = OrderTrackingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return OrderTracking.objects.filter(
            order_id=self.kwargs['order_pk']
        ).select_related('order')

class PaymentViewSet(mixins.ListModelMixin,
                    mixins.RetrieveModelMixin,
                    mixins.CreateModelMixin,
                    viewsets.GenericViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Payment.objects.filter(
            order_id=self.kwargs['order_pk'],
            order__customer=self.request.user
        )

    def perform_create(self, serializer):
        order = Order.objects.get(id=self.kwargs['order_pk'])
        serializer.save(order=order)

        # Update order payment status
        order.payment_status = Order.PaymentStatus.PAID
        order.save()

        # Create tracking update
        OrderTracking.objects.create(
            order=order,
            status=order.status,
            description="Payment completed"
        ) 