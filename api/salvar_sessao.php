<?php
/**
 * API para salvar sessão Pomodoro
 */

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Método não permitido', 405);
}

$data = json_decode(file_get_contents('php://input'), true);

// Validar dados obrigatórios
$required = ['nome_aula', 'duracao_acao', 'duracao_pausa', 'total_sessoes'];
foreach ($required as $field) {
    if (!isset($data[$field])) {
        jsonError("Campo obrigatório faltando: $field");
    }
}

$pdo = getConnection();

try {
    $pdo->beginTransaction();
    
    // Buscar ou criar matéria
    $nomeMateria = $data['nome_materia'] ?? 'Geral';
    $stmt = $pdo->prepare("SELECT id FROM materias WHERE nome = ? AND ativo = 1 LIMIT 1");
    $stmt->execute([$nomeMateria]);
    $materia = $stmt->fetch();
    
    if (!$materia) {
        // Criar nova matéria
        $stmt = $pdo->prepare("INSERT INTO materias (nome) VALUES (?)");
        $stmt->execute([$nomeMateria]);
        $materiaId = $pdo->lastInsertId();
    } else {
        $materiaId = $materia['id'];
    }
    
    // Salvar sessão
    $stmt = $pdo->prepare("
        INSERT INTO sessoes (
            materia_id, nome_aula, data_sessao, hora_inicio,
            duracao_acao, duracao_pausa, total_sessoes,
            sessoes_completadas, tempo_focado, tempo_pausa, status
        ) VALUES (?, ?, CURDATE(), CURTIME(), ?, ?, ?, 0, 0, 0, 'em_andamento')
    ");
    
    $stmt->execute([
        $materiaId,
        $data['nome_aula'],
        $data['duracao_acao'],
        $data['duracao_pausa'],
        $data['total_sessoes']
    ]);
    
    $sessaoId = $pdo->lastInsertId();
    
    $pdo->commit();
    
    jsonSuccess([
        'sessao_id' => $sessaoId,
        'materia_id' => $materiaId
    ], 'Sessão criada com sucesso');
    
} catch (PDOException $e) {
    $pdo->rollBack();
    jsonError('Erro ao salvar sessão: ' . $e->getMessage(), 500);
}




