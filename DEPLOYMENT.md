# Guia de Deploy para GitHub Pages

Este guia te ajudará a configurar a plataforma e-commerce no GitHub Pages com armazenamento de dados via GitHub API.

## 📋 Pré-requisitos

1. Conta no GitHub
2. Token de acesso pessoal do GitHub
3. Repositório para hospedar o projeto

## 🚀 Passos para Deploy

### 1. Preparar o Repositório

```bash
# Clone ou faça fork do repositório
git clone [URL_DO_REPOSITORIO]
cd [NOME_DO_REPOSITORIO]

# Os arquivos já estão prontos na pasta /docs
```

### 2. Configurar GitHub Pages

1. Vá para **Settings** do repositório
2. Navegue até **Pages** no menu lateral
3. Em **Source**, selecione **Deploy from a branch**
4. Escolha **main** como branch
5. Selecione **/docs** como pasta
6. Clique em **Save**

### 3. Gerar Token GitHub

1. Acesse **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. Clique em **Generate new token (classic)**
3. Configure as permissões:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `public_repo` (Access public repositories)
   - ✅ `contents:write` (Write access to repository contents)
4. Defina expiração (recomendado: 90 dias)
5. Gere e copie o token

### 4. Configurar Token no Projeto

Edite o arquivo `docs/config.js`:

```javascript
window.GITHUB_CONFIG = {
  token: 'ghp_SEU_TOKEN_AQUI',
  owner: 'seu-username-github',
  repo: 'nome-do-repositorio',
  branch: 'main'
};
```

**Importante**: O token estará visível no código. Use apenas repositórios privados ou tokens com escopo limitado.

## 🔧 Configuração Avançada

### Estrutura de Dados

O sistema criará automaticamente estas pastas/arquivos:

```
data/
├── categories.json      # Categorias de produtos
├── colors.json         # Cores disponíveis
├── products.json       # Catálogo de produtos
├── pricing-tables.json # Tabelas de preços
├── promotions.json     # Promoções ativas
└── announcements.json  # Comunicados
```

### Credenciais Padrão

- **Admin**: admin / admin123
- **Loja**: loja / loja123  
- **Restaurante**: restaurante / restaurante123

## 🛡️ Considerações de Segurança

### Para Produção Segura

1. **Use repositório privado**
2. **Configure variáveis de ambiente** (se possível)
3. **Rotacione tokens regularmente**
4. **Monitore acessos ao repositório**

### Limitações do GitHub Pages

- Dados são públicos no repositório
- Rate limit da API GitHub (5000 requests/hora)
- Autenticação baseada em credenciais estáticas
- Não adequado para dados sensíveis

## 📱 Funcionalidades Disponíveis

### Área Administrativa (admin/admin123)
- Gestão completa de produtos, categorias e cores
- Configuração de tabelas de preços
- Gerenciamento de promoções e comunicados
- Upload de imagens via URL

### Área da Loja (loja/loja123)
- Catálogo com 5 tabelas de preços:
  - À Vista (100%)
  - 30 dias (110%)
  - 30/60 dias (115%)
  - 30/60/90 dias (120%)
  - 30/60/90/120 dias (125%)

### Área do Restaurante (restaurante/restaurante123)
- Catálogo com preço especial (90% do valor base)

### Funcionalidades Gerais
- Carrinho de compras persistente
- Integração WhatsApp para pedidos
- Interface responsiva
- Filtros por categoria

## 🔍 Solução de Problemas

### Erro 404 na API GitHub
- Verifique se o token tem as permissões corretas
- Confirme se owner/repo estão corretos no config.js

### Dados não carregam
- Aguarde alguns minutos após o primeiro acesso
- Verifique o console do navegador para erros
- Teste a conectividade com a API GitHub

### WhatsApp não abre
- Confirme que está acessando via HTTPS
- Teste em diferentes navegadores/dispositivos

## 📊 Monitoramento

### Logs Úteis
- Console do navegador (F12)
- Network tab para requisições à API
- GitHub API rate limit headers

### Métricas GitHub
- Tráfego do repositório
- Uso da API
- Commits de dados

## 🔄 Manutenção

### Backup Regular
```bash
# Clone o repositório para backup local
git clone [URL_DO_REPOSITORIO] backup-data
```

### Atualizações
- Monitore o limite de rate da API
- Atualize tokens antes da expiração
- Faça backup antes de grandes mudanças

---

**Suporte**: Para problemas técnicos, verifique os logs do navegador e confirme as configurações do GitHub.