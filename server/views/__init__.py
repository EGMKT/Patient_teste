from .clinica_views import ClinicaViewSet, ServicoViewSet, ClinicaInfoView, ClinicaListView
from .medico_views import MedicoViewSet, MedicoListView
from .paciente_views import PacienteViewSet
from .consulta_views import ConsultaViewSet, GravarConsultaView
from .auth_views import CustomTokenObtainPairView, LoginView
from .pipedrive_views import PipedrivePatientView
from .dashboard_views import DashboardView, DashboardGeralView, NewClinicsDataView, DashboardDataView, ReportsView
from .user_views import RegistroUsuarioView, UserListView, UserViewSet
from .audio_views import AudioUploadView
from .two_factor_views import TrustedDeviceView
from .database_views import DatabaseOverviewView
from .home_views import home
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page

__all__ = [
    'ClinicaViewSet', 'MedicoViewSet', 'PacienteViewSet', 'ServicoViewSet',
    'ConsultaViewSet', 'CustomTokenObtainPairView', 'PipedrivePatientView',
    'DashboardView', 'DashboardGeralView', 'NewClinicsDataView', 'DashboardDataView',
    'GravarConsultaView', 'RegistroUsuarioView', 'AudioUploadView', 'TrustedDeviceView',
    'DatabaseOverviewView', 'home', 'ClinicaInfoView', 'LoginView',
    'ClinicaListView', 'MedicoListView', 'UserListView', 'UserViewSet', 'ReportsView'
]
