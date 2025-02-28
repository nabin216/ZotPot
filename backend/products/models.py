from django.db import models
from django.utils.translation import gettext_lazy as _

class Category(models.Model):
    name = models.CharField(_('name'), max_length=100)
    description = models.TextField(_('description'), blank=True)
    image = models.ImageField(
        _('image'),
        upload_to='categories/',
        null=True,
        blank=True
    )
    is_active = models.BooleanField(_('active'), default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('category')
        verbose_name_plural = _('categories')
        ordering = ['name']

    def __str__(self):
        return self.name

class Product(models.Model):
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name='products'
    )
    name = models.CharField(_('name'), max_length=255)
    description = models.TextField(_('description'))
    price = models.DecimalField(
        _('price'),
        max_digits=10,
        decimal_places=2
    )
    image = models.ImageField(
        _('image'),
        upload_to='products/'
    )
    stock = models.PositiveIntegerField(_('stock'), default=0)
    is_available = models.BooleanField(_('available'), default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('product')
        verbose_name_plural = _('products')
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    @property
    def is_in_stock(self):
        return self.stock > 0

class ProductVariant(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='variants'
    )
    name = models.CharField(_('name'), max_length=100)
    price_adjustment = models.DecimalField(
        _('price adjustment'),
        max_digits=10,
        decimal_places=2,
        default=0
    )
    stock = models.PositiveIntegerField(_('stock'), default=0)
    is_available = models.BooleanField(_('available'), default=True)

    class Meta:
        verbose_name = _('product variant')
        verbose_name_plural = _('product variants')

    def __str__(self):
        return f"{self.product.name} - {self.name}"

    @property
    def final_price(self):
        return self.product.price + self.price_adjustment

class ProductImage(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='additional_images'
    )
    image = models.ImageField(_('image'), upload_to='products/')
    is_primary = models.BooleanField(_('primary'), default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('product image')
        verbose_name_plural = _('product images')
        ordering = ['-is_primary', '-created_at']

    def __str__(self):
        return f"{self.product.name} - Image"

    def save(self, *args, **kwargs):
        if self.is_primary:
            # Set all other images of this product as non-primary
            ProductImage.objects.filter(product=self.product).update(is_primary=False)
        super().save(*args, **kwargs) 