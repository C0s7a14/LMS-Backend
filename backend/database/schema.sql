-- =========================================================
-- SIRROS ACADEMY / LMS - SCHEMA ORGANIZADO
-- Banco: MySQL
-- Observação: arquivo organizado para manter a estrutura oficial do MVP.
-- Não inclui SELECT, UPDATE ou DELETE de testes.
-- =========================================================

CREATE DATABASE IF NOT EXISTS lms;
USE lms;

-- =========================================================
-- 1. USUÁRIOS
-- =========================================================
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    role ENUM('student', 'client', 'admin') DEFAULT 'student',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- 2. DISPOSITIVOS
-- =========================================================
CREATE TABLE IF NOT EXISTS dispositivos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255) NOT NULL,
    modelo VARCHAR(100),
    tipo VARCHAR(100),
    descricao TEXT,
    imagem_url VARCHAR(500),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- 3. CURSOS
-- =========================================================
CREATE TABLE IF NOT EXISTS cursos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    thumbnail VARCHAR(500),
    criado_por INT NOT NULL,
    status ENUM('rascunho', 'publicado', 'arquivado') NOT NULL DEFAULT 'rascunho',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (criado_por) REFERENCES users(id) ON DELETE CASCADE
);

-- =========================================================
-- 4. CURSOS E DISPOSITIVOS
-- =========================================================
CREATE TABLE IF NOT EXISTS curso_dispositivos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    curso_id INT NOT NULL,
    dispositivo_id INT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
    FOREIGN KEY (dispositivo_id) REFERENCES dispositivos(id) ON DELETE CASCADE,

    UNIQUE KEY unique_curso_dispositivo (curso_id, dispositivo_id)
);

-- =========================================================
-- 5. CLIENTES E DISPOSITIVOS
-- =========================================================
CREATE TABLE IF NOT EXISTS cliente_dispositivos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    dispositivo_id INT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (cliente_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (dispositivo_id) REFERENCES dispositivos(id) ON DELETE CASCADE,

    UNIQUE KEY unique_cliente_dispositivo (cliente_id, dispositivo_id)
);

-- =========================================================
-- 6. MÓDULOS
-- =========================================================
CREATE TABLE IF NOT EXISTS modulos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    curso_id INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    ordem INT DEFAULT 0,

    FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE
);

-- =========================================================
-- 7. AULAS
-- =========================================================
CREATE TABLE IF NOT EXISTS aulas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    modulo_id INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    conteudo TEXT,
    video_url VARCHAR(500),
    pdf_url VARCHAR(500),
    duracao INT,
    ordem INT DEFAULT 0,
    status ENUM('rascunho', 'publicada') NOT NULL DEFAULT 'publicada',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (modulo_id) REFERENCES modulos(id) ON DELETE CASCADE
);

-- =========================================================
-- 8. MATRÍCULAS
-- =========================================================
CREATE TABLE IF NOT EXISTS matriculas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    curso_id INT NOT NULL,
    progresso DECIMAL(5,2) DEFAULT 0,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,

    UNIQUE KEY unique_usuario_curso (usuario_id, curso_id)
);

-- =========================================================
-- 9. PROGRESSO DAS AULAS
-- =========================================================
CREATE TABLE IF NOT EXISTS progresso_aulas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    aula_id INT NOT NULL,
    concluida BOOLEAN DEFAULT FALSE,
    segundos_assistidos INT DEFAULT 0,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (aula_id) REFERENCES aulas(id) ON DELETE CASCADE,

    UNIQUE KEY unique_usuario_aula (usuario_id, aula_id)
);

-- =========================================================
-- 10. QUIZZES / PROVAS
-- =========================================================
CREATE TABLE IF NOT EXISTS quizzes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    curso_id INT NOT NULL,
    modulo_id INT NULL,
    aula_id INT NULL,
    titulo VARCHAR(255) NOT NULL,
    tipo ENUM('aula', 'modulo', 'prova_final') NOT NULL DEFAULT 'aula',
    nota_minima DECIMAL(5,2) NOT NULL DEFAULT 70.00,
    max_tentativas INT NOT NULL DEFAULT 3,
    questoes_por_tentativa INT NOT NULL DEFAULT 5,
    sorteio_ativo BOOLEAN NOT NULL DEFAULT TRUE,
    status ENUM('rascunho', 'publicado') NOT NULL DEFAULT 'rascunho',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
    FOREIGN KEY (modulo_id) REFERENCES modulos(id) ON DELETE CASCADE,
    FOREIGN KEY (aula_id) REFERENCES aulas(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quiz_questoes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    quiz_id INT NOT NULL,
    pergunta TEXT NOT NULL,
    explicacao TEXT NULL,
    ordem INT NOT NULL DEFAULT 1,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quiz_opcoes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    questao_id INT NOT NULL,
    texto_opcao TEXT NOT NULL,
    correta BOOLEAN DEFAULT FALSE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (questao_id) REFERENCES quiz_questoes(id) ON DELETE CASCADE
);

-- =========================================================
-- 11. TENTATIVAS DO CURSO
-- =========================================================
CREATE TABLE IF NOT EXISTS curso_tentativas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    curso_id INT NOT NULL,
    numero_tentativa INT NOT NULL DEFAULT 1,
    status ENUM('em_andamento', 'em_revisao', 'reprovado', 'aprovado', 'bloqueado') NOT NULL DEFAULT 'em_andamento',
    nota_final DECIMAL(5,2) NULL,
    max_tentativas INT NOT NULL DEFAULT 3,
    iniciado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finalizado_em TIMESTAMP NULL,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,

    UNIQUE KEY unique_usuario_curso_tentativa (usuario_id, curso_id, numero_tentativa)
);

-- =========================================================
-- 12. TENTATIVAS DE QUIZ / PROVA
-- =========================================================
CREATE TABLE IF NOT EXISTS quiz_tentativas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    quiz_id INT NOT NULL,
    curso_tentativa_id INT NULL,
    nota DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    total_questoes INT NOT NULL DEFAULT 0,
    total_acertos INT NOT NULL DEFAULT 0,
    aprovado BOOLEAN DEFAULT FALSE,
    iniciado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finalizado_em TIMESTAMP NULL,

    FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    FOREIGN KEY (curso_tentativa_id) REFERENCES curso_tentativas(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS quiz_tentativa_questoes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tentativa_id INT NOT NULL,
    questao_id INT NOT NULL,
    ordem INT NOT NULL DEFAULT 1,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (tentativa_id) REFERENCES quiz_tentativas(id) ON DELETE CASCADE,
    FOREIGN KEY (questao_id) REFERENCES quiz_questoes(id) ON DELETE CASCADE,

    UNIQUE KEY unique_tentativa_questao (tentativa_id, questao_id)
);

CREATE TABLE IF NOT EXISTS respostas_quiz (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tentativa_id INT NOT NULL,
    usuario_id INT NOT NULL,
    quiz_id INT NOT NULL,
    questao_id INT NOT NULL,
    opcao_id INT NOT NULL,
    correta BOOLEAN DEFAULT FALSE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (tentativa_id) REFERENCES quiz_tentativas(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    FOREIGN KEY (questao_id) REFERENCES quiz_questoes(id) ON DELETE CASCADE,
    FOREIGN KEY (opcao_id) REFERENCES quiz_opcoes(id) ON DELETE CASCADE
);

-- =========================================================
-- 13. CERTIFICADOS
-- =========================================================
CREATE TABLE IF NOT EXISTS certificados (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    curso_id INT NOT NULL,
    certificado_url VARCHAR(500),
    validation_code VARCHAR(255) NOT NULL UNIQUE,
    emitido_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,

    UNIQUE KEY unique_certificado_usuario_curso (usuario_id, curso_id)
);

-- =========================================================
-- 14. AUTENTICAÇÃO
-- =========================================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS password_resets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =========================================================
-- 15. IA TÉCNICA / DOCUMENTAÇÃO
-- =========================================================
CREATE TABLE IF NOT EXISTS ai_prompts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    conteudo TEXT NOT NULL,
    dispositivo_id INT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_por INT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (dispositivo_id) REFERENCES dispositivos(id) ON DELETE SET NULL,
    FOREIGN KEY (criado_por) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS dispositivo_documentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dispositivo_id INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT NULL,
    nome_arquivo_original VARCHAR(255) NOT NULL,
    arquivo_url VARCHAR(500) NOT NULL,
    tipo_arquivo VARCHAR(50) NOT NULL DEFAULT 'pdf',
    tamanho_bytes INT NULL,
    status ENUM('pendente', 'processado', 'erro') NOT NULL DEFAULT 'pendente',
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_por INT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (dispositivo_id) REFERENCES dispositivos(id) ON DELETE CASCADE,
    FOREIGN KEY (criado_por) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS ai_document_chunks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    documento_id INT NOT NULL,
    dispositivo_id INT NOT NULL,
    conteudo TEXT NOT NULL,
    pagina INT NULL,
    chunk_index INT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (documento_id) REFERENCES dispositivo_documentos(id) ON DELETE CASCADE,
    FOREIGN KEY (dispositivo_id) REFERENCES dispositivos(id) ON DELETE CASCADE,

    FULLTEXT INDEX idx_ai_chunks_conteudo (conteudo)
);

CREATE TABLE IF NOT EXISTS ai_conversas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    dispositivo_id INT NULL,
    titulo VARCHAR(255) NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (usuario_id) REFERENCES users(id),
    FOREIGN KEY (dispositivo_id) REFERENCES dispositivos(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS ai_mensagens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversa_id INT NOT NULL,
    role ENUM('user', 'assistant') NOT NULL,
    conteudo TEXT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (conversa_id) REFERENCES ai_conversas(id) ON DELETE CASCADE
);

-- =========================================================
-- 16. ÍNDICES ÚTEIS
-- =========================================================
CREATE INDEX idx_cursos_status ON cursos(status);
CREATE INDEX idx_modulos_curso_id ON modulos(curso_id);
CREATE INDEX idx_aulas_modulo_id ON aulas(modulo_id);
CREATE INDEX idx_quizzes_curso_id ON quizzes(curso_id);
CREATE INDEX idx_quizzes_modulo_id ON quizzes(modulo_id);
CREATE INDEX idx_quizzes_tipo_status ON quizzes(tipo, status);
CREATE INDEX idx_quiz_tentativas_usuario_quiz ON quiz_tentativas(usuario_id, quiz_id);
CREATE INDEX idx_curso_tentativas_usuario_curso ON curso_tentativas(usuario_id, curso_id);
CREATE INDEX idx_certificados_usuario_curso ON certificados(usuario_id, curso_id);
CREATE INDEX idx_cliente_dispositivos_cliente_id ON cliente_dispositivos(cliente_id);
CREATE INDEX idx_cliente_dispositivos_dispositivo_id ON cliente_dispositivos(dispositivo_id);
CREATE INDEX idx_dispositivo_documentos_dispositivo_id ON dispositivo_documentos(dispositivo_id);
CREATE INDEX idx_ai_chunks_documento_id ON ai_document_chunks(documento_id);
CREATE INDEX idx_ai_chunks_dispositivo_id ON ai_document_chunks(dispositivo_id);
CREATE INDEX idx_ai_conversas_usuario_id ON ai_conversas(usuario_id);
CREATE INDEX idx_ai_mensagens_conversa_id ON ai_mensagens(conversa_id);

-- =========================================================
-- 17. SEED DISPOSITIVOS SIRROS
-- Rode apenas em banco novo ou quando quiser popular os dispositivos iniciais.
-- =========================================================
INSERT INTO dispositivos (nome, tipo, descricao, imagem_url)
VALUES
(
  'Sirros S1',
  'Telemetria e Eficiência Industrial',
  'O dispositivo S1 captura e envia dados de até 7 sinais, e sua conectividade Wi-Fi permite a transmissão instantânea dessas informações.',
  'https://sirros-site-cms.azurewebsites.net/uploads/bn_dispositivos_s1_fdc34a2cc3.png'
),
(
  'Sirros LogiTrack',
  'Geolocalização',
  'O Sirros LogiTrack é um dispositivo de telemetria para veículos industriais, projetado para monitorar e fornecer dados em tempo real.',
  'https://sirros-site-cms.azurewebsites.net/uploads/bn_dispositivos_Logi_Track2_a771014223.png'
),
(
  'Sirros Rastretech',
  'Geolocalização',
  'O Sirros Rastretech é um dispositivo para rastreamento de ativos com classificação IP65 de resistência. Ele possui um método de fixação simples e comunica-se via GSM para enviar os dados coletados em tempo real.',
  'https://sirros-site-cms.azurewebsites.net/uploads/bn_dispositivos_Rastre_Tech_9b4d9b6ada.png'
),
(
  'Sirros TrackOn',
  'Geolocalização',
  'O Sirros TrackOn utiliza beacons em formato de colar e gateways para monitorar a localização de pessoas equipadas com beacons BLE.',
  'https://sirros-site-cms.azurewebsites.net/uploads/bn_dispositivos_Track_On_e6eb642e2a.png'
),
(
  'Contador de Pessoas',
  'Contadores',
  'O Contador de Pessoas é uma solução para monitorar o fluxo de pessoas em ambientes internos.',
  'https://sirros-site-cms.azurewebsites.net/uploads/bn_dispositivos_contador_de_pessoas_69162893a6.png'
),
(
  'Sirros Data Tag',
  'Contadores',
  'O Data Tag é um dispositivo que simplifica a coleta de dados em ambientes de colheita com hardware principal e pulseiras RFID.',
  'https://sirros-site-cms.azurewebsites.net/uploads/Design_sem_nome_38_eee3f4c482.png'
),
(
  'Sirros SmartDoor',
  'Projetos Especiais',
  'O SmartDoor reforça a segurança em ambientes industriais, monitorando portas e armários com alertas instantâneos via LoRa.',
  'https://sirros-site-cms.azurewebsites.net/uploads/bn_dispositivos_Smart_Door_f4efa0f52c.png'
),
(
  'Semáforo IoT',
  'Projetos Especiais',
  'O Semáforo IoT utiliza tecnologia BLE para identificar veículos e alertar pedestres em áreas movimentadas.',
  'https://sirros-site-cms.azurewebsites.net/uploads/bn_dispositivos_Sinaleira_Io_T_a16c0a60a1.png'
),
(
  'Sirros Inclinômetro',
  'Projetos Especiais',
  'O Sirros Inclinômetro detecta inclinação em estruturas móveis com precisão, utilizando alerta visual e sonoro.',
  'https://sirros-site-cms.azurewebsites.net/uploads/Design_sem_nome_36_8595c088ee.png'
);

-- =========================================================
-- 18. COMANDOS ÚTEIS DE DESENVOLVIMENTO
-- Não rode estes comandos automaticamente. Use apenas quando precisar.
-- =========================================================

-- Adicionar novo dispositivo:
-- INSERT INTO dispositivos (nome, modelo, tipo, descricao, imagem_url)
-- VALUES ('Nome do dispositivo', 'Modelo', 'Categoria', 'Descrição', 'URL da imagem');

-- Vincular dispositivo a um cliente:
-- INSERT IGNORE INTO cliente_dispositivos (cliente_id, dispositivo_id)
-- VALUES (ID_DO_CLIENTE, ID_DO_DISPOSITIVO);

-- Adicionar documento técnico manualmente:
-- INSERT INTO dispositivo_documentos (
--   dispositivo_id,
--   titulo,
--   descricao,
--   nome_arquivo_original,
--   arquivo_url,
--   tipo_arquivo,
--   tamanho_bytes,
--   status,
--   ativo,
--   criado_por
-- ) VALUES (
--   ID_DO_DISPOSITIVO,
--   'Título do documento',
--   'Descrição opcional',
--   'manual.pdf',
--   'uploads/ai-documents/manual.pdf',
--   'pdf',
--   123456,
--   'pendente',
--   TRUE,
--   ID_DO_ADMIN
-- );

-- Criar prompt padrão da IA:
-- INSERT INTO ai_prompts (nome, conteudo, dispositivo_id, ativo, criado_por)
-- VALUES (
--   'Prompt padrão - Agente Técnico Sirros',
--   'Você é um assistente técnico da Sirros. Responda apenas dúvidas relacionadas aos dispositivos da Sirros. Use somente as informações presentes nos documentos técnicos cadastrados pelo administrador. Se a resposta não estiver nos documentos, informe que não encontrou essa informação na base técnica disponível. Não invente dados técnicos, valores, configurações, códigos ou procedimentos. Responda de forma clara, objetiva e segura.',
--   NULL,
--   TRUE,
--   ID_DO_ADMIN
-- );