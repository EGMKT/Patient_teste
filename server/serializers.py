from rest_framework import serializers
from .models import Clinica, Usuario, Medico, Paciente, Servico, Consulta, ClinicRegistration
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class ClinicaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Clinica
        fields = '__all__'

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_active', 'is_staff']
        # Adicione ou remova campos conforme necessário

class MedicoSerializer(serializers.ModelSerializer):
    usuario = UsuarioSerializer(read_only=True)
    
    class Meta:
        model = Medico
        fields = ['id', 'nome', 'especialidade', 'pin', 'usuario']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['nome'] = instance.nome or 'Nome não disponível'
        representation['especialidade'] = instance.especialidade or 'Especialidade não disponível'
        return representation

class PacienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Paciente
        fields = ['id', 'nome', 'email']

    def validate_email(self, value):
        if not value.endswith('@example.com'):
            raise serializers.ValidationError("Email inválido.")
        return value

class ConsultaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Consulta
        fields = ['id', 'medico', 'paciente', 'data', 'descricao']

    def validate_data(self, value):
        if value < timezone.now():
            raise serializers.ValidationError("A data da consulta não pode ser no passado.")
        return value

# Adicione serializers similares para Servico

class ServicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Servico
        fields = '__all__'

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        token['role'] = user.role
        return token

class ConsultaListSerializer(serializers.ModelSerializer):
    paciente = serializers.StringRelatedField()
    medico = serializers.StringRelatedField()

    class Meta:
        model = Consulta
        fields = ['id', 'paciente', 'medico', 'data', 'duracao', 'enviado']

class ClinicRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClinicRegistration
        fields = '__all__'
