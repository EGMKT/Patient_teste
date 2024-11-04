import requests
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class PipedriveConnector:
    def __init__(self, api_key):
        self.api_token = api_key
        self.base_url = "https://api.pipedrive.com/v1/"
        logger.info(f"PipedriveConnector inicializado com token: {self.api_token[:5]}...")

    def get_patients(self):
        url = f"{self.base_url}persons?api_token={self.api_token}"
        logger.info(f"Fazendo requisição para Pipedrive: {url[:50]}...")
        
        try:
            response = requests.get(url)
            logger.info(f"Status code da resposta Pipedrive: {response.status_code}")
            
            if response.status_code == 401:
                logger.error("Token do Pipedrive inválido, expirado ou problema com assinatura")
                return {
                    'error': 'auth_error',
                    'message': 'Acesso ao Pipedrive não autorizado. Verifique se sua assinatura está ativa e o token é válido.'
                }
                
            if response.status_code == 402:
                logger.error("Problema com pagamento do Pipedrive")
                return {
                    'error': 'payment_required',
                    'message': 'Sua assinatura do Pipedrive precisa ser renovada. Por favor, verifique o status do pagamento.'
                }

            response.raise_for_status()
            data = response.json()
            
            if not data.get('success'):
                error_msg = data.get('error', 'Erro desconhecido')
                logger.error(f"Erro na resposta do Pipedrive: {error_msg}")
                return {
                    'error': 'api_error',
                    'message': error_msg
                }
                
            patients = data.get('data', [])
            logger.info(f"Número de pacientes retornados: {len(patients)}")
            return {
                'success': True,
                'data': patients
            }
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Erro na requisição para o Pipedrive: {str(e)}")
            return {
                'error': 'request_error',
                'message': 'Erro ao conectar com o Pipedrive. Tente novamente mais tarde.'
            }
        except Exception as e:
            logger.error(f"Erro inesperado ao buscar pacientes: {str(e)}")
            return {
                'error': 'unknown_error',
                'message': 'Erro inesperado ao buscar pacientes. Entre em contato com o suporte.'
            }

    
