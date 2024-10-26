from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from ..models import Clinica, Usuario, Paciente, Consulta, Medico
# Removida a importação de Procedimento
from django.db.models import Count, Avg, F, ExpressionWrapper, fields
from django.utils import timezone
from django.db.models.functions import Now, TruncDay, TruncMonth
from django.http import JsonResponse
from django.views.decorators.http import require_GET
import logging
from dateutil.relativedelta import relativedelta
import traceback

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
            
            logger.info(f"Período de busca: de {start_date} até {end_date}")
            
            new_clinics_data = Clinica.objects.filter(
                data_criacao__range=(start_date, end_date)
            ).annotate(
                month=TruncMonth('data_criacao')
            ).values('month').annotate(
                count=Count('id')
            ).order_by('month')
            
            logger.info(f"Query executada: {new_clinics_data.query}")
            
            data = [
                {
                    'date': entry['month'].strftime('%Y-%m'),
                    'count': entry['count']
                }
                for entry in new_clinics_data
            ]
            
            logger.info(f"Dados processados: {data}")
            
            return Response(data)
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
                    'month': entry['month'].strftime('%Y-%m'),
                    'count': entry['count']
                }
                for entry in new_clinics_data
            ]
        }

        return Response(data)
