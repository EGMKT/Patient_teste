from django.urls import path
from django.contrib import admin
from .views import MedicoListCreateView, PacienteListCreateView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/medicos/', MedicoListCreateView.as_view(), name='medico_list_create'),
    path('api/pacientes/', PacienteListCreateView.as_view(), name='paciente_list_create'),
    path('admin/', admin.site.urls),
]
