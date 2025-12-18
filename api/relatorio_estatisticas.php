<?php
/**
 * API para gerar relatório completo de estatísticas
 */

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonError('Método não permitido', 405);
}

$pdo = getConnection();

try {
    $dataInicio = isset($_GET['data_inicio']) ? $_GET['data_inicio'] : date('Y-m-d', strtotime('-30 days'));
    $dataFim = isset($_GET['data_fim']) ? $_GET['data_fim'] : date('Y-m-d');
    
    // Estatísticas gerais
    $stmt = $pdo->prepare("
        SELECT 
            COUNT(DISTINCT s.id) as total_sessoes,
            COUNT(DISTINCT s.materia_id) as total_materias,
            SUM(s.tempo_focado) as total_tempo_focado,
            SUM(s.tempo_pausa) as total_tempo_pausa,
            SUM(s.sessoes_completadas) as total_sessoes_completadas,
            AVG(s.tempo_focado) as media_tempo_focado
        FROM sessoes s
        WHERE s.data_sessao BETWEEN ? AND ?
    ");
    $stmt->execute([$dataInicio, $dataFim]);
    $geral = $stmt->fetch();
    
    // Estatísticas por matéria
    $stmt = $pdo->prepare("
        SELECT 
            m.id,
            m.nome as materia,
            COUNT(DISTINCT s.id) as total_sessoes,
            SUM(s.tempo_focado) as total_tempo_focado,
            SUM(s.tempo_pausa) as total_tempo_pausa,
            SUM(s.sessoes_completadas) as sessoes_completadas,
            AVG(s.tempo_focado) as media_tempo_focado
        FROM materias m
        LEFT JOIN sessoes s ON m.id = s.materia_id 
            AND s.data_sessao BETWEEN ? AND ?
        WHERE m.ativo = 1
        GROUP BY m.id, m.nome
        HAVING total_sessoes > 0
        ORDER BY total_tempo_focado DESC
    ");
    $stmt->execute([$dataInicio, $dataFim]);
    $porMateria = $stmt->fetchAll();
    
    // Estatísticas por dia
    $stmt = $pdo->prepare("
        SELECT 
            s.data_sessao as data,
            COUNT(DISTINCT s.id) as sessoes,
            SUM(s.tempo_focado) as tempo_focado,
            SUM(s.tempo_pausa) as tempo_pausa
        FROM sessoes s
        WHERE s.data_sessao BETWEEN ? AND ?
        GROUP BY s.data_sessao
        ORDER BY s.data_sessao
    ");
    $stmt->execute([$dataInicio, $dataFim]);
    $porDia = $stmt->fetchAll();
    
    // Lista de todas as aulas estudadas
    $stmt = $pdo->prepare("
        SELECT 
            s.id,
            s.nome_aula,
            m.nome as materia,
            s.data_sessao,
            s.hora_inicio,
            s.sessoes_completadas,
            s.total_sessoes,
            s.tempo_focado,
            s.status
        FROM sessoes s
        JOIN materias m ON s.materia_id = m.id
        WHERE s.data_sessao BETWEEN ? AND ?
        ORDER BY s.data_sessao DESC, s.hora_inicio DESC
    ");
    $stmt->execute([$dataInicio, $dataFim]);
    $aulas = $stmt->fetchAll();
    
    jsonSuccess([
        'periodo' => [
            'inicio' => $dataInicio,
            'fim' => $dataFim
        ],
        'geral' => $geral,
        'por_materia' => $porMateria,
        'por_dia' => $porDia,
        'aulas' => $aulas
    ]);
    
} catch (PDOException $e) {
    jsonError('Erro ao gerar relatório: ' . $e->getMessage(), 500);
}




