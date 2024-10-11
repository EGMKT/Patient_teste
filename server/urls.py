from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClinicaViewSet, MedicoViewSet, PacienteViewSet, ServicoViewSet, ConsultaViewSet, CustomTokenObtainPairView, PipedrivePatientView, PipedriveAppointmentView, home
from rest_framework_simplejwt.views import TokenRefreshView
from django.contrib import admin

router = DefaultRouter()
router.register(r'clinicas', ClinicaViewSet)
router.register(r'medicos', MedicoViewSet, basename='medico')
router.register(r'pacientes', PacienteViewSet, basename='paciente')
router.register(r'servicos', ServicoViewSet, basename='servico')
router.register(r'consultas', ConsultaViewSet, basename='consulta')
# ... (registre outras viewsets)

urlpatterns = [
    path('', home, name='home'),
    path('api/', include(router.urls)),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/pipedrive/patients/', PipedrivePatientView.as_view()),
    path('api/pipedrive/appointments/', PipedriveAppointmentView.as_view()),
    # ... outras URLs
]
