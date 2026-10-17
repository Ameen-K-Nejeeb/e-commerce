from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    we use this: 
    Standard SimpleJWT only returns {'access' and 'refresh'},
    by customizing this serializer, we:
    
    1, embed user details (email, role) inside the encrypted jwt claims.
    2. include a 'user' object in the response payload so React knows immediately who logged in 
        and what role they hold without making an extran network request
    """

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        token['role'] = user.role
        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        #returning the user details login response body
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'role': self.user.role,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'profile_picture': self.user.profile_picture,
        }
        return data



class UserRegisterSerializer(serializers.ModelSerializer):
    """
    it's for validates input from registration form.
    - ensures paswsword are write-only
    - prevents public users from settings themselves as 'admin'
    - users custom manager's create_user to properly hash passwords via set_password
    """

    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ('id', 'email', 'password', 'first_name', 'last_name', 'role')

    def validate_role(self, value):
        if value == User.Role.ADMIN:
            raise serializers.ValidationError('Admin accounts cannot be created via public registration ')
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            email = validated_data['email'],
            password=validated_data['password'],
            first_name= validated_data.get('first_name',''),
            last_name = validated_data.get('last_name', ''),
            role = validated_data.get('role', User.Role.USER)
        )
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    """
    used for retriveing and updating user accout data, permission-critical fields(id, email, role) are set read-only
    """

    class Meta:
        model=User
        fields = ('id', 'email', 'first_name', 'last_name', 'role', 'profile_pictire')
        read_only_fields = ('id', 'email', 'role')