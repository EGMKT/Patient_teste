from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from ..models import Clinica, Paciente, Consulta, Medico
from django.db.models import Count, Avg
from django.utils import timezone

class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role == 'SA':
            return self.super_admin_dashboard()
        elif user.role == 'AC':
            return self.admin_clinica_dashboard(user.clinica)
        else:
            return Response({"error": "Acesso não autorizado"}, status=403)

    def super_admin_dashboard(self):
        total_clinicas = Clinica.objects.count()
        total_pacientes = Paciente.objects.count()
        total_consultas = Consulta.objects.count()
        clinicas_ativas = Clinica.objects.filter(ativa=True).count()
        
        clinicas_data = Clinica.objects.annotate(
            total_pacientes=Count('paciente'),
            total_consultas=Count('paciente__consulta'),
            media_satisfacao=Avg('paciente__consulta__satisfacao')
        ).values('nome', 'total_pacientes', 'total_consultas', 'media_satisfacao')

        return Response({
            "total_clinicas": total_clinicas,
            "clinicas_ativas": clinicas_ativas,
            "total_pacientes": total_pacientes,
            "total_consultas": total_consultas,
            "clinicas_data": clinicas_data
        })

    def admin_clinica_dashboard(self, clinica):
        hoje = timezone.now().date()
        mes_passado = hoje - timezone.timedelta(days=30)
        
        pacientes = Paciente.objects.filter(clinica=clinica)
        consultas = Consulta.objects.filter(paciente__clinica=clinica)
        
        return Response({
            "total_pacientes": pacientes.count(),
            "pacientes_novos": pacientes.filter(data_cadastro__gte=mes_passado).count(),
            "total_consultas": consultas.count(),
            "consultas_mes": consultas.filter(data__gte=mes_passado).count(),
            "media_satisfacao": consultas.aggregate(Avg('satisfacao'))['satisfacao__avg'],
            "top_medicos": Medico.objects.filter(usuario__clinica=clinica).annotate(
                total_consultas=Count('consulta')
            ).order_by('-total_consultas')[:5].values('usuario__first_name', 'usuario__last_name', 'total_consultas')
        })
