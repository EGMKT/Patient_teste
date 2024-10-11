import requests

class PipedriveConnector:
    def __init__(self, api_token):
        self.api_token = api_token
        self.base_url = "https://api.pipedrive.com/v1/"

    def get_patients(self):
        response = requests.get(f"{self.base_url}persons?api_token={self.api_token}")
        return response.json()

    def create_appointment(self, patient_id, doctor_id, date):
        data = {
            "person_id": patient_id,
            "user_id": doctor_id,
            "due_date": date,
            "type": "appointment"
        }
        response = requests.post(f"{self.base_url}activities?api_token={self.api_token}", json=data)
        return response.json()
