# accounts/forms.py
from django import forms
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from .models import User


class CustomUserCreationForm(UserCreationForm):
    """
    Used when adding a new user from /admin/accounts/user/add/
    """
    class Meta:
        model = User
        fields = ('email', 'role', 'first_name', 'last_name')


class CustomUserChangeForm(UserChangeForm):
    """
    Used when editing an existing user in Django Admin
    """
    class Meta:
        model = User
        fields = '__all__'