from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, AddressViewSet, DeliveryAgentViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'addresses', AddressViewSet, basename='address')
router.register(r'delivery-agents', DeliveryAgentViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 