# store/serializers.py
from rest_framework import serializers
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

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ('id', 'image_url', 'is_primary')


class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = ('id', 'name', 'additional_price', 'stock')


class ProductReviewSerializer(serializers.ModelSerializer):
    user_email = serializers.ReadOnlyField(source='user.email')

    class Meta:
        model = ProductReview
        fields = ('id', 'user_email', 'rating', 'title', 'comment', 'is_verified_purchase', 'created_at')
        read_only_fields = ('user_email', 'is_verified_purchase', 'created_at')


class ProductSerializer(serializers.ModelSerializer):
    vendor_name = serializers.ReadOnlyField(source='vendor.store_name')
    vendor_user_id = serializers.ReadOnlyField(source='vendor.user.id')  
    category_name = serializers.ReadOnlyField(source='category.name')
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = (
            'id',
            'name',
            'slug',
            'vendor',
            'vendor_name',
            'vendor_user_id',       
            'category',
            'category_name',
            'brand',
            'sku',
            'base_price',
            'discount_price',
            'effective_price',
            'stock',
            'description',
            'images',
            'variants',
            'average_rating',
            'created_at',
        )
        read_only_fields = ('id', 'slug', 'effective_price', 'average_rating', 'created_at')

class VendorProfileSerializer(serializers.ModelSerializer):
    user_email = serializers.ReadOnlyField(source='user.email')

    class Meta:
        model = VendorProfile
        fields = (
            'id', 'user_email', 'store_name', 'slug', 'description',
            'business_email', 'phone_number', 'address', 'is_approved',
            'commission_percentage', 'created_at'
        )
        read_only_fields = ('is_approved', 'commission_percentage', 'created_at')


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    variant_name = serializers.ReadOnlyField(source='variant.name')

    class Meta:
        model = OrderItem
        fields = ('id', 'product', 'product_name', 'variant', 'variant_name', 'unit_price', 'quantity')


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user_email = serializers.ReadOnlyField(source='user.email')

    class Meta:
        model = Order
        fields = (
            'id', 'user_email', 'total_amount', 'status',
            'shipping_full_name', 'shipping_phone', 'shipping_address',
            'shipping_city', 'shipping_pincode', 'tracking_carrier',
            'tracking_number', 'items', 'created_at'
        )
        read_only_fields = ('total_amount', 'status', 'created_at')


class ComplaintTicketSerializer(serializers.ModelSerializer):
    user_email = serializers.ReadOnlyField(source='user.email')

    class Meta:
        model = ComplaintTicket
        fields = (
            'id', 'user_email', 'order', 'product', 'ticket_type',
            'subject', 'description', 'status', 'admin_response', 'created_at'
        )
        read_only_fields = ('user_email', 'status', 'admin_response', 'created_at')


# store/serializers.py
class VendorOrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    variant_name = serializers.ReadOnlyField(source='variant.name')
    order_id = serializers.ReadOnlyField(source='order.id')
    customer_email = serializers.ReadOnlyField(source='order.user.email')
    shipping_full_name = serializers.ReadOnlyField(source='order.shipping_full_name')
    shipping_phone = serializers.ReadOnlyField(source='order.shipping_phone')
    shipping_address = serializers.ReadOnlyField(source='order.shipping_address')
    shipping_city = serializers.ReadOnlyField(source='order.shipping_city')
    shipping_pincode = serializers.ReadOnlyField(source='order.shipping_pincode')
    order_created_at = serializers.ReadOnlyField(source='order.created_at')
    order_status = serializers.ReadOnlyField(source='order.status')

    class Meta:
        model = OrderItem
        fields = (
            'id',
            'order_id',
            'order_status',
            'order_created_at',
            'customer_email',
            'shipping_full_name',
            'shipping_phone',
            'shipping_address',
            'shipping_city',
            'shipping_pincode',
            'product',
            'product_name',
            'variant',
            'variant_name',
            'unit_price',
            'quantity',
        )
        read_only_fields = fields