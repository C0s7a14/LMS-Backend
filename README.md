# Sirros Academy - Backend

Backend da **Sirros Academy**, uma plataforma de treinamento técnico voltada para dispositivos IoT da Sirros.

A API é responsável por autenticação, controle de usuários, cursos, módulos, aulas, quizzes, prova final, certificados, dispositivos, documentação técnica, vínculo de clientes com dispositivos e integração com o agente de IA.

---

## Tecnologias Utilizadas

- Node.js
- Express
- TypeScript
- MySQL
- MySQL2
- JWT
- Bcrypt
- Dotenv
- CORS
- Multer
- PDF Parse
- Axios

---

## Funcionalidades do Backend

### Autenticação

- Cadastro de usuários
- Login com JWT
- Refresh token
- Logout
- Recuperação de senha
- Redefinição de senha
- Controle de acesso por perfil

### Perfis de Usuário

O sistema trabalha com três perfis principais:

- `admin`: gerencia usuários, cursos, dispositivos, avaliações, documentos, relatórios e IA.
- `student`: acessa cursos publicados, realiza aulas, quizzes, prova final e recebe certificados.
- `client`: acessa dispositivos vinculados, documentação técnica e suporte IA.

### Cursos

- Criação de cursos
- Edição de cursos
- Controle de publicação
- Status:
  - `rascunho`
  - `publicado`
  - `arquivado`
- Associação de cursos com dispositivos
- Listagem de cursos por perfil
- Alunos visualizam apenas cursos publicados
- Administradores visualizam cursos publicados, rascunhos e arquivados

### Módulos e Aulas

- Cadastro de módulos
- Cadastro de aulas
- Ordenação de módulos e aulas
- Conteúdo textual
- Link de vídeo
- Material complementar
- Controle de conclusão de aulas
- Progresso individual por aluno

### Quizzes e Avaliações

- Quiz por módulo
- Prova final
- Cadastro de perguntas
- Cadastro de alternativas
- Indicação da alternativa correta
- Nota mínima
- Número máximo de tentativas
- Sorteio de questões por tentativa
- Correção automática
- Controle de tentativas

### Fluxo de Revisão

Quando o aluno não atinge a nota mínima na prova final:

1. O curso entra em revisão.
2. A prova final fica bloqueada.
3. O aluno precisa revisar o conteúdo.
4. Após concluir a revisão, uma nova tentativa é liberada.

### Certificados

- Emissão automática após aprovação na prova final
- Código de validação
- Download em PDF
- Validade de 1 ano
- Certificado vinculado ao aluno e ao curso

### Dispositivos

- Cadastro de dispositivos IoT
- Edição de dispositivos
- Exclusão de dispositivos
- Imagem do dispositivo
- Tipo/categoria
- Descrição técnica
- Vínculo de dispositivos com cursos
- Vínculo de dispositivos com clientes

### Área do Cliente

- Cliente visualiza apenas dispositivos vinculados a ele
- Cliente acessa detalhes do dispositivo
- Cliente acessa documentação técnica do dispositivo
- Cliente baixa PDFs vinculados ao dispositivo
- Cliente acessa suporte IA

### IA Técnica

- Cadastro de prompts da IA
- Upload de documentos técnicos por dispositivo
- Processamento de PDF em chunks
- Consulta de base técnica por dispositivo
- Integração com serviço externo de IA
- Registro de conversas e mensagens

### Relatórios Administrativos

- Total de alunos
- Total de clientes
- Total de cursos
- Cursos publicados
- Matrículas
- Certificados emitidos
- Média de quizzes
- Dados para gráficos no painel administrativo

---

## Estrutura de Pastas

```txt
backend/
│
├── src/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── routes/
│   ├── middlewares/
│   ├── database/
│   ├── utils/
│   └── server.ts
│
├── uploads/
│   └── ai-documents/
│
├── package.json
├── tsconfig.json
├── .env
└── README.md
```

---

## Pré-requisitos

Antes de rodar o backend, tenha instalado:

- Node.js
- npm
- MySQL
- MySQL Workbench ou outro gerenciador de banco
- Git

---

## Instalação

Entre na pasta do backend:

```bash
cd backend
```

Instale as dependências:

```bash
npm install
```

---

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz da pasta `backend`:

```env
PORT=3333

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=lms

JWT_SECRET=sua_chave_jwt
JWT_REFRESH_SECRET=sua_chave_refresh

RESEND_API_KEY=sua_chave_resend

AI_API_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
```

Ajuste os nomes das variáveis de acordo com o arquivo de conexão do projeto, caso estejam diferentes.

---

## Banco de Dados

O banco utilizado é MySQL.

Arquivo principal recomendado:

```txt
database/lms_schema_organizado.sql
```

Para criar o banco, execute o script SQL no MySQL Workbench.

O banco principal utilizado pelo projeto é:

```sql
lms
```

---

## Principais Tabelas

### Usuários e Autenticação

- `users`
- `refresh_tokens`
- `password_resets`

### Cursos e Conteúdo

- `cursos`
- `modulos`
- `aulas`
- `matriculas`
- `progresso_aulas`
- `curso_dispositivos`

### Avaliações

- `quizzes`
- `quiz_questoes`
- `quiz_opcoes`
- `quiz_tentativas`
- `quiz_tentativa_questoes`
- `respostas_quiz`
- `curso_tentativas`

### Certificados

- `certificados`

### Dispositivos

- `dispositivos`
- `cliente_dispositivos`

### IA e Documentação Técnica

- `ai_prompts`
- `dispositivo_documentos`
- `ai_document_chunks`
- `ai_conversas`
- `ai_mensagens`

---

## Rodando o Backend

Para iniciar o servidor em modo desenvolvimento:

```bash
npm run dev
```

O backend ficará disponível em:

```txt
http://localhost:3333
```

---

## Serviço de IA

O backend se comunica com um serviço externo de IA pela variável:

```env
AI_API_URL=http://localhost:8000
```

Para que o suporte IA funcione corretamente, o serviço de IA também precisa estar rodando.

Exemplo:

```bash
cd agente-ia
uvicorn app.main:app --reload --port 8000
```

---

## Rotas Principais

### Autenticação

```http
POST /auth/register
POST /auth/login
POST /auth/refresh
POST /auth/logout
POST /auth/forgot-password
POST /auth/reset-password
```

### Usuários

```http
GET /users
GET /users/:id
PUT /users/:id
DELETE /users/:id
PATCH /admin/users/:userId/role
```

### Cursos

```http
GET /courses
GET /courses/:id
GET /courses/:courseId/content
POST /courses
PUT /courses/:id
DELETE /courses/:id
PATCH /admin/courses/:courseId
PATCH /admin/courses/:courseId/status
```

### Módulos e Aulas

```http
GET /admin/courses/:courseId/aulas
POST /modules
PATCH /modules/:moduleId
DELETE /modules/:moduleId
POST /lessons
PATCH /lessons/:lessonId
DELETE /lessons/:lessonId
```

### Quizzes e Prova Final

```http
POST /quizzes
GET /quizzes/:quizId
GET /courses/:courseId/quizzes
PUT /quizzes/:quizId
DELETE /quizzes/:quizId
POST /quizzes/:quizId/start
GET /quizzes/attempts/:attemptId/questions
POST /quizzes/:quizId/submit
```

### Revisão de Curso

```http
GET /courses/:courseId/review/status
POST /courses/:courseId/review/complete
```

### Certificados

```http
GET /certificates
GET /certificates/:certificateId
GET /certificates/:certificateId/pdf
```

### Dispositivos

```http
GET /devices
GET /devices/:id
POST /devices
PATCH /admin/devices/:deviceId
DELETE /admin/devices/:deviceId
```

### Cliente e Dispositivos

```http
GET /client/devices
GET /client/devices/:deviceId
GET /client/devices/:deviceId/documents
GET /client/device-documents/:documentId/download
```

### Vínculo Cliente/Dispositivo

```http
GET /admin/clients/:clientId/devices
POST /admin/clients/:clientId/devices/:deviceId
DELETE /admin/clients/:clientId/devices/:deviceId
```

### IA Técnica

```http
GET /admin/ai/summary
GET /admin/ai/prompts
POST /admin/ai/prompts
PATCH /admin/ai/prompts/:promptId

GET /admin/ai/devices
GET /admin/devices/:deviceId/documents
POST /admin/devices/:deviceId/documents
POST /admin/device-documents/:documentId/process
DELETE /admin/device-documents/:documentId

POST /client/ai/chat
GET /client/ai/conversations
GET /client/ai/conversations/:conversationId
```

### Relatórios

```http
GET /admin/reports
```

---

## Regras de Acesso

### Admin

Pode:

- Gerenciar usuários
- Gerenciar cursos
- Gerenciar dispositivos
- Vincular dispositivos a clientes
- Criar módulos e aulas
- Criar quizzes e prova final
- Publicar, arquivar e editar cursos
- Enviar documentação técnica
- Processar PDFs para a IA
- Visualizar relatórios

### Student

Pode:

- Visualizar cursos publicados
- Iniciar cursos
- Concluir aulas
- Responder quizzes
- Realizar prova final
- Revisar curso após reprovação
- Baixar certificados

### Client

Pode:

- Visualizar dispositivos vinculados
- Ver detalhes do dispositivo
- Acessar documentação técnica
- Baixar PDFs técnicos
- Usar suporte IA

---

## Upload de Documentos Técnicos

Os documentos técnicos são enviados pelo administrador e vinculados a um dispositivo.

Fluxo:

```txt
Admin faz upload do PDF
↓
Documento é salvo em dispositivo_documentos
↓
PDF é processado
↓
Conteúdo é dividido em chunks
↓
Chunks são salvos em ai_document_chunks
↓
Cliente pode consultar documentação e suporte IA
```

---

## Segurança

- Rotas protegidas por JWT
- Controle de acesso por role
- Cliente só acessa dispositivos vinculados a ele
- Cliente só baixa documentos de dispositivos vinculados a ele
- Admin possui acesso às áreas administrativas
- Refresh tokens armazenados no banco
- Senhas criptografadas com Bcrypt

---

## Scripts Úteis

Instalar dependências:

```bash
npm install
```

Rodar em desenvolvimento:

```bash
npm run dev
```

Gerar build:

```bash
npm run build
```

Rodar build:

```bash
npm start
```

---

## Status do Projeto

O backend está em fase de MVP funcional.

Funcionalidades principais implementadas:

- Autenticação
- Controle por perfil
- Cursos
- Módulos
- Aulas
- Quizzes
- Prova final
- Fluxo de revisão
- Certificados
- Dispositivos
- Vínculo cliente/dispositivo
- Documentação técnica
- Suporte IA
- Relatórios administrativos

---

## Melhorias Futuras

- Exportação de relatórios
- Histórico completo de conversas da IA no painel admin
- Administração avançada de certificados
- Validação pública de certificados
- Controle de turmas
- Métricas avançadas de desempenho
- Melhorias no painel de suporte técnico

---

## Autor

Desenvolvido por **Lennon Costa Ferreira**.