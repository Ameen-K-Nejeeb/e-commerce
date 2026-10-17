# store/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet, 
    ProductViewSet, 
    MentorProfileViewSet, 
    MentorshipSlotViewSet,
    CreateCheckoutOrderView,
    VerifyPaymentView
)

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'products', ProductViewSet)
router.register(r'mentors', MentorProfileViewSet)
router.register(r'mentor-slots', MentorshipSlotViewSet, basename='mentor-slots')

urlpatterns = [
    path('', include(router.urls)),
    path('checkout/create-order/', CreateCheckoutOrderView.as_view(), name='checkout_create_order'),
    path('checkout/verify-payment/', VerifyPaymentView.as_view(), name='checkout_verify_payment'),
]