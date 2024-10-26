from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count
from django.utils import timezone
from dateutil.relativedelta import relativedelta
from django.db.models.functions import TruncMonth
from ..models import Clinica, Servico, ClinicRegistration, Usuario, Paciente, Consulta
from ..serializers import ClinicaSerializer, ServicoSerializer, ClinicRegistrationSerializer
import logging
import traceback
from django.core.paginator import Paginator
from rest_framework.decorators import action

logger = logging.getLogger(__name__)

class ClinicaViewSet(viewsets.ModelViewSet):
    queryset = Clinica.objects.all()
    serializer_class = ClinicaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Clinica.objects.filter(ativa=True)

    @action(detail=False, methods=['get'])
    def dashboard_data(self, request):
        end_date = timezone.now()
        start_date = end_date - relativedelta(months=6)

        new_clinics_data = Clinica.objects.filter(
            created_at__range=(start_date, end_date)
        ).annotate(
            month=TruncMonth('created_at')
        ).values('month').annotate(
            count=Count('id')
        ).order_by('month')

        data = {
            'total_clinicas': Clinica.objects.count(),
            'total_medicos': Usuario.objects.filter(role='ME').count(),
            'total_pacientes': Paciente.objects.count(),
            'total_consultas': Consulta.objects.count(),
            'new_clinics_data': [
                {
                    'date': entry['month'].strftime('%Y-%m'),
                    'count': entry['count']
                }
                for entry in new_clinics_data
            ]
        }

        return Response(data)

class ServicoViewSet(viewsets.ModelViewSet):
    queryset = Servico.objects.all()
    serializer_class = ServicoSerializer

class ClinicRegistrationViewSet(viewsets.ModelViewSet):
    queryset = ClinicRegistration.objects.all()
    serializer_class = ClinicRegistrationSerializer

class ClinicaInfoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        clinica = request.user.clinica
        if clinica:
            return Response({
                'nome': clinica.nome,
                'logo': clinica.logo.url if clinica.logo else None
            })
        return Response({'error': 'Clínica não encontrada'}, status=404)

class DashboardClinicaView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            logger.info("Iniciando geração de dados do dashboard da clínica")
            # Obter dados para os últimos 6 meses
            end_date = timezone.now()
            start_date = end_date - relativedelta(months=6)

            logger.info(f"Período de busca: {start_date} até {end_date}")

            # Consulta para obter o número de novas clínicas por mês
            new_clinics = Clinica.objects.filter(
                created_at__range=(start_date, end_date)
            ).annotate(
                month=TruncMonth('created_at')
            ).values('month').annotate(count=Count('id')).order_by('month')

            logger.info(f"Consulta executada: {new_clinics.query}")

            # Formatar os dados para o gráfico
            data = [
                {
                    'month': entry['month'].strftime('%Y-%m'),
                    'count': entry['count']
                }
                for entry in new_clinics
            ]

            logger.info(f"Dados gerados com sucesso: {data}")
            return Response(data)
        except Exception as e:
            logger.error(f"Erro ao gerar dados do dashboard da clínica: {str(e)}")
            logger.error(traceback.format_exc())
            return Response({'error': 'Erro interno do servidor'}, status=500)

class ClinicaListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        clinicas = Clinica.objects.all().order_by('nome')
        paginator = Paginator(clinicas, 20)
        page_number = request.GET.get('page')
        page_obj = paginator.get_page(page_number)
        serializer = ClinicaSerializer(page_obj, many=True)
        return Response({
            'clinicas': serializer.data,
            'total_pages': paginator.num_pages,
            'current_page': page_obj.number
        })
