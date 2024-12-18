from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.core.validators import MinLengthValidator, MaxLengthValidator
from django.db.models.signals import post_migrate
from django.dispatch import receiver
import pyotp
from django.utils import timezone
from django.core.exceptions import ValidationError
import logging
from django.db import transaction
from django.db import connection
from django.db.models import Index
from datetime import timedelta

logger = logging.getLogger(__name__)

class Clinica(models.Model):
    id = models.BigAutoField(primary_key=True)
    nome = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    ativa = models.BooleanField(default=True)
    logo = models.ImageField(upload_to='clinica_logos/', null=True, blank=True)
    pipedrive_api_token = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.nome
    pass

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('O e-mail é obrigatório')
        email = self.normalize_email(email)
        extra_fields.setdefault('date_joined', timezone.now())
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_staff', True)  # Adicionado
        extra_fields.setdefault('role', 'SA')
        return self.create_user(email, password, **extra_fields)
    pass

class Usuario(AbstractBaseUser, PermissionsMixin):
    id = models.BigAutoField(primary_key=True)
    SUPERADMIN = 'SA'
    ADMIN_CLINICA = 'AC'
    MEDICO = 'ME'
    ROLE_CHOICES = [
        (SUPERADMIN, 'Super Admin'),
        (ADMIN_CLINICA, 'Admin Clínica'),
        (MEDICO, 'Médico'),
    ]
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)  # Campo adicionado
    role = models.CharField(max_length=2, choices=ROLE_CHOICES, default=MEDICO)
    date_joined = models.DateTimeField(default=timezone.now)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    class Meta:
        db_table = 'server_usuario'
        permissions = [
            ("view_dashboard_geral", "Can view dashboard geral"),
            ("view_dashboard_clinica", "Can view dashboard clínica"),
            ("gravar_consulta", "Can gravar consulta"),
        ]
        indexes = [
            Index(fields=['email']),
            Index(fields=['role']),
        ]

    def __str__(self):
        return self.email

    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"

    def get_short_name(self):
        return self.first_name

    def save(self, *args, **kwargs):
        if self.role == self.SUPERADMIN:
            self.is_staff = True
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        try:
            with transaction.atomic():
                # Remove diretamente da tabela de grupos
                cursor = connection.cursor()
                cursor.execute(
                    "DELETE FROM server_usuario_groups WHERE usuario_id = %s",
                    [self.id]
                )
                
                if hasattr(self, 'medico'):
                    self.medico.delete()
                
                # Remove o usuário
                cursor.execute(
                    "DELETE FROM server_usuario WHERE id = %s",
                    [self.id]
                )
                
        except Exception as e:
            logger.error(f"Erro ao deletar usuário: {str(e)}")
            raise

    def has_perm(self, perm, obj=None):
        return self.is_staff

    def has_module_perms(self, app_label):
        return self.is_staff

    @classmethod
    def get_by_email(cls, email):
        return cls.objects.select_related('medico').get(email=email)

@receiver(post_migrate)
def create_custom_permissions(sender, **kwargs):
    from django.contrib.auth.models import Permission
    from django.contrib.contenttypes.models import ContentType

    content_type = ContentType.objects.get_for_model(Usuario)
    Permission.objects.get_or_create(
        codename='view_dashboard_geral',
        name='Can view dashboard geral',
        content_type=content_type,
    )
    Permission.objects.get_or_create(
        codename='view_dashboard_clinica',
        name='Can view dashboard clínica',
        content_type=content_type,
    )
    Permission.objects.get_or_create(
        codename='gravar_consulta',
        name='Can gravar consulta',
        content_type=content_type,
    )
    pass

class Medico(models.Model):
    usuario = models.OneToOneField('Usuario', on_delete=models.CASCADE, primary_key=True, related_name='medico')
    especialidade = models.CharField(max_length=100)
    clinica = models.ForeignKey(Clinica, on_delete=models.SET_NULL, null=True, blank=True, related_name='medicos')
    servicos = models.ManyToManyField('Servico', through='MedicoServico', related_name='medicos')

    def __str__(self):
        return f"{self.usuario.get_full_name()} - {self.especialidade}"

    def clean(self):
        if self.usuario.role not in ['ME', 'AC']:
            raise ValidationError("O usuário associado deve ter o papel de Médico ou Admin Clínica.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        try:
            with transaction.atomic():
                super().delete(*args, **kwargs)
        except Exception as e:
            logger.error(f"Erro ao deletar médico: {str(e)}")
            raise
    pass

class Paciente(models.Model):
    id = models.CharField(max_length=255, primary_key=True)
    nome = models.CharField(max_length=255)
    email = models.EmailField(blank=True, null=True)
    telefone = models.CharField(max_length=20, blank=True, null=True)
    idade = models.IntegerField(null=True, blank=True)
    genero = models.CharField(max_length=20, blank=True, null=True)
    ocupacao = models.CharField(max_length=100, blank=True, null=True)
    localizacao = models.CharField(max_length=255, blank=True, null=True)
    is_novo = models.BooleanField(default=True)
    clinica = models.ForeignKey(Clinica, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    ultima_consulta = models.DateTimeField(null=True, blank=True)
    
    def save(self, *args, **kwargs):
        # Atualiza is_novo baseado na existência de consultas anteriores
        if not self.pk:  # Novo paciente
            self.is_novo = True
        else:
            consultas_anteriores = self.consulta_set.exclude(
                id=kwargs.get('current_consulta_id')
            ).exists()
            self.is_novo = not consultas_anteriores
            
        super().save(*args, **kwargs)

    def __str__(self):
        return self.nome
    pass

class Servico(models.Model):
    nome = models.CharField(max_length=255)
    descricao = models.TextField(blank=True, null=True)
    ativo = models.BooleanField(default=True)

    def __str__(self):
        return self.nome

    class Meta:
        ordering = ['nome']
        db_table = 'server_servico'

class MedicoServico(models.Model):
    medico = models.ForeignKey(Medico, on_delete=models.CASCADE, related_name='medico_servicos')
    servico = models.ForeignKey(Servico, on_delete=models.CASCADE, related_name='medico_servicos')

    class Meta:
        db_table = 'server_medicoservico'
        unique_together = ('medico', 'servico')

    def __str__(self):
        return f"{self.medico} - {self.servico}"

class Consulta(models.Model):
    medico = models.ForeignKey(Medico, on_delete=models.CASCADE)
    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE)
    servico = models.ForeignKey(Servico, on_delete=models.CASCADE)
    data = models.DateTimeField()
    duracao = models.DurationField()
    audio_path = models.CharField(max_length=255, blank=True)
    incidente = models.BooleanField(default=False)
    satisfacao = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comentario = models.TextField(blank=True)
    enviado = models.BooleanField(default=False)
    valor = models.DecimalField(max_digits=10, decimal_places=2)
    summary = models.TextField(null=True, blank=True)
    satisfaction_score = models.FloatField(null=True)
    quality_index = models.FloatField(null=True)
    key_topics = models.JSONField(default=list)
    marketing_opportunities = models.JSONField(default=list)
    ai_processed = models.BooleanField(default=False)
    transcription_file = models.FileField(
        upload_to='transcriptions/%Y/%m/%d/', 
        null=True, 
        blank=True
    )
    summary_file = models.FileField(
        upload_to='summaries/%Y/%m/%d/', 
        null=True, 
        blank=True
    )
    procedimentos_desejados = models.JSONField(default=list, null=True)
    expectativas_paciente = models.JSONField(default=list, null=True)
    problemas_relatados = models.JSONField(default=list, null=True)
    experiencias_anteriores = models.JSONField(default=list, null=True)
    interesse_tratamentos = models.JSONField(default=list, null=True)
    motivacoes = models.JSONField(default=list, null=True)
    aspectos_emocionais = models.JSONField(default=list, null=True)
    preocupacoes_saude = models.JSONField(default=list, null=True)
    produtos_interesse = models.JSONField(default=list, null=True)

    def __str__(self):
        return f"Consulta {self.id} - {self.medico} - {self.paciente}"
    pass

class ClinicRegistration(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pendente'),
        ('approved', 'Aprovado'),
        ('rejected', 'Rejeitado')
    ]
    
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    address = models.TextField()
    owner_name = models.CharField(max_length=255)
    owner_document = models.CharField(max_length=20)
    business_document = models.CharField(max_length=20)
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES,
        default='pending'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    processed_by = models.ForeignKey(
        Usuario,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='processed_registrations'
    )
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.name} - {self.status}"
    pass
