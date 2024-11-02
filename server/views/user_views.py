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
                serializer = self.get_serializer(data=request.data)
                serializer.is_valid(raise_exception=True)
                instance = self.perform_create(serializer)
                
                # Se for médico e tiver serviços selecionados
                if instance.role == 'ME' and 'medico' in request.data:
                    medico_data = request.data['medico']
                    if 'servicos' in medico_data:
                        instance.medico.servicos.set(medico_data['servicos'])
                
                return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Erro ao criar usuário: {str(e)}")
            return Response(
                {"error": f"Erro ao criar usuário: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            logger.info(f"Iniciando exclusão do usuário {instance.id}")
            
            # Usa o método delete customizado do modelo
            instance.delete()
            logger.info(f"Usuário {instance.id} excluído com sucesso")
            
            return Response(status=status.HTTP_204_NO_CONTENT)
            
        except Exception as e:
            logger.error(f"Erro ao excluir usuário: {str(e)}")
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

    def update(self, instance, validated_data):
        medico_data = validated_data.pop('medico', None)
        password = validated_data.pop('password', None)
        
        # Atualiza dados do usuário
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if password:
            instance.set_password(password)
        
        instance.save()

        # Atualiza ou cria dados do médico
        if medico_data and instance.role in ['ME', 'AC']:
            medico, created = Medico.objects.get_or_create(usuario=instance)
            clinica_id = medico_data.pop('clinica_id', None)
            servicos = medico_data.pop('servicos', None)
            
            if clinica_id:
                medico.clinica_id = clinica_id
            
            for attr, value in medico_data.items():
                setattr(medico, attr, value)
            
            medico.save()
            
            if servicos is not None:
                medico.servicos.set(servicos)
                
        elif instance.role not in ['ME', 'AC'] and hasattr(instance, 'medico'):
            instance.medico.delete()

        return instance
