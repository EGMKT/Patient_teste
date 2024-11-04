from rest_framework import viewsets, generics
from rest_framework.permissions import IsAuthenticated
from ..models import Paciente
from ..serializers import PacienteSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)
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

class PacientesByClinicaView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, clinica_id):
        try:
            pacientes = Paciente.objects.filter(clinica_id=clinica_id)
            for paciente in pacientes:
                logger.info(f"Email do paciente {paciente.id}: {paciente.email}")
            
            serializer = PacienteSerializer(pacientes, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Erro ao buscar pacientes: {str(e)}")
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class PacienteDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, paciente_id):
        try:
            paciente = Paciente.objects.get(id=paciente_id)
            paciente.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Paciente.DoesNotExist:
            return Response(
                {"error": "Paciente não encontrado"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Erro ao excluir paciente: {str(e)}")
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )