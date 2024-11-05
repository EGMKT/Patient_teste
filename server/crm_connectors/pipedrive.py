import requests
from django.conf import settings
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

class PipedriveClient:
    BASE_URL = 'https://api.pipedrive.com/v1'

    def __init__(self, api_token: str):
        self.api_token = api_token
        self.session = requests.Session()

    def _make_request(self, method: str, endpoint: str, **kwargs) -> Dict[str, Any]:
        url = f"{self.BASE_URL}/{endpoint}"
        params = kwargs.get('params', {})
        params['api_token'] = self.api_token

        try:
            response = self.session.request(
                method=method,
                url=url,
                params=params,
                **kwargs
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Erro na requisição ao Pipedrive: {str(e)}")
            raise

    def get_persons(self):
        """Busca todas as pessoas (pacientes) do Pipedrive"""
        required_fields = {
            'name': 'nome',
            'email': [{'value': 'email', 'primary': True}],
            'phone': [{'value': 'telefone', 'primary': True}],
            'age': 'idade',
            'gender': 'genero',
            'occupation': 'ocupacao',
            'location': 'localizacao'
        }
        try:
            response = self._make_request('GET', 'persons')
            if response.get('success'):
                return response.get('data', [])
            return []
        except Exception as e:
            logger.error(f"Erro ao buscar pessoas do Pipedrive: {str(e)}")
            return []

    
