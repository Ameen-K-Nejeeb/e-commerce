# accounts/serializers.py
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.db import transaction
from django.utils.text import slugify
from .models import User
from store.models import VendorProfile


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom JWT serializer that includes user data and role inside the token response.
    """
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'role': self.user.role,
        }
        return data


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'role', 'profile_picture')
        read_only_fields = ('id', 'role')


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ('email', 'password', 'first_name', 'last_name', 'role')

    def create(self, validated_data):
        role = validated_data.get('role', User.Role.CUSTOMER)
        return User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=role,
        )


class VendorRegistrationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    store_name = serializers.CharField(max_length=200)
    phone_number = serializers.CharField(max_length=20)
    address = serializers.CharField()
    description = serializers.CharField(required=False, allow_blank=True)

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_store_name(self, value):
        if VendorProfile.objects.filter(store_name__iexact=value).exists():
            raise serializers.ValidationError("A store with this name already exists.")
        return value

    def create(self, validated_data):
        with transaction.atomic():
            user = User.objects.create_user(
                email=validated_data['email'],
                password=validated_data['password'],
                first_name=validated_data.get('first_name', ''),
                last_name=validated_data.get('last_name', ''),
                role=User.Role.VENDOR,
            )

            store_name = validated_data['store_name']
            base_slug = slugify(store_name)
            slug = base_slug
            counter = 1
            while VendorProfile.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1

            VendorProfile.objects.create(
                user=user,
                store_name=store_name,
                slug=slug,
                business_email=validated_data['email'],
                phone_number=validated_data['phone_number'],
                address=validated_data['address'],
                description=validated_data.get('description', ''),
                is_approved=False,
            )
            return user

# accounts/serializers.py

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'id',
            'first_name',
            'last_name',
            'email',
            'role',
            'profile_picture',
            'phone_number',
            'address',
            'city_district',
            'state',
            'pincode',
        )
        read_only_fields = ('id', 'email', 'role', 'profile_picture')