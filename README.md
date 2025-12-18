## 🕒 Timer Pomodoro – Versão Atual do Sistema  

Aplicação web completa para gerenciar sessões de estudo/trabalho usando o **método Pomodoro**, com **integração em PHP/MySQL**, histórico detalhado e estatísticas diárias.

## 🚀 Funcionalidades Implementadas  

- **Configuração de sessão Pomodoro**
  - Campos: **Matéria**, **Nome da Aula**, **Ação (min)**, **Pausa (min)**, **Sessões**
  - Validação de intervalos (min/máx) e mensagens de erro na interface
- **Timer avançado**
  - Contagem precisa usando `Date` (sem atrasos de `setInterval` simples)
  - **Pause/Play reais do timer** (não só da música)
  - Persistência de estado no `localStorage` (continua de onde parou após recarregar)
  - Botão **Cancelar** para resetar a sessão em andamento
- **Experiência de uso**
  - Música de fundo *lo-fi* com botão para pausar/retomar
  - Sons diferentes para fim de ação, pausa e fim de todas as sessões
  - Barra de progresso visual para a sessão atual
  - Atalhos de teclado (ex.: espaço para pausar/retomar, R para reset)
- **Integração com backend (PHP + MySQL)**
  - Salvamento de cada sessão no banco (`materias`, `sessoes`, `historico_detalhado`)
  - API REST em `api/` para:
    - Criar sessão (`salvar_sessao.php`)
    - Atualizar sessão e tempos focados/pausa
    - Salvar histórico detalhado de cada ação/pausa
    - Consultar estado da sessão para continuar depois
    - Consultar estatísticas e histórico
- **Estatísticas e histórico (página `estatisticas.html`)**
  - Listagem de sessões com matéria, aula, datas, status
  - Totais de tempo focado e de pausa por matéria/dia
  - Filtros por período e por matéria

## 🧱 Tecnologias Utilizadas  

- **Frontend**
  - HTML5
  - CSS3 + **Bootstrap 5** + Font Awesome 6
  - JavaScript **ES6 modules** (`src/js/main.js` + `modules/` + `utils/`)
- **Backend**
  - **PHP 8+**
  - **MySQL** (estrutura em `database/schema.sql`)
  - Endpoints REST em `api/*.php`

## 🛠 Como Rodar o Projeto Localmente  

- **Pré-requisitos**
  - Servidor PHP (ex.: **Laragon**, XAMPP, WampServer)
  - MySQL em execução

- **Passos**
  1. Clone ou copie o projeto para a pasta do seu servidor (ex.: `C:\laragon\www\Projeto-Timer-Pomodoro-main`).
  2. Importe o arquivo `database/schema.sql` no MySQL.
  3. Configure as credenciais do banco em `api/config.php`.
  4. Acesse no navegador via HTTP (nunca com `file://`):  
     - `http://localhost/Projeto-Timer-Pomodoro-main/` – **Timer Pomodoro**  
     - `http://localhost/Projeto-Timer-Pomodoro-main/estatisticas.html` – **Estatísticas e histórico**

## 📄 Documentação Interna  

- `docs/relatorio-analise.md` – análise do código legado
- `docs/plano-acao.md` – plano de evolução em fases
- `docs/VERIFICACAO-FRONTEND.md` – checklist para verificar se o frontend está funcionando
## Contatos do Autor:
- Nome: Luciano Ferreira Silva
- E-mail: lucianoferreira4628@gmail.com

Sinta-se à vontade para explorar, estudar o código e adaptar o projeto às suas necessidades. 😊  

<img width="1881" height="890" alt="image" src="https://github.com/user-attachments/assets/bff5d6d2-c6ff-468a-806e-97f7d55cb176" />

<img width="1885" height="921" alt="image" src="https://github.com/user-attachments/assets/7365ae75-2311-48cc-8438-d509a8c67dba" />


