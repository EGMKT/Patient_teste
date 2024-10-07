from django.db import models
from django.contrib.auth.models import User

class Clinica(models.Model):
    nome = models.CharField(max_length=255)
    user = models.OneToOneField(User, on_delete=models.CASCADE)

class Medico(models.Model):
    nome = models.CharField(max_length=255)
    clinica = models.ForeignKey(Clinica, related_name='medicos', on_delete=models.CASCADE)

class Paciente(models.Model):
    nome = models.CharField(max_length=255)
    medico = models.ForeignKey(Medico, related_name='pacientes', on_delete=models.CASCADE)

class Clinica(models.Model):
    nome = models.CharField(max_length=255)
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.nome

class Medico(models.Model):
    nome = models.CharField(max_length=255)
    clinica = models.ForeignKey(Clinica, related_name='medicos', on_delete=models.CASCADE)

    def __str__(self):
        return self.nome

class Paciente(models.Model):
    nome = models.CharField(max_length=255)
    medico = models.ForeignKey(Medico, related_name='pacientes', on_delete=models.CASCADE)

    def __str__(self):
        return self.nome