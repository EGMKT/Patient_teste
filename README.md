# Patient Funnel Web App

## Descrição
Patient Funnel é uma aplicação web desenvolvida para gerenciamento eficiente de consultas médicas e gravação de áudio. Esta solução visa otimizar o fluxo de trabalho em ambientes médicos, proporcionando uma interface intuitiva para profissionais de saúde.

## Funcionalidades Principais
- Autenticação de usuário (login/logout)
- Seleção de médico para consulta
- Configuração detalhada de consulta
- Gravação de áudio da consulta com visualização em tempo real
- Envio seguro de gravações para processamento posterior

## Tecnologias Utilizadas
- React 18.2.0
- TypeScript 4.9.5
- Tailwind CSS 3.3.2
- Axios 1.4.0
- Wavesurfer.js 6.6.3
- React Router Dom 6.11.2

## Pré-requisitos
- Node.js (versão 14.0.0 ou superior)
- npm (normalmente vem com Node.js)

## Instalação e Execução
1. Clone o repositório:
   ```bash
   git clone https://github.com/EGMKT/Patient-test.git
   ```
2. Navegue até o diretório do projeto:
   ```bash
   cd patientfunnel/client
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

## Estrutura do Projeto
patient-funnel/
│ client/
│ ├── node_modules/
│ │ └── (...)
│ ├── public/
│ │ └── index.html
│ ├── src/
│ │ ├── components
│ │ │ ├── SettingsButton.tsx
│ │ │ ├── PageTransition.tsx
│ │ │ ├── Notification.tsx
│ │ │ └── Tooltip.tsx
│ │ ├── contexts
│ │ │ └── AuthContext.tsx
│ │ ├── hooks
│ │ │ └── useKeyboardShortcuts.ts
│ │ ├── pages
│ │ │ ├── Login.tsx
│ │ │ ├── DoctorSelection.tsx
│ │ │ ├── ConsultationSetup.tsx
│ │ │ ├── AudioRecording.tsx
│ │ │ ├── ErrorPage.tsx
│ │ │ └── SuccessPage.tsx
│ │ ├── App.tsx
│ │ ├── index.css
│ │ └── index.tsx
│ ├── .gitignore
│ ├── .npmrc
│ ├── package-lock.json
│ ├── package.json
│ ├── Procfile
│ ├── tsconfig.json
│ └── tailwind.config.js
└── README.md

## Contribuição
Instruções para contribuir com o projeto...

## Licença
Especifique a licença do projeto aqui.
