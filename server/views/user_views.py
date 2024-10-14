from rest_framework.views import APIView
from rest_framework.response import Response

class VerifyPinView(APIView):
    def post(self, request):
        # Implemente a lógica aqui
        return Response({"message": "PIN verified"})

class RegistroUsuarioView(APIView):
    def post(self, request):
        # Implemente a lógica aqui
        return Response({"message": "User registered"})
