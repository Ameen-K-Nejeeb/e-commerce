# accounts/views.py
from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from django.conf import settings
from .models import User
from .serializers import (
    CustomTokenObtainPairSerializer,
    UserSerializer,
    RegisterSerializer,
    VendorRegistrationSerializer,
    UserProfileSerializer,
)
from rest_framework import permissions, status

class LoginView(TokenObtainPairView):
    """
    POST /api/auth/login/
    Issues SimpleJWT access & refresh tokens along with user info + role.
    """
    serializer_class = CustomTokenObtainPairSerializer


# Alias for backward compatibility if imported elsewhere
CustomTokenObtainPairView = LoginView


class RegisterView(APIView):
    """
    POST /api/auth/register/
    Customer registration (defaults to CUSTOMER role).
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'role': user.role,
                },
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VendorRegisterView(APIView):
    """
    POST /api/auth/register/vendor/
    Registers vendor account and creates linked VendorProfile in one transaction.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VendorRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'role': user.role,
                },
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(APIView):
    """
    GET  /api/auth/profile/ -> Returns user profile and delivery address
    PUT  /api/auth/profile/ -> Updates profile and delivery address
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    

class GoogleAuthView(APIView):
    """
    POST /api/auth/google/
    Verifies Google ID token and issues system JWT tokens.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get('token')
        if not token:
            return Response(
                {'error': 'Google token is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            google_client_id = getattr(settings, 'GOOGLE_CLIENT_ID', None)

            id_info = id_token.verify_oauth2_token(
                token,
                google_requests.Request(),
                audience=google_client_id
            )

            email = id_info.get('email')
            first_name = id_info.get('given_name', '')
            last_name = id_info.get('family_name', '')
            picture = id_info.get('picture', '')

            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'first_name': first_name,
                    'last_name': last_name,
                    'profile_picture': picture,
                    'role': User.Role.CUSTOMER,
                    'is_google_account': True,
                }
            )

            refresh = RefreshToken.for_user(user)

            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'role': user.role,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'profile_picture': user.profile_picture,
                }
            }, status=status.HTTP_200_OK)

        except ValueError:
            return Response(
                {'error': 'Invalid or expired Google token.'},
                status=status.HTTP_400_BAD_REQUEST
            )


# accounts/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from .serializers import UserProfileSerializer

