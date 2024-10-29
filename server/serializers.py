from rest_framework import serializers
from .models import Clinica, Usuario, Medico, Paciente, Servico, Consulta, ClinicRegistration
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class ClinicaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Clinica
        fields = ['id', 'nome', 'created_at', 'ativa', 'pipedrive_api_token']

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'email', 'first_name', 'last_name', 'role']

class MedicoSerializer(serializers.ModelSerializer):
    usuario_email = serializers.EmailField(source='usuario.email', read_only=True)
    clinica_nome = serializers.CharField(source='clinica.nome', read_only=True)
    
    class Meta:
        model = Medico
        fields = ['usuario', 'usuario_email', 'especialidade', 'clinica', 'clinica_nome']

    def create(self, validated_data):
        usuario_email = self.context['request'].data.get('usuario_email')
        if not usuario_email:
            raise serializers.ValidationError("O email do usuário é obrigatório.")
        
        try:
            usuario = Usuario.objects.get(email=usuario_email, role__in=['ME', 'AC'])
        except Usuario.DoesNotExist:
            raise serializers.ValidationError("Usuário não encontrado ou não é um médico/admin clínica.")
        
        validated_data['usuario'] = usuario
        return Medico.objects.create(**validated_data)

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

class MedicoNestedSerializer(serializers.ModelSerializer):
    clinica = ClinicaSerializer(read_only=True)
    clinica_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = Medico
        fields = ['especialidade', 'clinica', 'clinica_id']

class UsuarioSerializer(serializers.ModelSerializer):
    medico = MedicoNestedSerializer(required=False)
    
    class Meta:
        model = Usuario
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'medico']

    def update(self, instance, validated_data):
        medico_data = validated_data.pop('medico', None)
        
        # Atualiza dados do usuário
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Atualiza dados do médico se existirem
        if medico_data and hasattr(instance, 'medico'):
            medico = instance.medico
            clinica_id = medico_data.get('clinica_id')
            if clinica_id:
                medico.clinica_id = clinica_id
            if 'especialidade' in medico_data:
                medico.especialidade = medico_data['especialidade']
            medico.save()

        return instance
