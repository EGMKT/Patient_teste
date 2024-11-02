# server/migrations/0003_fix_servico_duration.py

from django.db import migrations, models
import datetime

class Migration(migrations.Migration):

    dependencies = [
        ('server', '0004_fix_servico_duration'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='servico',
            name='duracao_padrao',
        ),
    ]