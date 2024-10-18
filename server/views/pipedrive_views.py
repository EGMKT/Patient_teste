from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
import requests

class PipedrivePatientView(APIView):
    def get(self, request):
        # Lógica para obter pacientes do Pipedrive
        pipedrive_api_token = settings.PIPEDRIVE_API_TOKEN
        pipedrive_url = f"https://api.pipedrive.com/v1/persons?api_token={pipedrive_api_token}"
        
        try:
            response = requests.get(pipedrive_url)
            response.raise_for_status()
            data = response.json()
            return Response(data, status=status.HTTP_200_OK)
        except requests.RequestException as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PipedriveAppointmentView(APIView):
    def post(self, request):
        # Implemente a lógica aqui
        return Response({"message": "Appointment data received"})
