CREATE DATABASE IF NOT EXISTS lms;
USE lms;

-- =========================
-- USUÁRIOS
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
-- DISPOSITIVOS
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
-- CURSOS
-- =========================

CREATE TABLE cursos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    thumbnail VARCHAR(500),
    criado_por INT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (criado_por)
    REFERENCES users(id)
    ON DELETE CASCADE
);

-- =========================
-- CURSOS E DISPOSITIVOS
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
    ON DELETE CASCADE
);

-- =========================
-- MÓDULOS
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
-- AULAS
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
-- MATRÍCULAS
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
-- PROGRESSO DAS AULAS
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
-- QUIZZES
-- =========================

CREATE TABLE quizzes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    aula_id INT NOT NULL,
    pergunta TEXT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (aula_id)
    REFERENCES aulas(id)
    ON DELETE CASCADE
);

CREATE TABLE quiz_opcoes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    quiz_id INT NOT NULL,
    texto_opcao TEXT NOT NULL,
    correta BOOLEAN DEFAULT FALSE,

    FOREIGN KEY (quiz_id)
    REFERENCES quizzes(id)
    ON DELETE CASCADE
);

CREATE TABLE respostas_quiz (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    quiz_id INT NOT NULL,
    opcao_id INT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (usuario_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

    FOREIGN KEY (quiz_id)
    REFERENCES quizzes(id)
    ON DELETE CASCADE,

    FOREIGN KEY (opcao_id)
    REFERENCES quiz_opcoes(id)
    ON DELETE CASCADE
);

-- =========================
-- CERTIFICADOS
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
    ON DELETE CASCADE
);

-- =========================
-- REFRESH TOKENS
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
-- RESET DE SENHA
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
-- INSERT DISPOSITIVOS SIRROS
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
  'O Sirros TrackOn utiliza beacons em formato de colar e gateways para monitorar a localização de pessoas equipadas com beacons BLE. A solução otimiza a logística e garante a segurança dos funcionários em áreas controladas.',
  'https://sirros-site-cms.azurewebsites.net/uploads/bn_dispositivos_Track_On_e6eb642e2a.png'
),
(
  'Contador de Pessoas',
  'Contadores',
  'O Contador de Pessoas é uma solução simples e precisa para monitorar o fluxo de pessoas em ambientes internos. Ele é ideal para empresas, organizações e governos interessados em acompanhar a circulação de pessoas em tempo real para segurança, planejamento ou análise de negócios.',
  'https://sirros-site-cms.azurewebsites.net/uploads/bn_dispositivos_contador_de_pessoas_69162893a6.png'
),
(
  'Sirros Data Tag',
  'Contadores',
  'O Data Tag é um dispositivo inovador que simplifica a coleta de dados em ambientes de colheita. Composto por um hardware principal e pulseiras RFID, o sistema permite que os usuários registrem automaticamente a quantidade de sacas colhidas por um trabalhador específico.',
  'https://sirros-site-cms.azurewebsites.net/uploads/Design_sem_nome_38_eee3f4c482.png'
),
(
  'Sirros SmartDoor',
  'Projetos Especiais',
  'O SmartDoor reforça a segurança em ambientes industriais, monitorando portas e armários com alertas instantâneos via LoRa quando abertos. Ele protege ativos e áreas restritas.',
  'https://sirros-site-cms.azurewebsites.net/uploads/bn_dispositivos_Smart_Door_f4efa0f52c.png'
),
(
  'Semáforo IoT',
  'Projetos Especiais',
  'O Semáforo IoT utiliza tecnologia BLE para identificar veículos, alertando os pedestres sobre a passagem deles em áreas movimentadas. Essa solução aumenta a segurança, previne acidentes e otimiza o fluxo de tráfego em ambientes industriais.',
  'https://sirros-site-cms.azurewebsites.net/uploads/bn_dispositivos_Sinaleira_Io_T_a16c0a60a1.png'
),
(
  'Sirros Inclinômetro',
  'Projetos Especiais',
  'O Sirros Inclinômetro é uma solução completa de hardware com tecnologia IoT para detectar inclinação em estruturas móveis com precisão. Alimentado por uma bateria recarregável, ao identificar que a inclinação ultrapassou o limite definido, um LED vermelho acende e um alarme sonoro é ativado caso a condição persista.',
  'https://sirros-site-cms.azurewebsites.net/uploads/Design_sem_nome_36_8595c088ee.png'
);

-- =========================
-- COMANDOS ÚTEIS
-- =========================

-- Ver usuários
SELECT * FROM users;

-- Ver cursos
SELECT * FROM cursos;

-- Ver dispositivos
SELECT * FROM dispositivos;

-- Ver módulos
SELECT * FROM modulos;

-- Ver aulas
SELECT * FROM aulas;

-- Ver matrículas
SELECT * FROM matriculas;

-- Ver progresso das aulas
SELECT * FROM progresso_aulas;

-- Ver certificados
SELECT * FROM certificados;

-- Alterar usuário para admin
UPDATE users
SET role = 'admin'
WHERE id = 1;

-- Alterar usuário para client
UPDATE users
SET role = 'client'
WHERE id = 1;

-- Alterar usuário para student
UPDATE users
SET role = 'student'
WHERE id = 1;

