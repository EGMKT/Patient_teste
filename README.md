# PatientFunnel Web App

## Descrição
PatientFunnel é uma aplicação web desenvolvida para gerenciamento eficiente de consultas médicas e gravação de áudio. Esta solução visa otimizar o fluxo de trabalho em ambientes médicos, proporcionando uma interface intuitiva para profissionais de saúde.

## Níveis de acesso
1. Super Admin
  - [ ] Gerenciamento do app
  - [ ] Controle de acessos de clínicas
  - [ ] Dashboard geral
  - [ ] Dashboard de cada clínica
  - [ ] Configurações
2. Admin de Clínica
  - [ ] Mesmo acesso dos médicos
  - [ ] Dashboard da clínica
  - [ ] Configurações
3. Médicos
  - [ ] Seleção de médico para consulta
  - [ ] Configuração detalhada de consulta
  - [ ] Gravação de áudio da consulta com visualização em tempo real

## Funcionalidades Principais
- [x] Autenticação de usuário (login/logout)
- [ ] Dashboard para Super Admin e Admin de Clínica
- [ ] Seleção de médico para consulta
- [x] Configuração detalhada de consulta
- [x] Gravação de áudio da consulta com visualização em tempo real
- [x] Envio seguro de gravações para processamento posterior
- [x] Integração com Pipedrive
- [x] Armazenamento local de áudios e sincronização posterior
- [x] Suporte a múltiplos idiomas
- [x] Verificação de Duplo Fator para médicos (opcional)
- [x] Funcionalidade "Lembrar desse dispositivo" para 2FA
- [ ] Aba de configurações básica do médico (Ativa e desativa 2FA)

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
│ │ │ ├── ProtectedRoute.tsx
│ │ │ ├── TwoFactorSettings.tsx
│ │ │ └── Sidebar.tsx
│ │ ├── contexts/
│ │ │ └── AuthContext.tsx
│ │ ├── hooks/
│ │ ├── locales/
│ │ │ ├── en.json
│ │ │ └── pt.json
│ │ ├── pages/
│ │ │ ├── Login.tsx
│ │ │ ├── SuperAdminAudios.tsx
│ │ │ ├── AdminDashboard.tsx
│ │ │ ├── DoctorSelection.tsx
│ │ │ ├── ConsultationList.tsx
│ │ │ ├── ConsultationSetup.tsx
│ │ │ ├── AudioRecording.tsx
│ │ │ ├── DatabaseOverview.tsx
│ │ │ ├── ErrorPage.tsx
│ │ │ └── SuccessPage.tsx
│ │ ├── api.ts
│ │ ├── audioStorage.ts
│ │ ├── App.tsx
│ │ ├── i18n.ts
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
│ │ ├── 0001_initial.py
│ │ ├── __init__.py
│ │ ├── __pycache__/
│ │ │ └── (...)
│ ├── views/
│ │ ├── dashboards.py
│ │ ├── audio_view.py
│ │ ├── auth_view.py
│ │ ├── clinica_view.py
│ │ ├── consulta_view.py
│ │ ├── database_view.py
│ │ ├── home_view.py
│ │ ├── medico_view.py
│ │ ├── paciente_view.py
│ │ ├── pipedrive_view.py
│ │ ├── two_factor_view.py
│ │ ├── servico_view.py
│ │ ├── user_view.py
│ │ ├── __init__.py
│ │ ├── __pycache__/
│ │ │ └── (...)
│ ├── __init__.py
│ ├── admin.py
│ ├── pipedrive_integration.py
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


### Infraestrutura e Segurança
- [ ] Implementar estrutura de banco de dados que suporte todas as funcionalidades mencionadas
- [ ] Propor e implementar arquitetura de sistema que atenda a todos os requisitos
- [ ] Justificar escolhas de tecnologias
- [ ] Implementar autenticação de dois fatores
- [ ] Integrar/Documentar código API com GitDocs

## Próximos Passos
1. ~~Implementar dashboard completo para Super Admin e Admin de Clínica~~
2. ~~Finalizar integração com Pipedrive~~
3. ~~Implementar sistema de armazenamento local de áudios e sincronização~~
4. ~~Melhorar a interface do usuário, incluindo sidebar para áudios não enviados~~
5. ~~Implementar funcionalidades offline~~
6. ~~Implementar Interface para Super Admin para visualização de áudios não enviados das clínicas~~
7. Implementar Interface para Super Admin para visualização de Banco de Dados
8. Gerar um Relatório de Faturamento para ser preenchido pelos Administradores das Clínicas
9. ~~Habilitar funcionalidade de Verificação de Duplo Fator para cada médico~~
10. Verificar Estrutura do Diretório
11. ~~Integrar com o Frontend~~
12. Tornar dados dinâmicos
13. Deploy do Back no DigitalOcean

## Webhook
O Webhook está sendo recebido no n8n, que converte, trata e resume o áudio/consulta, e identifica oportunidades de marketing.

## Contribuição
Instruções para contribuir com o projeto...

## Licença
Especifique a licença do projeto aqui.