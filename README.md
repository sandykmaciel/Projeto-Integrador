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
- JSON Web Token
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
- Layout autenticado com sidebar e navbar fixa
- Navegação entre módulos internos do sistema
- Menu de perfil com opções de conta

## Funcionalidades implementadas

### Cadastro de usuário

Como novo usuário, quero realizar meu cadastro informando nome, email e senha para que eu possa acessar a plataforma e gerenciar minhas atividades.

#### Critérios atendidos

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

### Login e autenticação

Como usuário cadastrado, quero realizar login informando meu email e senha para acessar minhas tarefas e projetos.

#### Critérios atendidos

- Tela de login com campos de email e senha;
- Link “Esqueci minha senha”;
- Validação de email em formato inválido;
- Validação de email inexistente;
- Validação de senha incorreta;
- Geração de token JWT após login válido;
- Armazenamento do token no frontend;
- Redirecionamento para a tela de dashboard após login com sucesso;
- Bloqueio temporário após 5 tentativas consecutivas de login malsucedidas para o mesmo email;
- Tela de recuperação de senha;
- Geração de token temporário para redefinição de senha;
- Tela de redefinição de senha;
- Validação de token inválido, expirado ou já utilizado;
- Atualização da senha com hash;
- Redirecionamento para login após redefinição de senha.

### Sidebar e navbar fixa

Como usuário autenticado, quero ter acesso a uma barra lateral e uma barra de navegação fixa para navegar rapidamente entre as funcionalidades do sistema.

#### Critérios atendidos

- Layout autenticado criado para as telas internas do sistema;
- Proteção básica de rotas autenticadas por token salvo no frontend;
- Sidebar lateral adicionada ao layout interno;
- Navegação pela sidebar para Dashboard, Projetos, Tasks e To-do-list;
- Destaque visual do módulo ativo na sidebar;
- Navbar superior fixa adicionada ao layout autenticado;
- Menu expansível de perfil na navbar;
- Opções de Configurações do perfil, Notificações, Histórico e Logout;
- Logout removendo os dados do usuário do frontend e redirecionando para login;
- Páginas provisórias criadas para os módulos internos do sistema;
- Redirecionamentos adicionados para rotas alternativas de navegação.

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

Esse comando irá subir um container PostgreSQL com as configurações definidas no arquivo `docker-compose.yml`.

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

Crie o arquivo `.env` a partir do exemplo:

```bash
cp .env.example .env
```

O arquivo `.env` deve conter:

```env
PORT=3333

DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=task_user
DATABASE_PASSWORD=task_password
DATABASE_NAME=task_manager

JWT_SECRET=change_this_secret
```

Execute a migration para criar as tabelas necessárias:

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

Para testar se a API está rodando, acesse:

```txt
http://localhost:3333/health
```

Resultado esperado:

```json
{
  "status": "ok",
  "message": "Task Manager API is running"
}
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

Crie o arquivo `.env` a partir do exemplo:

```bash
cp .env.example .env
```

O arquivo `.env` deve conter:

```env
VITE_API_URL=http://localhost:3333/api
```

Inicie o frontend:

```bash
npm run dev
```

O frontend ficará disponível em:

```txt
http://localhost:5173
```

A tela de cadastro pode ser acessada em:

```txt
http://localhost:5173/cadastro
```

A tela de login pode ser acessada em:

```txt
http://localhost:5173/login
```

A tela de recuperação de senha pode ser acessada em:

```txt
http://localhost:5173/recuperar-senha
```

Após realizar login, o usuário será redirecionado para o dashboard:

```txt
http://localhost:5173/dashboard
```

As telas internas disponíveis no layout autenticado são:

```txt
http://localhost:5173/dashboard
http://localhost:5173/projetos
http://localhost:5173/tasks
http://localhost:5173/todo-list
http://localhost:5173/perfil
http://localhost:5173/notificacoes
http://localhost:5173/historico
```

Também existem redirecionamentos para rotas alternativas:

```txt
http://localhost:5173/projects -> /projetos
http://localhost:5173/tarefas -> /tasks
http://localhost:5173/todos -> /todo-list
http://localhost:5173/profile -> /perfil
http://localhost:5173/notifications -> /notificacoes
http://localhost:5173/history -> /historico
```

## Rotas implementadas no backend

### Health check

```http
GET /health
```

Verifica se a API está rodando.

### Cadastro de usuário

```http
POST /api/auth/register
```

Realiza o cadastro de um novo usuário.

Body esperado:

```json
{
  "name": "Luiz Carlos",
  "email": "luiz@email.com",
  "password": "Teste",
  "acceptedTerms": true
}
```

Resposta esperada em caso de sucesso:

```json
{
  "message": "Usuário cadastrado com sucesso.",
  "user": {
    "id": "...",
    "name": "Luiz Carlos",
    "email": "luiz@email.com",
    "created_at": "..."
  }
}
```

### Login de usuário

```http
POST /api/auth/login
```

Realiza autenticação do usuário e retorna um token JWT.

Body esperado:

```json
{
  "email": "luiz@email.com",
  "password": "Teste"
}
```

Resposta esperada em caso de sucesso:

```json
{
  "message": "Login realizado com sucesso.",
  "token": "...",
  "user": {
    "id": "...",
    "name": "Luiz Carlos",
    "email": "luiz@email.com"
  }
}
```

### Solicitação de recuperação de senha

```http
POST /api/auth/forgot-password
```

Gera um token temporário de recuperação de senha e simula o envio do link no console do backend.

Body esperado:

```json
{
  "email": "luiz@email.com"
}
```

Resposta esperada:

```json
{
  "message": "Se o email informado estiver cadastrado, enviaremos um link para redefinição de senha."
}
```

### Redefinição de senha

```http
POST /api/auth/reset-password
```

Redefine a senha do usuário a partir de um token válido.

Body esperado:

```json
{
  "token": "token_recebido_no_link",
  "password": "NovaSenha"
}
```

Resposta esperada em caso de sucesso:

```json
{
  "message": "Senha redefinida com sucesso."
}
```

## Cenários de teste do cadastro

### Cadastro com sucesso

Preencher:

```txt
Nome: Luiz Carlos
Email: luiz@email.com
Senha: Teste
Termos: marcado
```

Resultado esperado:

```txt
Conta criada com sucesso e redirecionamento para /login.
```

### Cadastro sem aceitar os termos

Preencher todos os campos, mas não marcar o checkbox de termos.

Resultado esperado:

```txt
O cadastro deve ser impedido e uma mensagem de erro deve ser exibida.
```

### Cadastro com email inválido

Exemplo:

```txt
luizemail.com
```

Resultado esperado:

```txt
O cadastro deve ser impedido e o sistema deve informar que o email é inválido.
```

### Cadastro com senha inválida

Exemplos inválidos:

```txt
abc
abcd
```

Resultado esperado:

```txt
O cadastro deve ser impedido e o sistema deve informar que a senha precisa ter no mínimo 4 caracteres e pelo menos uma letra maiúscula.
```

### Cadastro com email repetido

Tentar cadastrar duas contas com o mesmo email.

Resultado esperado:

```txt
O cadastro deve ser impedido e o sistema deve informar que o email já está cadastrado.
```

## Cenários de teste do login

### Login com sucesso

Informar email e senha de um usuário cadastrado.

Resultado esperado:

```txt
O sistema deve autenticar o usuário, salvar o token JWT e redirecionar para /dashboard.
```

### Email inválido

Informar email fora do formato padrão.

Exemplo:

```txt
luizemail.com
```

Resultado esperado:

```txt
O sistema deve impedir o login e exibir a mensagem: Email inválido.
```

### Email inexistente

Informar um email que não existe na base.

Resultado esperado:

```txt
O sistema deve impedir o login e exibir a mensagem: Email inválido.
```

### Senha incorreta

Informar um email existente com uma senha incorreta.

Resultado esperado:

```txt
O sistema deve impedir o login e exibir a mensagem: Email ou senha incorretos.
```

### Bloqueio por excesso de tentativas

Realizar 5 tentativas consecutivas de login malsucedidas para o mesmo email.

Resultado esperado:

```txt
O sistema deve bloquear temporariamente o acesso para aquele email.
```

### Recuperação de senha

Acessar a tela de recuperação de senha e informar um email cadastrado.

Resultado esperado:

```txt
O sistema deve gerar um link de redefinição de senha no console do backend.
```

### Redefinição de senha

Acessar o link gerado, informar uma nova senha válida e confirmar.

Resultado esperado:

```txt
O sistema deve atualizar a senha, marcar o token como utilizado e redirecionar para /login.
```

## Cenários de teste da sidebar e navbar

### Navegação pela sidebar

Estando autenticado no sistema, clicar nos itens da sidebar.

Rotas testadas:

```txt
/dashboard
/projetos
/tasks
/todo-list
```

Resultado esperado:

```txt
O sistema deve redirecionar o usuário para a tela correspondente ao item selecionado.
```

### Destaque visual do módulo ativo

Acessar qualquer rota interna pela sidebar.

Resultado esperado:

```txt
O item correspondente à rota atual deve ficar destacado visualmente na sidebar.
```

### Menu expansível do perfil

Estando autenticado, clicar no botão de perfil presente na navbar.

Resultado esperado:

```txt
O sistema deve exibir as opções Configurações do perfil, Notificações, Histórico e Logout.
```

### Navegação pelo menu de perfil

Clicar nas opções do menu de perfil.

Resultado esperado:

```txt
Configurações do perfil deve redirecionar para /perfil.
Notificações deve redirecionar para /notificacoes.
Histórico deve redirecionar para /historico.
```

### Logout

Clicar na opção Logout do menu de perfil.

Resultado esperado:

```txt
O sistema deve remover os dados de autenticação do frontend e redirecionar o usuário para /login.
```

### Acesso sem autenticação

Tentar acessar uma rota interna sem estar logado.

Exemplo:

```txt
http://localhost:5173/dashboard
```

Resultado esperado:

```txt
O sistema deve redirecionar o usuário para /login.
```

### Redirecionamentos de rotas alternativas

Estando autenticado, acessar as rotas alternativas.

Rotas testadas:

```txt
/projects
/tarefas
/todos
/profile
/notifications
/history
```

Resultado esperado:

```txt
O sistema deve redirecionar cada rota alternativa para sua rota principal correspondente.
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