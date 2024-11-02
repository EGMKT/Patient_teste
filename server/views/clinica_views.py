from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count
from django.utils import timezone
from dateutil.relativedelta import relativedelta
from django.db.models.functions import TruncMonth
from ..models import Clinica, ClinicRegistration, Usuario, Paciente, Consulta, Medico
from ..serializers import ClinicaSerializer, ClinicRegistrationSerializer
import logging
import traceback
from django.core.paginator import Paginator
from rest_framework.decorators import action
from django.db import transaction

logger = logging.getLogger(__name__)

class ClinicaViewSet(viewsets.ModelViewSet):
    queryset = Clinica.objects.all()
    serializer_class = ClinicaSerializer
    permission_classes = [IsAuthenticated]

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

    @action(detail=False, methods=['post'])
    def bulk_update(self, request):
        clinic_ids = request.data.get('clinic_ids', [])
        action = request.data.get('action')
        
        if not clinic_ids or action not in ['activate', 'deactivate']:
            return Response({"error": "Dados inválidos"}, status=400)
            
        try:
            with transaction.atomic():
                # Atualiza as clínicas
                ativa = action == 'activate'
                Clinica.objects.filter(id__in=clinic_ids).update(ativa=ativa)
                    
                # Atualiza apenas os usuários médicos e admin de clínica
                medicos = Medico.objects.filter(clinica_id__in=clinic_ids)
                Usuario.objects.filter(
                    medico__in=medicos,
                    role__in=['ME', 'AC']  # Apenas médicos e admin de clínica
                ).update(is_active=ativa)
                    
                return Response({"message": "Atualização realizada com sucesso"}, status=200)
                    
        except Exception as e:
            logger.error(f"Erro ao atualizar clínicas em massa: {str(e)}")
            return Response({"error": str(e)}, status=400)

class ClinicRegistrationViewSet(viewsets.ModelViewSet):
    queryset = ClinicRegistration.objects.all()
    serializer_class = ClinicRegistrationSerializer

class ClinicaInfoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Verifica se o usuário tem uma clínica associada através do médico
            if hasattr(request.user, 'medico') and request.user.medico.clinica:
                clinica = request.user.medico.clinica
                return Response({
                    'nome': clinica.nome,
                    'logo': clinica.logo.url if clinica.logo else None
                })
            # Verifica se o usuário tem uma clínica diretamente associada (caso de admin de clínica)
            elif hasattr(request.user, 'clinica'):
                clinica = request.user.clinica
                return Response({
                    'nome': clinica.nome,
                    'logo': clinica.logo.url if clinica.logo else None
                })
            return Response({'nome': None, 'logo': None})
        except Exception as e:
            logger.error(f"Erro ao buscar informações da clínica: {str(e)}")
            return Response({'error': 'Erro ao buscar informações da clínica'}, status=500)

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

class ClinicRegistrationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            registrations = ClinicRegistration.objects.all().order_by('-created_at')
            serializer = ClinicRegistrationSerializer(registrations, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Erro ao buscar registros: {str(e)}")
            return Response({'error': 'Erro ao buscar registros'}, status=500)

    def put(self, request, registration_id):
        try:
            registration = ClinicRegistration.objects.get(id=registration_id)
            status = request.data.get('status')
            notes = request.data.get('notes', '')

            with transaction.atomic():
                registration.status = status
                registration.processed_at = timezone.now()
                registration.processed_by = request.user
                registration.notes = notes
                registration.save()

                if status == 'approved':
                    # Criar clínica e usuários necessários
                    clinica = Clinica.objects.create(
                        nome=registration.name,
                        ativa=True
                    )
                    
                    # Criar usuário admin da clínica
                    admin_user = Usuario.objects.create_user(
                        email=registration.email,
                        password=User.objects.make_random_password(),
                        first_name=registration.owner_name.split()[0],
                        last_name=' '.join(registration.owner_name.split()[1:]),
                        role='AC'
                    )
                    
                    # Criar médico admin
                    Medico.objects.create(
                        usuario=admin_user,
                        clinica=clinica,
                        especialidade='Administrador'
                    )

                    # Enviar email com credenciais
                    # TODO: Implementar envio de email

            return Response({'message': 'Registro processado com sucesso'})
        except Exception as e:
            logger.error(f"Erro ao processar registro: {str(e)}")
            return Response({'error': 'Erro ao processar registro'}, status=500)
