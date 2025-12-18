# 🔧 Solução para Erro de CORS

## Problema
Módulos ES6 (`type="module"`) não funcionam quando o arquivo é aberto diretamente via `file://` devido a políticas de segurança do navegador (CORS).

## ✅ Solução: Acessar via Servidor HTTP

### Opção 1: Usar Laragon (Recomendado)

1. **Certifique-se de que o Laragon está rodando**
   - Abra o Laragon
   - Clique em "Start All"

2. **Acesse via navegador:**
   ```
   http://localhost/Projeto-Timer-Pomodoro-main/
   ```
   ou
   ```
   http://127.0.0.1/Projeto-Timer-Pomodoro-main/
   ```

### Opção 2: Servidor Python (Rápido)

1. Abra o terminal na pasta do projeto
2. Execute:
   ```bash
   python -m http.server 8000
   ```
3. Acesse:
   ```
   http://localhost:8000
   ```

### Opção 3: Servidor PHP (Rápido)

1. Abra o terminal na pasta do projeto
2. Execute:
   ```bash
   php -S localhost:8000
   ```
3. Acesse:
   ```
   http://localhost:8000
   ```

### Opção 4: Servidor Node.js (Rápido)

1. Abra o terminal na pasta do projeto
2. Execute:
   ```bash
   npx http-server
   ```
3. Acesse a URL mostrada no terminal (geralmente `http://localhost:8080`)

## ⚠️ Importante

**NÃO abra o arquivo diretamente** (duplo clique no `index.html` ou `file:///C:/...`)

**SEMPRE acesse via servidor HTTP** (`http://localhost/...`)

## 🔍 Como Verificar

Se estiver funcionando corretamente:
- A URL no navegador deve começar com `http://` ou `https://`
- NÃO deve começar com `file://`
- O console do navegador não deve mostrar erros de CORS


