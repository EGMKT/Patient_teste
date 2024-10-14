from rest_framework import viewsets, generics
from rest_framework.permissions import IsAuthenticated
from ..models import Paciente
from ..serializers import PacienteSerializer

class PacienteViewSet(viewsets.ModelViewSet):
    queryset = Paciente.objects.all()
    serializer_class = PacienteSerializer
    permission_classes = [IsAuthenticated]

class PacienteListView(generics.ListAPIView):
    serializer_class = PacienteSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Paciente.objects.filter(clinica=self.request.user.clinica)

class PacienteListCreateView(generics.ListCreateAPIView):
    queryset = Paciente.objects.all()
    serializer_class = PacienteSerializer
    permission_classes = [IsAuthenticated]