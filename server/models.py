from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.core.validators import MinLengthValidator, MaxLengthValidator
import random
from django.db.models.signals import post_migrate
from django.dispatch import receiver
import pyotp
import string

class Clinica(models.Model):
    nome = models.CharField(max_length=255)
    logo = models.ImageField(upload_to='logos/', null=True, blank=True)
    pipedrive_api_token = models.CharField(max_length=255, blank=True)
    data_criacao = models.DateTimeField(auto_now_add=True)
    ativa = models.BooleanField(default=True)
    # outros campos relevantes

    def __str__(self):
        return self.nome

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('O e-mail é obrigatório')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

class Usuario(AbstractBaseUser, PermissionsMixin):
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
    is_staff = models.BooleanField(default=False)
    role = models.CharField(max_length=2, choices=ROLE_CHOICES, default=MEDICO)
    clinica = models.ForeignKey('Clinica', on_delete=models.SET_NULL, null=True, blank=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email

    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"

    def get_short_name(self):
        return self.first_name

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
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE)
    nome = models.CharField(max_length=100)
    especialidade = models.CharField(max_length=100)
    pin = models.CharField(max_length=6, blank=True)

    def save(self, *args, **kwargs):
        if not self.pin:
            self.pin = ''.join(random.choices(string.digits, k=6))
        super().save(*args, **kwargs)

    def __str__(self):
        return self.nome

    def enable_two_factor(self):
        if not self.two_factor_enabled:
            self.two_factor_secret = pyotp.random_base32()
            self.two_factor_enabled = True
            self.save()

    def disable_two_factor(self):
        self.two_factor_enabled = False
        self.two_factor_secret = None
        self.save()

    def verify_two_factor(self, token):
        if self.two_factor_enabled:
            totp = pyotp.TOTP(self.two_factor_secret)
            return totp.verify(token)
        return False

    def add_trusted_device(self, device_id):
        if device_id not in self.trusted_devices:
            self.trusted_devices.append(device_id)
            self.save()

    def is_trusted_device(self, device_id):
        return device_id in self.trusted_devices

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

    def __str__(self):
        return f"Consulta {self.id} - {self.medico} - {self.paciente}"
