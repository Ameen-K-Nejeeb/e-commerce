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

        serializer = CustomerOrderItemSerializer(items, many=True)
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