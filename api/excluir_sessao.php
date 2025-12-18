<?php
/**
 * API para excluir uma sessão
 */

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    jsonError('Método não permitido', 405);
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['sessao_id'])) {
    jsonError('sessao_id é obrigatório');
}

$pdo = getConnection();

try {
    $pdo->beginTransaction();
    
    $sessaoId = (int)$data['sessao_id'];
    
    // Verificar se sessão existe
    $stmt = $pdo->prepare("SELECT id FROM sessoes WHERE id = ?");
    $stmt->execute([$sessaoId]);
    $sessao = $stmt->fetch();
    
    if (!$sessao) {
        $pdo->rollBack();
        jsonError('Sessão não encontrada', 404);
    }
    
    // Excluir histórico detalhado (cascade já faz isso, mas vamos fazer explicitamente)
    $stmt = $pdo->prepare("DELETE FROM historico_detalhado WHERE sessao_id = ?");
    $stmt->execute([$sessaoId]);
    
    // Excluir sessão
    $stmt = $pdo->prepare("DELETE FROM sessoes WHERE id = ?");
    $stmt->execute([$sessaoId]);
    
    $pdo->commit();
    
    jsonSuccess(null, 'Sessão excluída com sucesso');
    
} catch (PDOException $e) {
    $pdo->rollBack();
    jsonError('Erro ao excluir sessão: ' . $e->getMessage(), 500);
}




