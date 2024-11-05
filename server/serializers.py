from rest_framework import serializers
from datetime import timedelta, timezone
from .models import Clinica, Usuario, Medico, Paciente, Servico, Consulta, ClinicRegistration, MedicoServico, ClinicRegistration 
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer



class ClinicaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Clinica
        fields = ['id', 'nome', 'created_at', 'ativa', 'pipedrive_api_token']


class PacienteSerializer(serializers.ModelSerializer):
    clinica = ClinicaSerializer(read_only=True)
    
    class Meta:
        model = Paciente
        fields = [
            'id', 'nome', 'email', 'is_novo', 'idade', 
            'genero', 'ocupacao', 'localizacao',
            'clinica'
        ]

    def validate_email(self, value):
        if value and not value.endswith('@example.com'):
            raise serializers.ValidationError("Email inválido.")
        return value

class ConsultaSerializer(serializers.ModelSerializer):
    medico = serializers.SerializerMethodField()
    paciente = serializers.SerializerMethodField()
    servico = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = Consulta
        fields = [
            'id', 'data', 'duracao', 'medico', 'paciente', 
            'servico', 'ai_processed', 'satisfaction_score',
            'quality_index', 'summary', 'status'
        ]

    def get_medico(self, obj):
        return {
            'id': obj.medico.usuario.id,
            'nome': f"{obj.medico.usuario.first_name} {obj.medico.usuario.last_name}",
            'especialidade': obj.medico.especialidade
        }

    def get_paciente(self, obj):
        return {
            'id': obj.paciente.id,
            'nome': obj.paciente.nome
        }

    def get_servico(self, obj):
        return {
            'id': obj.servico.id,
            'nome': obj.servico.nome
        }

    def validate_data(self, value):
        if value < timezone.now():
            raise serializers.ValidationError("A data da consulta não pode ser no passado.")
        return value
    
    def get_status(self, obj):
        if not obj.enviado:
            return "pendente"
        elif not obj.ai_processed:
            return "processando"
        return "concluído"

# Adicione serializers similares para Servico

class ServicoSerializer(serializers.ModelSerializer):

    class Meta:
        model = Servico
        fields = ['id', 'nome', 'descricao', 'ativo']

class MedicoServicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicoServico
        fields = ['medico', 'servico']

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        token['role'] = user.role
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user

        # Verifica se o usuário é médico e se sua clínica está ativa
        if user.role in ['ME', 'AC'] and hasattr(user, 'medico'):
            clinica = user.medico.clinica
            if not clinica or not clinica.ativa:
                raise serializers.ValidationError({
                    "detail": "Acesso negado. A clínica está desativada."
                })

        return data

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
    servicos = serializers.PrimaryKeyRelatedField(many=True, queryset=Servico.objects.all(), required=False)

    class Meta:
        model = Medico
        fields = ['especialidade', 'clinica', 'clinica_id', 'servicos']


class UsuarioSerializer(serializers.ModelSerializer):
    medico = MedicoNestedSerializer(required=False)
    password = serializers.CharField(write_only=True, required=False)
    is_active = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Usuario
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'password', 'medico', 'is_active']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        medico_data = validated_data.pop('medico', None)
        password = validated_data.pop('password', None)
        
        # Cria o usuário
        user = Usuario.objects.create(**validated_data)
        if password:
            user.set_password(password)
            user.save()

        # Se for médico, cria o registro de médico
        if medico_data and user.role in ['ME', 'AC']:
            clinica_id = medico_data.pop('clinica_id', None)
            servicos = medico_data.pop('servicos', [])
            medico = Medico.objects.create(
                usuario=user,
                clinica_id=clinica_id,
                **medico_data
            )
            if servicos:
                medico.servicos.set(servicos)

        return user

    def update(self, instance, validated_data):
        medico_data = validated_data.pop('medico', None)
        password = validated_data.pop('password', None)
        
        # Atualiza dados do usuário
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if password:
            instance.set_password(password)
        
        instance.save()

        # Atualiza ou cria dados do médico
        if medico_data and instance.role in ['ME', 'AC']:
            medico, created = Medico.objects.get_or_create(usuario=instance)
            clinica_id = medico_data.pop('clinica_id', None)
            servicos = medico_data.pop('servicos', None)
            
            if clinica_id:
                medico.clinica_id = clinica_id
            
            for attr, value in medico_data.items():
                setattr(medico, attr, value)
            
            medico.save()

            # Atualiza os serviços se fornecidos
            if servicos is not None:
                medico.servicos.set(servicos)
                
        elif instance.role not in ['ME', 'AC'] and hasattr(instance, 'medico'):
            # Se não é mais médico, remove o registro de médico
            instance.medico.delete()

        return instance
    
class MedicoSerializer(serializers.ModelSerializer):
    usuario = UsuarioSerializer(read_only=True)
    usuario_email = serializers.EmailField(source='usuario.email', read_only=True)
    clinica_nome = serializers.CharField(source='clinica.nome', read_only=True)
    total_consultas = serializers.IntegerField(read_only=True)
    usuario_nome = serializers.SerializerMethodField()
    
    class Meta:
        model = Medico
        fields = [
            'usuario', 
            'usuario_email', 
            'usuario_nome',
            'especialidade', 
            'clinica', 
            'clinica_nome', 
            'total_consultas'
        ]

    def get_usuario_nome(self, obj):
        return f"{obj.usuario.first_name} {obj.usuario.last_name}"

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

class ReportSerializer(serializers.Serializer):
    totalPatientsAttended = serializers.IntegerField()
    patientsPerDoctor = serializers.DictField(child=serializers.IntegerField())
    newPatientsAttended = serializers.IntegerField()
    returningPatientsAttended = serializers.IntegerField()
    patientRetentionRate = serializers.FloatField()
    averageConsultationTime = serializers.FloatField()
    overallPatientSatisfaction = serializers.FloatField()
    doctorQualityIndex = serializers.DictField(child=serializers.FloatField())
    patientDemographics = serializers.DictField()