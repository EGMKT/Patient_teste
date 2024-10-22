from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (ClinicaViewSet, MedicoViewSet, PacienteViewSet, ServicoViewSet, 
                    ConsultaViewSet, CustomTokenObtainPairView, home, 
                    GravarConsultaView, VerifyPinView,
                    RegistroUsuarioView, AudioUploadView, TwoFactorView, TrustedDeviceView,
                    DatabaseOverviewView, ClinicaInfoView, get_medicos, LoginView,
                    clinica_views, user_views, auth_views)
from rest_framework_simplejwt.views import TokenRefreshView
from django.contrib import admin
from server.views.pipedrive_views import PipedrivePatientView
from server.views.dashboard_views import DashboardView, DashboardGeralView

router = DefaultRouter()
router.register(r'clinicas', ClinicaViewSet)
router.register(r'medicos', MedicoViewSet)
router.register(r'pacientes', PacienteViewSet)
router.register(r'servicos', ServicoViewSet)
router.register(r'consultas', ConsultaViewSet)
router.register(r'users', user_views.UserViewSet)
router.register(r'clinic-registrations', clinica_views.ClinicRegistrationViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/pipedrive/patients/', PipedrivePatientView.as_view(), name='pipedrive_patients'),
    path('api/verify-pin/', VerifyPinView.as_view(), name='verify_pin'),
    path('api/dashboard/geral/', DashboardGeralView.as_view(), name='dashboard_geral'),
    path('api/dashboard/clinica/', clinica_views.DashboardClinicaView.as_view(), name='dashboard_clinica'),
    path('api/consulta/gravar/', GravarConsultaView.as_view(), name='gravar_consulta'),
    path('api/dashboard/', DashboardView.as_view(), name='dashboard'),
    path('api/registro/', RegistroUsuarioView.as_view(), name='registro'),
    path('', home, name='home'),
    path('api/consultas/audio/', AudioUploadView.as_view(), name='audio_upload'),
    path('api/two-factor/', TwoFactorView.as_view(), name='two-factor'),
    path('api/trusted-device/', TrustedDeviceView.as_view(), name='trusted-device'),
    path('api/database-overview/', DatabaseOverviewView.as_view(), name='database-overview'),
    path('api/clinica-info/', ClinicaInfoView.as_view(), name='clinica-info'),
    path('api/get-medicos/', get_medicos, name='get-medicos'),
    path('api/login/', LoginView.as_view(), name='login'),
    path('login/', auth_views.LoginView.as_view(), name='login'),
    path('register/', user_views.RegistroUsuarioView.as_view(), name='register'),
    path('users-list/', user_views.UserListView.as_view(), name='users_list'),
    path('clinica-info/', clinica_views.ClinicaInfoView.as_view(), name='clinica_info'),
]
