from django.db import models

# Create your models here.

from django.db import models
from django.conf import settings
from decimal import Decimal


User = settings.AUTH_USER_MODEL

class Category(models.Model):
    name = models.CharField(max_length=120, unique=True)
    slug = models.SlugField(max_length=140, unique=True)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name_plural = 'Categories'

    def __str__(self):
        return self.name


class Product(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='product')
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_products')
    name = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - ₹{self.price}"



class MentorProfile(models.Model):
    mentor = models.OneToOneField(User, on_delete=models.CASCADE, related_name='mentor_profile')
    title = models.CharField(max_length=150, help_text='e.g. Senior Full-Stack Architect')
    bio = models.TextField()
    hourly_rate = models.DecimalField(max_digits=8, decimal_places=2, default=Decimal('500.00'))
    is_approved = models.BooleanField(default=False)

    def __str__(self):
        return f"Mentor : {self.mentor.email} ({self.title})"


class MentorshipSlot(models.Model):
    mentor = models.ForeignKey(MentorProfile, on_delete=models.CASCADE, related_name='slots')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    is_booked = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.mentor.mentor.email} | {self.start_time.strftime('%Y-%m-%d %H:%M')}"


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'pending'
        PAID = 'PAID', 'paid'
        FAILED = 'FAILED', 'failed'
        REFUNDED = 'REFUNDED', 'refunded'

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)

    #Razorpay GAteway Tracking
    razorpay_order_id = models.CharField(max_length=100, blank=True, null=True)
    razorpay_payment_id = models.CharField(max_length=100, blank=True, null=True)
    razorpay_signature = models.CharField(max_length=225, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order #{self.id} by {self.user.email} - {self.status}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True)
    mentorship_slot = models.ForeignKey(MentorshipSlot, on_delete=models.SET_NULL, null=True, blank=True)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        item_name = self.product.name if self.product else f"Slot #{self.mentorship_slot_id}"
        return f"{self.quantity}x {item_name} @ ₹{self.unit_price}"