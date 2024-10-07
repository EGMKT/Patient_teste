from rest_framework import generics
from .models import Medico, Paciente
from .serializers import MedicoSerializer, PacienteSerializer
from rest_framework.permissions import IsAuthenticated

class MedicoListCreateView(generics.ListCreateAPIView):
    queryset = Medico.objects.all()
    serializer_class = MedicoSerializer
    permission_classes = [IsAuthenticated]

class PacienteListCreateView(generics.ListCreateAPIView):
    queryset = Paciente.objects.all()
    serializer_class = PacienteSerializer
    permission_classes = [IsAuthenticated]
