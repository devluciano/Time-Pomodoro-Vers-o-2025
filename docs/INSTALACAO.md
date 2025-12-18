# Instalação e Configuração - Timer Pomodoro com MySQL

## Pré-requisitos

- PHP 8.1 ou superior
- MySQL 5.7 ou superior (ou MariaDB 10.3+)
- Servidor web (Apache/Nginx) ou Laragon/XAMPP/WAMP
- Navegador moderno com suporte a ES6 modules

## Passo 1: Configurar Banco de Dados

1. Acesse o phpMyAdmin: `http://localhost:8080/phpmyadmin/`
2. Execute o script SQL em `database/schema.sql`:
   - Abra o arquivo `database/schema.sql`
   - Copie todo o conteúdo
   - Cole no phpMyAdmin na aba "SQL"
   - Execute o script

   Ou via linha de comando:
   ```bash
   mysql -u root -p < database/schema.sql
   ```

3. Verifique se o banco `time_pomodoro` foi criado com as tabelas:
   - `materias`
   - `sessoes`
   - `historico_detalhado`
   - `estatisticas_diarias`

## Passo 2: Configurar API PHP

1. Verifique as configurações em `api/config.php`:
   ```php
   define('DB_HOST', 'localhost:3306');
   define('DB_USER', 'root');
   define('DB_PASS', '');
   define('DB_NAME', 'time_pomodoro');
   ```

2. Se necessário, ajuste as credenciais do banco de dados.

## Passo 3: Configurar Servidor Web

### Opção A: Laragon (Recomendado)
1. Coloque o projeto em `C:\laragon\www\Projeto-Timer-Pomodoro-main\`
2. Acesse: `http://projeto-timer-pomodoro-main.test/` ou `http://localhost/Projeto-Timer-Pomodoro-main/`

### Opção B: Servidor PHP Built-in
```bash
cd C:\laragon\www\Projeto-Timer-Pomodoro-main
php -S localhost:8000
```
Acesse: `http://localhost:8000/`

### Opção C: XAMPP/WAMP
1. Coloque o projeto em `htdocs` ou `www`
2. Acesse via `http://localhost/Projeto-Timer-Pomodoro-main/`

## Passo 4: Testar a Aplicação

1. Abra o navegador e acesse a URL do projeto
2. Preencha:
   - **Matéria**: Ex: "Matemática", "Programação"
   - **Nome da Aula**: Ex: "Aula 1", "Capítulo 3"
   - **Ação**: Tempo em minutos (padrão: 25)
   - **Pausa**: Tempo em minutos (padrão: 5)
   - **Sessões**: Número de sessões (padrão: 4)

3. Clique em "Iniciar"
4. Verifique no banco de dados se a sessão foi salva:
   ```sql
   SELECT * FROM sessoes ORDER BY id DESC LIMIT 1;
   SELECT * FROM materias ORDER BY id DESC LIMIT 1;
   ```

## Estrutura do Banco de Dados

### Tabela: `materias`
Armazena as matérias/disciplinas estudadas.

### Tabela: `sessoes`
Armazena cada sessão Pomodoro iniciada.

### Tabela: `historico_detalhado`
Armazena cada fase (ação/pausa) de cada sessão.

### Tabela: `estatisticas_diarias`
Armazena estatísticas agregadas por dia e matéria.

## API Endpoints

- `POST /api/salvar_sessao.php` - Cria nova sessão
- `PUT /api/atualizar_sessao.php` - Atualiza sessão existente
- `POST /api/salvar_historico.php` - Salva histórico detalhado
- `GET /api/estatisticas.php?tipo=hoje` - Busca estatísticas de hoje
- `GET /api/estatisticas.php?tipo=materias` - Lista todas as matérias
- `GET /api/estatisticas.php?tipo=historico&dias=7` - Histórico de sessões

## Solução de Problemas

### Erro: "Não foi possível salvar no banco de dados"
- Verifique se o MySQL está rodando
- Verifique as credenciais em `api/config.php`
- Verifique se o banco `time_pomodoro` existe
- Verifique permissões do usuário MySQL

### Erro CORS ao abrir arquivo diretamente
- **NUNCA** abra `index.html` diretamente no navegador (file://)
- Sempre use um servidor HTTP (Laragon, XAMPP, ou `php -S`)

### Botão "Iniciar" não funciona
- Abra o Console do navegador (F12) e verifique erros
- Verifique se todos os arquivos JavaScript estão carregando
- Verifique se está acessando via HTTP (não file://)

## Próximos Passos

Após a instalação, você pode:
- Visualizar estatísticas por matéria
- Acompanhar progresso diário
- Ver histórico de sessões
- Analisar tempo focado por disciplina



