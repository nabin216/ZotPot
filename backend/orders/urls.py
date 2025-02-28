from django.urls import path, include
from rest_framework_nested import routers
from .views import (
    OrderViewSet,
    OrderItemViewSet,
    OrderTrackingViewSet,
    PaymentViewSet,
)

router = routers.DefaultRouter()
router.register(r'orders', OrderViewSet, basename='order')

# Nested routes for order items, tracking, and payments
orders_router = routers.NestedDefaultRouter(router, r'orders', lookup='order')
orders_router.register(r'items', OrderItemViewSet, basename='order-items')
orders_router.register(r'tracking', OrderTrackingViewSet, basename='order-tracking')
orders_router.register(r'payments', PaymentViewSet, basename='order-payments')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(orders_router.urls)),
] 