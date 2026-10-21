# store/models.py
from django.db.models import Avg
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db import models
from django.conf import settings
from decimal import Decimal
from django.core.validators import MinValueValidator, MaxValueValidator

User = settings.AUTH_USER_MODEL

class Category(models.Model):
    name = models.CharField(max_length=120, unique=True)
    slug = models.SlugField(max_length=140, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True, help_text="Lucide icon name e.g. Smartphone, Shirt, Watch")

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name


class VendorProfile(models.Model):
    """Business profile created when a user registers as or applies to be a Vendor."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='vendor_profile')
    store_name = models.CharField(max_length=200, unique=True)
    slug = models.SlugField(max_length=220, unique=True)
    description = models.TextField(blank=True)
    business_email = models.EmailField()
    phone_number = models.CharField(max_length=20)
    address = models.TextField()
    is_approved = models.BooleanField(default=False, help_text="Admin must approve vendor before products go live")
    commission_percentage = models.DecimalField(max_digits=4, decimal_places=2, default=Decimal('10.00'))
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.store_name} ({'Approved' if self.is_approved else 'Pending'})"


class Product(models.Model):
    """Universal product model for any retail category."""
    vendor = models.ForeignKey(VendorProfile, on_delete=models.CASCADE, related_name='products')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=270, unique=True)
    brand = models.CharField(max_length=100, blank=True)
    description = models.TextField()
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    stock = models.PositiveIntegerField(default=0, help_text="Default inventory if no variants are used")
    sku = models.CharField(max_length=60, unique=True, help_text="Stock Keeping Unit")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # THE REAL DATABASE FIELD:
    average_rating = models.DecimalField(max_digits=3, decimal_places=1, default=0.0)
    
    @property
    def effective_price(self):
        return self.discount_price if self.discount_price else self.base_price

    # NOTICE: The @property def average_rating(self) HAS BEEN DELETED!

    def __str__(self):
        return f"{self.name} - ₹{self.effective_price}"


class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image_url = models.URLField(help_text="Direct URL to Cloudinary, S3, or media URL")
    is_primary = models.BooleanField(default=False)

    def __str__(self):
        return f"Image for {self.product.name}"


class ProductVariant(models.Model):
    """
    Handles specific variations:
    - Shoes: Size (UK 8, UK 9, UK 10)
    - T-Shirts: Size (S, M, L, XL), Color (Black, Navy)
    - Phones: Storage (128GB, 256GB), Color
    """
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    name = models.CharField(max_length=100, help_text="e.g. Size UK 9 / Black 128GB")
    additional_price = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    stock = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.product.name} ({self.name})"


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Payment Pending'
        PAID = 'PAID', 'Payment Received / Confirmed'
        CANCELLED = 'CANCELLED', 'Cancelled'

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=25, choices=Status.choices, default=Status.PENDING)
    
    # Shipping & Delivery details
    shipping_full_name = models.CharField(max_length=200)
    shipping_phone = models.CharField(max_length=20)
    shipping_address = models.TextField()
    shipping_city = models.CharField(max_length=100)
    shipping_pincode = models.CharField(max_length=15)

    # Razorpay attributes
    razorpay_order_id = models.CharField(max_length=100, blank=True, null=True)
    razorpay_payment_id = models.CharField(max_length=100, blank=True, null=True)
    razorpay_signature = models.CharField(max_length=255, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order #{self.id} by {self.user.email} - {self.status}"


class OrderItem(models.Model):
    class FulfillmentStatus(models.TextChoices):
        CONFIRMED = 'CONFIRMED', 'Order Confirmed'
        PROCESSING = 'PROCESSING', 'Processing by Vendor'
        SHIPPED = 'SHIPPED', 'Handed over to Courier'
        OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY', 'Out for Delivery'
        DELIVERED = 'DELIVERED', 'Delivered'
        CANCELLED = 'CANCELLED', 'Cancelled'

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    variant = models.ForeignKey(ProductVariant, on_delete=models.SET_NULL, null=True, blank=True)
    vendor = models.ForeignKey(VendorProfile, on_delete=models.SET_NULL, null=True, related_name='sold_items')
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)

    # INDIVIDUAL PRODUCT FULFILLMENT TRACKING
    status = models.CharField(
        max_length=25, 
        choices=FulfillmentStatus.choices, 
        default=FulfillmentStatus.CONFIRMED
    )
    tracking_carrier = models.CharField(max_length=100, blank=True, default='')
    tracking_number = models.CharField(max_length=100, blank=True, default='')
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        title = self.product.name if self.product else "Deleted Product"
        return f"{self.quantity}x {title} ({self.status}) @ ₹{self.unit_price}"


class ProductReview(models.Model):
    """Old Customer ratings and reviews (Kept to prevent migration errors)."""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='old_reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='old_reviews')
    rating = models.PositiveSmallIntegerField(choices=[(i, i) for i in range(1, 6)])
    title = models.CharField(max_length=150, blank=True)
    comment = models.TextField()
    is_verified_purchase = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('product', 'user')

    def __str__(self):
        return f"{self.rating}★ by {self.user.email} for {self.product.name}"


class ComplaintTicket(models.Model):
    """Customer complaints and suggestions handled by Administrator."""
    class TicketType(models.TextChoices):
        COMPLAINT = 'COMPLAINT', 'Complaint'
        SUGGESTION = 'SUGGESTION', 'Suggestion'
        RETURN_REQUEST = 'RETURN_REQUEST', 'Return/Refund Request'
        DAMAGED_ITEM = 'DAMAGED_ITEM', 'Defective or Damaged Product'

    class Status(models.TextChoices):
        OPEN = 'OPEN', 'Open'
        UNDER_REVIEW = 'UNDER_REVIEW', 'Under Review'
        RESOLVED = 'RESOLVED', 'Resolved'
        CLOSED = 'CLOSED', 'Closed'

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='complaints')
    order = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True, blank=True, related_name='complaints')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True)
    ticket_type = models.CharField(max_length=25, choices=TicketType.choices, default=TicketType.COMPLAINT)
    subject = models.CharField(max_length=255)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
    admin_response = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Ticket #{self.id}: {self.subject} ({self.status})"


class Review(models.Model):
    """The active Review model."""
    product = models.ForeignKey('Product', on_delete=models.CASCADE, related_name='customer_reviews')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    rating = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.first_name} - {self.product.name} ({self.rating} Stars)"


@receiver(post_save, sender=Review)
@receiver(post_delete, sender=Review)
def update_product_rating(sender, instance, **kwargs):
    """
    This function automatically runs every time a Review is created, 
    updated, or deleted.
    """
    product = instance.product
    
    # Calculate the average of all ratings for this specific product
    avg_rating = product.customer_reviews.aggregate(Avg('rating'))['rating__avg']
    
    if avg_rating is None:
        product.average_rating = 0.0
    else:
        product.average_rating = round(avg_rating, 1)
        
    product.save(update_fields=['average_rating'])