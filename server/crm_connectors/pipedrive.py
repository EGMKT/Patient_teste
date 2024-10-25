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
            logger.info(f"Conteúdo da resposta Pipedrive: {response.text[:500]}...")
            response.raise_for_status()
            data = response.json()
            if not data.get('success'):
                logger.error(f"Erro na resposta do Pipedrive: {data.get('error')}")
                return []
            logger.info(f"Número de pacientes retornados: {len(data.get('data', []))}")
            return data.get('data', [])
        except requests.exceptions.RequestException as e:
            logger.error(f"Erro na requisição para o Pipedrive: {str(e)}")
            return []
        except ValueError as e:
            logger.error(f"Erro ao processar JSON da resposta do Pipedrive: {str(e)}")
            return []

    
