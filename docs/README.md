# E-commerce Platform - GitHub Pages Deployment

Uma plataforma de e-commerce completa com autenticação baseada em funções, gestão de produtos e integração WhatsApp, otimizada para GitHub Pages.

## 🚀 Funcionalidades

- **Autenticação Multi-Perfil**: Admin, Loja e Restaurante
- **Gestão Completa de Produtos**: Categorias, cores e variações
- **Tabelas de Preços Diferenciadas**: 5 tabelas para lojas, 1 para restaurantes
- **Carrinho de Compras**: Com persistência local
- **Integração WhatsApp**: Para processamento de pedidos
- **Armazenamento GitHub**: Dados persistentes via GitHub API
- **Interface Responsiva**: Funciona em desktop e mobile

## 📋 Credenciais de Acesso

### Administrador
- **Usuário**: `admin`
- **Senha**: `admin123`
- **Funcionalidades**: Gestão completa do sistema

### Loja
- **Usuário**: `loja`
- **Senha**: `loja123`
- **Funcionalidades**: Catálogo com 5 tabelas de preços

### Restaurante
- **Usuário**: `restaurante`
- **Senha**: `restaurante123`
- **Funcionalidades**: Catálogo com preços especiais

## ⚙️ Configuração para GitHub Pages

### Passo 1: Configurar o Repositório

1. Faça fork ou clone este repositório
2. Vá em **Settings** > **Pages**
3. Selecione **Deploy from a branch**
4. Escolha **main** e **/docs**
5. Clique em **Save**

### Passo 2: Configurar GitHub Token

1. Vá em **Settings** > **Developer settings** > **Personal access tokens**
2. Clique em **Generate new token (classic)**
3. Selecione as permissões:
   - `repo` (acesso completo ao repositório)
   - `contents:write` (para modificar arquivos)
4. Copie o token gerado

### Passo 3: Atualizar Configuração

Edite o arquivo `docs/config.js`:

```javascript
window.GITHUB_CONFIG = {
  token: 'SEU_GITHUB_TOKEN_AQUI',
  owner: 'SEU_USERNAME_GITHUB',
  repo: 'NOME_DO_REPOSITORIO',
  branch: 'main'
};
```

### Passo 4: Estrutura de Dados

O sistema criará automaticamente os seguintes arquivos no seu repositório para armazenar dados:

- `data/categories.json` - Categorias de produtos
- `data/colors.json` - Cores disponíveis
- `data/products.json` - Produtos cadastrados
- `data/pricing-tables.json` - Tabelas de preços
- `data/promotions.json` - Promoções ativas
- `data/announcements.json` - Comunicados

## 🛠️ Funcionalidades do Admin

### Gestão de Produtos
- Criar, editar e excluir produtos
- Upload de múltiplas imagens
- Configurar cores disponíveis
- Definir preços base

### Gestão de Categorias
- Organizar produtos por categorias
- Descrições detalhadas

### Gestão de Cores
- Paleta de cores personalizável
- Códigos hexadecimais

### Tabelas de Preços
- **Lojas**: 5 tabelas com multiplicadores diferentes
  - À Vista (1.0x)
  - 30 dias (1.1x)
  - 30/60 (1.15x)
  - 30/60/90 (1.2x)
  - 30/60/90/120 (1.25x)
- **Restaurantes**: 1 tabela com desconto (0.9x)

### Promoções e Comunicados
- Banners promocionais
- Comunicados segmentados por tipo de usuário

## 📱 Integração WhatsApp

### Configuração Automática
O sistema gera automaticamente mensagens formatadas contendo:
- Dados do pedido
- Produtos selecionados
- Quantidades e preços
- Total do pedido

### Formato da Mensagem
```
🛒 *NOVO PEDIDO*

👤 *Cliente:* [Nome do usuário]
📧 *Tipo:* [Loja/Restaurante]

📦 *Produtos:*
• [Produto] - [Cor] - Qtd: [X] - R$ [Valor]

💰 *Total:* R$ [Valor Total]

📅 *Data:* [Data/Hora do pedido]
```

## 🔒 Segurança

### Considerações Importantes
- **Token GitHub**: Mantenha seu token seguro
- **Usuários Controlados**: Sistema projetado para base de usuários conhecida
- **Dados Públicos**: Informações armazenadas são visíveis no repositório
- **HTTPS**: Sempre use HTTPS para acesso seguro

### Recomendações
- Use um repositório privado se possível
- Rotacione tokens periodicamente
- Monitore acessos ao repositório
- Mantenha backups dos dados

## 🚦 Status do Sistema

### Funcionalidades Implementadas ✅
- ✅ Sistema de autenticação
- ✅ Gestão completa de produtos
- ✅ Carrinho de compras
- ✅ Integração WhatsApp
- ✅ Interface responsiva
- ✅ Armazenamento GitHub
- ✅ Deploy GitHub Pages

### Limitações Conhecidas ⚠️
- Autenticação baseada em credenciais estáticas
- Dados visíveis no repositório público
- Limite de rate do GitHub API (5000 requests/hora)

## 🆘 Solução de Problemas

### Erro de Autenticação GitHub
1. Verifique se o token está correto
2. Confirme as permissões do token
3. Verifique se o repositório existe

### Dados Não Aparecem
1. Aguarde alguns minutos após a primeira configuração
2. Verifique o console do navegador para erros
3. Confirme a configuração em `config.js`

### WhatsApp Não Abre
1. Verifique se está acessando via HTTPS
2. Teste em diferentes navegadores
3. Confirme se o WhatsApp Web está funcionando

## 📞 Suporte

Para problemas técnicos:
1. Verifique os logs no console do navegador
2. Confirme todas as configurações
3. Teste com dados mínimos primeiro

---

**Versão**: 1.0.0  
**Compatibilidade**: GitHub Pages, Navegadores modernos  
**Licença**: MIT