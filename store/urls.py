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

    CheckoutCreateOrderView,
    CheckoutVerifyPaymentView
)
from .views import (VendorOrdersListView, ProductReviewView,  VendorToggleProductStatusView, 
                    VendorFulfillmentUpdateView, ProductImageManageView, SetPrimaryImageView, 
                    ProductVariantManageView,AdminVendorListView, AdminVendorToggleApprovalView,
                    AdminComplaintListView, AdminComplaintResolveView, AdminProductListView, 
                    AdminProductToggleActiveView, AdminDashboardStatsView, AdminProductUpdateView,
                    AdminUserListView, AdminUserToggleActiveView, AdminUserUpdateView,
                    AdminCategoryListCreateView, AdminOrderListView, AdminReviewListView, 
                    AdminReviewDeleteView)


router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'products', ProductViewSet, basename='products') 
router.register(r'vendors', VendorProfileViewSet)
router.register(r'reviews', ProductReviewViewSet, basename='reviews')
router.register(r'complaints', ComplaintTicketViewSet, basename='complaints')

urlpatterns = [
    path('', include(router.urls)),
    path('checkout/create-order/', CreateCheckoutOrderView.as_view(), name='checkout_create_order'),
    path('checkout/verify-payment/', VerifyPaymentView.as_view(), name='checkout_verify_payment'),
    path('user/orders/', UserOrdersView.as_view(), name='user-orders-list'),
    path('orders/', UserOrdersView.as_view(), name='user-orders-alt'),

    path('vendors/me/', VendorProfileViewSet.as_view({'get': 'me'}), name='vendor-me'),
    path('vendor/orders/', VendorOrdersListView.as_view(), name='vendor_orders'),
    path('vendor/fulfillment/update/', VendorFulfillmentUpdateView.as_view(), name='vendor_fulfillment_update'),
    path(
        'vendor/products/<int:pk>/toggle-status/',
        VendorToggleProductStatusView.as_view(),
        name='vendor-product-toggle-status'
    ),

    path('products/<int:product_id>/images/', ProductImageManageView.as_view(), name='product_images_add'),
    path('products/<int:product_id>/images/<int:image_id>/', ProductImageManageView.as_view(), name='product_images_delete'),
    path('products/<int:product_id>/images/<int:image_id>/set-primary/', SetPrimaryImageView.as_view(), name='product_images_set_primary'),

    path('products/<int:product_id>/variants/', ProductVariantManageView.as_view(), name='product_variants_add'),
    path('products/<int:product_id>/variants/<int:variant_id>/', ProductVariantManageView.as_view(), name='product_variants_delete'),



    path('checkout/create-order/', CheckoutCreateOrderView.as_view(), name='checkout-create-order'),
    path('checkout/verify-payment/', CheckoutVerifyPaymentView.as_view(), name='checkout-verify-payment'),

    path('products/<int:pk>/reviews/', ProductReviewView.as_view(), name='product-reviews'),


    # Master Control: Vendor Management
    path('admin/vendors/', AdminVendorListView.as_view(), name='admin-vendor-list'),
    path('admin/vendors/<int:pk>/toggle-approval/', AdminVendorToggleApprovalView.as_view(), name='admin-vendor-toggle'),


    # Master Control: Support Tickets
    path('admin/complaints/', AdminComplaintListView.as_view(), name='admin-complaint-list'),
    path('admin/complaints/<int:pk>/resolve/', AdminComplaintResolveView.as_view(), name='admin-complaint-resolve'),


    path('admin/vendors/', AdminVendorListView.as_view(), name='admin-vendor-list'),
    path('admin/vendors/<int:pk>/toggle-approval/', AdminVendorToggleApprovalView.as_view(), name='admin-vendor-toggle'),
    path('admin/complaints/', AdminComplaintListView.as_view(), name='admin-complaint-list'),
    path('admin/complaints/<int:pk>/resolve/', AdminComplaintResolveView.as_view(), name='admin-complaint-resolve'),

    path('admin/products/', AdminProductListView.as_view(), name='admin-product-list'),
    path('admin/products/<int:pk>/toggle-active/', AdminProductToggleActiveView.as_view(), name='admin-product-toggle'),
    path('admin/stats/', AdminDashboardStatsView.as_view(), name='admin-stats'),

    path('admin/products/<int:pk>/edit/', AdminProductUpdateView.as_view(), name='admin-product-edit'),

    path('admin/users/', AdminUserListView.as_view(), name='admin-user-list'),
    path('admin/users/<int:pk>/toggle-active/', AdminUserToggleActiveView.as_view(), name='admin-user-toggle'),

    path('admin/users/<int:pk>/edit/', AdminUserUpdateView.as_view(), name='admin-user-edit'),

    path('admin/categories/', AdminCategoryListCreateView.as_view(), name='admin-category-list-create'),
    path('admin/orders/', AdminOrderListView.as_view(), name='admin-order-list'),
    path('admin/reviews/', AdminReviewListView.as_view(), name='admin-review-list'),
    path('admin/reviews/<int:pk>/delete/', AdminReviewDeleteView.as_view(), name='admin-review-delete'),
]