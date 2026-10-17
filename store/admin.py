# store/admin.py
from django.contrib import admin
from .models import Category, Product, MentorProfile, MentorshipSlot, Order, OrderItem

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product', 'mentorship_slot', 'unit_price', 'quantity')


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'total_amount', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('user__email', 'razorpay_order_id')
    inlines = [OrderItemInline]


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'stock', 'is_active', 'creator')
    list_filter = ('is_active', 'category')
    search_fields = ('name', 'description')


@admin.register(MentorProfile)
class MentorProfileAdmin(admin.ModelAdmin):
    list_display = ('mentor', 'title', 'hourly_rate', 'is_approved')
    list_filter = ('is_approved',)
    actions = ['approve_mentors']

    def approve_mentors(self, request, queryset):
        queryset.update(is_approved=True)
    approve_mentors.short_description = "Approve selected mentor profiles"


admin.site.register(Category)
admin.site.register(MentorshipSlot)