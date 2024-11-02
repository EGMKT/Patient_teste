# server/migrations/0003_fix_servico_duration.py

from django.db import migrations, models
import datetime

class Migration(migrations.Migration):

    dependencies = [
        ('server', '0003_alter_servico_table'),
    ]

    operations = [
        migrations.AlterField(
            model_name='servico',
            name='duracao_padrao',
            field=models.DurationField(
                blank=True,
                null=True,
                default=datetime.timedelta(hours=1)
            ),
        ),
    ]