from rest_framework import viewsets, views
from rest_framework.response import Response
from rest_framework.decorators import action
from django.http import HttpResponse
from django.utils import timezone
from ..models import Consulta, Medico, Paciente, Servico, Clinica
from ..serializers import ConsultaSerializer
import logging
from datetime import timedelta
from rest_framework import status

logger = logging.getLogger(__name__)

class ConsultaViewSet(viewsets.ModelViewSet):
    queryset = Consulta.objects.all()
    serializer_class = ConsultaSerializer

    @action(detail=True, methods=['get'])
    def get_file(self, request, pk=None, file_type=None):
        consulta = self.get_object()
        
        # Verificar permissões
        if not self.check_consultation_access(request.user, consulta):
            return Response({'error': 'Acesso negado'}, status=403)
        
        file_field = consulta.transcription_file if file_type == 'transcription' else consulta.summary_file
        
        if not file_field:
            return Response({'error': 'Arquivo não encontrado'}, status=404)
        
        response = HttpResponse(file_field.read(), content_type='text/plain')
        response['Content-Disposition'] = f'attachment; filename="{file_field.name}"'
        return response

    def check_consultation_access(self, user, consulta):
        if user.is_superuser:
            return True
        if user.role == 'SA':
            return True
        if user.role == 'AM':
            return consulta.clinica == user.clinica
        if user.role == 'ME':
            return consulta.medico.usuario == user
        return False

class GravarConsultaView(views.APIView):
    def post(self, request):
        try:
            data = request.data
            logger.info(f"Dados recebidos para criar consulta: {data}")
            
            # Validações
            if not data.get('medico_id'):
                return Response(
                    {"error": "medico_id é obrigatório"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            try:
                # Usar usuario_id para buscar o médico
                medico = Medico.objects.select_related('usuario', 'clinica').get(usuario_id=data['medico_id'])
                paciente = Paciente.objects.get(id=data['paciente_id'])
                servico = Servico.objects.get(id=data['servico_id'])
            except (Medico.DoesNotExist, Paciente.DoesNotExist, Servico.DoesNotExist) as e:
                logger.error(f"Erro ao buscar entidades: {str(e)}")
                return Response(
                    {"error": f"Entidade não encontrada: {str(e)}"}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Criar consulta
            consulta = Consulta.objects.create(
                medico=medico,
                paciente=paciente,
                servico=servico,
                data=timezone.now(),
                duracao=data.get('duracao', timedelta(hours=1)),
                valor=data.get('valor', 0),
                satisfacao=data.get('satisfacao', 0),
                enviado=True
            )
            
            logger.info(f"Consulta criada com sucesso: {consulta.id}")
            return Response({
                "message": "Consulta gravada com sucesso",
                "consultation_id": consulta.id,
                "doctor": {
                    "id": medico.usuario_id,  # Usando usuario_id aqui
                    "name": f"{medico.usuario.first_name} {medico.usuario.last_name}",
                    "specialty": medico.especialidade
                },
                "clinic": {
                    "id": medico.clinica.id if medico.clinica else None,
                    "name": medico.clinica.nome if medico.clinica else None
                }
            })
            
        except Exception as e:
            logger.error(f"Erro ao criar consulta: {str(e)}")
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ConsultasByClinicaView(views.APIView):
    def get(self, request, clinica_id):
        try:
            consultas = Consulta.objects.filter(
                medico__clinica_id=clinica_id
            ).select_related(
                'medico',
                'medico__usuario',
                'paciente',
                'servico'
            ).order_by('-data')
            
            serializer = ConsultaSerializer(consultas, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Erro ao buscar consultas: {str(e)}")
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
