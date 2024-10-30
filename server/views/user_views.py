from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from ..models import Medico, Usuario, Clinica
from django.core.paginator import Paginator
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator
from ..serializers import UsuarioSerializer
from rest_framework import viewsets, status
from django.contrib.auth import get_user_model
from rest_framework.decorators import action
from django.contrib.auth.hashers import check_password
from django.db import transaction
import logging

User = get_user_model()

logger = logging.getLogger(__name__)

class RegistroUsuarioView(APIView):
    def post(self, request):
        # Implemente a lógica aqui
        return Response({"message": "User registered"})

class UserListView(APIView):
    @method_decorator(cache_page(60 * 15))

    def get(self, request):
        users = Usuario.objects.select_related('medico__clinica').all().order_by('email')
        paginator = Paginator(users, 20)
        page_number = request.GET.get('page')
        page_obj = paginator.get_page(page_number)
        serializer = UsuarioSerializer(page_obj, many=True)
        return Response({
            'users': serializer.data,
            'total_pages': paginator.num_pages,
            'current_page': page_obj.number
        })

class UserViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.select_related('medico__clinica').all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                # Extrair dados do médico se existirem
                medico_data = None
                if request.data.get('role') == 'ME':
                    medico_data = request.data.pop('medico', None)

                # Criar usuário
                serializer = self.get_serializer(data=request.data)
                serializer.is_valid(raise_exception=True)
                user = serializer.save()

                # Se for médico, criar o registro de médico
                if medico_data and user.role == 'ME':
                    Medico.objects.create(
                        usuario=user,
                        especialidade=medico_data.get('especialidade', ''),
                        clinica_id=medico_data.get('clinica')
                    )

                return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Erro ao criar usuário: {str(e)}")
            return Response(
                {"error": f"Erro ao criar usuário: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            logger.info(f"Iniciando exclusão do usuário {instance.id}")
            
            # Verifica se é um médico
            if hasattr(instance, 'medico'):
                instance.medico.delete()
                logger.info(f"Médico associado ao usuário {instance.id} excluído")
            
            # Remove o usuário
            instance.delete()
            logger.info(f"Usuário {instance.id} excluído com sucesso")
            
            return Response(status=status.HTTP_204_NO_CONTENT)
            
        except Exception as e:
            logger.error(f"Erro ao excluir usuário: {str(e)}")
            transaction.set_rollback(True)
            return Response(
                {"error": f"Erro ao excluir usuário: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['post'])
    def create_medico(self, request):
        user_serializer = self.get_serializer(data=request.data)
        user_serializer.is_valid(raise_exception=True)
        user = user_serializer.save()
        
        medico_data = request.data.get('medico', {})
        medico_serializer = MedicoSerializer(data=medico_data)
        medico_serializer.is_valid(raise_exception=True)
        medico_serializer.save(usuario=user)
        
        return Response(user_serializer.data, status=status.HTTP_201_CREATED)
