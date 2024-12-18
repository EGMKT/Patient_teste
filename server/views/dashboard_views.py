from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from ..models import Clinica, Usuario, Paciente, Consulta, Medico
from django.db.models import Count, Avg, F, ExpressionWrapper, fields
from django.utils import timezone
from django.db.models.functions import Now, TruncDay, TruncMonth, Extract
from django.http import JsonResponse
from django.views.decorators.http import require_GET
import logging
from dateutil.relativedelta import relativedelta
import traceback
from django.db import models
from django.db.models import Case, Value, CharField, When
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from datetime import timedelta, datetime

logger = logging.getLogger(__name__)

class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        try:
            if user.role == 'SA':
                return self.super_admin_dashboard()
            elif user.role == 'AC':
                return self.admin_clinica_dashboard(user.clinica)
            else:
                return Response({"error": "Acesso não autorizado"}, status=403)
        except Exception as e:
            logger.error(f"Erro ao gerar dashboard: {str(e)}")
            return Response({"error": "Erro interno do servidor"}, status=500)

    def super_admin_dashboard(self):
        hoje = timezone.now().date()
        mes_passado = hoje - timezone.timedelta(days=30)

        total_clinicas = Clinica.objects.count()
        clinicas_ativas = Clinica.objects.filter(ativa=True).count()
        total_pacientes = Paciente.objects.count()
        novos_pacientes = Paciente.objects.filter(data_cadastro__gte=mes_passado).count()
        total_consultas = Consulta.objects.count()
        consultas_recentes = Consulta.objects.filter(data__gte=mes_passado).count()
        media_satisfacao = Consulta.objects.aggregate(Avg('satisfacao'))['satisfacao__avg']
        total_medicos = Usuario.objects.filter(role='ME').count()

        clinicas_data = Clinica.objects.annotate(
            total_pacientes=Count('paciente'),
            total_consultas=Count('paciente__consulta'),
            media_satisfacao=Avg('paciente__consulta__satisfacao')
        ).values('nome', 'total_pacientes', 'total_consultas', 'media_satisfacao')

        return Response({
            "total_clinicas": total_clinicas,
            "clinicas_ativas": clinicas_ativas,
            "total_pacientes": total_pacientes,
            "novos_pacientes": novos_pacientes,
            "total_consultas": total_consultas,
            "consultas_recentes": consultas_recentes,
            "media_satisfacao": media_satisfacao,
            "total_medicos": total_medicos,
            "clinicas_data": clinicas_data
        })

    def admin_clinica_dashboard(self, clinica):
        hoje = timezone.now().date()
        mes_passado = hoje - timezone.timedelta(days=30)
        seis_meses_atras = hoje - timezone.timedelta(days=180)
        
        pacientes = Paciente.objects.filter(clinica=clinica)
        consultas = Consulta.objects.filter(paciente__clinica=clinica)
        
        pacientes_fidelizados = pacientes.filter(consulta__data__gte=seis_meses_atras).distinct().count()
        indice_fidelizacao = pacientes_fidelizados / pacientes.count() if pacientes.count() > 0 else 0

        tempo_medio_atendimento = consultas.aggregate(
            avg_tempo=Avg(ExpressionWrapper(F('hora_fim') - F('hora_inicio'), output_field=fields.DurationField()))
        )['avg_tempo']

        return Response({
            "total_pacientes": pacientes.count(),
            "pacientes_novos": pacientes.filter(data_cadastro__gte=mes_passado).count(),
            "total_consultas": consultas.count(),
            "consultas_mes": consultas.filter(data__gte=mes_passado).count(),
            "media_satisfacao": consultas.aggregate(Avg('satisfacao'))['satisfacao__avg'],
            "indice_fidelizacao": indice_fidelizacao,
            "tempo_medio_atendimento": tempo_medio_atendimento,
            "top_medicos": Medico.objects.filter(usuario__clinica=clinica).annotate(
                total_consultas=Count('consulta')
            ).order_by('-total_consultas')[:5].values('usuario__first_name', 'usuario__last_name', 'total_consultas')
        })

class DashboardGeralView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Implementação do dashboard geral
        # Esta view pode ser usada para fornecer uma visão geral para todos os tipos de usuários
        user = request.user
        if user.role == 'SA':
            return self.super_admin_dashboard()
        elif user.role == 'AC':
            return self.admin_clinica_dashboard(user.clinica)
        elif user.role == 'ME':
            return self.medico_dashboard(user.medico)
        else:
            return Response({"error": "Acesso não autorizado"}, status=403)

    def super_admin_dashboard(self):
        # Reutilizar a lógica do método super_admin_dashboard da classe DashboardView
        return DashboardView().super_admin_dashboard()

    def admin_clinica_dashboard(self, clinica):
        # Reutilizar a lógica do método admin_clinica_dashboard da classe DashboardView
        return DashboardView().admin_clinica_dashboard(clinica)

    def medico_dashboard(self, medico):
        # Implementar um dashboard específico para médicos
        consultas = Consulta.objects.filter(medico=medico)
        return Response({
            "total_consultas": consultas.count(),
            "media_satisfacao": consultas.aggregate(Avg('satisfacao'))['satisfacao__avg'],
            "pacientes_atendidos": consultas.values('paciente').distinct().count()
        })

class NewClinicsDataView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            logger.info("Iniciando busca de dados de novas clínicas")
            end_date = timezone.now()
            start_date = end_date - relativedelta(months=6)
            
            new_clinics_data = (
                Clinica.objects
                .filter(created_at__range=(start_date, end_date))
                .annotate(month=TruncMonth('created_at'))
                .values('month')
                .annotate(count=Count('id'))
                .order_by('month')
            )
            
            # Garantir que todos os meses estejam presentes
            months_data = {}
            current_date = start_date
            while current_date <= end_date:
                months_data[current_date.strftime('%Y-%m')] = 0
                current_date += relativedelta(months=1)
            
            # Preencher com dados reais
            for entry in new_clinics_data:
                month_key = entry['month'].strftime('%Y-%m')
                months_data[month_key] = entry['count']
            
            # Converter para o formato esperado pelo frontend
            formatted_data = [
                {'month': month, 'count': count}
                for month, count in months_data.items()
            ]
            
            logger.info(f"Dados processados: {formatted_data}")
            return Response(formatted_data)
            
        except Exception as e:
            logger.error(f"Erro ao obter dados de novas clínicas: {str(e)}")
            logger.error(traceback.format_exc())
            return Response({"error": "Erro interno do servidor"}, status=500)

@require_GET
def dashboard_clinica(request):
    # Lógica para obter dados do dashboard da clínica
    data = {
        # Preencha com os dados necessários
    }
    return JsonResponse(data)

class DashboardDataView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        end_date = timezone.now()
        start_date = end_date - relativedelta(months=6)

        # Ajuste na query para garantir dados corretos por mês
        new_clinics_data = (
            Clinica.objects
            .filter(created_at__range=(start_date, end_date))
            .annotate(
                month=TruncMonth('created_at')
            )
            .values('month')
            .annotate(count=Count('id'))
            .order_by('month')
        )

        # Adiciona log para debug
        logger.info(f"Query de novas clínicas: {new_clinics_data.query}")
        logger.info(f"Dados encontrados: {list(new_clinics_data)}")

        data = {
            'total_clinicas': Clinica.objects.count(),
            'total_medicos': Usuario.objects.filter(role='ME').count(),
            'total_pacientes': Paciente.objects.count(),
            'total_consultas': Consulta.objects.count(),
            'new_clinics_data': [
                {
                    'month': entry['month'].strftime('%Y-%m'),
                    'count': entry['count']
                }
                for entry in new_clinics_data
            ]
        }

        return Response(data)

class ReportsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Cálculos básicos
            total_patients = Paciente.objects.count()
            
            # Pacientes por médico
            patients_per_doctor = dict(
                Consulta.objects.values('medico__usuario__first_name')
                .annotate(count=Count('id'))
                .values_list('medico__usuario__first_name', 'count')
            )
            
            # Novos vs antigos pacientes
            new_patients = Paciente.objects.filter(is_novo=True).count()
            returning_patients = Paciente.objects.filter(is_novo=False).count()
            
            # Calcula taxa de retenção
            hoje = timezone.now()
            seis_meses_atras = hoje - timedelta(days=180)
            um_ano_atras = hoje - timedelta(days=365)
            
            pacientes_antigos = Paciente.objects.filter(
                consulta__data__range=(um_ano_atras, seis_meses_atras)
            ).distinct()
            
            total_pacientes_antigos = pacientes_antigos.count()
            
            retention_rate = 0
            if total_pacientes_antigos > 0:
                pacientes_retidos = pacientes_antigos.filter(
                    consulta__data__gte=seis_meses_atras
                ).distinct().count()
                retention_rate = pacientes_retidos / total_pacientes_antigos
            
            # Tempo médio de consulta (corrigido)
            avg_consultation_time = Consulta.objects.aggregate(
                avg_time=Avg(
                    Extract('duracao', 'epoch')/60  # Converte para minutos
                )
            )['avg_time'] or 0
            
            # Satisfação média
            avg_satisfaction = Consulta.objects.aggregate(
                avg=Avg('satisfacao')
            )['avg'] or 0
            
            # Índice de qualidade por médico
            doctor_quality = dict(
                Consulta.objects.values('medico__usuario__first_name')
                .annotate(avg_quality=Avg('quality_index'))
                .values_list('medico__usuario__first_name', 'avg_quality')
            )
            
            # Dados demográficos (corrigido)
            demographics = {
                'ageGroups': dict(
                    Paciente.objects.filter(idade__gt=0).annotate(
                        age_group=Case(
                            When(idade__lt=18, then=Value('0-17')),
                            When(idade__lt=30, then=Value('18-29')),
                            When(idade__lt=50, then=Value('30-49')),
                            default=Value('50+'),
                            output_field=CharField(),
                        )
                    ).values('age_group')
                    .annotate(count=Count('id'))
                    .values_list('age_group', 'count')
                )
            }

            return Response({
                'totalPatientsAttended': total_patients,
                'patientsPerDoctor': patients_per_doctor,
                'newPatientsAttended': new_patients,
                'returningPatientsAttended': returning_patients,
                'patientRetentionRate': retention_rate,
                'averageConsultationTime': avg_consultation_time,
                'overallPatientSatisfaction': avg_satisfaction,
                'doctorQualityIndex': doctor_quality,
                'patientDemographics': demographics
            })
            
        except Exception as e:
            logger.error(f"Erro ao gerar relatórios: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {"error": "Erro ao gerar relatórios"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_reports(request):
    try:
        # Lógica para gerar relatórios
        reports_data = {
            'totalPatientsAttended': 0,
            'patientsPerDoctor': {},
            # ... outros dados
        }
        return Response(reports_data)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

class ClinicDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, clinica_id):
        try:
            clinica = Clinica.objects.get(id=clinica_id)
            hoje = timezone.now().date()
            mes_passado = hoje - timezone.timedelta(days=30)
            seis_meses_atras = hoje - timezone.timedelta(days=180)
            
            pacientes = Paciente.objects.filter(clinica=clinica)
            consultas = Consulta.objects.filter(paciente__clinica=clinica)
            
            pacientes_fidelizados = pacientes.filter(
                consulta__data__gte=seis_meses_atras
            ).distinct().count()
            
            indice_fidelizacao = (
                pacientes_fidelizados / pacientes.count() 
                if pacientes.count() > 0 else 0
            )

            top_medicos = (
                Medico.objects.filter(
                    clinica=clinica
                ).annotate(
                    total_consultas=Count('consulta')
                ).order_by('-total_consultas')[:5]
                .values(
                    'usuario__first_name', 
                    'usuario__last_name', 
                    'total_consultas'
                )
            )

            return Response({
                "total_pacientes": pacientes.count(),
                "pacientes_novos": pacientes.filter(
                    created_at__gte=mes_passado
                ).count(),
                "total_consultas": consultas.count(),
                "consultas_mes": consultas.filter(
                    data__gte=mes_passado
                ).count(),
                "media_satisfacao": consultas.aggregate(
                    Avg('satisfacao')
                )['satisfacao__avg'] or 0,
                "indice_fidelizacao": indice_fidelizacao,
                "top_medicos": list(top_medicos)
            })
        except Clinica.DoesNotExist:
            return Response(
                {"error": "Clínica não encontrada"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Erro ao buscar dados da clínica: {str(e)}")
            return Response(
                {"error": "Erro interno do servidor"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class DashboardMedicoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, medico_id):
        try:
            medico = Medico.objects.get(usuario_id=medico_id)
            consultas = Consulta.objects.filter(medico=medico)
            
            # Converte a duração para minutos
            duracao_media = consultas.aggregate(
                avg_time=Avg(
                    Extract('duracao', 'epoch')/60  # Converte para minutos
                )
            )['avg_time'] or 0

            # Calcula consultas por mês nos últimos 6 meses
            hoje = timezone.now().date()
            seis_meses_atras = hoje - timedelta(days=180)
            
            consultas_por_mes = (
                consultas.filter(
                    data__gte=seis_meses_atras
                ).annotate(
                    month=TruncMonth('data')
                ).values('month')
                .annotate(count=Count('id'))
                .order_by('month')
            )

            return Response({
                "total_pacientes": consultas.count(),
                "pacientes_mes": consultas.filter(
                    data__gte=timezone.now().date() - timezone.timedelta(days=180)
                ).count(),
                "media_satisfacao": consultas.aggregate(
                    Avg('satisfacao')
                )['satisfacao__avg'] or 0,
                "tempo_medio_consulta": duracao_media,
                "consultas_por_mes": [
                    {
                        'month': entry['month'].strftime('%Y-%m'),
                        'count': entry['count']
                    }
                    for entry in consultas_por_mes
                ]
            })
        except Medico.DoesNotExist:
            return Response(
                {"error": "Médico não encontrado"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Erro ao buscar dados do médico: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {"error": "Erro interno do servidor"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

def calcular_taxa_retencao(pacientes, hoje):
    seis_meses_atras = hoje - timedelta(days=180)
    um_ano_atras = hoje - timedelta(days=365)
    
    # Pacientes que consultaram entre 6 meses e 1 ano atrás
    pacientes_antigos = pacientes.filter(
        consulta__data__range=(um_ano_atras, seis_meses_atras)
    ).distinct()
    
    total_pacientes_antigos = pacientes_antigos.count()
    
    if total_pacientes_antigos == 0:
        return 0
        
    # Desses pacientes, quantos retornaram nos últimos 6 meses
    pacientes_retidos = pacientes_antigos.filter(
        consulta__data__gte=seis_meses_atras
    ).distinct().count()
    
    return pacientes_retidos / total_pacientes_antigos

