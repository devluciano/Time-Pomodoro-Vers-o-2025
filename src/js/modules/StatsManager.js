/**
 * Classe StatsManager - Gerencia análise e estatísticas
 */
export class StatsManager {
   constructor(apiManager) {
      this.api = apiManager
      this.chartMaterias = null
      this.chartEvolucao = null
      this.paginaAtual = 1
      this.itensPorPagina = 10
      this.totalPaginas = 1
      this.totalRegistros = 0
   }
   
   /**
    * Formata segundos para horas e minutos
    */
   formatarTempo(segundos) {
      const horas = Math.floor(segundos / 3600)
      const minutos = Math.floor((segundos % 3600) / 60)
      
      if (horas > 0) {
         return `${horas}h ${minutos}m`
      }
      return `${minutos}m`
   }
   
   /**
    * Carrega e exibe estatísticas
    */
   async carregarEstatisticas(dataInicio = null, dataFim = null, materiaId = null, nomeAula = null, status = null, pagina = 1) {
      try {
         // Resetar página se mudar filtros
         if (pagina === 1) {
            this.paginaAtual = 1
         }
         
         const params = new URLSearchParams()
         if (dataInicio) params.append('data_inicio', dataInicio)
         if (dataFim) params.append('data_fim', dataFim)
         if (materiaId) params.append('materia_id', materiaId)
         if (nomeAula) params.append('nome_aula', nomeAula)
         if (status) params.append('status', status)
         params.append('pagina', this.paginaAtual)
         params.append('itens_por_pagina', this.itensPorPagina)
         
         // Carregar histórico com paginação
         const responseHistorico = await this.api.request(`historico_completo.php?${params}`, 'GET')
         const dadosHistorico = responseHistorico.data
         
         console.log('📊 Dados recebidos da API:', dadosHistorico)
         
         // Verificar se é array direto (formato antigo) ou objeto com paginação
         let sessoes = []
         if (Array.isArray(dadosHistorico)) {
            // Formato antigo - array direto
            sessoes = dadosHistorico
            this.totalRegistros = sessoes.length
            this.totalPaginas = 1
         } else if (dadosHistorico.sessoes) {
            // Formato novo - objeto com paginação
            sessoes = dadosHistorico.sessoes || []
            if (dadosHistorico.paginacao) {
               this.totalRegistros = dadosHistorico.paginacao.total || 0
               this.totalPaginas = dadosHistorico.paginacao.total_paginas || 1
               this.paginaAtual = dadosHistorico.paginacao.pagina || 1
            }
         } else {
            // Fallback
            sessoes = []
            this.totalRegistros = 0
            this.totalPaginas = 1
         }
         
         // Atualizar tabela de aulas
         this.atualizarTabelaAulas(sessoes)
         this.atualizarPaginacao()
         
         // Carregar estatísticas gerais (sem paginação)
         const paramsStats = new URLSearchParams()
         if (dataInicio) paramsStats.append('data_inicio', dataInicio)
         if (dataFim) paramsStats.append('data_fim', dataFim)
         if (materiaId) paramsStats.append('materia_id', materiaId)
         
         try {
            const responseStats = await this.api.request(`relatorio_estatisticas.php?${paramsStats}`, 'GET')
            const dadosStats = responseStats.data
            
            // Atualizar estatísticas gerais
            this.atualizarEstatisticasGerais(dadosStats.geral)
            
            // Atualizar gráficos
            this.atualizarGraficoMaterias(dadosStats.por_materia)
            this.atualizarGraficoEvolucao(dadosStats.por_dia)
         } catch (error) {
            console.warn('Erro ao carregar estatísticas gerais:', error)
         }
         
         // Carregar lista de matérias para filtro
         await this.carregarMaterias()
         
         return dadosHistorico
      } catch (error) {
         console.error('Erro ao carregar estatísticas:', error)
         throw error
      }
   }
   
   /**
    * Atualiza estatísticas gerais
    */
   atualizarEstatisticasGerais(geral) {
      const elTotalSessoes = document.getElementById('stat-total-sessoes')
      const elTempoFocado = document.getElementById('stat-tempo-focado')
      const elTempoPausa = document.getElementById('stat-tempo-pausa')
      const elTotalMaterias = document.getElementById('stat-total-materias')
      
      if (elTotalSessoes) elTotalSessoes.textContent = geral.total_sessoes || 0
      if (elTempoFocado) elTempoFocado.textContent = this.formatarTempo(geral.total_tempo_focado || 0)
      if (elTempoPausa) elTempoPausa.textContent = this.formatarTempo(geral.total_tempo_pausa || 0)
      if (elTotalMaterias) elTotalMaterias.textContent = geral.total_materias || 0
   }
   
   /**
    * Atualiza gráfico de matérias
    */
   atualizarGraficoMaterias(dados) {
      const ctx = document.getElementById('chart-materias')
      if (!ctx) return
      
      const labels = dados.map(m => m.materia)
      const tempoFocado = dados.map(m => Math.round((m.total_tempo_focado || 0) / 60)) // em minutos
      
      if (this.chartMaterias) {
         this.chartMaterias.destroy()
      }
      
      this.chartMaterias = new Chart(ctx, {
         type: 'bar',
         data: {
            labels: labels,
            datasets: [{
               label: 'Tempo Focado (minutos)',
               data: tempoFocado,
               backgroundColor: 'rgba(40, 167, 69, 0.8)',
               borderColor: 'rgba(40, 167, 69, 1)',
               borderWidth: 1
            }]
         },
         options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
               legend: {
                  labels: {
                     color: '#fff'
                  }
               }
            },
            scales: {
               y: {
                  beginAtZero: true,
                  ticks: {
                     color: '#fff'
                  },
                  grid: {
                     color: 'rgba(255, 255, 255, 0.1)'
                  }
               },
               x: {
                  ticks: {
                     color: '#fff'
                  },
                  grid: {
                     color: 'rgba(255, 255, 255, 0.1)'
                  }
               }
            }
         }
      })
   }
   
   /**
    * Atualiza gráfico de evolução diária
    */
   atualizarGraficoEvolucao(dados) {
      const ctx = document.getElementById('chart-evolucao')
      if (!ctx) return
      
      const labels = dados.map(d => {
         const date = new Date(d.data)
         return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      })
      const tempoFocado = dados.map(d => Math.round((d.tempo_focado || 0) / 60)) // em minutos
      
      if (this.chartEvolucao) {
         this.chartEvolucao.destroy()
      }
      
      this.chartEvolucao = new Chart(ctx, {
         type: 'line',
         data: {
            labels: labels,
            datasets: [{
               label: 'Tempo Focado (minutos)',
               data: tempoFocado,
               borderColor: 'rgba(0, 123, 255, 1)',
               backgroundColor: 'rgba(0, 123, 255, 0.1)',
               tension: 0.4,
               fill: true
            }]
         },
         options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
               legend: {
                  labels: {
                     color: '#fff'
                  }
               }
            },
            scales: {
               y: {
                  beginAtZero: true,
                  ticks: {
                     color: '#fff'
                  },
                  grid: {
                     color: 'rgba(255, 255, 255, 0.1)'
                  }
               },
               x: {
                  ticks: {
                     color: '#fff'
                  },
                  grid: {
                     color: 'rgba(255, 255, 255, 0.1)'
                  }
               }
            }
         }
      })
   }
   
   /**
    * Atualiza informações de paginação
    */
   atualizarPaginacao() {
      const infoPaginacao = document.getElementById('info-paginacao')
      const paginacao = document.getElementById('paginacao')
      
      if (infoPaginacao) {
         const inicio = this.totalRegistros === 0 ? 0 : (this.paginaAtual - 1) * this.itensPorPagina + 1
         const fim = Math.min(this.paginaAtual * this.itensPorPagina, this.totalRegistros)
         infoPaginacao.textContent = `Mostrando ${inicio}-${fim} de ${this.totalRegistros}`
      }
      
      if (paginacao) {
         if (this.totalPaginas <= 1) {
            paginacao.innerHTML = ''
            return
         }
         
         let html = ''
         
         // Botão Anterior
         html += `<li class="page-item ${this.paginaAtual === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="window.statsManager.irParaPagina(${this.paginaAtual - 1}); return false;">
               <i class="fa-solid fa-chevron-left"></i>
            </a>
         </li>`
         
         // Números das páginas
         const inicioPagina = Math.max(1, this.paginaAtual - 2)
         const fimPagina = Math.min(this.totalPaginas, this.paginaAtual + 2)
         
         if (inicioPagina > 1) {
            html += `<li class="page-item"><a class="page-link" href="#" onclick="window.statsManager.irParaPagina(1); return false;">1</a></li>`
            if (inicioPagina > 2) {
               html += `<li class="page-item disabled"><span class="page-link">...</span></li>`
            }
         }
         
         for (let i = inicioPagina; i <= fimPagina; i++) {
            html += `<li class="page-item ${i === this.paginaAtual ? 'active' : ''}">
               <a class="page-link" href="#" onclick="window.statsManager.irParaPagina(${i}); return false;">${i}</a>
            </li>`
         }
         
         if (fimPagina < this.totalPaginas) {
            if (fimPagina < this.totalPaginas - 1) {
               html += `<li class="page-item disabled"><span class="page-link">...</span></li>`
            }
            html += `<li class="page-item"><a class="page-link" href="#" onclick="window.statsManager.irParaPagina(${this.totalPaginas}); return false;">${this.totalPaginas}</a></li>`
         }
         
         // Botão Próximo
         html += `<li class="page-item ${this.paginaAtual === this.totalPaginas ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="window.statsManager.irParaPagina(${this.paginaAtual + 1}); return false;">
               <i class="fa-solid fa-chevron-right"></i>
            </a>
         </li>`
         
         paginacao.innerHTML = html
      }
   }
   
   /**
    * Navega para uma página específica
    */
   async irParaPagina(pagina) {
      if (pagina < 1 || pagina > this.totalPaginas) return
      
      this.paginaAtual = pagina
      
      const dataInicio = document.getElementById('filtro-data-inicio')?.value || null
      const dataFim = document.getElementById('filtro-data-fim')?.value || null
      const materiaId = document.getElementById('filtro-materia')?.value || null
      const nomeAula = document.getElementById('filtro-aula')?.value?.trim() || null
      const status = document.getElementById('filtro-status')?.value || null
      
      await this.carregarEstatisticas(dataInicio, dataFim, materiaId, nomeAula, status, pagina)
      
      // Scroll para o topo da tabela
      const tabela = document.getElementById('tabela-aulas')
      if (tabela) {
         tabela.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
   }
   
   /**
    * Atualiza tabela de aulas
    */
   atualizarTabelaAulas(aulas) {
      const tbody = document.getElementById('tbody-aulas')
      if (!tbody) return
      
      if (!aulas || aulas.length === 0) {
         tbody.innerHTML = '<tr><td colspan="7" class="text-center">Nenhuma aula encontrada no período selecionado.</td></tr>'
         return
      }
      
      tbody.innerHTML = aulas.map(aula => {
         const data = new Date(aula.data_sessao)
         const dataFormatada = data.toLocaleDateString('pt-BR')
         const tempoFocado = this.formatarTempo(aula.tempo_focado || 0)
         const statusClass = {
            'completo': 'success',
            'em_andamento': 'warning',
            'pausado': 'info',
            'cancelado': 'danger'
         }[aula.status] || 'secondary'
         
         const statusText = {
            'completo': 'Completo',
            'em_andamento': 'Em Andamento',
            'pausado': 'Pausado',
            'cancelado': 'Cancelado'
         }[aula.status] || aula.status
         
         return `
            <tr>
               <td>${dataFormatada}</td>
               <td>${aula.materia}</td>
               <td>${aula.nome_aula}</td>
               <td>${aula.sessoes_completadas || 0}/${aula.total_sessoes || 0}</td>
               <td>${tempoFocado}</td>
               <td><span class="badge bg-${statusClass}">${statusText}</span></td>
               <td>
                  <div class="btn-group btn-group-sm" role="group">
                     ${aula.status === 'em_andamento' ? `
                     <button type="button" class="btn btn-outline-warning" onclick="window.statsManager.continuarSessao(${aula.id})" title="Continuar sessão">
                        <i class="fa-solid fa-play"></i>
                     </button>
                     ` : ''}
                     <button type="button" class="btn btn-outline-info" onclick="window.statsManager.visualizarSessao(${aula.id})" title="Visualizar detalhes">
                        <i class="fa-solid fa-eye"></i>
                     </button>
                     <button type="button" class="btn btn-outline-success" onclick="window.statsManager.exportarSessao(${aula.id})" title="Exportar sessão">
                        <i class="fa-solid fa-download"></i>
                     </button>
                     <button type="button" class="btn btn-outline-danger" onclick="window.statsManager.excluirSessao(${aula.id}, '${aula.nome_aula.replace(/'/g, "\\'")}')" title="Excluir sessão">
                        <i class="fa-solid fa-trash"></i>
                     </button>
                  </div>
               </td>
            </tr>
         `
      }).join('')
   }
   
   /**
    * Carrega lista de matérias para filtro
    */
   async carregarMaterias() {
      try {
         const materias = await this.api.getMaterias()
         const select = document.getElementById('filtro-materia')
         
         if (!select) return
         
         // Limpar opções (exceto "Todas")
         select.innerHTML = '<option value="">Todas as matérias</option>'
         
         materias.forEach(materia => {
            const option = document.createElement('option')
            option.value = materia.id
            option.textContent = materia.nome
            select.appendChild(option)
         })
      } catch (error) {
         console.error('Erro ao carregar matérias:', error)
      }
   }
   
   /**
    * Exporta relatório para PDF
    */
   async exportarPDF() {
      try {
         const { jsPDF } = window.jspdf
         const doc = new jsPDF()
         
         // Título
         doc.setFontSize(18)
         doc.text('Relatório de Estudos Pomodoro', 105, 20, { align: 'center' })
         
         // Data do relatório
         doc.setFontSize(10)
         const dataInicio = document.getElementById('filtro-data-inicio')?.value || 'Início'
         const dataFim = document.getElementById('filtro-data-fim')?.value || 'Fim'
         doc.text(`Período: ${dataInicio} a ${dataFim}`, 105, 30, { align: 'center' })
         
         // Estatísticas gerais
         let y = 45
         doc.setFontSize(14)
         doc.text('Estatísticas Gerais', 20, y)
         y += 10
         
         doc.setFontSize(10)
         const totalSessoes = document.getElementById('stat-total-sessoes')?.textContent || '0'
         const tempoFocado = document.getElementById('stat-tempo-focado')?.textContent || '0h 0m'
         const tempoPausa = document.getElementById('stat-tempo-pausa')?.textContent || '0h 0m'
         const totalMaterias = document.getElementById('stat-total-materias')?.textContent || '0'
         
         doc.text(`Total de Sessões: ${totalSessoes}`, 20, y)
         y += 7
         doc.text(`Tempo Focado: ${tempoFocado}`, 20, y)
         y += 7
         doc.text(`Tempo de Pausa: ${tempoPausa}`, 20, y)
         y += 7
         doc.text(`Total de Matérias: ${totalMaterias}`, 20, y)
         y += 15
         
         // Tabela de aulas
         doc.setFontSize(14)
         doc.text('Histórico de Aulas', 20, y)
         y += 10
         
         // Cabeçalho da tabela
         doc.setFontSize(9)
         doc.text('Data', 20, y)
         doc.text('Matéria', 50, y)
         doc.text('Aula', 100, y)
         doc.text('Sessões', 150, y)
         doc.text('Tempo', 170, y)
         y += 5
         doc.line(20, y, 190, y)
         y += 7
         
         // Dados da tabela
         const tbody = document.getElementById('tbody-aulas')
         if (tbody) {
            const rows = tbody.querySelectorAll('tr')
            rows.forEach(row => {
               const cells = row.querySelectorAll('td')
               if (cells.length >= 6 && !cells[0].textContent.includes('Nenhuma')) {
                  if (y > 270) {
                     doc.addPage()
                     y = 20
                  }
                  
                  doc.setFontSize(8)
                  doc.text(cells[0].textContent.trim(), 20, y)
                  doc.text(cells[1].textContent.trim().substring(0, 20), 50, y)
                  doc.text(cells[2].textContent.trim().substring(0, 25), 100, y)
                  doc.text(cells[3].textContent.trim(), 150, y)
                  doc.text(cells[4].textContent.trim(), 170, y)
                  y += 7
               }
            })
         }
         
         // Salvar PDF
         const nomeArquivo = `relatorio_pomodoro_${new Date().toISOString().split('T')[0]}.pdf`
         doc.save(nomeArquivo)
         
      } catch (error) {
         console.error('Erro ao exportar PDF:', error)
         Swal.fire({
            icon: 'error',
            title: 'Erro',
            text: 'Erro ao gerar PDF. Verifique o console para mais detalhes.'
         })
      }
   }
   
   /**
    * Visualiza detalhes de uma sessão
    */
   async visualizarSessao(sessaoId) {
      try {
         Swal.fire({
            title: 'Carregando...',
            text: 'Buscando detalhes da sessão',
            allowOutsideClick: false,
            didOpen: () => {
               Swal.showLoading()
            }
         })
         
         const detalhes = await this.api.getDetalhesSessao(sessaoId)
         
         const data = new Date(detalhes.data_sessao)
         const dataFormatada = data.toLocaleDateString('pt-BR')
         const horaInicio = detalhes.hora_inicio ? detalhes.hora_inicio : 'Não informado'
         const horaFim = detalhes.hora_fim ? detalhes.hora_fim : 'Não finalizado'
         const tempoFocado = this.formatarTempo(detalhes.tempo_focado || 0)
         const tempoPausa = this.formatarTempo(detalhes.tempo_pausa || 0)
         
         const statusText = {
            'completo': 'Completo',
            'em_andamento': 'Em Andamento',
            'pausado': 'Pausado',
            'cancelado': 'Cancelado'
         }[detalhes.status] || detalhes.status
         
         // Montar HTML com detalhes
         let historicoHTML = ''
         if (detalhes.historico && detalhes.historico.length > 0) {
            historicoHTML = '<table class="table table-sm table-dark mt-3"><thead><tr><th>Sessão</th><th>Tipo</th><th>Duração</th><th>Status</th></tr></thead><tbody>'
            detalhes.historico.forEach(h => {
               const tipoText = h.tipo === 'acao' ? 'Ação' : 'Pausa'
               const duracao = this.formatarTempo(h.duracao_segundos || 0)
               const completado = h.completado ? '<span class="badge bg-success">Completo</span>' : '<span class="badge bg-warning">Incompleto</span>'
               historicoHTML += `<tr><td>${h.numero_sessao}</td><td>${tipoText}</td><td>${duracao}</td><td>${completado}</td></tr>`
            })
            historicoHTML += '</tbody></table>'
         } else {
            historicoHTML = '<p class="text-muted mt-3">Nenhum histórico detalhado disponível.</p>'
         }
         
         Swal.fire({
            title: `Detalhes da Sessão`,
            html: `
               <div class="text-start text-white">
                  <p><strong>Matéria:</strong> ${detalhes.materia_nome}</p>
                  <p><strong>Nome da Aula:</strong> ${detalhes.nome_aula}</p>
                  <p><strong>Data:</strong> ${dataFormatada}</p>
                  <p><strong>Hora Início:</strong> ${horaInicio}</p>
                  <p><strong>Hora Fim:</strong> ${horaFim}</p>
                  <p><strong>Duração Ação:</strong> ${detalhes.duracao_acao} minutos</p>
                  <p><strong>Duração Pausa:</strong> ${detalhes.duracao_pausa} minutos</p>
                  <p><strong>Sessões:</strong> ${detalhes.sessoes_completadas || 0} / ${detalhes.total_sessoes || 0}</p>
                  <p><strong>Tempo Focado:</strong> ${tempoFocado}</p>
                  <p><strong>Tempo de Pausa:</strong> ${tempoPausa}</p>
                  <p><strong>Status:</strong> ${statusText}</p>
                  <hr>
                  <h6>Histórico Detalhado:</h6>
                  ${historicoHTML}
               </div>
            `,
            width: '800px',
            background: '#1a1a1a',
            color: '#fff',
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Fechar'
         })
         
      } catch (error) {
         console.error('Erro ao visualizar sessão:', error)
         Swal.fire({
            icon: 'error',
            title: 'Erro',
            text: 'Não foi possível carregar os detalhes da sessão.'
         })
      }
   }
   
   /**
    * Exporta uma sessão específica para PDF
    */
   async exportarSessao(sessaoId) {
      try {
         Swal.fire({
            title: 'Carregando...',
            text: 'Preparando exportação',
            allowOutsideClick: false,
            didOpen: () => {
               Swal.showLoading()
            }
         })
         
         const detalhes = await this.api.getDetalhesSessao(sessaoId)
         
         const { jsPDF } = window.jspdf
         const doc = new jsPDF()
         
         // Título
         doc.setFontSize(18)
         doc.text('Detalhes da Sessão Pomodoro', 105, 20, { align: 'center' })
         
         // Dados da sessão
         let y = 35
         doc.setFontSize(12)
         doc.text(`Matéria: ${detalhes.materia_nome}`, 20, y)
         y += 8
         doc.text(`Nome da Aula: ${detalhes.nome_aula}`, 20, y)
         y += 8
         
         const data = new Date(detalhes.data_sessao)
         doc.text(`Data: ${data.toLocaleDateString('pt-BR')}`, 20, y)
         y += 8
         doc.text(`Hora Início: ${detalhes.hora_inicio || 'N/A'}`, 20, y)
         y += 8
         doc.text(`Hora Fim: ${detalhes.hora_fim || 'N/A'}`, 20, y)
         y += 8
         doc.text(`Sessões: ${detalhes.sessoes_completadas || 0}/${detalhes.total_sessoes || 0}`, 20, y)
         y += 8
         doc.text(`Tempo Focado: ${this.formatarTempo(detalhes.tempo_focado || 0)}`, 20, y)
         y += 8
         doc.text(`Tempo de Pausa: ${this.formatarTempo(detalhes.tempo_pausa || 0)}`, 20, y)
         y += 10
         
         // Histórico
         if (detalhes.historico && detalhes.historico.length > 0) {
            doc.setFontSize(14)
            doc.text('Histórico Detalhado', 20, y)
            y += 8
            doc.setFontSize(9)
            doc.text('Sessão', 20, y)
            doc.text('Tipo', 50, y)
            doc.text('Duração', 100, y)
            doc.text('Status', 150, y)
            y += 5
            doc.line(20, y, 190, y)
            y += 7
            doc.setFontSize(8)
            
            detalhes.historico.forEach(h => {
               if (y > 270) {
                  doc.addPage()
                  y = 20
               }
               doc.text(h.numero_sessao.toString(), 20, y)
               doc.text(h.tipo === 'acao' ? 'Ação' : 'Pausa', 50, y)
               doc.text(this.formatarTempo(h.duracao_segundos || 0), 100, y)
               doc.text(h.completado ? 'Completo' : 'Incompleto', 150, y)
               y += 7
            })
         }
         
         // Salvar PDF
         const nomeArquivo = `sessao_${sessaoId}_${new Date().toISOString().split('T')[0]}.pdf`
         doc.save(nomeArquivo)
         
         Swal.fire({
            icon: 'success',
            title: 'Exportado!',
            text: 'Sessão exportada com sucesso.',
            timer: 2000,
            showConfirmButton: false
         })
         
      } catch (error) {
         console.error('Erro ao exportar sessão:', error)
         Swal.fire({
            icon: 'error',
            title: 'Erro',
            text: 'Não foi possível exportar a sessão.'
         })
      }
   }
   
   /**
    * Exclui uma sessão
    */
   async excluirSessao(sessaoId, nomeAula) {
      try {
         const result = await Swal.fire({
            title: 'Confirmar Exclusão',
            html: `Deseja realmente excluir a sessão <strong>"${nomeAula}"</strong>?<br><br><small class="text-muted">Esta ação não pode ser desfeita.</small>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sim, excluir',
            cancelButtonText: 'Cancelar',
            background: '#1a1a1a',
            color: '#fff'
         })
         
         if (!result.isConfirmed) {
            return
         }
         
         Swal.fire({
            title: 'Excluindo...',
            text: 'Por favor, aguarde',
            allowOutsideClick: false,
            didOpen: () => {
               Swal.showLoading()
            }
         })
         
         await this.api.excluirSessao(sessaoId)
         
         Swal.fire({
            icon: 'success',
            title: 'Excluído!',
            text: 'Sessão excluída com sucesso.',
            timer: 2000,
            showConfirmButton: false
         }).then(() => {
            // Recarregar estatísticas
            const dataInicio = document.getElementById('filtro-data-inicio')?.value || 
               new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            const dataFim = document.getElementById('filtro-data-fim')?.value || 
               new Date().toISOString().split('T')[0]
            const materiaId = document.getElementById('filtro-materia')?.value || null
            const nomeAula = document.getElementById('filtro-aula')?.value?.trim() || null
            const status = document.getElementById('filtro-status')?.value || null
            
            this.paginaAtual = 1
            this.carregarEstatisticas(dataInicio, dataFim, materiaId, nomeAula, status)
         })
         
      } catch (error) {
         console.error('Erro ao excluir sessão:', error)
         Swal.fire({
            icon: 'error',
            title: 'Erro',
            text: 'Não foi possível excluir a sessão. Verifique o console para mais detalhes.'
         })
      }
   }
   
   /**
    * Continua uma sessão em andamento
    */
   async continuarSessao(sessaoId) {
      try {
         const result = await Swal.fire({
            title: 'Continuar Sessão?',
            html: 'Deseja continuar esta sessão em andamento?<br><br><small class="text-muted">Você será redirecionado para a página principal.</small>',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sim, continuar',
            cancelButtonText: 'Cancelar',
            background: '#1a1a1a',
            color: '#fff'
         })
         
         if (!result.isConfirmed) {
            return
         }
         
         Swal.fire({
            title: 'Carregando...',
            text: 'Preparando sessão',
            allowOutsideClick: false,
            didOpen: () => {
               Swal.showLoading()
            }
         })
         
         // Buscar estado da sessão
         const estado = await this.api.getEstadoSessao(sessaoId)
         
         // Calcular duração total da fase atual em minutos
         const duracaoMinutos = estado.type === 'acao' ? estado.acao : estado.pausa
         const duracaoTotalMs = duracaoMinutos * 60 * 1000 // duração total em milissegundos
         
         // Calcular tempo decorrido em milissegundos
         const tempoDecorridoMs = estado.tempoDecorrido * 1000
         
         // Calcular tempo restante em milissegundos
         const tempoRestanteMs = estado.tempoRestante * 1000
         
         // Calcular startTime: se o timer começou há X tempo atrás
         // startTime = agora - tempoDecorrido
         const agora = Date.now()
         const startTime = agora - tempoDecorridoMs
         
         // Salvar no localStorage para restaurar na página principal
         const estadoTimer = {
            type: estado.type,
            startTime: startTime,
            duration: duracaoTotalMs, // duração total da fase
            isPaused: true,
            pausedAt: agora, // Pausar agora (momento da restauração)
            pausedDuration: 0, // Não havia pausas anteriores (será ajustado quando retomar)
            sessionNumber: estado.sessionNumber,
            totalSessions: estado.totalSessions,
            tempoRestante: estado.tempoRestante, // Guardar para referência
            tempoDecorrido: estado.tempoDecorrido, // Guardar para referência
            timestamp: agora
         }
         
         const config = {
            materia: estado.materia,
            nome_aula: estado.nome_aula,
            acao: estado.acao,
            pausa: estado.pausa,
            sessoes: estado.sessoes,
            sessao_id: estado.sessao_id,
            materia_id: estado.materia_id
         }
         
         // Salvar no localStorage
         localStorage.setItem('timerState', JSON.stringify(estadoTimer))
         localStorage.setItem('pomodoro_materia', config.materia)
         localStorage.setItem('pomodoro_nome_aula', config.nome_aula)
         localStorage.setItem('pomodoro_acao', config.acao)
         localStorage.setItem('pomodoro_pausa', config.pausa)
         localStorage.setItem('pomodoro_sessoes', config.sessoes)
         localStorage.setItem('pomodoro_sessao_id', config.sessao_id)
         localStorage.setItem('pomodoro_materia_id', config.materia_id)
         localStorage.setItem('continuar_sessao', 'true')
         
         Swal.fire({
            icon: 'success',
            title: 'Redirecionando...',
            text: 'Você será redirecionado para continuar a sessão.',
            timer: 1500,
            showConfirmButton: false
         }).then(() => {
            window.location.href = './index.html'
         })
         
      } catch (error) {
         console.error('Erro ao continuar sessão:', error)
         Swal.fire({
            icon: 'error',
            title: 'Erro',
            text: 'Não foi possível continuar a sessão. Verifique o console para mais detalhes.'
         })
      }
   }
}

