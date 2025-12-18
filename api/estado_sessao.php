<?php
/**
 * API para buscar estado de uma sessão para continuar
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
        WHERE s.id = ? AND s.status = 'em_andamento'
    ");
    $stmt->execute([$sessaoId]);
    $sessao = $stmt->fetch();
    
    if (!$sessao) {
        jsonError('Sessão não encontrada ou não está em andamento', 404);
    }
    
    // Buscar último histórico para calcular tempo restante
    $stmt = $pdo->prepare("
        SELECT 
            tipo,
            numero_sessao,
            tempo_inicio,
            tempo_fim,
            duracao_segundos,
            completado,
            UNIX_TIMESTAMP(tempo_inicio) as tempo_inicio_unix,
            UNIX_TIMESTAMP(tempo_fim) as tempo_fim_unix
        FROM historico_detalhado
        WHERE sessao_id = ?
        ORDER BY numero_sessao DESC, tipo DESC
        LIMIT 1
    ");
    $stmt->execute([$sessaoId]);
    $ultimoHistorico = $stmt->fetch();
    
    // Calcular tempo decorrido e restante
    $tempoDecorrido = 0;
    $tempoRestante = 0;
    $tipoAtual = 'acao';
    
    if ($ultimoHistorico && !$ultimoHistorico['completado']) {
        $tipoAtual = $ultimoHistorico['tipo'];
        $tempoInicio = $ultimoHistorico['tempo_inicio_unix'];
        $tempoAgora = time();
        $tempoDecorrido = $tempoAgora - $tempoInicio;
        $duracaoTotal = $ultimoHistorico['duracao_segundos'];
        $tempoRestante = max(0, $duracaoTotal - $tempoDecorrido);
    } else {
        // Se não há histórico ou está completo, calcular baseado na sessão
        $tipoAtual = ($sessao['sessoes_completadas'] % 2 == 0) ? 'acao' : 'pausa';
        $duracaoMinutos = ($tipoAtual === 'acao') ? $sessao['duracao_acao'] : $sessao['duracao_pausa'];
        $tempoRestante = $duracaoMinutos * 60; // em segundos
    }
    
    // Montar estado para restaurar
    $estado = [
        'sessao_id' => $sessao['id'],
        'materia_id' => $sessao['materia_id'],
        'materia' => $sessao['materia_nome'],
        'nome_aula' => $sessao['nome_aula'],
        'acao' => $sessao['duracao_acao'],
        'pausa' => $sessao['duracao_pausa'],
        'sessoes' => $sessao['total_sessoes'],
        'sessionNumber' => $sessao['sessoes_completadas'],
        'totalSessions' => $sessao['total_sessoes'],
        'type' => $tipoAtual,
        'tempoRestante' => $tempoRestante, // em segundos
        'tempoDecorrido' => $tempoDecorrido, // em segundos
        'isPaused' => true, // Sempre começa pausado quando continuar
        'pausedAt' => null,
        'pausedDuration' => 0
    ];
    
    jsonSuccess($estado);
    
} catch (PDOException $e) {
    jsonError('Erro ao buscar estado da sessão: ' . $e->getMessage(), 500);
}

