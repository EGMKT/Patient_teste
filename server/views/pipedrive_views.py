from rest_framework.views import APIView
from rest_framework.response import Response

class PipedrivePatientView(APIView):
    def post(self, request):
        # Implemente a lógica aqui
        return Response({"message": "Patient data received"})

class PipedriveAppointmentView(APIView):
    def post(self, request):
        # Implemente a lógica aqui
        return Response({"message": "Appointment data received"})
