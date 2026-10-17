# store/views.py
import razorpay
from decimal import Decimal
from django.conf import settings
from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response

from accounts.permissions import IsAdminRole, IsMentorRole
from .models import Category, Product, MentorProfile, MentorshipSlot, Order, OrderItem
from .serializers import (
    CategorySerializer, 
    ProductSerializer, 
    MentorProfileSerializer, 
    MentorshipSlotSerializer
)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsAdminRole()]


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsMentorRole()]

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)


class MentorProfileViewSet(viewsets.ModelViewSet):
    queryset = MentorProfile.objects.filter(is_approved=True)
    serializer_class = MentorProfileSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(mentor=self.request.user)


class MentorshipSlotViewSet(viewsets.ModelViewSet):
    serializer_class = MentorshipSlotSerializer
    permission_classes = [IsMentorRole]

    def get_queryset(self):
        return MentorshipSlot.objects.filter(mentor__mentor=self.request.user)

    def perform_create(self, serializer):
        profile = MentorProfile.objects.get(mentor=self.request.user)
        serializer.save(mentor=profile)


class CreateCheckoutOrderView(APIView):
    """
    POST /api/store/checkout/create-order/
    Validates cart inventory and recalculates prices on the server.
    Creates a PENDING Order record and calls Razorpay API for the order ID.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        items = request.data.get('items', [])
        if not items:
            return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

        calculated_total = Decimal('0.00')
        validated_items = []

        # Server-side pricing & stock verification
        for item in items:
            try:
                product = Product.objects.get(id=item['product_id'], is_active=True)
            except Product.DoesNotExist:
                return Response({'error': f"Product {item.get('product_id')} not found"}, status=status.HTTP_404_NOT_FOUND)

            qty = item.get('quantity', 1)
            if product.stock < qty:
                return Response({'error': f"Insufficient stock for {product.name}"}, status=status.HTTP_400_BAD_REQUEST)

            calculated_total += product.price * qty
            validated_items.append((product, qty, product.price))

        # 1. Create Pending Order in Database
        order = Order.objects.create(
            user=request.user,
            total_amount=calculated_total,
            status=Order.Status.PENDING
        )

        for product, quantity, unit_price in validated_items:
            OrderItem.objects.create(
                order=order,
                product=product,
                unit_price=unit_price,
                quantity=quantity
            )

        # 2. Call Razorpay API
        razorpay_key = getattr(settings, 'RAZORPAY_KEY_ID', 'rzp_test_placeholder_key')
        razorpay_secret = getattr(settings, 'RAZORPAY_KEY_SECRET', 'placeholder_secret')
        client = razorpay.Client(auth=(razorpay_key, razorpay_secret))

        amount_in_paise = int(calculated_total * 100)
        try:
            gateway_order = client.order.create({
                "amount": amount_in_paise,
                "currency": "INR",
                "receipt": f"order_rcpt_{order.id}"
            })
            order.razorpay_order_id = gateway_order['id']
            order.save()

            return Response({
                'order_id': order.id,
                'razorpay_order_id': gateway_order['id'],
                'amount': amount_in_paise,
                'currency': 'INR',
                'razorpay_key': razorpay_key
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            # Fallback for offline testing without live Razorpay credentials
            order.razorpay_order_id = f"order_mock_{order.id}"
            order.save()
            return Response({
                'order_id': order.id,
                'razorpay_order_id': order.razorpay_order_id,
                'amount': amount_in_paise,
                'currency': 'INR',
                'razorpay_key': razorpay_key,
                'note': 'Fallback mode active (check API credentials)'
            }, status=status.HTTP_201_CREATED)


class VerifyPaymentView(APIView):
    """
    POST /api/store/checkout/verify-payment/
    Verifies the HMAC-SHA256 signature returned by Razorpay Checkout.
    Only on verified signature is the order marked PAID and inventory deducted.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        razorpay_order_id = request.data.get('razorpay_order_id')
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_signature = request.data.get('razorpay_signature')

        try:
            order = Order.objects.get(razorpay_order_id=razorpay_order_id, user=request.user)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

        client = razorpay.Client(auth=(
            getattr(settings, 'RAZORPAY_KEY_ID', ''),
            getattr(settings, 'RAZORPAY_KEY_SECRET', '')
        ))

        try:
            client.utility.verify_payment_signature({
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            })
        except Exception:
            order.status = Order.Status.FAILED
            order.save()
            return Response({'error': 'Signature verification failed'}, status=status.HTTP_400_BAD_REQUEST)

        # Mark as PAID and safely deduct inventory
        order.status = Order.Status.PAID
        order.razorpay_payment_id = razorpay_payment_id
        order.razorpay_signature = razorpay_signature
        order.save()

        for item in order.items.all():
            if item.product:
                item.product.stock -= item.quantity
                item.product.save()

        return Response({'message': 'Payment verified and order fulfilled.'}, status=status.HTTP_200_OK)