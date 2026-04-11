
from django.urls import path

from . import views

urlpatterns = [

    path('configs/', views.get_all_config),

    path('districts/', views.get_districts),

    path('wards/', views.get_wards),

    path('top-careers/', views.get_top_10_careers),

    path('all-careers/', views.get_all_careers),

    path('presign/', views.presign_url),

    path('upload-file/', views.upload_file),

    path('health/', views.health_check, name='health_check'),

]

from rest_framework.routers import DefaultRouter

admin_router = DefaultRouter()

admin_router.register(r'admin/careers', views.AdminCareerViewSet, basename='admin-careers')

admin_router.register(r'admin/cities', views.AdminCityViewSet, basename='admin-cities')

admin_router.register(r'admin/districts', views.AdminDistrictViewSet, basename='admin-districts')

admin_router.register(r'admin/wards', views.AdminWardViewSet, basename='admin-wards')

urlpatterns += admin_router.urls
