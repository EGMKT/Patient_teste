from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Clinica, Usuario, Medico, Paciente, Servico, Consulta
from django import forms

@admin.register(Usuario)
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'first_name', 'last_name', 'role', 'is_active', 'is_staff', 'is_superuser')
    list_filter = ('role', 'is_active', 'is_staff', 'is_superuser')
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Informações Pessoais', {'fields': ('first_name', 'last_name')}),
        ('Permissões', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Datas Importantes', {'fields': ('last_login', 'date_joined')}),
        ('Informações adicionais', {'fields': ('role',)}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'role', 'is_active', 'is_staff', 'is_superuser'),
        }),
    )
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)

    def get_clinica(self, obj):
        try:
            return obj.medico.clinica if hasattr(obj, 'medico') else None
        except Medico.DoesNotExist:
            return None
    get_clinica.short_description = 'Clínica'

@admin.register(Clinica)
class ClinicaAdmin(admin.ModelAdmin):
    list_display = ('nome', 'created_at', 'ativa')
    list_filter = ('ativa',)
    search_fields = ('nome',)
    fields = ('nome', 'ativa', 'logo', 'pipedrive_api_token')

class MedicoAdminForm(forms.ModelForm):
    class Meta:
        model = Medico
        fields = ['usuario', 'especialidade', 'clinica']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if 'usuario' in self.fields:
            self.fields['usuario'].queryset = Usuario.objects.filter(role__in=['ME', 'AC'])
            self.fields['usuario'].label_from_instance = lambda obj: f"{obj.email} - {obj.get_full_name()}"

@admin.register(Medico)
class MedicoAdmin(admin.ModelAdmin):
    form = MedicoAdminForm
    list_display = ('get_usuario_email', 'get_usuario_nome', 'especialidade', 'clinica')
    list_filter = ('especialidade', 'clinica')
    search_fields = ('usuario__email', 'usuario__first_name', 'usuario__last_name', 'especialidade')

    def get_usuario_nome(self, obj):
        return obj.usuario.get_full_name()
    get_usuario_nome.short_description = 'Nome do Usuário'

    def get_usuario_email(self, obj):
        return obj.usuario.email
    get_usuario_email.short_description = 'Email do Usuário'

    def get_readonly_fields(self, request, obj=None):
        if obj:  # Editing an existing object
            return ('usuario',)
        return ()

    def has_change_permission(self, request, obj=None):
        return True

    def has_delete_permission(self, request, obj=None):
        return True

    def save_model(self, request, obj, form, change):
        if not change:  # Only when creating a new object
            usuario = form.cleaned_data['usuario']
            obj.usuario = usuario
        super().save_model(request, obj, form, change)

@admin.register(Paciente)
class PacienteAdmin(admin.ModelAdmin):
    list_display = ('nome', 'email', 'clinica', 'is_novo', 'data_cadastro')
    list_filter = ('clinica', 'is_novo')
    search_fields = ('nome', 'email')

@admin.register(Servico)
class ServicoAdmin(admin.ModelAdmin):
    list_display = ('nome','ativo')
    list_filter = ('ativo',)
    search_fields = ('nome',)

    def get_medico_nome(self, obj):
        return f"{obj.medico.usuario.get_full_name()}"
    get_medico_nome.short_description = 'Médico'

@admin.register(Consulta)
class ConsultaAdmin(admin.ModelAdmin):
    list_display = ('id', 'medico', 'paciente', 'servico', 'data', 'duracao', 'enviado')
    list_filter = ('enviado', 'data', 'medico__especialidade')
    search_fields = ('medico__usuario__email', 'paciente__nome', 'servico__nome')
    date_hierarchy = 'data'
# Comente ou remova esta função se não estiver mais usando
# def create_custom_theme():
#     theme = Theme.objects.get_or_create(name='PatientFunnel Theme')[0]
#     theme.title = 'PatientFunnel Admin'
#     theme.logo = 'path/to/your/logo.png'  # Adicione seu logo
#     theme.css_header_background_color = '#4a4a4a'
#     theme.css_header_text_color = '#ffffff'
#     theme.css_header_link_color = '#ffffff'
#     theme.css_module_background_color = '#efefef'
#     theme.css_module_text_color = '#000000'
#     theme.css_module_link_color = '#4a4a4a'
#     theme.css_generic_link_color = '#4a4a4a'
#     theme.save()

# Comente ou remova esta linha
# create_custom_theme()

# Remova ou comente esta parte
# class MyAdminSite(admin.AdminSite):
#     def each_context(self, request):
#         context = super().each_context(request)
#         context['extra_css'] = [
#             'admin/css/responsive.css',
#         ]
#         return context

# admin_site = MyAdminSite(name='myadmin')
