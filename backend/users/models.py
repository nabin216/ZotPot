from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    class Role(models.TextChoices):
        CUSTOMER = 'customer', _('Customer')
        DELIVERY_AGENT = 'delivery_agent', _('Delivery Agent')
        ADMIN = 'admin', _('Admin')

    email = models.EmailField(_('email address'), unique=True)
    phone = models.CharField(_('phone number'), max_length=15, blank=True)
    role = models.CharField(
        _('role'),
        max_length=20,
        choices=Role.choices,
        default=Role.CUSTOMER,
    )
    avatar = models.ImageField(
        _('avatar'),
        upload_to='avatars/',
        null=True,
        blank=True
    )
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')

    def __str__(self):
        return self.email

class DeliveryAgent(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='delivery_profile'
    )
    vehicle_number = models.CharField(max_length=20)
    vehicle_type = models.CharField(max_length=50)
    license_number = models.CharField(max_length=20)
    is_available = models.BooleanField(default=True)
    current_location = models.JSONField(null=True, blank=True)
    rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0.00
    )
    total_deliveries = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.vehicle_number}"

class Address(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='addresses'
    )
    title = models.CharField(max_length=100)  # e.g., "Home", "Office"
    address_line1 = models.CharField(max_length=255)
    address_line2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=10)
    country = models.CharField(max_length=100, default='India')
    is_default = models.BooleanField(default=False)
    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True
    )
    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True
    )

    class Meta:
        verbose_name = _('address')
        verbose_name_plural = _('addresses')

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.title}"

    def save(self, *args, **kwargs):
        if self.is_default:
            # Set all other addresses of the user as non-default
            Address.objects.filter(user=self.user).update(is_default=False)
        super().save(*args, **kwargs) 