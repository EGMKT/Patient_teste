from rest_framework import viewsets, views
from rest_framework.response import Response
from ..models import Consulta
from ..serializers import ConsultaSerializer

class ConsultaViewSet(viewsets.ModelViewSet):
    queryset = Consulta.objects.all()
    serializer_class = ConsultaSerializer

class GravarConsultaView(views.APIView):
    def post(self, request):
        # Implemente a lógica para gravar a consulta aqui
        return Response({"message": "Consulta gravada com sucesso"})
