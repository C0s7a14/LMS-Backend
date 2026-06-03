# API de Autenticação, Usuários e Cursos

---

# Como Rodar o Projeto Localmente

Após baixar ou abrir o projeto na sua máquina, siga os passos abaixo no terminal.

---

## 1. Instalar as Dependências

Instale todos os pacotes necessários:

```bash
npm install
```

ou:

```bash
npm i
```

---

## 2. Entrar na Pasta do Backend

```bash
cd backend
```

---

## 3. Configurar o Arquivo `.env`

Crie um arquivo `.env` na raiz do backend:

```env
PORT=3333

JWT_SECRET=sua_chave_jwt

RESEND_API_KEY=sua_chave_resend

DATABASE_HOST=localhost
DATABASE_USER=root
DATABASE_PASSWORD=sua_senha
DATABASE_NAME=lms
```

---

## 4. Iniciar o Servidor

Execute:

```bash
npm run dev
```

O servidor iniciará em:

```txt
http://localhost:3333
```

---

# Banco de Dados

Execute o arquivo SQL do projeto para criar todas as tabelas do sistema:

* users
* cursos
* modulos
* aulas
* matriculas
* quizzes
* certificados
* refresh_tokens
* password_resets

---

# Testando as Rotas no Insomnia

---

# Autenticação

## Registrar Usuário

```http
POST http://localhost:3333/auth/register
```

### Body JSON

```json
{
  "name": "Lennon",
  "email": "lennon@gmail.com",
  "senha": "123456",
  "role": "admin"
}
```

---

## Login

```http
POST http://localhost:3333/auth/login
```

### Body JSON

```json
{
  "email": "lennon@gmail.com",
  "senha": "123456"
}
```

### Resposta

```json
{
  "accessToken": "TOKEN",
  "refreshToken": "TOKEN",
  "user": {
    "id": 1,
    "name": "Lennon",
    "email": "lennon@gmail.com",
    "role": "admin"
  }
}
```

---

## Refresh Token

```http
POST http://localhost:3333/auth/refresh
```

### Body JSON

```json
{
  "refreshToken": "SEU_REFRESH_TOKEN"
}
```

---

## Logout

```http
POST http://localhost:3333/auth/logout
```

### Body JSON

```json
{
  "refreshToken": "SEU_REFRESH_TOKEN"
}
```

---

# Recuperação de Senha com Resend

---

## Enviar Email de Recuperação

```http
POST http://localhost:3333/auth/forgot-password
```

### Body JSON

```json
{
  "email": "lennon@gmail.com"
}
```

O sistema irá:

* gerar um token seguro
* salvar no banco
* enviar email usando Resend
* criar link de redefinição

---

## Redefinir Senha

```http
POST http://localhost:3333/auth/reset-password
```

### Body JSON

```json
{
  "token": "TOKEN_RECEBIDO_NO_EMAIL",
  "newPassword": "NovaSenha123"
}
```

---

# CRUD de Usuários

---

## Listar Usuários

```http
GET http://localhost:3333/users
```

---

## Buscar Usuário por ID

```http
GET http://localhost:3333/users/1
```

---

## Atualizar Usuário

```http
PUT http://localhost:3333/users/1
```

### Body JSON

```json
{
  "name": "Lennon Costa",
  "email": "novoemail@gmail.com",
  "senha": "123456",
  "role": "admin"
}
```

---

## Deletar Usuário

```http
DELETE http://localhost:3333/users/1
```

---

# CRUD de Cursos

---

## Criar Curso

```http
POST http://localhost:3333/courses
```

### Body JSON

```json
{
  "titulo": "React Completo",
  "descricao": "Curso completo de React",
  "thumbnail": "https://imagem.com/thumb.png",
  "criado_por": 1
}
```

---

## Listar Cursos

```http
GET http://localhost:3333/courses
```

---

## Buscar Curso por ID

```http
GET http://localhost:3333/courses/1
```

---

## Atualizar Curso

```http
PUT http://localhost:3333/courses/1
```

### Body JSON

```json
{
  "titulo": "React Avançado",
  "descricao": "Curso atualizado",
  "thumbnail": "https://imagem.com/nova.png"
}
```

---

## Deletar Curso

```http
DELETE http://localhost:3333/courses/1
```

---

# Tecnologias Utilizadas

* Node.js
* Express
* TypeScript
* MySQL
* JWT
* Bcrypt
* Resend
* React
* Vite
* TailwindCSS

---

# Estrutura do Projeto

```txt
src/
│
├── controllers/
├── services/
├── repositories/
├── routes/
├── middlewares/
├── database/
└── server.ts
```

---

# Funcionalidades Implementadas

* Registro de usuários
* Login com JWT
* Refresh Token
* Logout
* Recuperação de senha via email
* Redefinição de senha
* CRUD completo de usuários
* CRUD completo de cursos
* Integração com MySQL
* Integração com Resend
* Frontend React integrado ao backend

---

# Feito por

Lennon Costa Ferreira
