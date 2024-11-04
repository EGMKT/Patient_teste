from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from server.crm_connectors.pipedrive import PipedriveConnector
from server.models import Medico, Paciente
import logging

logger = logging.getLogger(__name__)

class PipedrivePatientView(APIView):
    def get(self, request):
        try:
            medico = Medico.objects.get(usuario=request.user)
            clinica = medico.clinica
            
            if not clinica or not clinica.pipedrive_api_token:
                return Response({"error": "Configuração do Pipedrive ausente"}, status=400)

            connector = PipedriveConnector(clinica.pipedrive_api_token)
            result = connector.get_patients()
            
            if 'error' in result:
                return Response({"error": result['message']}, status=400)

            # Sincronizar pacientes com o banco local
            for patient_data in result['data']:
                Paciente.objects.update_or_create(
                    id=patient_data['id'],
                    defaults={
                        'nome': patient_data['name'],
                        'clinica': clinica,
                        'email': patient_data.get('email', ''),
                        'is_novo': True,
                        'idade': patient_data.get('age', 0),
                        'genero': patient_data.get('gender', ''),
                        'ocupacao': patient_data.get('occupation', ''),
                        'localizacao': patient_data.get('location', '')
                    }
                )

            return Response({"data": result['data']})
        except Exception as e:
            logger.error(f"Erro ao processar pacientes: {str(e)}")
            return Response({"error": str(e)}, status=500)

# Se você não tem uma view para appointments, remova ou comente a linha abaixo
# class PipedriveAppointmentView(APIView):
#     # Implementação futura
