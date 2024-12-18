from rest_framework import viewsets, generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view
from rest_framework.response import Response
from ..models import Medico
from ..serializers import MedicoSerializer
import logging
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework.views import APIView
from django.core.paginator import Paginator
from rest_framework import serializers
from django.db.models import Count

logger = logging.getLogger(__name__)

class MedicoViewSet(viewsets.ModelViewSet):
    queryset = Medico.objects.all()
    serializer_class = MedicoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Medico.objects.select_related(
            'usuario', 
            'clinica'
        ).filter(
            usuario__role='ME'
        ).annotate(
            total_consultas=Count('consulta')
        )

    def list(self, request):
        logger.info("Requisição recebida para listar médicos")
        try:
            queryset = self.get_queryset()
            logger.info(f"Total de médicos encontrados: {queryset.count()}")
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Erro ao listar médicos: {str(e)}")
            return Response({"error": str(e)}, status=500)

    def perform_create(self, serializer):
        usuario = self.request.data.get('usuario')
        if not usuario:
            raise serializers.ValidationError("Um usuário deve ser fornecido para criar um médico.")
        serializer.save()

class MedicoListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        medicos = Medico.objects.annotate(
            total_consultas=Count('consulta')
        ).order_by('usuario__first_name')
        
        paginator = Paginator(medicos, 20)  # 20 médicos por página
        page_number = request.GET.get('page')
        page_obj = paginator.get_page(page_number)
        serializer = MedicoSerializer(page_obj, many=True)
        return Response({
            'medicos': serializer.data,
            'total_pages': paginator.num_pages,
            'current_page': page_obj.number
        })
    
@api_view(['GET'])
def get_medicos(request):
    logging.info("Função get_medicos chamada")
    try:
        medicos = Medico.objects.annotate(
            total_consultas=Count('consulta')
        ).all()
        logging.info(f"Médicos obtidos: {medicos}")
        serializer = MedicoSerializer(medicos, many=True)
        logging.info("Serializer criado")
        return Response(serializer.data)
    except Exception as e:
        logging.error(f"Erro em get_medicos: {str(e)}")
        return Response({"error": str(e)}, status=500)

class MedicosByClinicaView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, clinica_id):
        try:
            medicos = Medico.objects.filter(
                clinica_id=clinica_id,
                usuario__role='ME'
            ).select_related(
                'usuario',
                'clinica'
            ).annotate(
                total_consultas=Count('consulta')
            )
            
            serializer = MedicoSerializer(medicos, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Erro ao buscar médicos: {str(e)}")
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
