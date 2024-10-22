from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Clinica, Usuario, Medico, Paciente, Servico, Consulta
from admin_interface.models import Theme

@admin.register(Usuario)
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'first_name', 'last_name', 'role', 'clinica', 'is_staff')
    list_filter = ('role', 'clinica', 'is_staff')
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Informações Pessoais', {'fields': ('first_name', 'last_name')}),
        ('Permissões', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Datas Importantes', {'fields': ('last_login', 'date_joined')}),
        ('Informações adicionais', {'fields': ('role', 'clinica')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'role', 'clinica'),
        }),
    )
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)

@admin.register(Clinica)
class ClinicaAdmin(admin.ModelAdmin):
    list_display = ('nome', 'created_at', 'ativa')
    list_filter = ('ativa',)
    search_fields = ('nome',)

@admin.register(Medico)
class MedicoAdmin(admin.ModelAdmin):
    list_display = ('get_nome', 'especialidade', 'get_clinica', 'pin')
    list_filter = ('especialidade', 'usuario__clinica')
    search_fields = ('usuario__email', 'usuario__first_name', 'usuario__last_name', 'especialidade')

    def get_nome(self, obj):
        return obj.usuario.get_full_name()
    get_nome.short_description = 'Nome'

    def get_clinica(self, obj):
        return obj.usuario.clinica
    get_clinica.short_description = 'Clínica'

@admin.register(Paciente)
class PacienteAdmin(admin.ModelAdmin):
    list_display = ('nome', 'email', 'clinica', 'is_novo', 'data_cadastro')
    list_filter = ('clinica', 'is_novo')
    search_fields = ('nome', 'email')

@admin.register(Servico)
class ServicoAdmin(admin.ModelAdmin):
    list_display = ('nome', 'clinica', 'preco')
    list_filter = ('clinica',)
    search_fields = ('nome',)

@admin.register(Consulta)
class ConsultaAdmin(admin.ModelAdmin):
    list_display = ('id', 'medico', 'paciente', 'servico', 'data', 'duracao', 'enviado')
    list_filter = ('enviado', 'data', 'medico__especialidade')
    search_fields = ('medico__user__email', 'paciente__nome', 'servico__nome')
    date_hierarchy = 'data'

def create_custom_theme():
    theme = Theme.objects.get_or_create(name='PatientFunnel Theme')[0]
    theme.title = 'PatientFunnel Admin'
    theme.logo = 'path/to/your/logo.png'  # Adicione seu logo
    theme.css_header_background_color = '#4a4a4a'
    theme.css_header_text_color = '#ffffff'
    theme.css_header_link_color = '#ffffff'
    theme.css_module_background_color = '#efefef'
    theme.css_module_text_color = '#000000'
    theme.css_module_link_color = '#4a4a4a'
    theme.css_generic_link_color = '#4a4a4a'
    theme.save()

# Chame esta função quando o servidor iniciar
create_custom_theme()

# Remova ou comente esta parte
# class MyAdminSite(admin.AdminSite):
#     def each_context(self, request):
#         context = super().each_context(request)
#         context['extra_css'] = [
#             'admin/css/responsive.css',
#         ]
#         return context

# admin_site = MyAdminSite(name='myadmin')
