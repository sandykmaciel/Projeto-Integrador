# TaskFlow

![CI](https://github.com/sandykmaciel/Projeto-Integrador/actions/workflows/ci.yml/badge.svg?branch=main)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=sandykmaciel_Projeto-Integrador&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=sandykmaciel_Projeto-Integrador)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=sandykmaciel_Projeto-Integrador&metric=coverage)](https://sonarcloud.io/summary/new_code?id=sandykmaciel_Projeto-Integrador)

Sistema web para gerenciamento de tarefas pessoais ou em equipe, permitindo que usuários organizem atividades, acompanhem prazos e acessem funcionalidades internas por meio de uma interface autenticada.

O projeto está sendo desenvolvido para a disciplina de Projeto Integrador.

## Objetivo do produto

O objetivo do TaskFlow é oferecer uma plataforma simples e organizada para gerenciamento de tarefas, projetos e listas de atividades, com controle de acesso por autenticação e navegação interna por módulos.

Na primeira sprint, o foco foi implementar a base do sistema, incluindo cadastro de usuários, login com autenticação, recuperação de senha e estrutura inicial de navegação autenticada.

Na segunda sprint, o foco passou a ser a implementação inicial do módulo de projetos, permitindo visualizar projetos em formato de cards, acompanhar progresso, editar informações, excluir projetos com confirmação e criar projeto com tarefa inicial em um único fluxo.

## Integrantes e responsabilidades

- Kaique Inácio Salvador  
  Responsável pelo desenvolvimento do card de sidebar e navbar fixa, incluindo layout autenticado, navegação lateral, menu de perfil e rotas internas.

- Luiz Carlos de Paiva Silva  
  Responsável pelo desenvolvimento dos cards de cadastro, login/autenticação e módulo inicial de projetos, incluindo backend, frontend, validações, JWT, recuperação de senha, estrutura de banco, integração com API, Docker, pipeline, testes e SonarCloud.

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

### Qualidade e CI/CD

- GitHub Actions
- SonarCloud
- Jest Coverage
- Quality Gate
- Pull Requests com revisão obrigatória

### Versionamento e processo

- Git
- GitHub
- GitHub Projects
- Branch protection
- Commits semânticos

## Funcionalidades implementadas

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

### Projetos em formato de cards

- Estrutura de banco para projetos;
- Estrutura de banco para membros de projetos;
- Estrutura inicial de tarefas vinculadas a projetos;
- Endpoints protegidos por JWT para listar, criar, editar e excluir projetos;
- Tela de projetos consumindo a API;
- Listagem de projetos em formato de cards;
- Exibição do título do projeto;
- Exibição da descrição do projeto;
- Barra de progresso calculada com base nas tarefas vinculadas;
- Exibição de membros do projeto em formato de avatares;
- Ações de editar e excluir projeto;
- Modal de edição de projeto;
- Modal de confirmação antes da exclusão;
- Aviso de que tarefas vinculadas também serão removidas ao excluir um projeto.

### Criação de projeto com tarefa inicial

- Modal de criação aberta a partir da tela de Projetos;
- Campo de nome do projeto;
- Campo de descrição do projeto;
- Busca e seleção de membros cadastrados;
- Exibição visual dos membros selecionados em formato de avatar;
- Usuário logado adicionado como membro padrão;
- Formulário de criação da tarefa inicial;
- Campo de título da tarefa;
- Campo de descrição da tarefa;
- Campo de data final;
- Validação para impedir data final anterior à data atual;
- Campo de responsável preenchido por padrão com o usuário logado;
- Possibilidade de alterar o responsável para outro membro do projeto;
- Campo de prioridade da tarefa;
- Tabela de pré-visualização da tarefa inicial;
- Filtro de busca em tempo real na tabela;
- Criação do projeto e da tarefa inicial em um único fluxo;
- Atualização automática da listagem de projetos após salvar.

## Estrutura do projeto

```txt
Projeto-Integrador/
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── backend/
│   ├── src/
│   │   ├── database/
│   │   │   ├── connection.js
│   │   │   └── migrate.js
│   │   ├── middlewares/
│   │   │   └── auth.middleware.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── projects.routes.js
│   │   │   └── users.routes.js
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
├── docs/
│   └── retrospectivas/
│       ├── sprint1.md
│       └── sprint2.md
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
├── Dockerfile
├── docker-compose.yml
├── sonar-project.properties
├── .gitignore
└── README.md
```

## Pré-requisitos

Antes de executar o projeto localmente, é necessário ter instalado:

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

## Como executar com Docker Compose

A aplicação pode ser executada com Docker Compose, subindo banco de dados, backend e frontend.

Na raiz do projeto, execute:

```bash
docker compose up --build
```

Esse comando inicia:

```txt
PostgreSQL
Backend Node.js/Express
Frontend React/Vite
```

Após a inicialização, os serviços ficam disponíveis em:

```txt
Frontend: http://localhost:5173
Backend: http://localhost:3333
Health check: http://localhost:3333/health
```

Para parar os containers:

```bash
docker compose down
```

Caso existam containers antigos do projeto ocupando portas, execute:

```bash
docker compose down --remove-orphans
```

## Como configurar e executar manualmente

Também é possível executar o projeto manualmente, sem Docker Compose completo.

### Banco de dados

Na raiz do projeto, execute:

```bash
docker compose up database -d
```

Configurações do banco:

```txt
Host: localhost
Porta: 5432
Usuário: task_user
Senha: task_password
Banco: task_manager
```

### Backend

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

### Frontend

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

A tela `/projetos` permite visualizar projetos em cards e criar um novo projeto com tarefa inicial por meio da modal `+ Novo projeto`.

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

### Busca de usuários

```http
GET /api/users?search=nome
```

Busca usuários cadastrados por nome ou email para seleção de membros em projetos.

A rota é protegida por autenticação JWT.

### Listagem de projetos

```http
GET /api/projects
```

Retorna os projetos do usuário autenticado, incluindo membros, total de tarefas, tarefas concluídas e progresso calculado.

### Criação de projeto

```http
POST /api/projects
```

Cria um novo projeto para o usuário autenticado.

Body esperado:

```json
{
  "title": "Faculdade",
  "description": "Atividades e trabalhos da faculdade"
}
```

### Criação de projeto com tarefa inicial

```http
POST /api/projects/with-initial-task
```

Cria um projeto e sua tarefa inicial em um único fluxo.

Body esperado:

```json
{
  "project": {
    "title": "Faculdade",
    "description": "Atividades e trabalhos da faculdade",
    "memberIds": ["id_do_membro"]
  },
  "task": {
    "title": "Entregar relatório",
    "description": "Finalizar relatório da disciplina",
    "dueDate": "2026-12-10",
    "priority": "high",
    "assignedUserId": "id_do_responsavel"
  }
}
```

Regras aplicadas:

```txt
A data final não pode ser anterior à data atual.
O usuário logado é adicionado automaticamente como membro do projeto.
Caso nenhum responsável seja informado, o usuário logado será o responsável padrão.
O responsável da tarefa precisa ser membro do projeto.
```

### Edição de projeto

```http
PUT /api/projects/:id
```

Atualiza título e descrição de um projeto existente.

Body esperado:

```json
{
  "title": "Faculdade Atualizado",
  "description": "Atividades, trabalhos e provas da faculdade"
}
```

### Exclusão de projeto

```http
DELETE /api/projects/:id
```

Exclui um projeto do usuário autenticado. As tarefas e membros vinculados ao projeto também são removidos por relacionamento em cascata no banco.

## GitHub Projects

Link do board da Sprint 1:

```txt
https://github.com/users/sandykmaciel/projects/3
```

## Pipeline e qualidade de código

O projeto utiliza GitHub Actions para executar o pipeline de integração contínua em Pull Requests para a branch `main`.

O workflow executa:

- Instalação das dependências do backend;
- Execução dos testes do backend com cobertura;
- Instalação das dependências do frontend;
- Build do frontend;
- Análise do SonarCloud.

O SonarCloud é utilizado para análise estática de código, acompanhamento do Quality Gate, cobertura de testes e identificação de issues.

Critérios acompanhados:

- Quality Gate sem falha;
- Nenhuma issue Blocker ou Critical pendente;
- Cobertura de código acompanhada pelo relatório do SonarCloud;
- Pull Requests validados pelo pipeline antes do merge.

## Testes

Foram adicionados testes unitários para validar regras utilizadas nas funcionalidades implementadas.

A suíte de testes pode ser executada dentro da pasta `backend` com:

```bash
npm test
```

Para executar os testes com cobertura:

```bash
npm run test:coverage
```

O relatório de cobertura é gerado em:

```txt
backend/coverage/
```

A pasta de cobertura não deve ser versionada no Git.

## Retrospectivas

As retrospectivas das sprints estão documentadas em:

```txt
docs/retrospectivas/sprint1.md
docs/retrospectivas/sprint2.md
```

Cada arquivo segue o formato:

```txt
Start
Stop
Continue
```

com no mínimo 3 itens por categoria.

## Padrão de branches

```txt
feat/nome-da-funcionalidade
fix/nome-do-ajuste
docs/nome-da-documentacao
chore/nome-da-configuracao
ci/nome-da-configuracao
test/nome-do-teste
```

## Padrão de commits

```txt
feat: nova funcionalidade
fix: correção de bug
docs: documentação
chore: configuração ou manutenção
refactor: refatoração sem mudança de comportamento
test: testes
ci: integração contínua ou pipeline
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
Executar pipeline
Realizar merge na main
```

A branch `main` possui proteção para exigir Pull Request antes do merge.

## Observações

O envio real de email na recuperação de senha foi simulado no console do backend durante a Sprint 1. A integração com serviço real de email poderá ser adicionada em uma sprint futura.

O módulo de projetos foi iniciado na Sprint 2 e será evoluído nas próximas etapas com tela interna de detalhes do projeto, gerenciamento completo de tarefas, atualização de status e visualização detalhada do backlog.