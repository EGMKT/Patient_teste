from rest_framework.views import APIView
from rest_framework.response import Response

class DatabaseOverviewView(APIView):
    def get(self, request):
        # Implemente a lógica aqui
        return Response({"message": "Database overview"})
