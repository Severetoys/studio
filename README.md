
# Documentação do Projeto Italo Santos

Bem-vindo à documentação do projeto Italo Santos. Este documento visa fornecer um guia completo para entender, configurar e contribuir para este projeto. O projeto Italo Santos é uma aplicação web multifacetada com foco em conteúdo adulto, que inclui um site de apresentação, uma loja virtual, um sistema de assinaturas e um painel de administração robusto.

## Tecnologias Utilizadas

O projeto é construído com um conjunto de tecnologias modernas e escaláveis:

- **Framework:** Next.js (com App Router)
- **Linguagem:** TypeScript
- **Backend e Banco de Dados:** Firebase (Firestore, Realtime Database, Storage, Authentication)
- **Estilização:** Tailwind CSS com componentes ShadCN/UI
- **Inteligência Artificial:** Google Genkit para funcionalidades de IA (tradução, verificação facial, etc.)
- **Pagamentos:** Integração com Mercado Pago (PIX) e PayPal.
- **APIs de Terceiros:** Facebook Graph API, Instagram Graph API, Twitter API.

## Estrutura de Diretórios

- `src/app/`: Contém todas as rotas e páginas do site, seguindo o padrão do Next.js App Router.
  - `(public)/`: Páginas públicas como a home, loja, fotos, etc.
  - `admin/`: Contém todo o painel de administração.
  - `api/`: Rotas de API do Next.js para tarefas de backend.
- `src/components/`: Componentes React reutilizáveis.
  - `layout/`: Componentes principais do layout (header, footer, sidebar).
  - `ui/`: Componentes de UI da biblioteca ShadCN.
  - `admin/`: Componentes específicos para o painel de administração.
- `src/ai/flows/`: Contém os fluxos do Genkit que orquestram as funcionalidades de IA.
- `src/services/`: Módulos que interagem com serviços externos, como o banco de dados.
- `src/lib/`: Utilitários e configuração de bibliotecas (Firebase, etc.).
- `public/`: Arquivos estáticos.
- `*.rules`: Arquivos de configuração das regras de segurança do Firebase.

## Funcionalidades Principais

### 1. Autenticação

- **Face ID para Clientes:** Usuários podem se cadastrar e autenticar usando reconhecimento facial. O sistema compara a imagem de login com uma base de dados de usuários cadastrados.
- **Acesso de Administrador:** O administrador (`pix@italosantos.com`) tem acesso a um painel de controle exclusivo (`/admin`) através de login com email e senha.
- **Acesso de Visitante do Assinante:** O administrador pode visualizar a área do assinante usando suas credenciais de admin na página de autenticação facial.

### 2. Painel de Administração (`/admin`)

Um painel completo para gerenciar todo o conteúdo e operações do site.

- **Dashboard:** Visão geral com estatísticas de assinantes, conversas, produtos, avaliações pendentes e as páginas mais acessadas do site.
- **Conversas:** Uma caixa de entrada centralizada para visualizar e responder a todas as conversas do "Chat Secreto" com os visitantes.
- **Assinantes:** Lista de todos os usuários cadastrados com Face ID, com opção de remoção.
- **Gerenciamento de Conteúdo:**
  - **Produtos:** Adicionar, editar e remover produtos da loja (conteúdo não relacionado a vídeos).
  - **Fotos:** Gerenciar a galeria de fotos que aparece na página pública.
  - **Vídeos:** Gerenciar os vídeos vendidos avulsamente na loja.
  - **Uploads:** Uma central para enviar mídias (imagens, vídeos) para o Firebase Storage e obter os links para usar nas outras seções.
- **Integrações:** Ligar e desligar a exibição dos feeds do Facebook, Instagram e Twitter no site, além de controlar a ativação dos métodos de pagamento.
- **Avaliações:** Moderar (aprovar ou rejeitar) os comentários deixados pelos usuários.
- **Configurações:** Um local central para atualizar informações de perfil (nome, contato), foto de perfil, imagem de capa e as 7 galerias de fotos que aparecem no rodapé da página inicial.

### 3. Regras de Segurança

A aplicação segue o princípio de "negar por padrão", garantindo segurança máxima:

- **Firestore (`firestore.rules`):**
  - **Leitura:** A leitura de dados públicos (produtos, fotos, vídeos, reviews aprovadas) é permitida para todos.
  - **Escrita:** Nenhuma escrita é permitida diretamente pelo cliente. Todas as modificações de dados são feitas de forma segura através do painel de administração, que utiliza credenciais de administrador no servidor (Admin SDK).
- **Realtime Database (`database.rules.json`):**
  - **Padrão:** Todo o banco de dados é bloqueado para leitura e escrita por padrão.
  - **Exceções:** Apenas os dados de `facialAuth/users` (para verificação de login) e as conversas do chat (acessíveis apenas pelos participantes da conversa) têm permissões específicas.
- **Storage (`storage.rules`):**
  - **Leitura:** A leitura de arquivos é pública para que as imagens e vídeos do site possam ser exibidos.
  - **Escrita:** O upload de novos arquivos é permitido apenas para usuários autenticados, o que na prática restringe essa ação ao painel de administração.

### 4. Pagamentos

- **PIX (via Mercado Pago):** Um modal customizado permite que clientes no Brasil gerem um QR Code PIX para pagamento.
- **PayPal:** Um botão de pagamento direciona para o checkout do PayPal para pagamentos internacionais.

## Variáveis de Ambiente (`.env.local`)

Para que o projeto funcione localmente, crie um arquivo `.env.local` na raiz e adicione as seguintes variáveis:

```
# Firebase (Cliente)
NEXT_PUBLIC_FIREBASE_API_KEY="AIza..."
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY="TEST-..."

# Firebase (Servidor - Admin SDK)
# Geralmente gerenciado pelo ambiente de hospedagem (ex: App Hosting)
# GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/serviceAccountKey.json"

# APIs de Terceiros
FACEBOOK_PAGE_ACCESS_TOKEN="EAA..."
INSTAGRAM_FEED_ACCESS_TOKEN="IGQVJ..."
INSTAGRAM_SHOP_ACCESS_TOKEN="IGQVJ..."
TWITTER_BEARER_TOKEN="AAAAA..."
MERCADOPAGO_ACCESS_TOKEN="APP_USR-..."
PAYPAL_CLIENT_ID="AZ..."
PAYPAL_CLIENT_SECRET="E..."

# Segurança dos Webhooks
GOOGLE_SHEETS_WEBHOOK_SECRET="seu_token_secreto_aqui"

# Cloudflare (Chat Externo - Se aplicável)
CLOUDFLARE_ORG_ID="..."
```
