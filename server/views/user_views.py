from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from ..models import Medico

class VerifyPinView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        medico_id = request.data.get('medico_id')
        pin = request.data.get('pin')

        try:
            medico = Medico.objects.get(id=medico_id)
            is_valid = medico.pin == pin
            print(f"Verificação de PIN para médico {medico_id}: {'válido' if is_valid else 'inválido'}")
            return Response({'valid': is_valid})
        except Medico.DoesNotExist:
            print(f"Médico com ID {medico_id} não encontrado")
            return Response({'valid': False}, status=404)

class RegistroUsuarioView(APIView):
    def post(self, request):
        # Implemente a lógica aqui
        return Response({"message": "User registered"})
