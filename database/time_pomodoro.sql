-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Dec 18, 2025 at 04:31 PM
-- Server version: 5.7.39
-- PHP Version: 8.3.17

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `time_pomodoro`
--

-- --------------------------------------------------------

--
-- Table structure for table `estatisticas_diarias`
--

CREATE TABLE `estatisticas_diarias` (
  `id` int(11) NOT NULL,
  `materia_id` int(11) NOT NULL,
  `data` date NOT NULL,
  `total_sessoes` int(11) NOT NULL DEFAULT '0',
  `total_tempo_focado` int(11) NOT NULL DEFAULT '0' COMMENT 'Em segundos',
  `total_tempo_pausa` int(11) NOT NULL DEFAULT '0' COMMENT 'Em segundos',
  `data_atualizacao` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `estatisticas_diarias`
--

INSERT INTO `estatisticas_diarias` (`id`, `materia_id`, `data`, `total_sessoes`, `total_tempo_focado`, `total_tempo_pausa`, `data_atualizacao`) VALUES
(1, 2, '2025-12-17', 0, 60, 60, '2025-12-17 22:22:53'),
(3, 4, '2025-12-17', 0, 60, 60, '2025-12-17 22:33:40'),
(5, 1, '2025-12-17', 0, 60, 60, '2025-12-17 23:51:34');

-- --------------------------------------------------------

--
-- Table structure for table `historico_detalhado`
--

CREATE TABLE `historico_detalhado` (
  `id` int(11) NOT NULL,
  `sessao_id` int(11) NOT NULL,
  `tipo` enum('acao','pausa') COLLATE utf8mb4_unicode_ci NOT NULL,
  `numero_sessao` int(11) NOT NULL COMMENT 'Número da sessão dentro do ciclo',
  `tempo_inicio` timestamp NOT NULL,
  `tempo_fim` timestamp NULL DEFAULT NULL,
  `duracao_segundos` int(11) NOT NULL DEFAULT '0',
  `completado` tinyint(1) DEFAULT '0',
  `data_criacao` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `materias`
--

CREATE TABLE `materias` (
  `id` int(11) NOT NULL,
  `nome` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `data_criacao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `ativo` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `materias`
--

INSERT INTO `materias` (`id`, `nome`, `data_criacao`, `ativo`) VALUES
(1, 'teste', '2025-12-17 22:20:52', 1),
(2, 'teste', '2025-12-17 22:20:52', 1),
(3, 'Redes wifi', '2025-12-17 22:31:40', 1),
(4, 'Redes wifi', '2025-12-17 22:31:40', 1);

-- --------------------------------------------------------

--
-- Table structure for table `sessoes`
--

CREATE TABLE `sessoes` (
  `id` int(11) NOT NULL,
  `materia_id` int(11) NOT NULL,
  `nome_aula` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `data_sessao` date NOT NULL,
  `hora_inicio` time DEFAULT NULL,
  `hora_fim` time DEFAULT NULL,
  `duracao_acao` int(11) NOT NULL COMMENT 'Duração da ação em minutos',
  `duracao_pausa` int(11) NOT NULL COMMENT 'Duração da pausa em minutos',
  `total_sessoes` int(11) NOT NULL COMMENT 'Total de sessões configuradas',
  `sessoes_completadas` int(11) NOT NULL DEFAULT '0',
  `tempo_focado` int(11) NOT NULL DEFAULT '0' COMMENT 'Tempo total focado em segundos',
  `tempo_pausa` int(11) NOT NULL DEFAULT '0' COMMENT 'Tempo total de pausa em segundos',
  `status` enum('em_andamento','pausado','completo','cancelado') COLLATE utf8mb4_unicode_ci DEFAULT 'em_andamento',
  `data_criacao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `data_atualizacao` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `estatisticas_diarias`
--
ALTER TABLE `estatisticas_diarias`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_materia_data` (`materia_id`,`data`),
  ADD KEY `idx_data` (`data`);

--
-- Indexes for table `historico_detalhado`
--
ALTER TABLE `historico_detalhado`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_sessao_id` (`sessao_id`),
  ADD KEY `idx_tipo` (`tipo`),
  ADD KEY `idx_tempo_inicio` (`tempo_inicio`);

--
-- Indexes for table `materias`
--
ALTER TABLE `materias`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_nome` (`nome`),
  ADD KEY `idx_data_criacao` (`data_criacao`);

--
-- Indexes for table `sessoes`
--
ALTER TABLE `sessoes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_materia_id` (`materia_id`),
  ADD KEY `idx_data_sessao` (`data_sessao`),
  ADD KEY `idx_status` (`status`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `estatisticas_diarias`
--
ALTER TABLE `estatisticas_diarias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `historico_detalhado`
--
ALTER TABLE `historico_detalhado`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `materias`
--
ALTER TABLE `materias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `sessoes`
--
ALTER TABLE `sessoes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `estatisticas_diarias`
--
ALTER TABLE `estatisticas_diarias`
  ADD CONSTRAINT `estatisticas_diarias_ibfk_1` FOREIGN KEY (`materia_id`) REFERENCES `materias` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `historico_detalhado`
--
ALTER TABLE `historico_detalhado`
  ADD CONSTRAINT `historico_detalhado_ibfk_1` FOREIGN KEY (`sessao_id`) REFERENCES `sessoes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `sessoes`
--
ALTER TABLE `sessoes`
  ADD CONSTRAINT `sessoes_ibfk_1` FOREIGN KEY (`materia_id`) REFERENCES `materias` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
