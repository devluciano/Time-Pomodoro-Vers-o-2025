<?php
/**
 * API para buscar histórico completo de estudos
 */

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonError('Método não permitido', 405);
}

$pdo = getConnection();

try {
    $filtroMateria = isset($_GET['materia_id']) ? (int)$_GET['materia_id'] : null;
    $dataInicio = isset($_GET['data_inicio']) ? $_GET['data_inicio'] : null;
    $dataFim = isset($_GET['data_fim']) ? $_GET['data_fim'] : null;
    $filtroStatus = isset($_GET['status']) ? $_GET['status'] : null;
    $filtroAula = isset($_GET['nome_aula']) ? trim($_GET['nome_aula']) : null;
    $pagina = isset($_GET['pagina']) ? max(1, (int)$_GET['pagina']) : 1;
    $itensPorPagina = isset($_GET['itens_por_pagina']) ? max(1, min(100, (int)$_GET['itens_por_pagina'])) : 10;
    $offset = ($pagina - 1) * $itensPorPagina;
    
    // Buscar total de registros (para paginação)
    $sqlCount = "
        SELECT COUNT(*) as total
        FROM sessoes s
        JOIN materias m ON s.materia_id = m.id
        WHERE 1=1
    ";
    
    $paramsCount = [];
    
    if ($filtroMateria) {
        $sqlCount .= " AND s.materia_id = ?";
        $paramsCount[] = $filtroMateria;
    }
    
    if ($dataInicio) {
        $sqlCount .= " AND s.data_sessao >= ?";
        $paramsCount[] = $dataInicio;
    }
    
    if ($dataFim) {
        $sqlCount .= " AND s.data_sessao <= ?";
        $paramsCount[] = $dataFim;
    }
    
    if ($filtroStatus) {
        $sqlCount .= " AND s.status = ?";
        $paramsCount[] = $filtroStatus;
    }
    
    if ($filtroAula) {
        $sqlCount .= " AND s.nome_aula LIKE ?";
        $paramsCount[] = '%' . $filtroAula . '%';
    }
    
    $stmtCount = $pdo->prepare($sqlCount);
    $stmtCount->execute($paramsCount);
    $totalRegistros = $stmtCount->fetch()['total'];
    $totalPaginas = ceil($totalRegistros / $itensPorPagina);
    
    // Buscar sessões completas
    $sql = "
        SELECT 
            s.id,
            s.nome_aula,
            m.nome as materia,
            s.data_sessao,
            s.hora_inicio,
            s.hora_fim,
            s.duracao_acao,
            s.duracao_pausa,
            s.total_sessoes,
            s.sessoes_completadas,
            s.tempo_focado,
            s.tempo_pausa,
            s.status,
            TIMESTAMPDIFF(SECOND, CONCAT(s.data_sessao, ' ', s.hora_inicio), 
                IFNULL(CONCAT(s.data_sessao, ' ', s.hora_fim), NOW())) as duracao_total_segundos
        FROM sessoes s
        JOIN materias m ON s.materia_id = m.id
        WHERE 1=1
    ";
    
    $params = [];
    
    if ($filtroMateria) {
        $sql .= " AND s.materia_id = ?";
        $params[] = $filtroMateria;
    }
    
    if ($dataInicio) {
        $sql .= " AND s.data_sessao >= ?";
        $params[] = $dataInicio;
    }
    
    if ($dataFim) {
        $sql .= " AND s.data_sessao <= ?";
        $params[] = $dataFim;
    }
    
    if ($filtroStatus) {
        $sql .= " AND s.status = ?";
        $params[] = $filtroStatus;
    }
    
    if ($filtroAula) {
        $sql .= " AND s.nome_aula LIKE ?";
        $params[] = '%' . $filtroAula . '%';
    }
    
    $sql .= " ORDER BY s.data_sessao DESC, s.hora_inicio DESC LIMIT ? OFFSET ?";
    $params[] = $itensPorPagina;
    $params[] = $offset;
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $sessoes = $stmt->fetchAll();
    
    // Buscar histórico detalhado para cada sessão
    foreach ($sessoes as &$sessao) {
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
        $stmt->execute([$sessao['id']]);
        $sessao['historico'] = $stmt->fetchAll();
    }
    
    jsonSuccess([
        'sessoes' => $sessoes,
        'paginacao' => [
            'total' => $totalRegistros,
            'pagina' => $pagina,
            'itens_por_pagina' => $itensPorPagina,
            'total_paginas' => $totalPaginas
        ]
    ]);
    
} catch (PDOException $e) {
    jsonError('Erro ao buscar histórico: ' . $e->getMessage(), 500);
}

