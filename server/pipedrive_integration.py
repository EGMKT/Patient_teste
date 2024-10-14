import requests
from django.conf import settings

def create_pipedrive_person(paciente):
    url = f"{settings.PIPEDRIVE_API_URL}/persons"
    data = {
        "name": paciente.nome,
        "email": paciente.email,
        "phone": paciente.telefone,
    }
    headers = {
        "Authorization": f"Bearer {settings.PIPEDRIVE_API_TOKEN}",
    }
    response = requests.post(url, json=data, headers=headers)
    return response.json()

def create_pipedrive_deal(consulta):
    url = f"{settings.PIPEDRIVE_API_URL}/deals"
    data = {
        "title": f"Consulta - {consulta.paciente.nome}",
        "person_id": consulta.paciente.pipedrive_id,
        "stage_id": settings.PIPEDRIVE_STAGE_ID,
    }
    headers = {
        "Authorization": f"Bearer {settings.PIPEDRIVE_API_TOKEN}",
    }
    response = requests.post(url, json=data, headers=headers)
    return response.json()