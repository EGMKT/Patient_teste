from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from server.crm_connectors.pipedrive import PipedriveConnector
import logging

logger = logging.getLogger(__name__)

class PipedrivePatientView(APIView):
    def get(self, request):
        logger.info("PipedrivePatientView chamada")
        connector = PipedriveConnector()
        patients = connector.get_patients()
        if not patients:
            logger.warning("Nenhum paciente retornado do Pipedrive")
            return Response({"error": "Não foi possível obter pacientes do Pipedrive"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        logger.info(f"Número de pacientes retornados: {len(patients)}")
        return Response({"data": patients}, status=status.HTTP_200_OK)

# Se você não tem uma view para appointments, remova ou comente a linha abaixo
# class PipedriveAppointmentView(APIView):
#     # Implementação futura
