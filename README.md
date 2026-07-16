# Sirros Academy - Plataforma de Treinamento Técnico IoT

A **Sirros Academy** é uma plataforma web de treinamento técnico voltada para capacitação de usuários, operadores e clientes que utilizam dispositivos IoT da Sirros.

O sistema permite a criação de cursos, organização por módulos e aulas, acompanhamento de progresso, aplicação de quizzes e prova final, emissão de certificados e controle de acesso por tipo de usuário.

---

## Sobre o Projeto

A plataforma foi desenvolvida com o objetivo de facilitar o treinamento técnico de dispositivos IoT, reduzindo a necessidade de treinamentos presenciais e centralizando conteúdos, avaliações e certificados em um único ambiente digital.

O sistema possui três perfis principais:

- **Admin**: gerencia cursos, usuários, dispositivos, avaliações e conteúdos.
- **Student**: acessa cursos publicados, conclui aulas, responde quizzes, realiza prova final e obtém certificados.
- **Client**: acessa dispositivos e materiais técnicos vinculados.

---

## Funcionalidades Principais

### Autenticação e Usuários

- Cadastro de usuários
- Login com JWT
- Refresh token
- Logout
- Recuperação de senha por e-mail
- Redefinição de senha
- Controle de acesso por perfil
- Gerenciamento de usuários pelo administrador

---

### Cursos

- Criação de cursos
- Edição de cursos
- Exclusão controlada de cursos
- Status de publicação:
  - `rascunho`
  - `publicado`
  - `arquivado`
- Alunos visualizam apenas cursos publicados
- Administradores visualizam cursos publicados, rascunhos e arquivados
- Listagem de cursos com progresso individual por aluno
- Exibição automática da imagem do dispositivo como capa do curso quando o curso não possui thumbnail própria

---

### Módulos e Aulas

- Cursos organizados por módulos
- Módulos compostos por aulas
- Controle de aulas concluídas
- Progresso individual por aluno
- Bloqueio sequencial de aulas
- Exibição de conteúdo textual, vídeo e material complementar

---

### Dispositivos

- Cadastro de dispositivos IoT
- Armazenamento de informações técnicas
- Imagem do dispositivo
- Vinculação de dispositivos a cursos
- Uso da imagem do dispositivo como capa automática do curso

---

### Quizzes e Avaliações

- Quiz por módulo
- Prova final do curso
- Perguntas com alternativas
- Alternativa correta
- Nota mínima
- Número máximo de tentativas
- Correção automática
- Controle de tentativas
- Sorteio de questões por tentativa

---

### Fluxo de Revisão

Quando o aluno não atinge a nota mínima na prova final:

1. O curso entra em status de revisão.
2. A prova final fica bloqueada.
3. O aluno retorna ao curso para revisar o conteúdo.
4. Após concluir a revisão, uma nova tentativa da prova final é liberada.

Esse fluxo evita que o aluno refaça a prova imediatamente sem retornar ao conteúdo do curso.

---

### Certificados

- Certificado emitido automaticamente após aprovação na prova final
- Tela de certificados do aluno
- Modal para visualização do certificado
- Download do certificado em PDF
- Código de validação
- Validade de 1 ano
- Certificados aparecem apenas para cursos aprovados

---

### Interface Web

- Dashboard
- Tela inicial
- Meus Cursos
- Visualização do curso
- Player/área de aula
- Quizzes
- Prova final
- Revisão de curso
- Certificados
- Gerenciamento de usuários
- Gerenciamento de dispositivos
- Criação de cursos
- Dark mode
- Interface responsiva

---

## Tecnologias Utilizadas

### Frontend

- React
- TypeScript
- Vite
- TailwindCSS
- React Router DOM
- Axios
- Lucide React
- React Hot Toast

### Backend

- Node.js
- Express
- TypeScript
- MySQL
- JWT
- Bcrypt
- Resend
- Multer
- PDF generation/download

### Banco de Dados

- MySQL
- MySQL Workbench

---

## Estrutura Geral do Projeto

```txt
sirros-academy/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   ├── routes/
│   │   └── main.tsx
│   │
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   ├── database/
│   │   └── server.ts
│   │
│   ├── package.json
│   └── tsconfig.json
│
└── README.md

Como Rodar o Projeto Localmente
Pré-requisitos

Antes de iniciar, é necessário ter instalado:

Node.js
npm
MySQL
MySQL Workbench ou outro gerenciador de banco
Git
1. Clonar o Repositório
git clone https://github.com/seu-usuario/seu-repositorio.git
cd seu-repositorio
2. Configurar o Backend

Entre na pasta do backend:

cd backend

Instale as dependências:

npm install

Crie um arquivo .env na raiz do backend:

PORT=3333

JWT_SECRET=sua_chave_jwt
JWT_REFRESH_SECRET=sua_chave_refresh

RESEND_API_KEY=sua_chave_resend

DATABASE_HOST=localhost
DATABASE_USER=root
DATABASE_PASSWORD=sua_senha
DATABASE_NAME=lms

Ajuste os nomes das variáveis conforme o arquivo de conexão do projeto.

Inicie o servidor:

npm run dev

O backend ficará disponível em:

http://localhost:3333
3. Configurar o Frontend

Em outro terminal, entre na pasta do frontend:

cd frontend

Instale as dependências:

npm install

Crie um arquivo .env na raiz do frontend, caso o projeto utilize variável para a API:

VITE_API_URL=http://localhost:3333

Inicie o frontend:

npm run dev

O frontend ficará disponível em:

http://localhost:5173
Banco de Dados

O banco de dados utilizado é MySQL.

Principais tabelas do sistema:

users
refresh_tokens
password_resets

cursos
modulos
aulas
matriculas
progresso_aulas

dispositivos
curso_dispositivos

quizzes
quiz_questoes
quiz_opcoes
quiz_tentativas
quiz_tentativa_questoes
respostas_quiz

curso_tentativas
certificados
Status dos Cursos

A tabela cursos possui controle de publicação:

rascunho
publicado
arquivado

Regras:

Administradores visualizam cursos publicados, rascunhos e arquivados.
Alunos visualizam somente cursos publicados.
Cursos em rascunho não aparecem para alunos.
Status da Jornada do Aluno no Curso

O sistema controla o status do aluno dentro do curso por meio das tentativas.

Status possíveis:

em_andamento
em_revisao
reprovado
aprovado
bloqueado

Fluxo:

Aluno acessa curso publicado
↓
Conclui aulas
↓
Realiza quizzes dos módulos
↓
Realiza prova final
↓
Se aprovado, certificado é emitido
↓
Se reprovado, curso entra em revisão
↓
Após revisão, nova tentativa é liberada
Principais Rotas da API
Autenticação
POST /auth/register
POST /auth/login
POST /auth/refresh
POST /auth/logout
POST /auth/forgot-password
POST /auth/reset-password
Usuários
GET /users
GET /users/:id
PUT /users/:id
DELETE /users/:id
Cursos
GET /courses
GET /courses/:id
GET /courses/:courseId/content
POST /courses
PUT /courses/:id
DELETE /courses/:id
Revisão de Curso
GET /courses/:courseId/review/status
POST /courses/:courseId/review/complete
Quizzes e Prova Final
GET /courses/:courseId/quizzes
POST /quizzes/:quizId/start
GET /quizzes/attempts/:attemptId/questions
POST /quizzes/:quizId/submit
Certificados
GET /certificates
GET /certificates/:id
GET /certificates/:id/pdf
Dispositivos
GET /devices
GET /devices/:id
POST /devices
PUT /devices/:id
DELETE /devices/:id
Exemplo de Retorno da Listagem de Cursos
[
  {
    "id": 16,
    "titulo": "Treinamento Técnico: Dispositivo IoT Sirros S1",
    "descricao": "Curso completo sobre a instalação, configuração e operação do dispositivo IoT S1.",
    "thumbnail": "https://imagem-do-dispositivo.png",
    "criado_por": 1,
    "criado_em": "2026-07-16T00:00:00.000Z",
    "curso_publicacao_status": "publicado",
    "criador": "Lennon",
    "total_aulas": 6,
    "aulas_concluidas": 0,
    "progresso": 0,
    "curso_status": "sem_tentativa"
  }
]
Regras da Capa do Curso

A imagem exibida no card do curso segue esta ordem:

Se o curso possuir thumbnail, usa a thumbnail do curso.
Se não possuir thumbnail, usa a imagem do dispositivo vinculado.
Se não houver imagem disponível, o frontend exibe uma capa padrão.
Funcionalidades Implementadas no Frontend
Login
Cadastro
Recuperação de senha
Dashboard
Home
Meus Cursos
Visualização de curso
Conclusão de aulas
Quizzes
Prova final
Fluxo de revisão
Certificados
Download de certificado
Dispositivos
Suporte IA na interface
Administração de usuários
Criação de cursos
Dark mode
Layout responsivo
Funcionalidades Implementadas no Backend
Autenticação com JWT
Refresh token
Logout
Recuperação de senha
CRUD de usuários
CRUD de cursos
Controle de publicação de cursos
Controle de permissões por perfil
Cadastro e vínculo de dispositivos
Progresso individual por aluno
Controle de aulas concluídas
Quizzes
Prova final
Tentativas
Correção automática
Fluxo de revisão
Emissão de certificados
Download de certificados em PDF
Integração com MySQL
Diferenciais do Projeto
Treinamento técnico voltado para dispositivos IoT reais
Controle de progresso individual por aluno
Separação entre cursos publicados e rascunhos
Imagem automática do dispositivo como capa do curso
Fluxo de revisão após reprovação na prova final
Certificado com validade e código de validação
Interface moderna com suporte a modo claro e escuro
Estrutura separada em frontend e backend
Status do Projeto

O projeto está em fase de MVP funcional.

Funcionalidades principais já implementadas:

autenticação
cursos
aulas
progresso
dispositivos
quizzes
prova final
revisão
certificados
controle por perfil

Melhorias futuras previstas:

revisão mais detalhada por módulo
relatórios administrativos
métricas de desempenho
histórico completo de tentativas
validação pública de certificados
melhorias na área de suporte inteligente
maior controle de matrícula por cliente ou turma
Autor

Desenvolvido por Lennon Costa Ferreira.