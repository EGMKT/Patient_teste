from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from ..models import Medico
import pyotp

class TwoFactorView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        action = request.data.get('action')
        medico = Medico.objects.get(usuario=request.user)

        if action == 'enable':
            medico.enable_two_factor()
            return Response({'secret': medico.two_factor_secret})
        elif action == 'disable':
            medico.disable_two_factor()
            return Response({'message': '2FA desativado com sucesso'})
        elif action == 'verify':
            token = request.data.get('token')
            device_id = request.data.get('device_id')
            remember_device = request.data.get('remember_device', False)

            if medico.verify_two_factor(token):
                if remember_device:
                    medico.add_trusted_device(device_id)
                return Response({'message': 'Token válido'})
            else:
                return Response({'message': 'Token inválido'}, status=400)
        else:
            return Response({'message': 'Ação inválida'}, status=400)

class TrustedDeviceView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        device_id = request.data.get('device_id')
        medico = Medico.objects.get(usuario=request.user)

        if medico.is_trusted_device(device_id):
            return Response({'trusted': True})
        else:
            return Response({'trusted': False})
