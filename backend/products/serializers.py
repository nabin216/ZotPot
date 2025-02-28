from rest_framework import serializers
from .models import Category, Product, ProductVariant, ProductImage

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'is_primary', 'created_at']

class ProductVariantSerializer(serializers.ModelSerializer):
    final_price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    class Meta:
        model = ProductVariant
        fields = [
            'id',
            'name',
            'price_adjustment',
            'stock',
            'is_available',
            'final_price',
        ]

class ProductSerializer(serializers.ModelSerializer):
    variants = ProductVariantSerializer(many=True, read_only=True)
    additional_images = ProductImageSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    is_in_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id',
            'category',
            'category_name',
            'name',
            'description',
            'price',
            'image',
            'stock',
            'is_available',
            'is_in_stock',
            'variants',
            'additional_images',
            'created_at',
            'updated_at',
        ]

class CategorySerializer(serializers.ModelSerializer):
    products_count = serializers.IntegerField(
        source='products.count',
        read_only=True
    )

    class Meta:
        model = Category
        fields = [
            'id',
            'name',
            'description',
            'image',
            'is_active',
            'products_count',
            'created_at',
            'updated_at',
        ]

class CategoryDetailSerializer(CategorySerializer):
    products = ProductSerializer(many=True, read_only=True)

    class Meta(CategorySerializer.Meta):
        fields = CategorySerializer.Meta.fields + ['products'] 