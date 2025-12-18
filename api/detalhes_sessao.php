<?php
/**
 * API para buscar detalhes completos de uma sessão
 */

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonError('Método não permitido', 405);
}

if (!isset($_GET['sessao_id'])) {
    jsonError('sessao_id é obrigatório');
}

$pdo = getConnection();

try {
    $sessaoId = (int)$_GET['sessao_id'];
    
    // Buscar dados da sessão
    $stmt = $pdo->prepare("
        SELECT 
            s.*,
            m.nome as materia_nome
        FROM sessoes s
        JOIN materias m ON s.materia_id = m.id
        WHERE s.id = ?
    ");
    $stmt->execute([$sessaoId]);
    $sessao = $stmt->fetch();
    
    if (!$sessao) {
        jsonError('Sessão não encontrada', 404);
    }
    
    // Buscar histórico detalhado
    $stmt = $pdo->prepare("
        SELECT 
            tipo,
            numero_sessao,
            tempo_inicio,
            tempo_fim,
            duracao_segundos,
            completado
        FROM historico_detalhado
        WHERE sessao_id = ?
        ORDER BY numero_sessao, tipo
    ");
    $stmt->execute([$sessaoId]);
    $historico = $stmt->fetchAll();
    
    $sessao['historico'] = $historico;
    
    jsonSuccess($sessao);
    
} catch (PDOException $e) {
    jsonError('Erro ao buscar detalhes: ' . $e->getMessage(), 500);
}



