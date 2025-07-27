# Status e Funcionalidades do Projeto - Italo Santos

Este documento fornece uma visão geral de todas as funcionalidades implementadas no site, seu propósito e o status atual de desenvolvimento.

## Status das Funcionalidades

- **Em Produção:** A funcionalidade está estável, completa e pronta para ser usada por usuários finais.
- **Em Modo de Teste:** A funcionalidade está implementada, mas utiliza credenciais de teste (sandbox) ou depende de APIs externas que requerem monitoramento contínuo. Não realiza operações reais (ex: cobranças financeiras).
- **Em Desenvolvimento / Simulado:** A funcionalidade é um placeholder (simulação), está incompleta ou em processo de construção.

---

## I. Seção Pública (Visível para todos os visitantes)

### 1. Página Inicial (`/`)
- **Autenticação Facial (Face ID):**
  - **Função:** Permite que usuários se cadastrem e façam login usando o reconhecimento facial.
  - **Status:** `Em Modo de Teste`. O fluxo está implementado, mas requer testes extensivos para garantir a precisão e segurança em diferentes condições de iluminação e com múltiplos usuários.
- **Botões de Pagamento Rápido:**
  - **Função:** Oferecem um atalho para o processo de assinatura.
  - **Status (Google/Apple Pay):** `Em Desenvolvimento / Simulado`. Atualmente, apenas simulam um pagamento bem-sucedido e redirecionam o usuário.
  - **Status (Pix via Mercado Pago):** `Em Modo de Teste`. Integra-se com a API do Mercado Pago para gerar um QR Code real, mas utiliza credenciais de teste.
- **Exibição de Preço Dinâmico:**
  - **Função:** Converte o preço da assinatura para a moeda local do visitante usando IA.
  - **Status:** `Em Modo de Teste`. A funcionalidade está ativa, mas a precisão da taxa de câmbio depende da resposta da IA.
- **Seção "Sobre" e "Features":**
  - **Função:** Exibe informações estáticas sobre o perfil e serviços.
  - **Status:** `Em Produção`.

### 2. Galerias de Mídia (`/fotos` e `/videos/venda-avulsa`)
- **Feed do X (Twitter):**
  - **Função:** Busca e exibe as últimas fotos e vídeos postados no perfil `@Severepics`.
  - **Status:** `Em Modo de Teste`. Depende da validade contínua do token de API do Twitter e das políticas da plataforma.
- **Feed do Instagram (@severepics):**
  - **Função:** Busca e exibe as últimas fotos do perfil de fotos.
  - **Status:** `Em Modo de Teste`. Depende da validade contínua do token de API do Instagram.
- **Feed de Uploads (Fotos da Galeria):**
  - **Função:** Exibe as fotos que foram enviadas pelo painel de administração.
  - **Status:** `Em Produção`.

### 3. Loja (`/loja`)
- **Listagem de Produtos Internos:**
  - **Função:** Exibe vídeos e outros produtos cadastrados no painel de administração.
  - **Status:** `Em Produção`.
- **Feed de Produtos do Facebook/Instagram (@severetoys):**
  - **Função:** Exibe produtos do catálogo do Facebook e da galeria do Instagram da loja.
  - **Status:** `Em Modo de Teste`. Depende da validade dos tokens de API.
- **Carrinho de Compras e Checkout:**
  - **Função:** Permite adicionar produtos ao carrinho e finalizar a compra.
  - **Status:** `Em Modo de Teste`. O fluxo de pagamento usa as credenciais de teste do Mercado Pago.

### 4. Chat Secreto (Widget)
- **Função:** Permite que visitantes anônimos conversem em tempo real com o administrador. Mantém o histórico entre as sessões.
- **Status (Mensagens de Texto e Imagem):** `Em Produção`.
- **Status (Tradução Automática):** `Em Modo de Teste`. A tradução é funcional, mas depende da resposta da IA.
- **Status (Chamada de Vídeo via Dyte):** `Em Desenvolvimento`. A integração está configurada, mas usa um token de teste fixo. A geração dinâmica de tokens por usuário precisa ser implementada.
- **Status (Envio de Áudio/Outros Arquivos):** `Em Desenvolvimento`. A funcionalidade ainda não foi implementada.

### 5. Outras Páginas Públicas
- **`/aluga-se`, `/canais`, `/termos-condicoes`, `/politica-de-privacidade`:**
  - **Função:** Exibem conteúdo estático ou listas de links.
  - **Status:** `Em Produção`.

---

## II. Seção de Administração (`/admin`)

### 1. Segurança do Painel
- **Login e Senha:**
  - **Função:** Protege o acesso a todas as páginas do painel de administração.
  - **Status:** `Em Produção`.

### 2. Gerenciamento de Conteúdo
- **Dashboard, Produtos, Fotos, Vídeos:**
  - **Função:** Permitem criar, visualizar, editar e excluir conteúdos do site.
  - **Status:** `Em Produção`.
- **Uploads (Gerenciador de Mídias):**
  - **Função:** Hub central para enviar arquivos (do dispositivo ou via link) e obter suas URLs para uso no site.
  - **Status (Upload de Arquivo):** `Em Produção`. A barra de progresso está funcional.
  - **Status (Importar via Link):** `Em Desenvolvimento`. A interface existe, mas a lógica de backend para baixar o arquivo do link e subir para o Storage ainda precisa ser implementada.
- **Assinantes:**
  - **Função:** Lista os assinantes da plataforma.
  - **Status:** `Em Desenvolvimento / Simulado`. Atualmente, exibe uma lista de dados de exemplo (mock).

### 3. Comunicação
- **Caixa de Entrada e Conversas (`/admin/conversations`):**
  - **Função:** Permite visualizar todas as conversas ativas do Chat Secreto e responder aos clientes.
  - **Status:** `Em Produção`.

### 4. Configurações e Integrações
- **Integrações de Plataformas:**
  - **Função:** Permite conectar/desconectar contas de redes sociais e serviços.
  - **Status:** `Em Desenvolvimento / Simulado`. Os botões salvam o estado "conectado/desconectado" apenas localmente no navegador do administrador. A lógica real de troca de tokens com o backend ainda não está implementada.
- **Configurações do Perfil:**
  - **Função:** Permite editar os dados públicos do site (nome, telefone, fotos de perfil/capa, etc.).
  - **Status:** `Em Produção`. Os campos estão funcionais e salvam as alterações, mas a integração com o mapa e o botão de WhatsApp ainda precisa ser vinculada dinamicamente a esses dados.
