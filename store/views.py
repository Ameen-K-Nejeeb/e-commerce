# store/views.py
import hmac
import hashlib
import razorpay
from decimal import Decimal

from django.conf import settings
from rest_framework import viewsets, permissions, status, filters, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from django.shortcuts import get_object_or_404

from accounts.permissions import IsAdminRole, IsVendorRole
from .models import (
    Category,
    VendorProfile,
    Product,
    ProductVariant,
    ProductImage,
    Order,
    OrderItem,
    ProductReview,
    ComplaintTicket,
    Review,
)
from .serializers import (
    CategorySerializer,
    ProductSerializer,
    VendorProfileSerializer,
    OrderSerializer,
    ProductReviewSerializer,
    ComplaintTicketSerializer,
    VendorOrderItemSerializer,
    ProductImageSerializer,
    ProductVariantSerializer,
    CustomerOrderItemSerializer,
    

    ReviewSerializer,

    AdminComplaintSerializer,
    AdminVendorSerializer,
    AdminCategorySerializer,
    AdminOrderSerializer, 
    AdminReviewSerializer,
)

from django.utils.text import slugify








class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsAdminRole()]


class VendorProductListCreateView(generics.ListCreateAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        vendor = VendorProfile.objects.filter(user=self.request.user).first()
        if not vendor:
            return Product.objects.none()
        return Product.objects.filter(vendor=vendor).order_by('-created_at')

    def perform_create(self, serializer):
        vendor = VendorProfile.objects.filter(user=self.request.user).first()
        if not vendor:
            raise PermissionDenied("You must have an approved vendor account to list products.")

        # Generate unique slug
        name = serializer.validated_data.get('name', 'product')
        base_slug = slugify(name) or 'product'
        slug = base_slug
        counter = 1
        while Product.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1

        # Effective price calculation
        base_price = serializer.validated_data.get('base_price')
        discount_price = serializer.validated_data.get('discount_price')
        effective_price = discount_price if discount_price else base_price

        serializer.save(
            vendor=vendor,
            slug=slug,
            effective_price=effective_price,
        )






class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'brand', 'category__name']
    ordering_fields = ['base_price', 'created_at']

    def get_queryset(self):
        user = self.request.user
        queryset = Product.objects.select_related('vendor', 'category').prefetch_related('images', 'variants')

        # 1. Vendor Studio explicitly requests only their inventory
        my_products = self.request.query_params.get('my_products')
        if my_products == 'true' and user.is_authenticated:
            try:
                vendor = VendorProfile.objects.get(user=user)
                return queryset.filter(vendor=vendor)
            except VendorProfile.DoesNotExist:
                return queryset.none()

        # 2. Direct modification actions (PUT, PATCH, DELETE) restricted to owner
        if self.action in ['update', 'partial_update', 'destroy']:
            if user.is_authenticated:
                try:
                    vendor = VendorProfile.objects.get(user=user)
                    return queryset.filter(vendor=vendor)
                except VendorProfile.DoesNotExist:
                    return queryset.none()
            return queryset.none()

        # 3. Main Marketplace Catalog: SHOW ALL APPROVED, ACTIVE PRODUCTS
        queryset = queryset.filter(is_active=True, vendor__is_approved=True)

        category = self.request.query_params.get('category')
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')

        if category:
            queryset = queryset.filter(category__slug=category)
        if min_price:
            queryset = queryset.filter(base_price__gte=min_price)
        if max_price:
            queryset = queryset.filter(base_price__lte=max_price)

        return queryset

    def perform_create(self, serializer):
        try:
            vendor = VendorProfile.objects.get(user=self.request.user)
        except VendorProfile.DoesNotExist:
            raise PermissionDenied("Vendor profile not found.")
        if not vendor.is_approved:
            raise PermissionDenied("Your store is pending verification.")
        serializer.save(vendor=vendor)

    def perform_update(self, serializer):
        product = self.get_object()
        if product.vendor.user != self.request.user and not self.request.user.is_staff:
            raise PermissionDenied("You cannot edit products belonging to another vendor.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.vendor.user != self.request.user and not self.request.user.is_staff:
            raise PermissionDenied("You cannot delete products belonging to another vendor.")
        instance.delete()


class VendorProfileViewSet(viewsets.ModelViewSet):
    queryset = VendorProfile.objects.all()
    serializer_class = VendorProfileSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        try:
            vendor = VendorProfile.objects.get(user=request.user)
            serializer = self.get_serializer(vendor)
            return Response(serializer.data)
        except VendorProfile.DoesNotExist:
            return Response(
                {"detail": "No vendor profile found for the logged-in user."},
                status=status.HTTP_404_NOT_FOUND
            )


class CreateCheckoutOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        items = request.data.get('items', [])
        shipping_data = request.data.get('shipping', {})

        if not items:
            return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

        calculated_total = Decimal('0.00')
        validated_items = []

        for item in items:
            # Handles either 'product_id' or standard 'id' from frontend cart items
            p_id = item.get('product_id') or item.get('id')
            if not p_id:
                return Response({'error': 'Product ID missing from cart payload'}, status=status.HTTP_400_BAD_REQUEST)

            try:
                product = Product.objects.select_related('vendor').get(id=p_id, is_active=True)
            except Product.DoesNotExist:
                return Response({'error': f"Product {p_id} not found"}, status=status.HTTP_404_NOT_FOUND)

            variant = None
            price = product.effective_price

            # Handles nested object item['variant']['id'] or flat item['variant_id']
            variant_id = item.get('variant_id') or (item.get('variant') and item['variant'].get('id'))
            if variant_id:
                try:
                    variant = ProductVariant.objects.get(id=variant_id, product=product)
                    price += variant.additional_price
                except ProductVariant.DoesNotExist:
                    return Response({'error': 'Invalid product variant'}, status=status.HTTP_400_BAD_REQUEST)

            qty = int(item.get('quantity', 1))
            calculated_total += price * qty
            validated_items.append((product, variant, qty, price))

        # Create Order in PENDING status
        order = Order.objects.create(
            user=request.user,
            total_amount=calculated_total,
            status=Order.Status.PENDING,
            shipping_full_name=shipping_data.get('full_name', ''),
            shipping_phone=shipping_data.get('phone', ''),
            shipping_address=shipping_data.get('address', ''),
            shipping_city=shipping_data.get('city', ''),
            shipping_pincode=shipping_data.get('pincode', ''),
        )

        # Create OrderItems linked explicitly to each product's vendor
        for product, variant, quantity, unit_price in validated_items:
            OrderItem.objects.create(
                order=order,
                product=product,
                variant=variant,
                vendor=product.vendor,
                unit_price=unit_price,
                quantity=quantity
            )

        razorpay_key = getattr(settings, 'RAZORPAY_KEY_ID', 'rzp_test_placeholder')
        razorpay_secret = getattr(settings, 'RAZORPAY_KEY_SECRET', 'placeholder_secret')
        client = razorpay.Client(auth=(razorpay_key, razorpay_secret))

        amount_in_paise = int(calculated_total * 100)
        try:
            gateway_order = client.order.create({
                "amount": amount_in_paise,
                "currency": "INR",
                "receipt": f"order_{order.id}"
            })
            order.razorpay_order_id = gateway_order['id']
            order.save()
            order_gateway_id = gateway_order['id']
        except Exception:
            order.razorpay_order_id = f"mock_order_{order.id}"
            order.save()
            order_gateway_id = order.razorpay_order_id

        return Response({
            'order_id': order.id,
            'razorpay_order_id': order_gateway_id,
            'amount': amount_in_paise,
            'currency': 'INR',
            'razorpay_key': razorpay_key
        }, status=status.HTTP_201_CREATED)


class VerifyPaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        order_id = request.data.get('order_id')
        razorpay_order_id = request.data.get('razorpay_order_id')
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_signature = request.data.get('razorpay_signature')

        # Find order by order_id or razorpay_order_id
        order = None
        if order_id:
            order = Order.objects.filter(id=order_id, user=request.user).first()
        if not order and razorpay_order_id:
            order = Order.objects.filter(razorpay_order_id=razorpay_order_id, user=request.user).first()

        if not order:
            return Response({'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        razorpay_secret = getattr(settings, 'RAZORPAY_KEY_SECRET', 'placeholder_secret')

        # Signature verification (skipped if mock payment or DEBUG)
        is_mock = (
            not razorpay_payment_id
            or razorpay_payment_id.startswith('pay_mock_') 
            or razorpay_secret == 'placeholder_secret'
            or getattr(settings, 'DEBUG', False)
        )

        if not is_mock and razorpay_signature and razorpay_order_id:
            generated_signature = hmac.new(
                razorpay_secret.encode(),
                f"{razorpay_order_id}|{razorpay_payment_id}".encode(),
                hashlib.sha256
            ).hexdigest()

            if generated_signature != razorpay_signature:
                return Response(
                    {'error': 'Invalid payment signature verification failed.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Transition order to PAID
        order.status = Order.Status.PAID
        order.razorpay_payment_id = razorpay_payment_id or f"pay_confirmed_{order.id}"
        order.razorpay_signature = razorpay_signature or 'signature_confirmed'
        order.save()

        # Deduct stock
        for item in order.items.select_related('product', 'variant'):
            if item.variant:
                item.variant.stock = max(0, item.variant.stock - item.quantity)
                item.variant.save()
            elif item.product:
                item.product.stock = max(0, item.product.stock - item.quantity)
                item.product.save()

        return Response({
            'message': 'Payment confirmed and order placed successfully.',
            'order_id': order.id,
            'status': order.status
        }, status=status.HTTP_200_OK)


# store/views.py
class VendorOrdersListView(APIView):
    """
    GET /api/store/vendor/orders/
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            vendor = VendorProfile.objects.get(user=request.user)
        except VendorProfile.DoesNotExist:
            return Response({'error': 'Vendor profile not found.'}, status=status.HTTP_404_NOT_FOUND)

        items = OrderItem.objects.filter(
            vendor=vendor
        ).select_related('order', 'order__user', 'product', 'variant').order_by('-order__created_at')

        serializer = VendorOrderItemSerializer(items, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class VendorFulfillmentUpdateView(APIView):
    """
    POST /api/store/vendor/fulfillment/update/
    Updates tracking and status strictly for the specific OrderItem.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        item_id = request.data.get('item_id') # Targets the specific item
        new_status = request.data.get('status')
        carrier = request.data.get('tracking_carrier', '').strip()
        tracking_number = request.data.get('tracking_number', '').strip()

        try:
            vendor = VendorProfile.objects.get(user=request.user)
        except VendorProfile.DoesNotExist:
            return Response({'error': 'Vendor profile not found.'}, status=status.HTTP_404_NOT_FOUND)

        try:
            item = OrderItem.objects.get(id=item_id, vendor=vendor)
        except OrderItem.DoesNotExist:
            return Response({'error': 'Item not found or unauthorized.'}, status=status.HTTP_404_NOT_FOUND)

        valid_statuses = [choice[0] for choice in OrderItem.FulfillmentStatus.choices]
        if new_status and new_status in valid_statuses:
            item.status = new_status

        if carrier:
            item.tracking_carrier = carrier
        if tracking_number:
            item.tracking_number = tracking_number

        item.save()

        return Response({
            'message': f'Fulfillment updated for item #{item.id}',
            'item_id': item.id,
            'status': item.status,
            'tracking_carrier': item.tracking_carrier,
            'tracking_number': item.tracking_number,
        }, status=status.HTTP_200_OK)

class UserOrdersView(APIView):
    """
    GET /api/store/orders/
    Returns every purchased item as an independent line item with separate tracking.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Fetch items belonging to confirmed orders placed by current user
        items = OrderItem.objects.filter(
            order__user=request.user,
            order__status=Order.Status.PAID
        ).select_related('order', 'product', 'variant', 'vendor').prefetch_related('product__images').order_by('-order__created_at')

        # FIXED: Added context={'request': request} here!
        serializer = CustomerOrderItemSerializer(items, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class ProductReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ProductReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        product_id = self.request.query_params.get('product')
        if product_id:
            return ProductReview.objects.filter(product_id=product_id)
        return ProductReview.objects.all()

    def perform_create(self, serializer):
        product = Product.objects.get(id=self.request.data.get('product_id'))
        has_purchased = OrderItem.objects.filter(
            order__user=self.request.user,
            order__status=Order.Status.PAID,
            product=product
        ).exists()
        serializer.save(user=self.request.user, product=product, is_verified_purchase=has_purchased)


class ComplaintTicketViewSet(viewsets.ModelViewSet):
    serializer_class = ComplaintTicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'ADMIN':
            return ComplaintTicket.objects.all()
        return ComplaintTicket.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ProductImageManageView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsVendorRole]

    def post(self, request, product_id):
        try:
            vendor = VendorProfile.objects.get(user=request.user)
            product = Product.objects.get(id=product_id, vendor=vendor)
        except (VendorProfile.DoesNotExist, Product.DoesNotExist):
            return Response({'error': 'Product not found or unauthorized.'}, status=status.HTTP_404_NOT_FOUND)

        image_url = request.data.get('image_url')
        is_primary = request.data.get('is_primary', False)

        if not image_url:
            return Response({'error': 'Image URL is required.'}, status=status.HTTP_400_BAD_REQUEST)

        if is_primary:
            ProductImage.objects.filter(product=product).update(is_primary=False)
        elif not ProductImage.objects.filter(product=product).exists():
            is_primary = True

        new_image = ProductImage.objects.create(
            product=product,
            image_url=image_url,
            is_primary=is_primary
        )
        return Response(ProductImageSerializer(new_image).data, status=status.HTTP_201_CREATED)

    def delete(self, request, product_id, image_id):
        try:
            vendor = VendorProfile.objects.get(user=request.user)
            image = ProductImage.objects.get(id=image_id, product_id=product_id, product__vendor=vendor)
        except ProductImage.DoesNotExist:
            return Response({'error': 'Image not found or unauthorized.'}, status=status.HTTP_404_NOT_FOUND)

        was_primary = image.is_primary
        product = image.product
        image.delete()

        if was_primary:
            first_remaining = ProductImage.objects.filter(product=product).first()
            if first_remaining:
                first_remaining.is_primary = True
                first_remaining.save()

        return Response({'message': 'Image deleted successfully.'}, status=status.HTTP_200_OK)


class SetPrimaryImageView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsVendorRole]

    def post(self, request, product_id, image_id):
        try:
            vendor = VendorProfile.objects.get(user=request.user)
            image = ProductImage.objects.get(id=image_id, product_id=product_id, product__vendor=vendor)
        except ProductImage.DoesNotExist:
            return Response({'error': 'Image not found.'}, status=status.HTTP_404_NOT_FOUND)

        ProductImage.objects.filter(product_id=product_id).update(is_primary=False)
        image.is_primary = True
        image.save()
        return Response({'message': 'Image set as primary.'}, status=status.HTTP_200_OK)


class ProductVariantManageView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsVendorRole]

    def post(self, request, product_id):
        try:
            vendor = VendorProfile.objects.get(user=request.user)
            product = Product.objects.get(id=product_id, vendor=vendor)
        except (VendorProfile.DoesNotExist, Product.DoesNotExist):
            return Response({'error': 'Product not found or unauthorized.'}, status=status.HTTP_404_NOT_FOUND)

        name = request.data.get('name', '').strip()
        additional_price = request.data.get('additional_price', 0.00)
        stock = request.data.get('stock', 10)

        if not name:
            return Response({'error': 'Variant name is required.'}, status=status.HTTP_400_BAD_REQUEST)

        variant = ProductVariant.objects.create(
            product=product,
            name=name,
            additional_price=additional_price,
            stock=stock
        )
        return Response(ProductVariantSerializer(variant).data, status=status.HTTP_201_CREATED)

    def delete(self, request, product_id, variant_id):
        try:
            vendor = VendorProfile.objects.get(user=request.user)
            variant = ProductVariant.objects.get(id=variant_id, product_id=product_id, product__vendor=vendor)
        except ProductVariant.DoesNotExist:
            return Response({'error': 'Variant not found or unauthorized.'}, status=status.HTTP_404_NOT_FOUND)

        variant.delete()
        return Response({'message': 'Variant deleted successfully.'}, status=status.HTTP_200_OK)



class VendorToggleProductStatusView(APIView):
    """
    PATCH /api/store/vendor/products/<int:pk>/toggle-status/
    Toggles the is_active status of a product owned by the authenticated vendor.
    """
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        vendor = get_object_or_404(VendorProfile, user=request.user)
        product = get_object_or_404(Product, pk=pk, vendor=vendor)

        product.is_active = not product.is_active
        product.save(update_fields=['is_active'])

        return Response({
            'id': product.id,
            'is_active': product.is_active,
            'message': f"Product is now {'Active' if product.is_active else 'Deactivated'}."
        }, status=status.HTTP_200_OK)
    








client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

class CheckoutCreateOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        data = request.data
        items = data.get('items', [])
        shipping = data.get('shipping', {})

        if not items:
            return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Calculate total amount dynamically from the database (never trust frontend prices)
        total_amount = 0
        for item in items:
            product = Product.objects.get(id=item['product_id'])
            price = product.effective_price if product.effective_price else product.base_price
            total_amount += (price * item['quantity'])

        # Convert to paise (Razorpay expects the amount in the smallest currency sub-unit)
        amount_in_paise = int(total_amount * 100)

        # 2. Create Razorpay Order
        razorpay_order = client.order.create({
            "amount": amount_in_paise,
            "currency": "INR",
            "payment_capture": "1" # Automatically capture payment
        })

        # 3. Create the Database Order
        order = Order.objects.create(
            user=request.user,
            total_amount=total_amount,
            razorpay_order_id=razorpay_order['id'],
            shipping_name=shipping.get('full_name'),
            shipping_address=shipping.get('address'),
            shipping_city=shipping.get('city'),
            shipping_pincode=shipping.get('pincode'),
            shipping_phone=shipping.get('phone'),
        )

        # NOTE: Create your OrderItem logic here looping through 'items' and linking to 'order'

        return Response({
            "order_id": order.id,
            "razorpay_order_id": razorpay_order['id'],
            "amount": amount_in_paise,
            "currency": "INR",
            "razorpay_key": settings.RAZORPAY_KEY_ID
        })

class CheckoutVerifyPaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        razorpay_order_id = request.data.get('razorpay_order_id')
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_signature = request.data.get('razorpay_signature')

        try:
            # 1. Verify the signature using Razorpay SDK
            client.utility.verify_payment_signature({
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            })

            # 2. Update the Order status in the database
            order = Order.objects.get(razorpay_order_id=razorpay_order_id)
            order.payment_status = 'PAID'
            order.razorpay_payment_id = razorpay_payment_id
            order.razorpay_signature = razorpay_signature
            order.save()

            # NOTE: If building a multi-vendor system, this is where you change the status of OrderItems to "Processing"

            return Response({"message": "Payment verified successfully!"}, status=status.HTTP_200_OK)
        except razorpay.errors.SignatureVerificationError:
            return Response({"error": "Payment verification failed. Invalid signature."}, status=status.HTTP_400_BAD_REQUEST)
        except Order.DoesNotExist:
            return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        







# store/views.py

# store/views.py

class ProductReviewView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request, pk):
        reviews = Review.objects.filter(product_id=pk).order_by('-created_at')
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)

    def post(self, request, pk):
        product = get_object_or_404(Product, pk=pk)
        user = request.user

        # 1. Verify they actually purchased the item
        has_purchased = OrderItem.objects.filter(
            order__user=user,
            product=product
        ).exists()

        if not has_purchased:
            return Response(
                {"error": "You can only review products you have successfully ordered."}, 
                status=status.HTTP_403_FORBIDDEN
            )

        # 2. Check if this user already reviewed this product
        existing_review = Review.objects.filter(product=product, user=user).first()

        if existing_review:
            # EDIT EXISTING REVIEW: Pass the existing review into the serializer
            serializer = ReviewSerializer(existing_review, data=request.data, partial=True)
            status_code = status.HTTP_200_OK
        else:
            # CREATE NEW REVIEW
            serializer = ReviewSerializer(data=request.data)
            status_code = status.HTTP_201_CREATED

        # 3. Save the changes (this triggers your signal to update average_rating too!)
        if serializer.is_valid():
            serializer.save(product=product, user=user)
            return Response(serializer.data, status=status_code)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



from .serializers import AdminVendorSerializer
from rest_framework.permissions import IsAdminUser


class AdminVendorListView(generics.ListAPIView):
    """
    Returns a list of all registered boutiques for the Master Control dashboard.
    Restricted to Admin users only.
    """
    permission_classes = [IsAdminUser]
    queryset = VendorProfile.objects.all().order_by('-id')  # Newest first
    serializer_class = AdminVendorSerializer

class AdminVendorToggleApprovalView(APIView):
    """
    Toggles the 'is_approved' status of a specific vendor.
    Restricted to Admin users only.
    """
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        vendor = get_object_or_404(VendorProfile, pk=pk)
        
        # Get the new status from the request payload
        new_status = request.data.get('is_approved')
        
        if new_status is not None:
            vendor.is_approved = new_status
            vendor.save()
            
            # Optional: Send an email to the vendor here notifying them of approval/revocation
            
            return Response(
                {"detail": "Boutique status updated.", "is_approved": vendor.is_approved},
                status=status.HTTP_200_OK
            )
            
        return Response(
            {"error": "is_approved field is required."}, 
            status=status.HTTP_400_BAD_REQUEST
        )





# ==========================================
# MASTER CONTROL: VENDOR MANAGEMENT
# ==========================================

class AdminVendorListView(generics.ListAPIView):
    """
    Returns a list of all registered boutiques.
    Restricted to Super Admin users only.
    """
    permission_classes = [IsAdminUser]
    queryset = VendorProfile.objects.all().order_by('-id')
    serializer_class = AdminVendorSerializer


class AdminVendorToggleApprovalView(APIView):
    """
    Toggles the 'is_approved' status of a specific boutique.
    Restricted to Super Admin users only.
    """
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        vendor = get_object_or_404(VendorProfile, pk=pk)
        new_status = request.data.get('is_approved')
        
        if new_status is not None:
            vendor.is_approved = new_status
            vendor.save()
            return Response(
                {"detail": "Boutique status updated.", "is_approved": vendor.is_approved}, 
                status=status.HTTP_200_OK
            )
            
        return Response(
            {"error": "is_approved field is required."}, 
            status=status.HTTP_400_BAD_REQUEST
        )


# ==========================================
# MASTER CONTROL: SUPPORT TICKETS
# ==========================================

class AdminComplaintListView(generics.ListAPIView):
    """
    Returns all customer support tickets.
    Restricted to Super Admin users only.
    """
    permission_classes = [IsAdminUser]
    queryset = ComplaintTicket.objects.all().order_by('-created_at')
    serializer_class = AdminComplaintSerializer


class AdminComplaintResolveView(APIView):
    """
    Updates the status of a support ticket (e.g., marking it RESOLVED).
    Restricted to Super Admin users only.
    """
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        ticket = get_object_or_404(ComplaintTicket, pk=pk)
        
        # 'RESOLVED' matches your ComplaintTicket.Status choices
        new_status = request.data.get('status', 'RESOLVED')
        ticket.status = new_status
        ticket.save()
            
        return Response(
            {"detail": "Ticket status updated.", "status": ticket.status}, 
            status=status.HTTP_200_OK
        )




from .serializers import AdminProductSerializer


class AdminProductListView(generics.ListAPIView):
    """
    Returns every product on the platform for admin moderation.
    """
    permission_classes = [IsAdminUser]
    queryset = Product.objects.all().order_by('-created_at')
    serializer_class = AdminProductSerializer


class AdminProductToggleActiveView(APIView):
    """
    Toggles the 'is_active' status of a product (Suspend/Publish).
    """
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        product = get_object_or_404(Product, pk=pk)
        new_status = request.data.get('is_active')
        
        if new_status is not None:
            product.is_active = new_status
            product.save()
            return Response(
                {"detail": "Piece visibility updated.", "is_active": product.is_active}, 
                status=status.HTTP_200_OK
            )
            
        return Response(
            {"error": "is_active field is required."}, 
            status=status.HTTP_400_BAD_REQUEST
        )



from django.db.models import Sum
from .models import Order, VendorProfile, ComplaintTicket

# ==========================================
# MASTER CONTROL: DASHBOARD STATS
# ==========================================

class AdminDashboardStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        revenue_agg = Order.objects.filter(status='PAID').aggregate(total=Sum('total_amount'))
        total_revenue = revenue_agg['total'] or 0.00
        active_boutiques = VendorProfile.objects.filter(is_approved=True).count()
        open_tickets = ComplaintTicket.objects.filter(status__in=['OPEN', 'UNDER_REVIEW']).count()
        
        # Monthly Chart Data Generation
        monthly_data = Order.objects.filter(status='PAID').annotate(
            month=TruncMonth('created_at')
        ).values('month').annotate(
            revenue=Sum('total_amount'),
            sales=Count('id')
        ).order_by('month')[:6] # Last 6 active months

        chart_data = [
            {
                "name": entry['month'].strftime('%b %Y') if entry['month'] else "N/A",
                "revenue": float(entry['revenue'] or 0),
                "sales": entry['sales']
            }
            for entry in monthly_data
        ]
        
        return Response({
            "total_revenue": total_revenue,
            "active_boutiques": active_boutiques,
            "open_tickets": open_tickets,
            "chart_data": chart_data
        }, status=status.HTTP_200_OK)



class AdminProductUpdateView(APIView):
    """
    Allows Super Admin to directly edit any product's details.
    """
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        product = get_object_or_404(Product, pk=pk)
        
        # Update allowed fields if they are provided in the request
        if 'name' in request.data:
            product.name = request.data['name']
        if 'base_price' in request.data:
            product.base_price = request.data['base_price']
        if 'stock' in request.data:
            product.stock = request.data['stock']
            
        product.save()
        
        return Response({
            "detail": "Piece updated successfully.",
            "id": product.id,
            "name": product.name,
            "base_price": product.base_price,
            "stock": product.stock
        }, status=status.HTTP_200_OK)


from django.contrib.auth import get_user_model
from .serializers import AdminUserSerializer

User = get_user_model()

# ==========================================
# MASTER CONTROL: CLIENT DIRECTORY
# ==========================================

class AdminUserListView(generics.ListAPIView):
    """
    Returns a list of all registered users on the platform.
    """
    permission_classes = [IsAdminUser]
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = AdminUserSerializer


class AdminUserToggleActiveView(APIView):
    """
    Toggles the 'is_active' status of a user account (Suspend/Ban).
    """
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        
        # Prevent the Super Admin from accidentally suspending themselves
        if user == request.user:
            return Response(
                {"error": "You cannot suspend your own Super Admin account."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        new_status = request.data.get('is_active')
        
        if new_status is not None:
            user.is_active = new_status
            user.save()
            return Response(
                {"detail": "Client account status updated.", "is_active": user.is_active}, 
                status=status.HTTP_200_OK
            )
            
        return Response(
            {"error": "is_active field is required."}, 
            status=status.HTTP_400_BAD_REQUEST
        )



class AdminUserUpdateView(APIView):
    """
    Allows Super Admin to directly edit a client's profile and reset their password.
    """
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        
        # Update text fields if provided
        if 'first_name' in request.data:
            user.first_name = request.data['first_name']
        if 'last_name' in request.data:
            user.last_name = request.data['last_name']
        if 'email' in request.data:
            user.email = request.data['email']
            # If your custom user model uses email as the unique username field:
            if hasattr(user, 'username') and user.username == user.email:
                 user.username = request.data['email']
        
        # Securely update password if a new one was typed in the dashboard
        password = request.data.get('password')
        if password:
            user.set_password(password)
            
        user.save()
        
        return Response({
            "detail": "Client updated successfully.",
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email
        }, status=status.HTTP_200_OK)


class AdminCategoryListCreateView(generics.ListCreateAPIView):
    """
    Allows Super Admin to view all categories and create new ones.
    """
    permission_classes = [IsAdminUser]
    queryset = Category.objects.all().order_by('name')
    serializer_class = AdminCategorySerializer



# ==========================================
# MASTER CONTROL: ORDERS
# ==========================================
class AdminOrderListView(generics.ListAPIView):
    """View all platform transactions."""
    permission_classes = [IsAdminUser]
    queryset = Order.objects.all().order_by('-created_at')
    serializer_class = AdminOrderSerializer

# ==========================================
# MASTER CONTROL: REVIEWS
# ==========================================
class AdminReviewListView(generics.ListAPIView):
    """View all platform product reviews."""
    permission_classes = [IsAdminUser]
    queryset = Review.objects.all().order_by('-created_at')
    serializer_class = AdminReviewSerializer

class AdminReviewDeleteView(generics.DestroyAPIView):
    """Delete inappropriate or fake reviews."""
    permission_classes = [IsAdminUser]
    queryset = Review.objects.all()


class AdminOrderUpdateView(APIView):
    permission_classes = [IsAdminUser]
    def patch(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        if 'status' in request.data:
            order.status = request.data['status']
            order.save()
        return Response({"detail": "Order updated."}, status=status.HTTP_200_OK)

class AdminCategoryUpdateView(APIView):
    permission_classes = [IsAdminUser]
    def patch(self, request, pk):
        category = get_object_or_404(Category, pk=pk)
        if 'name' in request.data: category.name = request.data['name']
        if 'slug' in request.data: category.slug = request.data['slug']
        if 'icon' in request.data: category.icon = request.data['icon']
        if 'description' in request.data: category.description = request.data['description']
        if 'is_active' in request.data: category.is_active = request.data['is_active']
        category.save()
        return Response({"detail": "Category updated."}, status=status.HTTP_200_OK)

class AdminReviewToggleView(APIView):
    permission_classes = [IsAdminUser]
    def patch(self, request, pk):
        review = get_object_or_404(Review, pk=pk)
        review.is_hidden = request.data.get('is_hidden', review.is_hidden)
        review.save()
        return Response({"detail": "Review visibility updated."}, status=status.HTTP_200_OK)


class AdminUserCreateView(APIView):
    """
    Creates a new user from the Master Control panel and assigns the correct roles/permissions.
    """
    permission_classes = [IsAdminUser]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')
        role = request.data.get('role', 'CUSTOMER')

        if not email or not password:
            return Response({'error': 'Email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({'error': 'An account with this email already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        # Create the user and hash the password
        user = User.objects.create_user(
            username=email,  # If your custom user model relies on username
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )
        
        # Apply roles and permissions
        if hasattr(user, 'role'):
            user.role = role
            
        if role == 'ADMIN':
            user.is_staff = True
            user.is_superuser = True
            
        user.save()

        # If creating a vendor, generate a placeholder VendorProfile so they don't crash the vendor tabs
        if role == 'VENDOR':
            VendorProfile.objects.get_or_create(
                user=user, 
                defaults={
                    'store_name': f"Boutique_{user.id}", 
                    'slug': f"boutique-{user.id}",
                    'business_email': user.email,
                    'phone_number': '0000000000'
                }
            )

        # Return the newly created user data to instantly update React
        from .serializers import AdminUserSerializer # Local import to avoid circular errors
        serializer = AdminUserSerializer(user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)