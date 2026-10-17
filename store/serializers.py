# store/serializers.py
from rest_framework import serializers
from .models import Category, Product, MentorProfile, MentorshipSlot, Order, OrderItem


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    creator_email = serializers.ReadOnlyField(source='creator.email')

    class Meta:
        model = Product
        fields = (
            'id', 'name', 'description', 'price', 
            'stock', 'category', 'category_name', 
            'creator_email', 'is_active', 'created_at'
        )
        read_only_fields = ('creator', 'created_at')


class MentorshipSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = MentorshipSlot
        fields = '__all__'
        read_only_fields = ('mentor', 'is_booked')


class MentorProfileSerializer(serializers.ModelSerializer):
    email = serializers.ReadOnlyField(source='mentor.email')
    slots = MentorshipSlotSerializer(many=True, read_only=True)

    class Meta:
        model = MentorProfile
        fields = ('id', 'email', 'title', 'bio', 'hourly_rate', 'is_approved', 'slots')
        read_only_fields = ('is_approved',)