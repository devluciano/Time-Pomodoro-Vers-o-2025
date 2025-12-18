-- ============================================
-- Banco de Dados: time_pomodoro
-- ============================================

CREATE DATABASE IF NOT EXISTS time_pomodoro CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE time_pomodoro;

-- Tabela de matérias/aulas
CREATE TABLE IF NOT EXISTS materias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ativo TINYINT(1) DEFAULT 1,
    INDEX idx_nome (nome),
    INDEX idx_data_criacao (data_criacao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de sessões Pomodoro
CREATE TABLE IF NOT EXISTS sessoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    materia_id INT NOT NULL,
    nome_aula VARCHAR(255) NOT NULL,
    data_sessao DATE NOT NULL,
    hora_inicio TIME,
    hora_fim TIME,
    duracao_acao INT NOT NULL COMMENT 'Duração da ação em minutos',
    duracao_pausa INT NOT NULL COMMENT 'Duração da pausa em minutos',
    total_sessoes INT NOT NULL COMMENT 'Total de sessões configuradas',
    sessoes_completadas INT NOT NULL DEFAULT 0,
    tempo_focado INT NOT NULL DEFAULT 0 COMMENT 'Tempo total focado em segundos',
    tempo_pausa INT NOT NULL DEFAULT 0 COMMENT 'Tempo total de pausa em segundos',
    status ENUM('em_andamento', 'pausado', 'completo', 'cancelado') DEFAULT 'em_andamento',
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE CASCADE,
    INDEX idx_materia_id (materia_id),
    INDEX idx_data_sessao (data_sessao),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de histórico detalhado (cada fase do Pomodoro)
CREATE TABLE IF NOT EXISTS historico_detalhado (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sessao_id INT NOT NULL,
    tipo ENUM('acao', 'pausa') NOT NULL,
    numero_sessao INT NOT NULL COMMENT 'Número da sessão dentro do ciclo',
    tempo_inicio TIMESTAMP NOT NULL,
    tempo_fim TIMESTAMP NULL,
    duracao_segundos INT NOT NULL DEFAULT 0,
    completado TINYINT(1) DEFAULT 0,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sessao_id) REFERENCES sessoes(id) ON DELETE CASCADE,
    INDEX idx_sessao_id (sessao_id),
    INDEX idx_tipo (tipo),
    INDEX idx_tempo_inicio (tempo_inicio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de estatísticas diárias (agregadas)
CREATE TABLE IF NOT EXISTS estatisticas_diarias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    materia_id INT NOT NULL,
    data DATE NOT NULL,
    total_sessoes INT NOT NULL DEFAULT 0,
    total_tempo_focado INT NOT NULL DEFAULT 0 COMMENT 'Em segundos',
    total_tempo_pausa INT NOT NULL DEFAULT 0 COMMENT 'Em segundos',
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE CASCADE,
    UNIQUE KEY uk_materia_data (materia_id, data),
    INDEX idx_data (data)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;




