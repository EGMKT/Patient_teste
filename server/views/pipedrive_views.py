from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from ..models import Paciente
from ..serializers import PacienteSerializer
from ..crm_connectors.pipedrive import PipedriveClient
import logging
from rest_framework.permissions import IsAuthenticated
from server.serializers import PacienteSerializer

logger = logging.getLogger(__name__)

class PipedrivePatientView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Se o usuário for médico, pega a clínica dele
            if hasattr(request.user, 'medico'):
                clinica = request.user.medico.clinica
            # Se for SA, pode passar a clínica como parâmetro
            elif request.user.role == 'SA':
                clinica_id = request.query_params.get('clinica_id')
                if not clinica_id:
                    return Response(
                        {"error": "Clínica não especificada"}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                clinica = Clinica.objects.get(id=clinica_id)
            else:
                return Response(
                    {"error": "Usuário não autorizado"}, 
                    status=status.HTTP_403_FORBIDDEN
                )

            if not clinica.pipedrive_api_token:
                # Se não tiver token, retorna apenas os pacientes locais
                pacientes = Paciente.objects.filter(clinica=clinica)
                serializer = PacienteSerializer(pacientes, many=True)
                return Response(serializer.data)

            # Busca pacientes do Pipedrive
            pipedrive_client = PipedriveClient(clinica.pipedrive_api_token)
            persons = pipedrive_client.get_persons()

            # Atualiza ou cria pacientes localmente
            for person in persons:
                email = person.get('email', [{}])[0].get('value', '') if person.get('email') else ''
                paciente, _ = Paciente.objects.update_or_create(
                    id=str(person['id']),
                    clinica=clinica,
                    defaults={
                        'nome': person['name'],
                        'email': email,
                        'is_novo': True,  # Pode ser ajustado conforme lógica necessária
                    }
                )

            # Retorna todos os pacientes da clínica
            pacientes = Paciente.objects.filter(clinica=clinica)
            serializer = PacienteSerializer(pacientes, many=True)
            return Response(serializer.data)

        except Exception as e:
            logger.error(f"Erro ao buscar pacientes do Pipedrive: {str(e)}")
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# Se você não tem uma view para appointments, remova ou comente a linha abaixo
# class PipedriveAppointmentView(APIView):
#     # Implementação futura
