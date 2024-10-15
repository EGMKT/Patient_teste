from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from ..models import Clinica, Usuario, Paciente, Consulta

class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'SA':
            return Response({"error": "Unauthorized"}, status=403)

        total_clinics = Clinica.objects.count()
        total_doctors = Usuario.objects.filter(role='ME').count()
        total_patients = Paciente.objects.count()
        total_consultations = Consulta.objects.count()

        data = {
            "totalClinics": total_clinics,
            "totalDoctors": total_doctors,
            "totalPatients": total_patients,
            "totalConsultations": total_consultations,
        }

        return Response(data)

class DashboardGeralView(APIView):
    def get(self, request):
        # Implemente a lógica aqui
        return Response({"message": "Dashboard geral data"})

class DashboardClinicaView(APIView):
    def get(self, request):
        # Implemente a lógica aqui
        return Response({"message": "Dashboard clinica data"})

class DashboardView(APIView):
    def get(self, request):
        # Implemente a lógica aqui
        return Response({"message": "Dashboard data"})
