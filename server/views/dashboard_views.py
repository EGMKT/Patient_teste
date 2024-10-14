from rest_framework.views import APIView
from rest_framework.response import Response

class AdminDashboardView(APIView):
    def get(self, request):
        # Implemente a lógica aqui
        return Response({"message": "Admin dashboard data"})

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
