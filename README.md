# TaskFlow

Sistema web para gerenciamento de tarefas pessoais ou em equipe, permitindo que usuários organizem atividades, acompanhem prazos e acessem funcionalidades internas por meio de uma interface autenticada.

O projeto está sendo desenvolvido para a disciplina de Projeto Integrador.

## Objetivo do produto

O objetivo do TaskFlow é oferecer uma plataforma simples e organizada para gerenciamento de tarefas, projetos e listas de atividades, com controle de acesso por autenticação e navegação interna por módulos.

Nesta primeira sprint, o foco foi implementar a base do sistema, incluindo cadastro de usuários, login com autenticação, recuperação de senha e estrutura inicial de navegação autenticada.

## Integrantes e responsabilidades

- Kaique Inácio Salvador  
  Responsável pelo desenvolvimento do card de sidebar e navbar fixa, incluindo layout autenticado, navegação lateral, menu de perfil e rotas internas.

- Luiz Carlos de Paiva Silva  
  Responsável pelo desenvolvimento dos cards de cadastro e login/autenticação, incluindo backend, frontend, validações, JWT, bloqueio por tentativas e recuperação de senha.

- Sandy Karolina Maciel  
  Product Owner do projeto, responsável pela organização das demandas, acompanhamento dos critérios de aceitação e realização da maioria das revisões de código nos Pull Requests.

## Tecnologias utilizadas

### Frontend

- React
- Vite
- Axios
- React Router DOM

### Backend

- Node.js
- Express
- PostgreSQL
- BcryptJS
- JSON Web Token
- Dotenv
- CORS
- Jest

### Banco de dados

- PostgreSQL

### Conteinerização

- Docker
- Docker Compose

### Versionamento e processo

- Git
- GitHub
- GitHub Projects
- Pull Requests com revisão obrigatória

## Funcionalidades implementadas na Sprint 1

### Cadastro de usuário

- Tela de cadastro;
- Campos de nome, email e senha;
- Checkbox de aceite dos Termos de Privacidade;
- Validação de campos obrigatórios;
- Validação de email;
- Validação de senha com no mínimo 4 caracteres e pelo menos uma letra maiúscula;
- Validação de email único;
- Armazenamento de senha com hash;
- Redirecionamento para login após cadastro.

### Login e autenticação

- Tela de login;
- Login com email e senha;
- Geração de token JWT;
- Armazenamento do token no frontend;
- Redirecionamento para dashboard após login;
- Mensagem para email inválido;
- Mensagem para senha incorreta;
- Bloqueio temporário após 5 tentativas consecutivas malsucedidas;
- Recuperação de senha;
- Redefinição de senha com token temporário.

### Sidebar e navbar fixa

- Layout autenticado para telas internas;
- Sidebar com navegação para Dashboard, Projetos, Tasks e To-do-list;
- Destaque visual do módulo ativo;
- Navbar fixa;
- Menu expansível de perfil;
- Opções de Configurações do perfil, Notificações, Histórico e Logout;
- Logout removendo os dados de autenticação do frontend;
- Redirecionamentos para rotas alternativas.

## Estrutura do projeto

```txt
Projeto-Integrador/
│
├── backend/
│   ├── src/
│   │   ├── database/
│   │   │   ├── connection.js
│   │   │   └── migrate.js
│   │   ├── routes/
│   │   │   └── auth.routes.js
│   │   ├── utils/
│   │   │   └── validators.js
│   │   └── server.js
│   │
│   ├── tests/
│   │   └── validators.test.js
│   │
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   └── TopNavbar.jsx
│   │   ├── layouts/
│   │   │   └── AuthenticatedLayout.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── History.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Notifications.jsx
│   │   │   ├── ProfileSettings.jsx
│   │   │   ├── Projects.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ResetPassword.jsx
│   │   │   ├── Tasks.jsx
│   │   │   └── TodoList.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── .env.example
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── package-lock.json
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

## Pré-requisitos

Antes de executar o projeto, é necessário ter instalado:

- Git
- Node.js
- npm
- Docker
- Docker Compose

## Como clonar o projeto

```bash
git clone https://github.com/sandykmaciel/Projeto-Integrador.git
cd Projeto-Integrador
```

## Como subir o banco de dados

Na raiz do projeto, execute:

```bash
docker compose up -d
```

Esse comando sobe o container PostgreSQL utilizado pelo backend.

Configurações do banco:

```txt
Host: localhost
Porta: 5432
Usuário: task_user
Senha: task_password
Banco: task_manager
```

## Como configurar e executar o backend

Acesse a pasta do backend:

```bash
cd backend
```

Instale as dependências:

```bash
npm install
```

Crie o arquivo `.env` a partir do exemplo:

```bash
cp .env.example .env
```

Execute a migration:

```bash
npm run migrate
```

Resultado esperado:

```txt
Migrations executed successfully.
```

Inicie o backend:

```bash
npm run dev
```

O backend ficará disponível em:

```txt
http://localhost:3333
```

Para testar se a API está rodando:

```txt
http://localhost:3333/health
```

## Como configurar e executar o frontend

Em outro terminal, acesse a pasta do frontend:

```bash
cd frontend
```

Instale as dependências:

```bash
npm install
```

Crie o arquivo `.env` a partir do exemplo:

```bash
cp .env.example .env
```

Inicie o frontend:

```bash
npm run dev
```

O frontend ficará disponível em:

```txt
http://localhost:5173
```

## Principais rotas do frontend

```txt
/cadastro
/login
/recuperar-senha
/redefinir-senha
/dashboard
/projetos
/tasks
/todo-list
/perfil
/notificacoes
/historico
```

## Principais endpoints do backend

### Health check

```http
GET /health
```

### Cadastro de usuário

```http
POST /api/auth/register
```

### Login de usuário

```http
POST /api/auth/login
```

### Solicitação de recuperação de senha

```http
POST /api/auth/forgot-password
```

### Redefinição de senha

```http
POST /api/auth/reset-password
```

## GitHub Projects

Link do board da Sprint 1:

```txt
https://github.com/users/sandykmaciel/projects/3
```

## Padrão de branches

```txt
feat/nome-da-funcionalidade
fix/nome-do-ajuste
docs/nome-da-documentacao
chore/nome-da-configuracao
```

## Padrão de commits

```txt
feat: nova funcionalidade
fix: correção de bug
docs: documentação
chore: configuração ou manutenção
refactor: refatoração sem mudança de comportamento
test: testes
```

## Processo de desenvolvimento

O projeto utiliza Pull Requests para integração das funcionalidades na branch principal.

Fluxo adotado:

```txt
Criar branch a partir da main
Desenvolver a funcionalidade
Criar commits descritivos
Abrir Pull Request
Adicionar descrição do que foi feito
Solicitar revisão de colega
Aprovar o PR
Realizar merge na main
```

A branch `main` possui proteção para exigir Pull Request antes do merge.

## Testes

Foram adicionados testes unitários para validar regras utilizadas nas funcionalidades da Sprint 1.

A suíte de testes pode ser executada com:

```bash
npm test
```

Os testes devem executar sem falhas.

## Observações

O envio real de email na recuperação de senha foi simulado no console do backend durante a Sprint 1. A integração com serviço real de email poderá ser adicionada em uma sprint futura.
