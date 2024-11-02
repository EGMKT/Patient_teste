# server/migrations/0002_fix_servico.py

from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('server', '0001_initial'),
    ]

    operations = [
        migrations.RunSQL(
            """
            DROP TABLE IF EXISTS server_servico CASCADE;
            CREATE TABLE server_servico (
                id SERIAL PRIMARY KEY,
                nome VARCHAR(255) NOT NULL,
                descricao TEXT,
                duracao_padrao INTERVAL,
                ativo BOOLEAN DEFAULT TRUE
            );
            """,
            reverse_sql="DROP TABLE server_servico;"
        ),
    ]