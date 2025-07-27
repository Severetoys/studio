
# Primeiros Passos para Configurar o Projeto Italo Santos

Siga estes passos para configurar e executar o projeto Italo Santos em seu ambiente de desenvolvimento local.

## Pré-requisitos

- Node.js (versão 18 ou superior recomendada)
- npm ou yarn
- Conta Firebase e um projeto configurado
- Chaves de API para integrações (Mercado Pago, PayPal, Google Sheets, etc.)

## Configuração do Ambiente

1. Clone o repositório:

   ```bash
   git clone [URL do Repositório]
   cd [Nome da Pasta do Projeto]
   ```

2. Instale as dependências:

   ```bash
   npm install
   # ou yarn install
   ```

3. Configure as variáveis de ambiente:

   Crie um arquivo `.env.local` ou `.env` na raiz do projeto e adicione as seguintes variáveis (substitua pelos seus valores):

   ```env
   # Firebase
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
   # ... (outras variáveis do Firebase se necessário)

   # Chaves de API de Serviços
   MERCADOPAGO_ACCESS_TOKEN=...
   PAYPAL_CLIENT_ID=...
   PAYPAL_CLIENT_SECRET=...
   
   # Tokens para Feeds de Mídia Social
   TWITTER_BEARER_TOKEN=...
   INSTAGRAM_FEED_ACCESS_TOKEN=...
   INSTAGRAM_SHOP_ACCESS_TOKEN=...
   FACEBOOK_PAGE_ACCESS_TOKEN=...
   ```

   *Nota: As chaves privadas do Firebase Admin SDK estão no arquivo `serviceAccountKey.json` e devem ser manuseadas com segurança, não expostas publicamente.*

4. Configure o Firebase CLI:

   Certifique-se de ter o Firebase CLI instalado (`npm install -g firebase-tools`). Faça login e associe o projeto local ao seu projeto Firebase:

   ```bash
   firebase login
   firebase use --add
   ```

## Executando o Projeto

Para iniciar o servidor de desenvolvimento:

```bash
npm run dev
# ou yarn dev
```

O aplicativo estará disponível em `http://localhost:3000` (ou a porta que você configurar).
