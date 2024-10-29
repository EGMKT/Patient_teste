from rest_framework import viewsets, views
from rest_framework.response import Response
from rest_framework.decorators import action
from django.http import HttpResponse
from ..models import Consulta
from ..serializers import ConsultaSerializer

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
        # Implemente a lógica para gravar a consulta aqui
        return Response({"message": "Consulta gravada com sucesso"})
