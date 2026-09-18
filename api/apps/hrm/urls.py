from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.hrm import views

router = DefaultRouter()
router.register(r'work-locations', views.WorkLocationViewSet, basename='hrm-work-locations')
router.register(r'biometric-devices', views.BiometricDeviceViewSet, basename='hrm-biometric-devices')
router.register(r'departments', views.DepartmentViewSet, basename='hrm-departments')
router.register(r'designations', views.DesignationViewSet, basename='hrm-designations')
router.register(r'employees', views.EmployeeViewSet, basename='hrm-employees')
router.register(r'contracts', views.EmploymentContractViewSet, basename='hrm-contracts')
router.register(r'leave-types', views.LeaveTypeViewSet, basename='hrm-leave-types')
router.register(r'leave-requests', views.LeaveRequestViewSet, basename='hrm-leave-requests')
router.register(r'leave-balances', views.LeaveBalanceViewSet, basename='hrm-leave-balances')
router.register(r'attendances', views.AttendanceRecordViewSet, basename='hrm-attendances')
router.register(r'work-shifts', views.WorkShiftViewSet, basename='hrm-work-shifts')
router.register(r'shift-assignments', views.ShiftAssignmentViewSet, basename='hrm-shift-assignments')
router.register(r'attendance-requests', views.AttendanceRequestViewSet, basename='hrm-attendance-requests')
router.register(r'biometric-punch-logs', views.BiometricPunchLogViewSet, basename='hrm-biometric-punch-logs')
router.register(r'monthly-summaries', views.MonthlyAttendanceSummaryViewSet, basename='hrm-monthly-summaries')
router.register(r'career-histories', views.EmployeeCareerHistoryViewSet, basename='hrm-career-histories')
router.register(r'documents', views.EmployeeDocumentViewSet, basename='hrm-documents')
router.register(r'payroll', views.MonthlyPayrollViewSet, basename='hrm-payroll')

urlpatterns = [
    path('dashboard/stats/', views.HrmDashboardStatsAPIView.as_view(), name='hrm-dashboard-stats'),
    path('me/', views.EmployeeSelfServiceView.as_view(), name='hrm-self-service'),
    path('', include(router.urls)),
]
