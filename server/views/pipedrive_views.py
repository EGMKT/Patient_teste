from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from server.crm_connectors.pipedrive import PipedriveConnector
from server.models import Medico
import logging

logger = logging.getLogger(__name__)

class PipedrivePatientView(APIView):
    def get(self, request):
        logger.info("PipedrivePatientView chamada")
        user = request.user
        try:
            medico = Medico.objects.get(usuario=user)
            clinica = medico.clinica
            if not clinica or not clinica.pipedrive_api_token:
                return Response({"error": "Chave API do Pipedrive não configurada para esta clínica"}, status=status.HTTP_400_BAD_REQUEST)
            
            connector = PipedriveConnector(clinica.pipedrive_api_token)
            patients = connector.get_patients()
            if not patients:
                logger.warning("Nenhum paciente retornado do Pipedrive")
                return Response({"error": "Não foi possível obter pacientes do Pipedrive"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            logger.info(f"Número de pacientes retornados: {len(patients)}")
            return Response({"data": patients}, status=status.HTTP_200_OK)
        except Medico.DoesNotExist:
            return Response({"error": "Médico não encontrado"}, status=status.HTTP_404_NOT_FOUND)

# Se você não tem uma view para appointments, remova ou comente a linha abaixo
# class PipedriveAppointmentView(APIView):
#     # Implementação futura
