CREATE DATABASE IF NOT EXISTS lms;
USE lms;

-- =========================
-- 1. USUÁRIOS
-- =========================

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    role ENUM('student', 'client', 'admin') DEFAULT 'student',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- 2. DISPOSITIVOS
-- =========================

CREATE TABLE dispositivos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255) NOT NULL,
    modelo VARCHAR(100),
    tipo VARCHAR(100),
    descricao TEXT,
    imagem_url VARCHAR(500),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- 3. CURSOS
-- =========================

CREATE TABLE cursos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    thumbnail VARCHAR(500),
    criado_por INT NOT NULL,
    status ENUM('rascunho', 'publicado', 'arquivado') NOT NULL DEFAULT 'rascunho',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (criado_por)
    REFERENCES users(id)
    ON DELETE CASCADE
);

-- =========================
-- 4. CURSOS E DISPOSITIVOS
-- =========================

CREATE TABLE curso_dispositivos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    curso_id INT NOT NULL,
    dispositivo_id INT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (curso_id)
    REFERENCES cursos(id)
    ON DELETE CASCADE,

    FOREIGN KEY (dispositivo_id)
    REFERENCES dispositivos(id)
    ON DELETE CASCADE,

    UNIQUE KEY unique_curso_dispositivo (curso_id, dispositivo_id)
);

-- =========================
-- 5. MÓDULOS
-- =========================

CREATE TABLE modulos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    curso_id INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    ordem INT DEFAULT 0,

    FOREIGN KEY (curso_id)
    REFERENCES cursos(id)
    ON DELETE CASCADE
);

-- =========================
-- 6. AULAS
-- =========================

CREATE TABLE aulas (
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

    FOREIGN KEY (modulo_id)
    REFERENCES modulos(id)
    ON DELETE CASCADE
);

-- =========================
-- 7. MATRÍCULAS
-- =========================

CREATE TABLE matriculas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    curso_id INT NOT NULL,
    progresso DECIMAL(5,2) DEFAULT 0,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (usuario_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

    FOREIGN KEY (curso_id)
    REFERENCES cursos(id)
    ON DELETE CASCADE,

    UNIQUE KEY unique_usuario_curso (usuario_id, curso_id)
);

-- =========================
-- 8. PROGRESSO DAS AULAS
-- =========================

CREATE TABLE progresso_aulas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    aula_id INT NOT NULL,
    concluida BOOLEAN DEFAULT FALSE,
    segundos_assistidos INT DEFAULT 0,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (usuario_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

    FOREIGN KEY (aula_id)
    REFERENCES aulas(id)
    ON DELETE CASCADE,

    UNIQUE KEY unique_usuario_aula (usuario_id, aula_id)
);

-- =========================
-- 9. QUIZZES / PROVAS
-- =========================

CREATE TABLE quizzes (
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

    FOREIGN KEY (curso_id)
    REFERENCES cursos(id)
    ON DELETE CASCADE,

    FOREIGN KEY (modulo_id)
    REFERENCES modulos(id)
    ON DELETE CASCADE,

    FOREIGN KEY (aula_id)
    REFERENCES aulas(id)
    ON DELETE CASCADE
);

CREATE TABLE quiz_questoes (
    id INT PRIMARY KEY AUTO_INCREMENT,

    quiz_id INT NOT NULL,

    pergunta TEXT NOT NULL,
    explicacao TEXT NULL,

    ordem INT NOT NULL DEFAULT 1,

    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (quiz_id)
    REFERENCES quizzes(id)
    ON DELETE CASCADE
);

CREATE TABLE quiz_opcoes (
    id INT PRIMARY KEY AUTO_INCREMENT,

    questao_id INT NOT NULL,

    texto_opcao TEXT NOT NULL,
    correta BOOLEAN DEFAULT FALSE,

    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (questao_id)
    REFERENCES quiz_questoes(id)
    ON DELETE CASCADE
);

-- =========================
-- 10. TENTATIVAS DO CURSO
-- =========================

CREATE TABLE curso_tentativas (
    id INT PRIMARY KEY AUTO_INCREMENT,

    usuario_id INT NOT NULL,
    curso_id INT NOT NULL,
    numero_tentativa INT NOT NULL DEFAULT 1,

    status ENUM(
        'em_andamento',
        'em_revisao',
        'reprovado',
        'aprovado',
        'bloqueado'
    ) NOT NULL DEFAULT 'em_andamento',

    nota_final DECIMAL(5,2) NULL,
    max_tentativas INT NOT NULL DEFAULT 3,

    iniciado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finalizado_em TIMESTAMP NULL,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (usuario_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

    FOREIGN KEY (curso_id)
    REFERENCES cursos(id)
    ON DELETE CASCADE,

    UNIQUE KEY unique_usuario_curso_tentativa (
        usuario_id,
        curso_id,
        numero_tentativa
    )
);

-- =========================
-- 11. TENTATIVAS DE QUIZ / PROVA
-- =========================

CREATE TABLE quiz_tentativas (
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

    FOREIGN KEY (usuario_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

    FOREIGN KEY (quiz_id)
    REFERENCES quizzes(id)
    ON DELETE CASCADE,

    FOREIGN KEY (curso_tentativa_id)
    REFERENCES curso_tentativas(id)
    ON DELETE SET NULL
);

CREATE TABLE quiz_tentativa_questoes (
    id INT PRIMARY KEY AUTO_INCREMENT,

    tentativa_id INT NOT NULL,
    questao_id INT NOT NULL,
    ordem INT NOT NULL DEFAULT 1,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (tentativa_id)
    REFERENCES quiz_tentativas(id)
    ON DELETE CASCADE,

    FOREIGN KEY (questao_id)
    REFERENCES quiz_questoes(id)
    ON DELETE CASCADE,

    UNIQUE KEY unique_tentativa_questao (
        tentativa_id,
        questao_id
    )
);

CREATE TABLE respostas_quiz (
    id INT PRIMARY KEY AUTO_INCREMENT,

    tentativa_id INT NOT NULL,
    usuario_id INT NOT NULL,
    quiz_id INT NOT NULL,
    questao_id INT NOT NULL,
    opcao_id INT NOT NULL,

    correta BOOLEAN DEFAULT FALSE,

    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (tentativa_id)
    REFERENCES quiz_tentativas(id)
    ON DELETE CASCADE,

    FOREIGN KEY (usuario_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

    FOREIGN KEY (quiz_id)
    REFERENCES quizzes(id)
    ON DELETE CASCADE,

    FOREIGN KEY (questao_id)
    REFERENCES quiz_questoes(id)
    ON DELETE CASCADE,

    FOREIGN KEY (opcao_id)
    REFERENCES quiz_opcoes(id)
    ON DELETE CASCADE
);

-- =========================
-- 12. CERTIFICADOS
-- =========================

CREATE TABLE certificados (
    id INT PRIMARY KEY AUTO_INCREMENT,

    usuario_id INT NOT NULL,
    curso_id INT NOT NULL,

    certificado_url VARCHAR(500),
    validation_code VARCHAR(255) NOT NULL UNIQUE,

    emitido_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (usuario_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

    FOREIGN KEY (curso_id)
    REFERENCES cursos(id)
    ON DELETE CASCADE,

    UNIQUE KEY unique_certificado_usuario_curso (usuario_id, curso_id)
);

-- =========================
-- 13. REFRESH TOKENS
-- =========================

CREATE TABLE refresh_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,

    user_id INT NOT NULL,
    token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

-- =========================
-- 14. RESET DE SENHA
-- =========================

CREATE TABLE password_resets (
    id INT PRIMARY KEY AUTO_INCREMENT,

    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

-- =========================
-- 15. ÍNDICES ÚTEIS
-- =========================

CREATE INDEX idx_cursos_status ON cursos(status);
CREATE INDEX idx_modulos_curso_id ON modulos(curso_id);
CREATE INDEX idx_aulas_modulo_id ON aulas(modulo_id);
CREATE INDEX idx_quizzes_curso_id ON quizzes(curso_id);
CREATE INDEX idx_quizzes_modulo_id ON quizzes(modulo_id);
CREATE INDEX idx_quizzes_tipo_status ON quizzes(tipo, status);
CREATE INDEX idx_quiz_tentativas_usuario_quiz ON quiz_tentativas(usuario_id, quiz_id);
CREATE INDEX idx_curso_tentativas_usuario_curso ON curso_tentativas(usuario_id, curso_id);
CREATE INDEX idx_certificados_usuario_curso ON certificados(usuario_id, curso_id);

-- =========================
-- 16. SEED DISPOSITIVOS SIRROS
-- =========================

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