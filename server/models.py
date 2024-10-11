from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinLengthValidator, MaxLengthValidator

class Clinica(models.Model):
    nome = models.CharField(max_length=255)
    # outros campos relevantes

class Usuario(AbstractUser):
    clinica = models.ForeignKey(Clinica, on_delete=models.CASCADE, null=True)
    is_admin = models.BooleanField(default=False)
    pin = models.CharField(max_length=6, blank=True)

class Medico(models.Model):
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE)
    especialidade = models.CharField(max_length=100)
    pin = models.CharField(
        max_length=6,
        validators=[MinLengthValidator(6), MaxLengthValidator(6)],
        help_text="PIN de 6 dígitos para acesso"
    )

    def save(self, *args, **kwargs):
        if not self.pin.isdigit():
            raise ValueError("PIN deve conter apenas números")
        super().save(*args, **kwargs)

class Paciente(models.Model):
    nome = models.CharField(max_length=255)
    clinica = models.ForeignKey(Clinica, on_delete=models.CASCADE)
    # outros campos relevantes

class Servico(models.Model):
    nome = models.CharField(max_length=255)
    clinica = models.ForeignKey(Clinica, on_delete=models.CASCADE)

class Consulta(models.Model):
    medico = models.ForeignKey(Medico, on_delete=models.CASCADE)
    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE)
    servico = models.ForeignKey(Servico, on_delete=models.CASCADE)
    data = models.DateTimeField()
    audio_path = models.CharField(max_length=255, blank=True)