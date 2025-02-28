from django.urls import path, include
from rest_framework_nested import routers
from .views import (
    CategoryViewSet,
    ProductViewSet,
    ProductVariantViewSet,
    ProductImageViewSet,
)

router = routers.DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'products', ProductViewSet)

# Nested routes for product variants and images
products_router = routers.NestedDefaultRouter(router, r'products', lookup='product')
products_router.register(r'variants', ProductVariantViewSet, basename='product-variants')
products_router.register(r'images', ProductImageViewSet, basename='product-images')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(products_router.urls)),
] 