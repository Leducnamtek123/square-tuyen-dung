
from django.urls import include, path

from rest_framework.routers import DefaultRouter

from . import views

app_router = DefaultRouter()

web_router = DefaultRouter()

web_router.register(r'feedbacks', views.FeedbackViewSet, basename='feedback')
web_router.register(r'articles', views.ArticlePublicViewSet, basename='article-public')

admin_router = DefaultRouter()
admin_router.register(r'banners', views.AdminBannerViewSet, basename='admin-banner')
admin_router.register(r'feedbacks', views.AdminFeedbackViewSet, basename='admin-feedback')
admin_router.register(r'banner-types', views.AdminBannerTypeViewSet, basename='admin-banner-type')
admin_router.register(r'articles', views.AdminArticleViewSet, basename='admin-article')

employer_router = DefaultRouter()
employer_router.register(r'articles', views.EmployerArticleViewSet, basename='employer-article')

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

    path('web/employer/', include([
        path('', include(employer_router.urls)),
    ])),

]
