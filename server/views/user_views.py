from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from ..models import Medico
from django.core.paginator import Paginator
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator
from ..serializers import UsuarioSerializer
from rest_framework import viewsets, status
from rest_framework.permissions import IsAdminUser
from django.contrib.auth import get_user_model

User = get_user_model()

class VerifyPinView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        medico_id = request.data.get('medico_id')
        pin = request.data.get('pin')

        try:
            medico = Medico.objects.get(id=medico_id)
            is_valid = medico.pin == pin
            print(f"Verificação de PIN para médico {medico_id}: {'válido' if is_valid else 'inválido'}")
            return Response({'valid': is_valid})
        except Medico.DoesNotExist:
            print(f"Médico com ID {medico_id} não encontrado")
            return Response({'valid': False}, status=404)

class RegistroUsuarioView(APIView):
    def post(self, request):
        # Implemente a lógica aqui
        return Response({"message": "User registered"})

class UserListView(APIView):
    @method_decorator(cache_page(60 * 15))  # Cache por 15 minutos
    def get(self, request):
        users = User.objects.select_related('clinica').all()
        paginator = Paginator(users, 20)  # 20 usuários por página
        page_number = request.GET.get('page')
        page_obj = paginator.get_page(page_number)
        serializer = UsuarioSerializer(page_obj, many=True)
        return Response({
            'users': serializer.data,
            'total_pages': paginator.num_pages,
            'current_page': page_obj.number
        })

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)
