# accounts/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User
from .forms import CustomUserCreationForm, CustomUserChangeForm


class UserAdmin(BaseUserAdmin):
    # Attach custom forms designed for email-only authentication
    form = CustomUserChangeForm
    add_form = CustomUserCreationForm

    list_display = ('email', 'first_name', 'last_name', 'role', 'is_staff', 'is_active')
    list_filter = ('role', 'is_staff', 'is_active')

    # Edit existing user layout
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'profile_picture')}),
        ('Permissions & Roles', {'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important Dates', {'fields': ('last_login', 'date_joined')}),
    )

    # Add new user layout (/admin/accounts/user/add/)
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'role', 'first_name', 'last_name', 'password1', 'password2'),
        }),
    )

    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)


admin.site.register(User, UserAdmin)