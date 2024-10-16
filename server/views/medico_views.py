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
            logging.info(f"Queryset obtido: {queryset}")
            serializer = self.get_serializer(queryset, many=True)
            logging.info("Serializer criado")
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
    logging.info("Função get_medicos chamada")
    try:
        medicos = Medico.objects.all()
        logging.info(f"Médicos obtidos: {medicos}")
        serializer = MedicoSerializer(medicos, many=True)
        logging.info("Serializer criado")
        return Response(serializer.data)
    except Exception as e:
        logging.error(f"Erro em get_medicos: {str(e)}")
        return Response({"error": str(e)}, status=500)
