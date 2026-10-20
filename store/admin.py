# store/admin.py
from django.contrib import admin
from .models import (
    Category,
    VendorProfile,
    Product,
    ProductImage,
    ProductVariant,
    Order,
    OrderItem,
    ProductReview,
    ComplaintTicket,
)

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1

class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'vendor', 'category', 'base_price', 'discount_price', 'stock', 'is_active')
    list_filter = ('category', 'is_active', 'vendor')
    search_fields = ('name', 'sku', 'brand')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductImageInline, ProductVariantInline]

@admin.register(VendorProfile)
class VendorProfileAdmin(admin.ModelAdmin):
    list_display = ('store_name', 'user', 'business_email', 'phone_number', 'is_approved', 'created_at')
    list_filter = ('is_approved',)
    search_fields = ('store_name', 'business_email', 'user__email')
    actions = ['approve_vendors', 'reject_vendors']

    def approve_vendors(self, request, queryset):
        queryset.update(is_approved=True)
    approve_vendors.short_description = "Approve selected vendors"

    def reject_vendors(self, request, queryset):
        queryset.update(is_approved=False)
    reject_vendors.short_description = "Reject/Revoke selected vendors"

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product', 'variant', 'vendor', 'unit_price', 'quantity')

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'total_amount', 'status', 'shipping_city', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('id', 'user__email', 'razorpay_order_id', 'shipping_phone')
    inlines = [OrderItemInline]

@admin.register(ComplaintTicket)
class ComplaintTicketAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'ticket_type', 'subject', 'status', 'created_at')
    list_filter = ('status', 'ticket_type')
    search_fields = ('subject', 'description', 'user__email')

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}

admin.site.register(ProductReview)