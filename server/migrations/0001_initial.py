# Generated by Django 5.1.2 on 2024-11-02 08:17

import datetime
import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='Usuario',
            fields=[
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('id', models.BigAutoField(primary_key=True, serialize=False)),
                ('email', models.EmailField(max_length=254, unique=True)),
                ('first_name', models.CharField(blank=True, max_length=30)),
                ('last_name', models.CharField(blank=True, max_length=30)),
                ('is_active', models.BooleanField(default=True)),
                ('is_staff', models.BooleanField(default=False)),
                ('role', models.CharField(choices=[('SA', 'Super Admin'), ('AC', 'Admin Clínica'), ('ME', 'Médico')], default='ME', max_length=2)),
                ('date_joined', models.DateTimeField(default=django.utils.timezone.now)),
                ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.group', verbose_name='groups')),
                ('user_permissions', models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.permission', verbose_name='user permissions')),
            ],
            options={
                'db_table': 'server_usuario',
                'permissions': [('view_dashboard_geral', 'Can view dashboard geral'), ('view_dashboard_clinica', 'Can view dashboard clínica'), ('gravar_consulta', 'Can gravar consulta')],
            },
        ),
        migrations.CreateModel(
            name='Clinica',
            fields=[
                ('id', models.BigAutoField(primary_key=True, serialize=False)),
                ('nome', models.CharField(max_length=100)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('ativa', models.BooleanField(default=True)),
                ('logo', models.ImageField(blank=True, null=True, upload_to='clinica_logos/')),
                ('pipedrive_api_token', models.CharField(blank=True, max_length=255, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='Servico',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nome', models.CharField(max_length=255)),
                ('descricao', models.TextField(blank=True)),
                ('duracao_padrao', models.DurationField(blank=True, default=datetime.timedelta(seconds=3600), null=True)),
                ('ativo', models.BooleanField(default=True)),
            ],
            options={
                'ordering': ['nome'],
            },
        ),
        migrations.CreateModel(
            name='Medico',
            fields=[
                ('usuario', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, primary_key=True, related_name='medico', serialize=False, to=settings.AUTH_USER_MODEL)),
                ('especialidade', models.CharField(max_length=100)),
                ('clinica', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='medicos', to='server.clinica')),
            ],
        ),
        migrations.CreateModel(
            name='ClinicRegistration',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('email', models.EmailField(max_length=254)),
                ('phone', models.CharField(max_length=20)),
                ('address', models.TextField()),
                ('owner_name', models.CharField(max_length=255)),
                ('owner_document', models.CharField(max_length=20)),
                ('business_document', models.CharField(max_length=20)),
                ('status', models.CharField(choices=[('pending', 'Pendente'), ('approved', 'Aprovado'), ('rejected', 'Rejeitado')], default='pending', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('processed_at', models.DateTimeField(blank=True, null=True)),
                ('notes', models.TextField(blank=True)),
                ('processed_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='processed_registrations', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Paciente',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nome', models.CharField(max_length=255)),
                ('email', models.EmailField(max_length=254)),
                ('is_novo', models.BooleanField(default=True)),
                ('idade', models.IntegerField()),
                ('genero', models.CharField(max_length=50)),
                ('ocupacao', models.CharField(max_length=100)),
                ('localizacao', models.CharField(max_length=255)),
                ('data_cadastro', models.DateTimeField(auto_now_add=True)),
                ('clinica', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='server.clinica')),
            ],
        ),
        migrations.CreateModel(
            name='MedicoServico',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('servico', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='medico_servicos', to='server.servico')),
                ('medico', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='medico_servicos', to='server.medico')),
            ],
        ),
        migrations.CreateModel(
            name='Consulta',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('data', models.DateTimeField()),
                ('duracao', models.DurationField()),
                ('audio_path', models.CharField(blank=True, max_length=255)),
                ('incidente', models.BooleanField(default=False)),
                ('satisfacao', models.IntegerField(choices=[(1, 1), (2, 2), (3, 3), (4, 4), (5, 5)])),
                ('comentario', models.TextField(blank=True)),
                ('enviado', models.BooleanField(default=False)),
                ('valor', models.DecimalField(decimal_places=2, max_digits=10)),
                ('summary', models.TextField(blank=True, null=True)),
                ('satisfaction_score', models.FloatField(null=True)),
                ('quality_index', models.FloatField(null=True)),
                ('key_topics', models.JSONField(default=list)),
                ('marketing_opportunities', models.JSONField(default=list)),
                ('ai_processed', models.BooleanField(default=False)),
                ('transcription_file', models.FileField(blank=True, null=True, upload_to='transcriptions/%Y/%m/%d/')),
                ('summary_file', models.FileField(blank=True, null=True, upload_to='summaries/%Y/%m/%d/')),
                ('paciente', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='server.paciente')),
                ('servico', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='server.servico')),
                ('medico', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='server.medico')),
            ],
        ),
        migrations.AddIndex(
            model_name='usuario',
            index=models.Index(fields=['email'], name='server_usua_email_07ca48_idx'),
        ),
        migrations.AddIndex(
            model_name='usuario',
            index=models.Index(fields=['role'], name='server_usua_role_db15a4_idx'),
        ),
        migrations.AlterUniqueTogether(
            name='medicoservico',
            unique_together={('medico', 'servico')},
        ),
    ]
