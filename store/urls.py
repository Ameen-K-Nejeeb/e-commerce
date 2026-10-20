# store/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet,
    ProductViewSet,
    VendorProfileViewSet,
    ProductReviewViewSet,
    ComplaintTicketViewSet,
    CreateCheckoutOrderView,
    VerifyPaymentView,
    UserOrdersView,
)
from .views import VendorOrdersListView, VendorFulfillmentUpdateView, ProductImageManageView, SetPrimaryImageView, ProductVariantManageView


router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'products', ProductViewSet)
router.register(r'vendors', VendorProfileViewSet)
router.register(r'reviews', ProductReviewViewSet, basename='reviews')
router.register(r'complaints', ComplaintTicketViewSet, basename='complaints')

urlpatterns = [
    path('', include(router.urls)),
    path('checkout/create-order/', CreateCheckoutOrderView.as_view(), name='checkout_create_order'),
    path('checkout/verify-payment/', VerifyPaymentView.as_view(), name='checkout_verify_payment'),
    path('user/orders/', UserOrdersView.as_view(), name='user_orders'),

    path('vendor/orders/', VendorOrdersListView.as_view(), name='vendor_orders'),
    path('vendor/fulfillment/update/', VendorFulfillmentUpdateView.as_view(), name='vendor_fulfillment_update'),

    path('products/<int:product_id>/images/', ProductImageManageView.as_view(), name='product_images_add'),
    path('products/<int:product_id>/images/<int:image_id>/', ProductImageManageView.as_view(), name='product_images_delete'),
    path('products/<int:product_id>/images/<int:image_id>/set-primary/', SetPrimaryImageView.as_view(), name='product_images_set_primary'),

    path('products/<int:product_id>/variants/', ProductVariantManageView.as_view(), name='product_variants_add'),
    path('products/<int:product_id>/variants/<int:variant_id>/', ProductVariantManageView.as_view(), name='product_variants_delete'),
]