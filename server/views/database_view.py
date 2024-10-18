from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAdminUser
from ..models import Clinica, Usuario, Medico, Paciente, Servico, Consulta
from ..serializers import ClinicaSerializer, UsuarioSerializer, MedicoSerializer, PacienteSerializer, ServicoSerializer, ConsultaSerializer

class DatabaseOverviewView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        clinicas = ClinicaSerializer(Clinica.objects.all(), many=True).data
        usuarios = UsuarioSerializer(Usuario.objects.all(), many=True).data
        medicos = MedicoSerializer(Medico.objects.all(), many=True).data
        pacientes = PacienteSerializer(Paciente.objects.all(), many=True).data
        servicos = ServicoSerializer(Servico.objects.all(), many=True).data
        consultas = ConsultaSerializer(Consulta.objects.all(), many=True).data

        return Response({
            'clinicas': clinicas,
            'usuarios': usuarios,
            'medicos': medicos,
            'pacientes': pacientes,
            'servicos': servicos,
            'consultas': consultas
        }, status=status.HTTP_200_OK)