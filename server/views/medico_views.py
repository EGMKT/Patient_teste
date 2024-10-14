from rest_framework import viewsets, generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view
from rest_framework.response import Response
from ..models import Medico
from ..serializers import MedicoSerializer
import logging

class MedicoViewSet(viewsets.ModelViewSet):
    queryset = Medico.objects.all()
    serializer_class = MedicoSerializer
    permission_classes = [IsAuthenticated]

    def list(self, request):
        logging.info("Requisição recebida para listar médicos")
        try:
            queryset = self.get_queryset()
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            logging.error(f"Erro ao listar médicos: {str(e)}")
            return Response({"error": str(e)}, status=500)

class MedicoListView(generics.ListAPIView):
    serializer_class = MedicoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Medico.objects.filter(usuario__clinica=self.request.user.clinica)
    
@api_view(['GET'])
def get_medicos(request):
    medicos = Medico.objects.all()
    serializer = MedicoSerializer(medicos, many=True)
    return Response(serializer.data)
