CREATE DATABASE lms;
USE lms;


CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    role ENUM('student', 'client', 'admin')
    DEFAULT 'student',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE cursos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    thumbnail VARCHAR(500),
    criado_por INT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (criado_por) REFERENCES users(id) ON DELETE CASCADE
);


CREATE TABLE modulos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    curso_id INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    ordem INT DEFAULT 0,
    FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE
);


CREATE TABLE aulas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    modulo_id INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    video_url VARCHAR(500),
    pdf_url VARCHAR(500),
    duracao INT,
    ordem INT DEFAULT 0,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (modulo_id) REFERENCES modulos(id) ON DELETE CASCADE
);


CREATE TABLE matriculas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    curso_id INT NOT NULL,
    progresso DECIMAL(5,2) DEFAULT 0,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE
);


CREATE TABLE progresso_aulas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    aula_id INT NOT NULL,
    concluida BOOLEAN DEFAULT FALSE,
    segundos_assistidos INT DEFAULT 0,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (aula_id) REFERENCES aulas(id) ON DELETE CASCADE
);


CREATE TABLE quizzes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    aula_id INT NOT NULL,
    pergunta TEXT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (aula_id) REFERENCES aulas(id) ON DELETE CASCADE
);


CREATE TABLE quiz_opcoes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    quiz_id INT NOT NULL,
    texto_opcao TEXT NOT NULL,
    correta BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);


CREATE TABLE respostas_quiz (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    quiz_id INT NOT NULL,
    opcao_id INT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    FOREIGN KEY (opcao_id) REFERENCES quiz_opcoes(id) ON DELETE CASCADE
);


CREATE TABLE certificados (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    curso_id INT NOT NULL,
    certificado_url VARCHAR(500),
    emitido_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE
);