# Estrutura do Projeto Italo Santos

A estrutura de diretórios do projeto Italo Santos segue uma organização padrão de projetos Next.js, com adição de pastas para Firebase Functions, Data Connect e documentação.

```
. 
├── .idx/                 # Arquivos de configuração de ambiente (.nix, icon, integrations)
├── .vscode/              # Configurações do VS Code
├── dataconnect/          # Configurações e schema do Data Connect
│   ├── connector/
│   └── schema/
├── docs/                 # Documentação do projeto
│   ├── blueprint.md
│   ├── contributing.md
│   ├── getting-started.md
│   ├── project-overview.md
│   └── project-structure.md
├── functions/            # Código das Firebase Functions
│   ├── src/
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.dev.json
│   └── tsconfig.json
├── public/               # Arquivos estáticos (imagens, service worker)
├── src/                  # Código fonte da aplicação Next.js
│   ├── ai/               # Lógica relacionada a IA (Genkit, flows)
│   │   └── flows/
│   ├── app/              # Páginas e layouts da aplicação (Next.js App Router)
│   │   ├── admin/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── canais/
│   │   ├── chat-secreto/
│   │   ├── dashboard/
│   │   ├── fotos/
│   │   ├── loja/
│   │   ├── old-auth-page/
│   │   ├── politica-de-privacidade/
│   │   ├── termos-condicoes/
│   │   └── videos/
│   ├── components/       # Componentes reutilizáveis (incluindo componentes de UI com shadcn/ui)
│   │   ├── admin/
│   │   ├── layout/
│   │   └── ui/
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilitários e configurações (Firebase, fetishes, utils)
│   ├── services/         # Serviços externos (Google Sheets, Vision)
│   └── styles/           # Arquivos de estilo globais
├── .gitignore
├── README.md
├── apphosting.yaml       # Configuração de hosting (Firebase App Hosting?)
├── components.json       # Configuração para shadcn/ui
├── firestore.indexes.json # Índices do Firestore
├── firestore.rules       # Regras de segurança do Firestore
├── next.config.ts        # Configuração do Next.js
├── package.json          # Dependências e scripts do projeto
├── package-lock.json     # Lock file de dependências
├── postcss.config.mjs    # Configuração do PostCSS
├── remoteconfig.template.json # Template para Firebase Remote Config
├── serviceAccountKey.json # Chave da conta de serviço Firebase (ATENÇÃO: Não incluir em repositórios públicos!)
├── storage.rules         # Regras de segurança do Cloud Storage
├── studio.code-workspace # Configuração do VS Code Workspace
├── tailwind.config.ts    # Configuração do Tailwind CSS
└── tsconfig.json         # Configuração do TypeScript
```

