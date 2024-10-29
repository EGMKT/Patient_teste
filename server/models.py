from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.core.validators import MinLengthValidator, MaxLengthValidator
from django.db.models.signals import post_migrate
from django.dispatch import receiver
import pyotp
from django.utils import timezone
from django.core.exceptions import ValidationError

class Clinica(models.Model):
    id = models.BigAutoField(primary_key=True)
    nome = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    ativa = models.BooleanField(default=True)
    logo = models.ImageField(upload_to='clinica_logos/', null=True, blank=True)
    pipedrive_api_token = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.nome

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

class Medico(models.Model):
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE, primary_key=True, related_name='medico')
    especialidade = models.CharField(max_length=100)
    clinica = models.ForeignKey(Clinica, on_delete=models.SET_NULL, null=True, blank=True, related_name='medicos')

    def __str__(self):
        return f"{self.usuario.get_full_name()} - {self.especialidade}"

    def clean(self):
        if self.usuario.role not in ['ME', 'AC']:
            raise ValidationError("O usuário associado deve ter o papel de Médico ou Admin Clínica.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

class Paciente(models.Model):
    nome = models.CharField(max_length=255)
    clinica = models.ForeignKey(Clinica, on_delete=models.CASCADE)
    email = models.EmailField()
    is_novo = models.BooleanField(default=True)
    idade = models.IntegerField()
    genero = models.CharField(max_length=50)
    ocupacao = models.CharField(max_length=100)
    localizacao = models.CharField(max_length=255)
    data_cadastro = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nome

class Servico(models.Model):
    nome = models.CharField(max_length=255)
    clinica = models.ForeignKey(Clinica, on_delete=models.CASCADE)
    preco = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.nome} - {self.clinica.nome}"

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

    def __str__(self):
        return f"Consulta {self.id} - {self.medico} - {self.paciente}"

class ClinicRegistration(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField()
    status = models.CharField(max_length=20, choices=[('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected')], default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

        return self.name
