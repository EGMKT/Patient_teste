from rest_framework import serializers
from .models import Clinica, Usuario, Medico, Paciente, Servico, Consulta

class ClinicaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Clinica
        fields = '__all__'

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ('id', 'username', 'email', 'is_admin', 'clinica')

class MedicoSerializer(serializers.ModelSerializer):
    usuario = UsuarioSerializer()
    class Meta:
        model = Medico
        fields = ['id', 'nome', 'especialidade', 'pin']

    def validate_pin(self, value):
        if not value.isdigit() or len(value) != 6:
            raise serializers.ValidationError("PIN deve ser um número de 6 dígitos.")
        return value

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