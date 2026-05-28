Aqui tens o código completo atualizado, sem nenhum emoji e com o teu nome no encerramento. Podes copiar e colar diretamente no teu ficheiro README.md:

Markdown
# API de Autenticaçao e Usuarios

---

## Como Rodar o Projeto Localmente

Apos baixar ou abrir o projeto na sua maquina, siga os passos abaixo no seu terminal:

### 1. Instalar as dependencias
Instale todos os pacotes necessarios utilizando o npm:
```bash
npm install
ou apenas npm i

2. Iniciar o servidor
Execute o comando abaixo para iniciar o servidor de desenvolvimento:

Bash
npm run dev
Testando as Rotas (Insomnia)
A API roda localmente por padrao na porta 3000. Como as rotas utilizam o prefixo de autenticaçao, voce deve configurar as URLs completas no seu Insomnia (ou cliente HTTP de preferencia) exatamente como demonstrado abaixo:

Autenticaçao (Rotas Publicas)
POST http://localhost:3000/auth/register

Objetivo: Registrar um novo usuario no sistema.

Corpo da Requisiçao (JSON): Enviar os dados cadastrais (ex: name, email, password).

POST http://localhost:3000/auth/login

Objetivo: Autenticar o usuario e gerar os tokens de acesso.

Corpo da Requisiçao (JSON): Enviar as credenciais de acesso (email e password).

POST http://localhost:3000/auth/refresh

Objetivo: Atualizar o token de acesso expirado utilizando um Refresh Token valido.

POST http://localhost:3000/auth/logout

Objetivo: Encerrar a sessao atual e invalidar os tokens do usuario.

Usuario (Rota Protegida)
GET http://localhost:3000/auth/profile

Objetivo: Retornar os dados do perfil do usuario atualmente autenticado.

Nota de Configuraçao: Esta rota possui uma camada de segurança (authMiddleware). Para testa-la com sucesso no Insomnia, voce deve incluir o token de acesso recebido no login (configurado na aba Auth -> Bearer Token ou diretamente nos Headers da requisiçao como Authorization: Bearer <seu_token>).

Feito por Lennon Costa Ferreira.