from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import get_user_model
from .models import DeliveryAgent, Address
from .serializers import (
    UserSerializer,
    UserRegistrationSerializer,
    DeliveryAgentRegistrationSerializer,
    AddressSerializer,
    PasswordChangeSerializer,
)

User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'register_delivery_agent']:
            return [AllowAny()]
        return super().get_permissions()

    def get_serializer_class(self):
        if self.action == 'create':
            return UserRegistrationSerializer
        elif self.action == 'register_delivery_agent':
            return DeliveryAgentRegistrationSerializer
        elif self.action == 'change_password':
            return PasswordChangeSerializer
        return self.serializer_class

    @action(detail=False, methods=['post'])
    def register_delivery_agent(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        delivery_agent = serializer.save()
        return Response(
            UserSerializer(delivery_agent.user).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def change_password(self, request):
        user = request.user
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if not user.check_password(serializer.validated_data['old_password']):
            return Response(
                {'error': 'Wrong password'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({'status': 'password changed'})

class AddressViewSet(viewsets.ModelViewSet):
    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class DeliveryAgentViewSet(viewsets.ModelViewSet):
    queryset = DeliveryAgent.objects.all()
    serializer_class = DeliveryAgentSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['patch'])
    def update_location(self, request):
        agent = request.user.delivery_profile
        agent.current_location = request.data.get('location')
        agent.save()
        return Response(self.get_serializer(agent).data)

    @action(detail=False, methods=['patch'])
    def toggle_availability(self, request):
        agent = request.user.delivery_profile
        agent.is_available = not agent.is_available
        agent.save()
        return Response(self.get_serializer(agent).data) 