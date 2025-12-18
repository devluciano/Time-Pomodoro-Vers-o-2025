<?php
/**
 * API para atualizar sessão Pomodoro
 */

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    jsonError('Método não permitido', 405);
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['sessao_id'])) {
    jsonError('sessao_id é obrigatório');
}

$pdo = getConnection();

try {
    $pdo->beginTransaction();
    
    $sessaoId = $data['sessao_id'];
    
    // Atualizar sessão
    $updates = [];
    $params = [];
    
    if (isset($data['sessoes_completadas'])) {
        $updates[] = "sessoes_completadas = ?";
        $params[] = $data['sessoes_completadas'];
    }
    
    if (isset($data['tempo_focado'])) {
        $updates[] = "tempo_focado = tempo_focado + ?";
        $params[] = $data['tempo_focado'];
    }
    
    if (isset($data['tempo_pausa'])) {
        $updates[] = "tempo_pausa = tempo_pausa + ?";
        $params[] = $data['tempo_pausa'];
    }
    
    if (isset($data['status'])) {
        $updates[] = "status = ?";
        $params[] = $data['status'];
    }
    
    if (isset($data['hora_fim'])) {
        $updates[] = "hora_fim = ?";
        $params[] = $data['hora_fim'];
    }
    
    if (empty($updates)) {
        jsonError('Nenhum campo para atualizar');
    }
    
    $params[] = $sessaoId;
    
    $sql = "UPDATE sessoes SET " . implode(', ', $updates) . " WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    
    // Atualizar estatísticas diárias
    if (isset($data['tempo_focado']) || isset($data['tempo_pausa']) || isset($data['sessoes_completadas'])) {
        $stmt = $pdo->prepare("
            SELECT materia_id FROM sessoes WHERE id = ?
        ");
        $stmt->execute([$sessaoId]);
        $sessao = $stmt->fetch();
        
        if ($sessao) {
            $stmt = $pdo->prepare("
                INSERT INTO estatisticas_diarias 
                    (materia_id, data, total_sessoes, total_tempo_focado, total_tempo_pausa)
                VALUES (?, CURDATE(), ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    total_sessoes = total_sessoes + VALUES(total_sessoes),
                    total_tempo_focado = total_tempo_focado + VALUES(total_tempo_focado),
                    total_tempo_pausa = total_tempo_pausa + VALUES(total_tempo_pausa)
            ");
            
            $stmt->execute([
                $sessao['materia_id'],
                $data['sessoes_completadas'] ?? 0,
                $data['tempo_focado'] ?? 0,
                $data['tempo_pausa'] ?? 0
            ]);
        }
    }
    
    $pdo->commit();
    
    jsonSuccess(null, 'Sessão atualizada com sucesso');
    
} catch (PDOException $e) {
    $pdo->rollBack();
    jsonError('Erro ao atualizar sessão: ' . $e->getMessage(), 500);
}




