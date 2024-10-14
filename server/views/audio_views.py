from rest_framework.views import APIView
from rest_framework.response import Response

class AudioUploadView(APIView):
    def post(self, request):
        # Implemente a lógica aqui
        return Response({"message": "Audio uploaded"})
