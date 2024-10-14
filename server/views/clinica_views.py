from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from ..models import Clinica, Servico
from ..serializers import ClinicaSerializer, ServicoSerializer

class ClinicaViewSet(viewsets.ModelViewSet):
    queryset = Clinica.objects.all()
    serializer_class = ClinicaSerializer

class ServicoViewSet(viewsets.ModelViewSet):
    queryset = Servico.objects.all()
    serializer_class = ServicoSerializer

class ClinicaInfoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        clinica = request.user.clinica
        if clinica:
            return Response({
                'nome': clinica.nome,
                'logo': clinica.logo.url if clinica.logo else None
            })
        return Response({'error': 'Clínica não encontrada'}, status=404)
