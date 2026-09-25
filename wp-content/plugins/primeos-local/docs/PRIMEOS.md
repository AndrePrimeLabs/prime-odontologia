# PrimeOS Hub

Aplicativo de gestão Prime Os Hub para operação clínica, CRM, marketing, vendas, finanças, IA e crescimento do ecossistema PrimeOSHub.

- Produção: [primeos.primeodontologia.com.br](https://primeos.primeodontologia.com.br)
- Repositório: [PrimeLabs/primeos](https://github.com/AndrePrimeLabs/primeos-local)
- Stack: React, Vite, Supabase, Docker e deploy estático para Hostinger

## Documentação

A documentação funcional e técnica do produto está em:

- [docs/PRIMEOS.md]

## Como rodar localmente

```bash
npm install
npm run dev
```

Crie um `.env.local` com as variáveis necessárias antes de iniciar o app.
Use `.env.example` como referência.

## Scripts principais

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run deploy
npm run docker:build
npm run docker:run
npm run docker:compose
npm run firebase:deploy
```

## Deploy

### Hostinger FTP

O projeto é publicado em `primeos.primeodontologia.com.br`.
O deploy de arquivos estáticos para Hostinger acontece por FTP, via `scripts/deploy.mjs`.
Use `npm run deploy` ou `npm run deploy:hostinger`.

1. Crie um `.env` com `FTP_PASSWORD` e confirme `FTP_USER`, `FTP_HOST`, `FTP_PORT` e `FTP_REMOTE_ROOT` se necessário.
2. Rode `npm run deploy`.

### Docker

O projeto pode ser empacotado como imagem Docker usando `Dockerfile`.

- `npm run docker:build`
- `npm run docker:run`
- `npm run docker:compose`

Isto constrói o app e serve os arquivos estáticos com Nginx na porta `80`.

### Firebase

O deploy para Firebase Hosting usa a pasta `dist` como output.

1. Configure o Firebase CLI e conecte seu projeto.
2. Atualize `.firebaserc` com seu `FIREBASE_PROJECT_ID`.
3. Rode `npm run firebase:deploy`.

Endpoints server-side relacionados à Hostinger ficam em `api/hostinger/*` e exigem o header `x-primeos-key`.
