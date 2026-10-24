# accounts/urls.py
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, VendorRegisterView, LoginView, GoogleAuthView, UserProfileView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('register/vendor/', VendorRegisterView.as_view(), name='register_vendor'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('google/', GoogleAuthView.as_view(), name='google_auth'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
]