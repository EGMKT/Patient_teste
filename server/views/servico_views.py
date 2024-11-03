# server/views/servico_views.py
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from ..models import Servico, MedicoServico
from ..serializers import ServicoSerializer
import logging
from django.db import transaction
from rest_framework.decorators import action

logger = logging.getLogger(__name__)

class ServicoViewSet(viewsets.ModelViewSet):
    queryset = Servico.objects.all()
    serializer_class = ServicoSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        try:
            logger.info(f"Criando novo serviço com dados: {self.request.data}")
            instance = serializer.save()
            logger.info(f"Serviço criado com sucesso: {instance.id}")
            return instance
        except Exception as e:
            logger.error(f"Erro ao criar serviço: {str(e)}")
            raise

    def create(self, request, *args, **kwargs):
        try:
            logger.info(f"Dados recebidos: {request.data}")
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            logger.info(f"Dados validados: {serializer.validated_data}")
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(
                serializer.data, 
                status=status.HTTP_201_CREATED, 
                headers=headers
            )
        except Exception as e:
            logger.error(f"Erro na criação: {str(e)}")
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    def list(self, request, *args, **kwargs):
        try:
            return super().list(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Erro na listagem: {str(e)}")
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            # Primeiro remove todas as relações
            MedicoServico.objects.filter(servico=instance).delete()
            # Depois remove o serviço
            instance.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            logger.error(f"Erro ao excluir serviço: {str(e)}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['GET'])
    def medico_servicos(self, request):
        try:
            if not hasattr(request.user, 'medico'):
                return Response({"error": "Usuário não é médico"}, status=400)
                
            servicos = request.user.medico.servicos.filter(ativo=True)
            serializer = self.get_serializer(servicos, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Erro ao buscar serviços do médico: {str(e)}")
            return Response({"error": str(e)}, status=500)