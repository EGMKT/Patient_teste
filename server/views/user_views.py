from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from ..models import Medico
from django.core.paginator import Paginator
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator
from ..serializers import UsuarioSerializer
from rest_framework import viewsets, status
from django.contrib.auth import get_user_model
from rest_framework.decorators import action

User = get_user_model()



class RegistroUsuarioView(APIView):
    def post(self, request):
        # Implemente a lógica aqui
        return Response({"message": "User registered"})

class UserListView(APIView):
    @method_decorator(cache_page(60 * 15))  # Cache por 15 minutos

    def get(self, request):
        users = User.objects.all().order_by('-date_joined')
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
