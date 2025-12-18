<?php
/**
 * API para buscar estatísticas
 */

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonError('Método não permitido', 405);
}

$pdo = getConnection();

try {
    $tipo = $_GET['tipo'] ?? 'hoje';
    $materiaId = isset($_GET['materia_id']) ? (int)$_GET['materia_id'] : null;
    
    $result = [];
    
    switch ($tipo) {
        case 'hoje':
            // Estatísticas de hoje
            $sql = "
                SELECT 
                    m.nome as materia,
                    COALESCE(SUM(ed.total_sessoes), 0) as sessoes_completadas,
                    COALESCE(SUM(ed.total_tempo_focado), 0) as total_foco_segundos,
                    COALESCE(SUM(ed.total_tempo_pausa), 0) as total_pausa_segundos
                FROM materias m
                LEFT JOIN estatisticas_diarias ed ON m.id = ed.materia_id AND ed.data = CURDATE()
                WHERE m.ativo = 1
            ";
            
            if ($materiaId) {
                $sql .= " AND m.id = ?";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([$materiaId]);
            } else {
                $sql .= " GROUP BY m.id";
                $stmt = $pdo->prepare($sql);
                $stmt->execute();
            }
            
            $result = $stmt->fetchAll();
            break;
            
        case 'materias':
            // Listar todas as matérias
            $stmt = $pdo->prepare("
                SELECT 
                    m.id,
                    m.nome,
                    COUNT(DISTINCT s.id) as total_sessoes,
                    COALESCE(SUM(s.tempo_focado), 0) as total_tempo_focado,
                    COALESCE(SUM(s.tempo_pausa), 0) as total_tempo_pausa
                FROM materias m
                LEFT JOIN sessoes s ON m.id = s.materia_id
                WHERE m.ativo = 1
                GROUP BY m.id
                ORDER BY m.nome
            ");
            $stmt->execute();
            $result = $stmt->fetchAll();
            break;
            
        case 'historico':
            // Histórico de sessões
            $dias = isset($_GET['dias']) ? (int)$_GET['dias'] : 7;
            $sql = "
                SELECT 
                    s.id,
                    s.nome_aula,
                    m.nome as materia,
                    s.data_sessao,
                    s.hora_inicio,
                    s.hora_fim,
                    s.sessoes_completadas,
                    s.total_sessoes,
                    s.tempo_focado,
                    s.tempo_pausa,
                    s.status
                FROM sessoes s
                JOIN materias m ON s.materia_id = m.id
                WHERE s.data_sessao >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
            ";
            
            if ($materiaId) {
                $sql .= " AND s.materia_id = ?";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([$dias, $materiaId]);
            } else {
                $sql .= " ORDER BY s.data_sessao DESC, s.hora_inicio DESC";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([$dias]);
            }
            
            $result = $stmt->fetchAll();
            break;
    }
    
    jsonSuccess($result);
    
} catch (PDOException $e) {
    jsonError('Erro ao buscar estatísticas: ' . $e->getMessage(), 500);
}




