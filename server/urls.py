from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.contrib import admin
from django.views.decorators.cache import cache_page
from .views import (
    ClinicaViewSet, MedicoViewSet, PacienteViewSet, ServicoViewSet,
    ConsultaViewSet, CustomTokenObtainPairView, home,
    GravarConsultaView, RegistroUsuarioView, AudioUploadView,
    TrustedDeviceView, DatabaseOverviewView, ClinicaInfoView,
    LoginView, ClinicaListView, UserListView, MedicoListView, UserViewSet
)
from rest_framework_simplejwt.views import TokenRefreshView
from .views.pipedrive_views import PipedrivePatientView
from .views.dashboard_views import DashboardView, DashboardGeralView

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
    path('api/medicos/', MedicoListView.as_view(), name='medico_list'),
    path('api/clinicas/', ClinicaListView.as_view(), name='clinica_list'),
]
