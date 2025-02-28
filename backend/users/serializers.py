from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import DeliveryAgent, Address

User = get_user_model()

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = '__all__'
        read_only_fields = ('user',)

class DeliveryAgentSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryAgent
        fields = '__all__'
        read_only_fields = ('user', 'rating', 'total_deliveries')

class UserSerializer(serializers.ModelSerializer):
    addresses = AddressSerializer(many=True, read_only=True)
    delivery_profile = DeliveryAgentSerializer(read_only=True)
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = (
            'id',
            'email',
            'username',
            'first_name',
            'last_name',
            'phone',
            'role',
            'avatar',
            'password',
            'addresses',
            'delivery_profile',
            'date_joined',
            'is_active',
        )
        read_only_fields = ('id', 'date_joined', 'is_active')

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = super().create(validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    password_confirm = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = (
            'email',
            'username',
            'password',
            'password_confirm',
            'first_name',
            'last_name',
            'phone',
            'role',
        )

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Passwords do not match")
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        return User.objects.create_user(**validated_data)

class DeliveryAgentRegistrationSerializer(serializers.Serializer):
    user = UserRegistrationSerializer()
    vehicle_number = serializers.CharField(max_length=20)
    vehicle_type = serializers.CharField(max_length=50)
    license_number = serializers.CharField(max_length=20)

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user_data['role'] = User.Role.DELIVERY_AGENT
        user = User.objects.create_user(**user_data)
        delivery_agent = DeliveryAgent.objects.create(user=user, **validated_data)
        return delivery_agent

class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    new_password_confirm = serializers.CharField(required=True)

    def validate(self, data):
        if data['new_password'] != data['new_password_confirm']:
            raise serializers.ValidationError("New passwords do not match")
        return data 