# accounts/permissions.py
from rest_framework.permissions import BasePermission
from .models import User

class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == User.Role.ADMIN)

class IsVendorRole(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in [User.Role.VENDOR, User.Role.ADMIN])

class IsCustomerRole(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == User.Role.CUSTOMER)