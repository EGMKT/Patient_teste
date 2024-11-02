# server/migrations/XXXX_create_medicoservico_table.py

from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('server', '0008_alter_medicoservico_table'),
    ]

    operations = [
        migrations.RunSQL(
            """
            DROP TABLE IF EXISTS server_medicoservico CASCADE;
            CREATE TABLE server_medicoservico (
                id SERIAL PRIMARY KEY,
                medico_id INTEGER NOT NULL REFERENCES server_medico(usuario_id) ON DELETE CASCADE,
                servico_id INTEGER NOT NULL REFERENCES server_servico(id) ON DELETE CASCADE,
                UNIQUE(medico_id, servico_id)
            );
            """,
            reverse_sql="DROP TABLE server_medicoservico;"
        ),
    ]