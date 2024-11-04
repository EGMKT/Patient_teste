from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
import hmac
import hashlib
import json
from django.core.files.base import ContentFile
import base64
from rest_framework.views import APIView
from rest_framework.response import Response
from ..models import Consulta

def validate_webhook_signature(request):
    signature = request.headers.get('X-Webhook-Signature')
    if not signature:
        return False
    
    secret = settings.WEBHOOK_SECRET
    computed_signature = hmac.new(
        secret.encode(),
        request.body,
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(signature, computed_signature)

@csrf_exempt
def process_ai_results(request):
    if not validate_webhook_signature(request):
        return JsonResponse({'error': 'Invalid signature'}, status=401)
    
    data = json.loads(request.body)
    consultation_id = data.get('consultationId')
    
    try:
        consulta = Consulta.objects.get(id=consultation_id)
        
        # Atualização dos campos existentes
        consulta.summary = data['summary']
        consulta.quality_index = data['metrics']['qualityIndex']
        consulta.satisfaction_score = data['metrics']['satisfactionScore']
        consulta.key_topics = data['metrics']['keyTopics']
        
        # Novos campos
        insights = data.get('insights', {})
        consulta.procedimentos_desejados = insights.get('procedimentos', [])
        consulta.expectativas_paciente = insights.get('expectativas', [])
        consulta.problemas_relatados = insights.get('problemas', [])
        consulta.experiencias_anteriores = insights.get('experiencias', [])
        consulta.interesse_tratamentos = insights.get('interesse', [])
        consulta.motivacoes = insights.get('motivacoes', [])
        consulta.aspectos_emocionais = insights.get('aspectos_emocionais', [])
        consulta.preocupacoes_saude = insights.get('preocupacoes', [])
        consulta.produtos_interesse = insights.get('produtos', [])
        
        consulta.ai_processed = True
        consulta.save()
        
        return JsonResponse({'success': True})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def save_consultation_files(request):
    data = json.loads(request.body)
    consultation_id = data.get('consultationId')
    
    try:
        consulta = Consulta.objects.get(id=consultation_id)
        
        # Salvar transcrição
        if 'transcription' in data:
            transcription_content = data['transcription'].encode('utf-8')
            consulta.transcription_file.save(
                f'transcription_{consultation_id}.txt',
                ContentFile(transcription_content)
            )
        
        # Salvar resumo
        if 'summary' in data:
            summary_content = data['summary'].encode('utf-8')
            consulta.summary_file.save(
                f'summary_{consultation_id}.txt',
                ContentFile(summary_content)
            )
        
        consulta.save()
        return JsonResponse({'success': True})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

class ProcessedConsultationDataView(APIView):
    def post(self, request):
        try:
            data = json.loads(request.body)
            consultation_id = data.get('consultationId')
            consultation = Consulta.objects.get(id=consultation_id)
            
            # Dados básicos da análise
            consultation.summary = data['summary']
            consultation.quality_index = data['metrics']['qualityIndex']
            consultation.satisfaction_score = data['metrics']['satisfactionScore']
            consultation.key_topics = data['metrics']['keyTopics']
            
            # Insights específicos
            insights = data.get('insights', {})
            consultation.procedimentos_desejados = insights.get('procedimentos', [])
            consultation.expectativas_paciente = insights.get('expectativas', [])
            consultation.problemas_relatados = insights.get('problemas', [])
            consultation.experiencias_anteriores = insights.get('experiencias', [])
            consultation.interesse_tratamentos = insights.get('interesse', [])
            consultation.motivacoes = insights.get('motivacoes', [])
            consultation.aspectos_emocionais = insights.get('aspectos_emocionais', [])
            consultation.preocupacoes_saude = insights.get('preocupacoes', [])
            consultation.produtos_interesse = insights.get('produtos', [])
            
            consultation.ai_processed = True
            consultation.save()
            
            return Response({'status': 'success'})
        except Exception as e:
            return Response({'error': str(e)}, status=500)
