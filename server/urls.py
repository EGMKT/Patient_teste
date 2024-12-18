from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.contrib import admin
from rest_framework_simplejwt.views import TokenRefreshView
from .views import *  # Importa todas as views do __init__.py
from .views.webhook_views import save_consultation_files

router = DefaultRouter()
router.register(r'clinicas', ClinicaViewSet)
router.register(r'medicos', MedicoViewSet)
router.register(r'pacientes', PacienteViewSet)
router.register(r'servicos', ServicoViewSet)
router.register(r'consultas', ConsultaViewSet)
router.register(r'users', UserViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/pipedrive/patients/', PipedrivePatientView.as_view(), name='pipedrive_patients'),
    path('api/dashboard/geral/', DashboardGeralView.as_view(), name='dashboard_geral'),
    path('api/consulta/gravar/', GravarConsultaView.as_view(), name='gravar_consulta'),
    path('api/dashboard/', DashboardView.as_view(), name='dashboard'),
    path('api/registro/', RegistroUsuarioView.as_view(), name='registro'),
    path('', home, name='home'),
    path('api/consultas/audio/', AudioUploadView.as_view(), name='audio_upload'),
    path('api/trusted-device/', TrustedDeviceView.as_view(), name='trusted-device'),
    path('api/database-overview/', DatabaseOverviewView.as_view(), name='database-overview'),
    path('api/clinica-info/', ClinicaInfoView.as_view(), name='clinica-info'),
    path('api/login/', LoginView.as_view(), name='login'),
    path('login/', LoginView.as_view(), name='login'),
    path('register/', RegistroUsuarioView.as_view(), name='register'),
    path('users-list/', UserListView.as_view(), name='users_list'),
    path('clinica-info/', ClinicaInfoView.as_view(), name='clinica_info'),
    path('admin/users/', UserListView.as_view(), name='admin_user_list'),
    path('admin/medicos/', MedicoListView.as_view(), name='admin_medico_list'),
    path('admin/clinicas/', ClinicaListView.as_view(), name='admin_clinica_list'),
    path('api/users/', UserListView.as_view(), name='user_list'),
    path('api/medicos/', MedicoViewSet.as_view({'get': 'list'}), name='medicos-list'),
    path('api/clinicas/', ClinicaListView.as_view(), name='clinica_list'),
    path('api/dashboard/new-clinics/', NewClinicsDataView.as_view(), name='new-clinics-data'),
    path('api/dashboard/data/', DashboardDataView.as_view(), name='dashboard_data'),
    path('api/reports/', ReportsView.as_view(), name='reports'),
    path('api/consultation/process-ai-data/', ProcessedConsultationDataView.as_view(), name='process-ai-data'),
    path('api/verify-password/', VerifyPasswordView.as_view(), name='verify-password'),
    path('api/users/<int:pk>/', UserViewSet.as_view({'delete': 'destroy'}), name='user-detail'),
    path('api/dashboard/clinica/<int:clinica_id>/', ClinicDashboardView.as_view(), name='clinic-dashboard'),
    path('api/consultation/files/', save_consultation_files, name='save_consultation_files'),
    path('api/clinicas/<int:clinica_id>/consultas/', ConsultasByClinicaView.as_view(), name='consultas-by-clinica'),
    path('api/clinicas/<int:clinica_id>/medicos/', MedicosByClinicaView.as_view(), name='medicos-by-clinica'),
    path('api/dashboard/medico/<int:medico_id>/', DashboardMedicoView.as_view(), name='dashboard-medico'),
    path('api/clinicas/<int:clinica_id>/pacientes/', PacientesByClinicaView.as_view(), name='pacientes-by-clinica'),
    path('api/pacientes/<str:paciente_id>/', PacienteDeleteView.as_view(), name='paciente-delete'),
    path('api/consultas/<int:pk>/', ConsultaViewSet.as_view({'delete': 'destroy'}), name='consulta-detail'),
    path('api/sync/clinics/', SyncClinicView.as_view(), name='sync-clinics'),
    path('api/sync/patients/', SyncPatientsView.as_view(), name='sync-patients'),
    path('api/sync/services/', SyncServicesView.as_view(), name='sync-services'),
]
