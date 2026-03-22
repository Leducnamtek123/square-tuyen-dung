
from django.urls import include, path

from rest_framework.routers import DefaultRouter

from . import views

app_router = DefaultRouter()

web_router = DefaultRouter()

web_router.register(r'feedbacks', views.FeedbackViewSet, basename='feedback')

admin_router = DefaultRouter()
admin_router.register(r'banners', views.AdminBannerViewSet, basename='admin-banner')
admin_router.register(r'feedbacks', views.AdminFeedbackViewSet, basename='admin-feedback')

urlpatterns = [

    path('', include([

        path('send-noti-demo/', views.send_notification_demo),

    ])),

    path('app/', include([

        path('', include(app_router.urls)),

        path('banner/', views.get_mobile_banner)

    ])),

    path('web/', include([

        path("", include(web_router.urls)),

        path("sms-download-app/", views.send_sms_download_app),

        path('banner/', views.get_web_banner)

    ])),

    path('web/admin/', include([
        path('', include(admin_router.urls)),
        path('system-settings/', views.system_settings_view),
    ])),

]
