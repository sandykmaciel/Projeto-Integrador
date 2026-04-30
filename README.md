# TaskFlow - Sistema Web de Gerenciamento de Tarefas

Sistema web para gerenciamento de tarefas pessoais ou em equipe, permitindo que usuários organizem atividades, acompanhem prazos e recebam notificações automáticas sobre tarefas próximas do vencimento.

Este projeto está sendo desenvolvido para a disciplina de Projeto Integrador.

## Integrantes

- Kaique Inácio Salvador
- Luiz Carlos de Paiva Silva
- Sandy Karolina Maciel

## Objetivo do projeto

O objetivo do sistema é permitir que usuários cadastrem uma conta, acessem a plataforma e gerenciem suas tarefas e projetos de forma organizada.

A proposta contempla uma arquitetura moderna com frontend, backend, autenticação, banco de dados, mensageria e conteinerização.

## Stack utilizada

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
- Dotenv
- CORS

### Banco de dados

- PostgreSQL

### Conteinerização

- Docker
- Docker Compose

### Mensageria

- Redis ou RabbitMQ serão adicionados em etapas futuras para processamento assíncrono de notificações.

## Funcionalidades previstas

- Cadastro de usuários
- Login e autenticação com JWT
- Criação e gerenciamento de projetos
- Criação e gerenciamento de tarefas
- Definição de prioridades e prazos
- Alteração de status das tarefas
- Dashboard com resumo das tarefas
- Notificações para tarefas próximas do prazo
- Histórico de alterações das tarefas

## Funcionalidade implementada neste card

### Cadastro de usuário

Como novo usuário, quero realizar meu cadastro informando nome, email e senha para que eu possa acessar a plataforma e gerenciar minhas atividades.

### Critérios atendidos

- Tela de cadastro com logo do sistema;
- Campo de nome;
- Campo de email;
- Campo de senha;
- Checkbox de aceite dos Termos de Privacidade;
- Validação de campos obrigatórios;
- Validação de email inválido;
- Validação de senha com no mínimo 4 caracteres e pelo menos uma letra maiúscula;
- Bloqueio do cadastro caso os termos não sejam aceitos;
- Validação de email único na base de dados;
- Senha armazenada com hash;
- Redirecionamento para a tela de login após cadastro realizado com sucesso.

## Estrutura do projeto

```txt
task-manager/
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
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   └── Register.jsx
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

## Pré Requisitos

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
Esse comando irá subir um container PostgreSQL com as configurações definidas no arquivo docker-compose.yml.

Configurações do banco:

```txt
Host: localhost
Porta: 5432
Usuário: task_user
Senha: task_password
Banco: task_manager
```

## Como configurar o backend

Acesse a pasta do backend:

```bash
cd backend
```

Instale as dependências:

```bash
npm install
```

Crie o arquivo .env a partir do exemplo:

```bash
cp .env.example .env
```

Execute a migration para criar a tabela de usuários:

```bash
npm run migrate
```
Resultado esperado: Migrations executed successfully.

Inicie o backend:

```bash
npm run dev
```

O backend ficará disponível em:

```txt
http://localhost:3333
```

Para testar se a API está rodando, acesse:

```txt
http://localhost:3333/health
```

## Como configurar o frontend

Em outro terminal, acesse a pasta do frontend:

```bash
cd frontend
```

Instale as dependências:

```bash
npm install
```

Crie o arquivo .env a partir do exemplo:

```bash
cp .env.example .env
```

Inicie o frontend

```bash
npm run dev
```

O backend ficará disponível em:

```txt
http://localhost:5173
```

## Rotas implementadas no backend

### Health check

```http
GET /health
```

### Cadastro de usuário

```http
POST /api/auth/register
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
```