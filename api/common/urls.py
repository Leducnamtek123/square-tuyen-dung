"""
MyJob Recruitment System - Part of MyJob Platform

Author: Bui Khanh Huy
Email: khuy220@gmail.com
Copyright (c) 2023 Bui Khanh Huy

License: MIT License
See the LICENSE file in the project root for full license information.
"""

from django.urls import path
from . import views

urlpatterns = [
    path('configs/', views.get_all_config),
    path('districts/', views.get_districts),
    path('top-careers/', views.get_top_10_careers),
    path('all-careers/', views.get_all_careers),
    path('health/', views.health_check, name='health_check'),
]

from rest_framework.routers import DefaultRouter
admin_router = DefaultRouter()
admin_router.register(r'admin/careers', views.AdminCareerViewSet, basename='admin-careers')
admin_router.register(r'admin/cities', views.AdminCityViewSet, basename='admin-cities')
admin_router.register(r'admin/districts', views.AdminDistrictViewSet, basename='admin-districts')

urlpatterns += admin_router.urls
