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
    Review,
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
    primary_image = serializers.SerializerMethodField()
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
            'is_active',
            'primary_image',
            'variants',
            'average_rating',
            'created_at',
        )
        read_only_fields = (
            'id',
            'vendor',
            'slug',
            'effective_price',
            'average_rating',
            'created_at',
        )

    def get_primary_image(self, obj):
        if hasattr(obj, 'images'):
            primary = obj.images.filter(is_primary=True).first() or obj.images.first()
            if primary:
                return primary.image_url
        return None


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
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_image = serializers.SerializerMethodField()
    variant_name = serializers.CharField(source='variant.name', read_only=True, default="")
    vendor_store = serializers.CharField(source='vendor.store_name', read_only=True, default="")
    order_created_at = serializers.DateTimeField(source='order.created_at', read_only=True)
    order_id = serializers.IntegerField(source='order.id', read_only=True)
    user_review = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ['id', 'order_id', 'product', 'product_name', 'product_image', 'variant', 'variant_name', 
                  'vendor', 'vendor_store', 'unit_price', 'quantity', 'status', 'tracking_carrier', 
                  'tracking_number', 'order_created_at', 'user_review']

    def get_product_image(self, obj):
        if obj.product:
            primary_image = obj.product.images.filter(is_primary=True).first()
            if primary_image:
                return primary_image.image_url
        return None

    def get_user_review(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and obj.product:
            review = Review.objects.filter(product=obj.product, user=request.user).first()
            if review:
                return {
                    "rating": review.rating,
                    "comment": review.comment
                }
        return None


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user_email = serializers.ReadOnlyField(source='user.email')

    class Meta:
        model = Order
        fields = (
            'id', 'user_email', 'total_amount', 'status',
            'shipping_full_name', 'shipping_phone', 'shipping_address',
            'shipping_city', 'shipping_pincode', 'items', 'created_at'
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


class CustomerOrderItemSerializer(serializers.ModelSerializer):
    order_id = serializers.ReadOnlyField(source='order.id')
    order_created_at = serializers.ReadOnlyField(source='order.created_at')
    product_name = serializers.ReadOnlyField(source='product.name')
    variant_name = serializers.ReadOnlyField(source='variant.name')
    vendor_store = serializers.ReadOnlyField(source='vendor.store_name')
    product_image = serializers.SerializerMethodField()
    total_price = serializers.SerializerMethodField()
    
    # NEW: Fetch user review
    user_review = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = (
            'id',
            'order_id',
            'order_created_at',
            'product',
            'product_name',
            'product_image',
            'variant_name',
            'vendor_store',
            'unit_price',
            'quantity',
            'total_price',
            'status',
            'tracking_carrier',
            'tracking_number',
            'updated_at',
            'user_review', # ADDED HERE
        )

    def get_product_image(self, obj):
        if obj.product:
            primary_img = obj.product.images.filter(is_primary=True).first() or obj.product.images.first()
            if primary_img:
                return primary_img.image_url
        return None

    def get_total_price(self, obj):
        return str(obj.unit_price * obj.quantity)

    # NEW: Logic to fetch review
    def get_user_review(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and obj.product:
            review = Review.objects.filter(product=obj.product, user=request.user).first()
            if review:
                return {
                    "rating": review.rating,
                    "comment": review.comment
                }
        return None


class VendorOrderItemSerializer(serializers.ModelSerializer):
    order_id = serializers.ReadOnlyField(source='order.id')
    order_created_at = serializers.ReadOnlyField(source='order.created_at')
    customer_email = serializers.ReadOnlyField(source='order.user.email')
    shipping_full_name = serializers.ReadOnlyField(source='order.shipping_full_name')
    shipping_phone = serializers.ReadOnlyField(source='order.shipping_phone')
    shipping_address = serializers.ReadOnlyField(source='order.shipping_address')
    shipping_city = serializers.ReadOnlyField(source='order.shipping_city')
    shipping_pincode = serializers.ReadOnlyField(source='order.shipping_pincode')
    product_name = serializers.ReadOnlyField(source='product.name')
    variant_name = serializers.ReadOnlyField(source='variant.name')
    product_image = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = (
            'id',
            'order_id',
            'order_created_at',
            'customer_email',
            'shipping_full_name',
            'shipping_phone',
            'shipping_address',
            'shipping_city',
            'shipping_pincode',
            'product',
            'product_name',
            'product_image',
            'variant_name',
            'unit_price',
            'quantity',
            'status',
            'tracking_carrier',
            'tracking_number',
        )

    def get_product_image(self, obj):
        if obj.product:
            primary_img = obj.product.images.filter(is_primary=True).first() or obj.product.images.first()
            if primary_img:
                return primary_img.image_url
        return None


class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.first_name', read_only=True)
    
    class Meta:
        model = Review
        fields = ['id', 'user_name', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'created_at']



class AdminVendorSerializer(serializers.ModelSerializer):
    # Pulls the email from the related User model
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = VendorProfile
        fields = ['id', 'user_email', 'store_name', 'is_approved', 'phone_number', 'address']



class AdminComplaintSerializer(serializers.ModelSerializer):
    customer_email = serializers.EmailField(source='order.customer.email', read_only=True)
    order_ref = serializers.CharField(source='order.order_id', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    
    class Meta:
        model = ComplaintTicket # Replace with your actual model name
        fields = [
            'id', 'customer_email', 'order_ref', 'product_name', 
            'ticket_type', 'subject', 'description', 'status', 'created_at'
        ]



class AdminProductSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source='vendor.store_name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    image_url = serializers.SerializerMethodField() 
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'vendor_name', 'category_name', 
            'base_price', 'stock', 'is_active', 'created_at', 'image_url'
        ]

    # Moved this method up so it belongs to AdminProductSerializer
    def get_image_url(self, obj):
        image = obj.images.filter(is_primary=True).first() or obj.images.first()
        return image.image_url if image else None


from django.contrib.auth import get_user_model

User = get_user_model()

class AdminUserSerializer(serializers.ModelSerializer):
    # Tell Django we are going to calculate the role dynamically
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'is_active', 'date_joined', 'role']

    def get_role(self, obj):
        # 1. If they have staff/superuser permissions, they are an ADMIN
        if obj.is_superuser or obj.is_staff:
            return 'ADMIN'
            
        # 2. Check if they have a VendorProfile linked to their account
        # (This uses the 'related_name' from your VendorProfile model)
        if hasattr(obj, 'vendor_profile'):
            return 'VENDOR'
            
        # 3. If neither, they are a standard CUSTOMER
        return 'CUSTOMER'


class AdminCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'icon', 'is_active']


class AdminOrderSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    first_item_image = serializers.SerializerMethodField()
    first_item_name = serializers.SerializerMethodField()
    item_count = serializers.SerializerMethodField()
    fulfillment_status = serializers.SerializerMethodField() # NEW

    class Meta:
        model = Order
        fields = [
            'id', 'user_email', 'total_amount', 'status', 'created_at', 
            'first_item_image', 'first_item_name', 'item_count', 'fulfillment_status'
        ]

    # Fetch the delivery status of the first item in the order
    def get_fulfillment_status(self, obj):
        first_item = obj.items.first()
        return first_item.status if first_item else 'CONFIRMED'

    def get_first_item_image(self, obj):
        first_item = obj.items.first()
        if first_item and first_item.product:
            image = first_item.product.images.filter(is_primary=True).first() or first_item.product.images.first()
            return image.image_url if image else None
        return None

    def get_first_item_name(self, obj):
        first_item = obj.items.first()
        return first_item.product.name if first_item and first_item.product else "Unknown Item"
        
    def get_item_count(self, obj):
        return obj.items.count()

class AdminReviewSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    
    class Meta:
        model = Review
        fields = ['id', 'user_email', 'product_name', 'rating', 'comment', 'created_at', 'is_hidden']



class VendorStudioProductSerializer(serializers.ModelSerializer):
    primary_image = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'base_price', 'stock', 'is_active', 'primary_image', 'category', 'category_name']

    def get_primary_image(self, obj):
        image = obj.images.filter(is_primary=True).first() or obj.images.first()
        return image.image_url if image else None

class VendorStudioOrderSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    created_at = serializers.DateTimeField(source='order.created_at', read_only=True)
    user_email = serializers.CharField(source='order.user.email', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product_id', 'product_name', 'quantity', 'unit_price', 'status', 'tracking_carrier', 'tracking_number', 'created_at', 'user_email']