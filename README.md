# PatientFunnel Web App

## Descrição
PatientFunnel é uma aplicação web desenvolvida para gerenciamento eficiente de consultas médicas e gravação de áudio. Esta solução visa otimizar o fluxo de trabalho em ambientes médicos, proporcionando uma interface intuitiva para profissionais de saúde.

## Níveis de acesso
1. Super Admin (SA)
  - [x] Gerenciamento do app
  - [ ] Controle de acessos de clínicas
  - [x] Dashboard geral
  - [ ] Dashboard de cada clínica
  - [ ] Configurações
2. Admin de Clínica (AM)
  - [ ] Mesmo acesso dos médicos
  - [ ] Dashboard da clínica
  - [ ] Configurações
3. Médicos (ME)
  - [x] Seleção de médico para consulta
  - [x] Configuração detalhada de consulta
  - [x] Gravação de áudio da consulta com visualização em tempo real

## Funcionalidades Principais
- [x] Autenticação de usuário (login/logout)
- [x] Dashboard para Super Admin
- [ ] Resposta do backend mais rápida
- [ ] Abreviar nome (no nome do meio) dos médicos e médicos admin automáticamente
- [x] Interface para Super Admin visualizar os bancos de dados
- [ ] Acesso fácil e manipulação do back e dados através do dashboard do Super Admin
- [ ] Api documentada com (gitbook) e exclusiva para time interno da PatientFunnel
- [ ] Dashboard para Admin de Clínica
- [x] Seleção de médico para consulta
- [x] Configuração detalhada de consulta
- [x] Gravação de áudio da consulta com visualização em tempo real
- [x] Envio seguro de gravações para processamento posterior
- [x] Integração com Pipedrive
- [x] Armazenamento local de áudios e sincronização posterior
- [x] Suporte a múltiplos idiomas
- [x] Verificação de Duplo Fator para médicos (opcional)
- [x] Funcionalidade "Lembrar desse dispositivo" para 2FA
- [ ] Aba de configurações básica do médico (Ativa e desativa 2FA)
- [ ] Segurança de dados  
- [ ] Segurança de infraestrutura
- [ ] Segurança contra acessos não autorizados e forçados (ex: tentar acessar uma página que não tem autorização, acesso revogado, etc)
- [ ] Página de erro 404 (página não encontrada)

## Tecnologias Utilizadas
PatientFunnel está hospedado no DigitalOcean.
### Frontend
- [x] React 18.2.0
- [x] TypeScript 4.9.5
- [x] Tailwind CSS 3.3.2
- [x] Axios 1.4.0
- [x] Wavesurfer.js 6.6.3
- [x] React Router Dom 6.11.2
- [x] i18next para internacionalização

### Backend
- [x] Django 3.2
- [x] Django Rest Framework
- [ ] Django Channels (para WebSockets)
- [ ] Celery (para tarefas assíncronas)
- [x] PostgreSQL (banco de dados principal)
- [ ] Redis (para cache e filas de tarefas)

## Pré-requisitos
- Node.js (versão 14.0.0 ou superior)
- Python (versão 3.8 ou superior)
- PostgreSQL
- Redis

## Instalação e Execução
### Frontend
1. Clone o repositório:
   ```bash
   git clone https://github.com/EGMKT/Patient-test.git
   ```
2. Navegue até o diretório do projeto:
   ```bash
   cd client
   ```
3. Instale as dependências:
   ```bash
   npm install
   ```
4. Execute o aplicativo em modo de desenvolvimento:
   ```bash
   npm start
   ```
5. Abra [http://localhost:3000](http://localhost:3000) para visualizar no navegador.

### Backend
1. Navegue até o diretório do backend:
   ```bash
   cd server
   ```
2. Crie um ambiente virtual:
   ```bash
   python -m venv venv
   ```
3. Ative o ambiente virtual:
   - Windows: `.\venv\Scripts\activate`
   - Unix ou MacOS: `source venv/bin/activate`
4. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```
5. Configure as variáveis de ambiente (crie um arquivo .env na raiz do projeto)
6. Execute as migrações:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```
7. Inicie o servidor:
   ```bash
   python manage.py runserver
   ```

## Estrutura do Projeto
PatientFunnel-test/
│ client/
│ ├── node_modules/
│ │ └── (...)
│ ├── public/
│ │ └── index.html
│ ├── src/
│ │ ├── components/
│ │ │ ├── Header.tsx
│ │ │ ├── NewClinicsChart.tsx
│ │ │ ├── SuperAdminSidebar.tsx
│ │ │ ├── ProtectedRoute.tsx
│ │ │ ├── SuperAdminHeader.tsx
│ │ │ ├── TwoFactorSettingsModal.tsx
│ │ │ └── Sidebar.tsx
│ │ ├── contexts/
│ │ │ └── AuthContext.tsx
│ │ ├── hooks/
│ │ │ ├── useTranslation.ts
│ │ ├── locales/
│ │ │ ├── en.json
│ │ │ └── pt.json
│ │ ├── pages/
│ │ │ ├── Login.tsx
│ │ │ ├── ConsultationSetup.tsx
│ │ │ ├── AudioRecording.tsx
│ │ │ ├── DatabaseOverview.tsx
│ │ │ ├── ErrorPage.tsx
│ │ │ ├── SuccessPage.tsx
│ │ │ ├── ManageClinics.tsx
│ │ │ ├── ManageUsers.tsx
│ │ │ ├── NotFound.tsx 
│ │ │ ├── ManageClinicRegistrations.tsx
│ │ │ ├── ManageSuperAdmins.tsx
│ │ │ ├── SuperAdminDashboard.tsx
│ │ │ ├── ViewReports.tsx
│ │ ├── types/
│ │ │ └── wavesurfer.d.ts
│ │ ├── api.ts
│ │ ├── audioStorage.ts
│ │ ├── App.tsx
│ │ ├── i18n.ts
│ │ ├── types.tsx
│ │ ├── index.css
│ │ └── index.tsx
│ ├── .gitignore
│ ├── .npmrc
│ ├── package-lock.json
│ ├── package.json
│ ├── Procfile
│ ├── tsconfig.json
│ └── tailwind.config.js
│ server/
│ ├── __pycache__/
│ │ └── (...)
│ ├── venv/
│ │ └── (...)
│ ├── crm_connectors/
│ │ ├── __pycache__/
│ │ │ └── (...)
│ │ ├── __init__.py
│ │ └── pipedrive.py
│ ├── migrations/
│ │ │ └── (...)
│ ├── views/
│ │ ├── dashboard_views.py
│ │ ├── audio_views.py
│ │ ├── auth_views.py
│ │ ├── clinica_views.py
│ │ ├── consulta_views.py
│ │ ├── database_views.py
│ │ ├── home_views.py
│ │ ├── medico_views.py
│ │ ├── paciente_views.py
│ │ ├── pipedrive_views.py
│ │ ├── two_factor_views.py
│ │ ├── servico_views.py
│ │ ├── user_views.py
│ │ ├── __init__.py
│ │ ├── __pycache__/
│ │ │ └── (...)
│ ├── __init__.py
│ ├── admin.py
│ ├── requirements.txt
│ ├── manage.py
│ ├── models.py
│ ├── urls.py
│ ├── settings.py
│ ├── wsgi.py
│ ├── asgi.py
│ ├── serializers.py
│ └── .env
└── README.md


## Para Entregar até o Final de Hoje
- [x] **Interface para o Super Admin (SA)**:
  - [ ] Criar interface administrativa para configuração do back-end.
  - [ ] Implementar gerenciamento de acessos e aprovação de cadastros.
  - [ ] Desenvolver visualização de relatórios e dados.
  - [x] Ativar tradução automática e atualizar arquivos de tradução.

- [x] **Interface do Doctor Selection**:
  - [x] Melhorar a interface do PIN. Quero que seja aceitavel somente números. E que fique mais bonito.

- [ ] **Implementação de Formulários de Cadastro**:
  - [ ] Página de aprovação de cadastro para clínicas.
  - [ ] Página de aprovação de cadastro para médicos.

- [x] **Autenticação por PIN para Médicos**:
  - [x] Implementar sistema de login por PIN para médicos e médicos admin.

- [x] **Desativação da Aba de Sincronização de Áudios**:
  - [x] Remover ou ocultar a aba até que a funcionalidade esteja operacional.

- [ ] **Verificação e Ajuste da Estrutura do Back-end**:
  - [ ] Revisar modelos e relacionamentos.
  - [ ] Ajustar conforme necessidades atuais.

- [ ] **Melhoria no JSON Enviado pelo Webhook**:
  - [ ] Definir novo esquema de JSON.
  - [ ] Implementar melhorias no código de geração do JSON.

- [ ] **Otimização do Back-end**:
  - [ ] Identificar e corrigir gargalos de performance.
  - [ ] Implementar melhorias necessárias.
  - [ ] Aceitar somente números nos PINs dos médicos

## Estrutura de Dados e Usuários

- **Login com email da clínica**:
  - Acesso permitido apenas para emails cadastrados das clínicas ou SA.

- **Médico com PIN**:
  - Autenticação por PIN, sem necessidade de email no momento.

- **Médico Admin com PIN**:
  - Autenticação por PIN, com permissões adicionais.

## Relatórios e Dados

- [ ] Implementar geração e visualização dos seguintes relatórios:
  - [ ] Quantidade total de pacientes atendidos.
  - [ ] Quantidade de pacientes atendidos por profissional.
  - [ ] Quantidade total de pacientes novos atendidos.
  - [ ] Quantidade total de pacientes antigos atendidos.
  - [ ] Índice de fidelização de pacientes.
  - [ ] Tempo médio de cada atendimento.
  - [ ] Quantidade de procedimentos realizados.
  - [ ] Quantidade de incidentes ocorridos.
  - [ ] Índice de satisfação geral dos pacientes (análise semântica).
  - [ ] Índice de qualidade do atendimento de cada profissional (análise semântica).
  - [ ] Dados gerais (Faixa de Idade, gênero, ocupação e localização dos pacientes).

## Fluxo n8n

O fluxo atual do n8n é:

1. Recebimento do webhook do aplicativo.
2. Conversão de base64 para arquivo binário no n8n.
3. Envio para o AssemblyAI para transcrição.
4. Identificação do médico.
5. Resumo do conteúdo.
6. Extração de oportunidades de marketing.

**Problemática**:
- Necessidade de extrair demais dados.
- Decidir se vale a pena extrair mais informações no n8n ou transferir parte do processo para o código do app.
- Considerar enviar os resumos e oportunidades de marketing para o banco de dados do PatientFunnel.
- Avaliar se esses dados devem ser apresentados na interface do SA.

**Ações Propostas**:
- Analisar quais dados adicionais precisam ser extraídos.
- Decidir a melhor plataforma para processamento (n8n vs back-end do app).
- Planejar a integração dos resultados no banco de dados e na interface do SA.

## Checklist
### Visual
- [ ] Interface para Super ADM (donos do PatientFunnel)
  - [ ] Gerenciamento do app
  - [ ] Controle de acessos de clínicas
  - [ ] Dashboard geral
  - [ ] Dashboard de cada clínica
  - [ ] Configurações
  - [ ] Interface similar ao Facebook Business
- [ ] Interface comum para médicos
  - [ ] Configuração de consulta
  - [ ] Gravação de áudio
  - [ ] Visualização de dados dos pacientes
  - [ ] Visualização das últimas consultas
- [ ] Visualização do banco de dados
- [ ] Interface e configurações para o admin da clínica
  - [ ] Dashboard para o admin da clínica
- [ ] Interface para o Super Admin visualizar os bancos de dados
- [ ] Página de consultas com capacidade de identificar e enviar consultas não enviadas
- [ ] Aba lateral direita para envio dos áudios locais (não sobrepondo o header)
- [ ] Tela de seleção de médico para usuários padrão (médicos e admins da clínica)
- [ ] Exibição do logo e nome de cada clínica

### Sistemático
- [ ] Criptografia
- [ ] Gravação dos áudios
- [ ] Download remoto em caso de falha de envio para webhook
- [ ] Funcionamento offline básico (consultas e afins)
- [x] Autenticação de login
- [x] Acessos diferenciados
- [ ] Integração completa com o frontend
- [ ] API para envio de arquivos e solicitações
- [ ] Extração de dados:
  - [ ] Quantidade total de pacientes atendidos
  - [ ] Quantidade de pacientes atendidos por profissional
  - [ ] Quantidade total de pacientes novos atendidos
  - [ ] Quantidade total de pacientes antigos atendidos
  - [ ] Índice de fidelização de pacientes
  - [ ] Tempo médio de cada atendimento
  - [ ] Quantidade de procedimentos realizados
  - [ ] Quantidade de incidentes ocorridos
  - [ ] Índice de satisfação geral dos pacientes (análise semântica)
  - [ ] Índice de qualidade do atendimento de cada profissional (análise semântica)
  - [ ] Dados gerais (Faixa de Idade, gênero, ocupação e localização dos pacientes)
- [ ] Integração com Pipedrive
  - [ ] Puxar dados de cada Clínica em sua respectiva conta
- [ ] Na tela de ConsultationSetup:
  - [ ] Puxar os pacientes da clínica em uma dropbox com função de pesquisa
  - [ ] Puxar os serviços da clínica do BD
- [ ] Atualização do BD das clínicas a partir de formulários enviados pelos clientes
- [ ] Dados dinâmicos (ex: número de cards de médicos na tela de DoctorSelection)
- [ ] PIN na tela de DoctorSelection
  - [ ] Funcionalidades adicionais na tela de ConsultationSetup para médicos admin autenticados
- [ ] Tradução dinâmica
- [ ] Logout
- [ ] Envio de PIN por email para médicos cadastrados
- [ ] Cada médico linkado a um email
- [ ] Webhook recebendo o máximo de informações
- [ ] Onboarding de clínicas:
  - [ ] Envio de email com senha padrão e PIN para clínicas e médicos cadastrados
  - [ ] Solicitação de alteração de senha no primeiro acesso
- [ ] Implementar autenticação e autorização mais robustas
  - [ ] Usar JWT (JSON Web Tokens) para autenticação.
  - [ ] Implementar refresh tokens para maior segurança.
- [ ] Melhorar a estrutura do projeto:
  - [ ] Separar os componentes em pastas mais organizadas (por exemplo, components/common, components/admin, components/doctor).
  - [ ] Criar hooks personalizados para lógica reutilizável.
- [ ] Melhorar a experiência offline:
  - [ ] Implementar um Service Worker para caching de assets e dados.
  - [ ] Usar IndexedDB para armazenamento local mais robusto.
- [ ] Implementar testes:
  - [ ] Adicionar testes unitários para componentes React.
  - [ ] Adicionar testes de integração para o backend Django.
- [ ] Melhorar a segurança:
  - [ ] Implementar rate limiting para prevenir ataques de força bruta.
  - [ ] Usar HTTPS em todos os ambientes.
  - [ ] Implementar validação e sanitização de entrada de dados mais rigorosas.
- [ ] Otimizar o desempenho:
  - [ ] Implementar lazy loading para componentes e rotas.
  - [ ] Otimizar consultas ao banco de dados no backend.
- [ ] Configurar o .env
- [ ] Estruturar melhor os dados a serem enviados para o Webhook
- [ ] Reconstruir rotas

### Infraestrutura e Segurança
- [ ] Implementar estrutura de banco de dados que suporte todas as funcionalidades mencionadas
- [ ] Propor e implementar arquitetura de sistema que atenda a todos os requisitos
- [ ] Justificar escolhas de tecnologias
- [ ] Implementar autenticação de dois fatores
- [ ] Integrar/Documentar código API com GitBook

## Webhook
O Webhook está sendo recebido no n8n, que converte, trata e resume o áudio/consulta, e identifica oportunidades de marketing.

## Contribuição
Instruções para contribuir com o projeto...

## Licença
Especifique a licença do projeto aqui.

## Correções Recentes e Próximos Passos

### Correções
- Adicionado campo `id` explicitamente ao modelo `Usuario` para maior clareza.
- Verificado e confirmado que todos os modelos têm um campo `id` como chave primária.

### Próximos Passos
1. Após fazer essas alterações no `models.py`, crie uma nova migração:
   ```
   python manage.py makemigrations
   ```

2. Aplique a nova migração:
   ```
   python manage.py migrate
   ```

3. Se ainda houver problemas, pode ser necessário resetar as migrações:
   - Faça backup do seu banco de dados.
   - Remova todos os arquivos de migração (exceto `__init__.py`) da pasta `migrations/`.
   - Execute:
     ```
     python manage.py makemigrations
     python manage.py migrate --fake-initial
     ```

4. Verifique se o problema com a coluna `usuario_id` na tabela `server_medico` foi resolvido.
