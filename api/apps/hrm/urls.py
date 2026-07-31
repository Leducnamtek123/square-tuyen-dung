from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.hrm import views

router = DefaultRouter()
router.register(r'departments', views.DepartmentViewSet, basename='hrm-departments')
router.register(r'designations', views.DesignationViewSet, basename='hrm-designations')
router.register(r'employees', views.EmployeeViewSet, basename='hrm-employees')
router.register(r'contracts', views.EmploymentContractViewSet, basename='hrm-contracts')
router.register(r'leave-types', views.LeaveTypeViewSet, basename='hrm-leave-types')
router.register(r'leave-requests', views.LeaveRequestViewSet, basename='hrm-leave-requests')
router.register(r'attendances', views.AttendanceRecordViewSet, basename='hrm-attendances')

urlpatterns = [
    path('dashboard/stats/', views.HrmDashboardStatsAPIView.as_view(), name='hrm-dashboard-stats'),
    path('', include(router.urls)),
]
