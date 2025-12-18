<?php
/**
 * API para salvar histórico detalhado
 */

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Método não permitido', 405);
}

$data = json_decode(file_get_contents('php://input'), true);

$required = ['sessao_id', 'tipo', 'numero_sessao', 'tempo_inicio', 'duracao_segundos'];
foreach ($required as $field) {
    if (!isset($data[$field])) {
        jsonError("Campo obrigatório faltando: $field");
    }
}

$pdo = getConnection();

try {
    $stmt = $pdo->prepare("
        INSERT INTO historico_detalhado 
            (sessao_id, tipo, numero_sessao, tempo_inicio, tempo_fim, duracao_segundos, completado)
        VALUES (?, ?, ?, FROM_UNIXTIME(?), 
                IF(? = 1, FROM_UNIXTIME(?), NULL), ?, ?)
    ");
    
    $tempoFim = isset($data['tempo_fim']) ? $data['tempo_fim'] : null;
    
    $stmt->execute([
        $data['sessao_id'],
        $data['tipo'],
        $data['numero_sessao'],
        $data['tempo_inicio'],
        $data['completado'] ?? 0,
        $tempoFim,
        $data['duracao_segundos'],
        $data['completado'] ?? 0
    ]);
    
    jsonSuccess(['id' => $pdo->lastInsertId()], 'Histórico salvo com sucesso');
    
} catch (PDOException $e) {
    jsonError('Erro ao salvar histórico: ' . $e->getMessage(), 500);
}




