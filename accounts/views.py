from django.shortcuts import render

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
    UserRegisterSerializer, 
    UserProfileSerializer
)


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    POST /api/auth/login
    """
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    """
    POST /api/auth/register
    """
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [AllowAny]


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    GET /api/auth/profile
    PUT / PATCH /api/auth/profile
    """

    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

class GoogleAuthView(APIView):
    """
    POST /api/auth/google

    1. React uses Google Identity Services to get an id_token (JWT signed by Google).
    2. React posts the token here.
    3. We verify the token signature with Google's public keys.
    4. We find or create the user in the database.
    5. We issue our own SimpleJWT tokens so React communicates with our API consistently

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
            first_name = id_info.get('given_name', "")
            last_name = id_info.get('family_name', '')
            picture = id_info.get('picture', '')

            user, created = User.objects.get_or_create(
                email = email,
                defaults={
                    'first_name':first_name,
                    'last_name': last_name,
                    'profile_picture': picture,
                    'role': User.Role.USER,
                    'is_google_account': True,
                }
            )

            refresh = RefreshToken.for_user(user)
            refresh['email'] = user.email
            refresh['role'] = user.role

            return Response({
                'refresh' : str(refresh),
                'access' : str(refresh.access_token),
                'user': {
                    'id': user.id, 
                    'email': user.email, 
                    'role': user.role,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'profile_picture': user.profile_picture
                }
            }, status=status.HTTP_200_OK)

        except ValueError:
            return Response(
                {'error': 'Invalid or expired Google token. '},
                status=status.HTTP_400_BAD_REQUEST
            )