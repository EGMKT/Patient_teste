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
        consulta.summary = data['summary']
        consulta.quality_index = data['metrics']['qualityIndex']
        consulta.satisfaction_score = data['metrics']['satisfactionScore']
        consulta.key_topics = data['metrics']['keyTopics']
        consulta.follow_up_needed = data['metrics']['followUpNeeded']
        consulta.marketing_opportunities = data['marketingOpportunities']
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
            consultation_id = request.data.get('consultation_id')
            consultation = Consulta.objects.get(id=consultation_id)
            
            # Atualizar dados da consulta com os insights da IA
            consultation.summary = request.data.get('summary')
            consultation.satisfaction_score = request.data.get('satisfaction_score')
            consultation.quality_index = request.data.get('quality_index')
            consultation.key_topics = request.data.get('key_topics', [])
            consultation.marketing_opportunities = request.data.get('marketing_opportunities', [])
            consultation.ai_processed = True
            consultation.save()
            
            return Response({'status': 'success'})
        except Exception as e:
            return Response({'error': str(e)}, status=500)
