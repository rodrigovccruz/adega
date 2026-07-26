# Adega

Controle pessoal de vinhos com autenticação e sugestões gastronômicas.

## Desenvolvimento (SDD)

O produto foi construído via **Spec-Driven Development**.

Plano completo: [`docs/sdd/README.md`](./docs/sdd/README.md)

### Resumo do MVP

- Cadastro e login (usuário/senha)
- Inventário de vinhos
- Sugestões gastronômicas por vinho
- Busca por rótulo ou por prato

### Status

MVP implementado (Fases 0–4 do plano SDD): autenticação, inventário de vinhos e
sugestões gastronômicas com testes automatizados.

v1.1: foto do rótulo com OCR implementada
([spec 04](./docs/sdd/specs/04-foto-rotulo-ocr.md); reconhecimento de texto
ainda não validado em produção — só o fallback sem rede foi testado). Em
planejamento: busca numa base externa de vinhos (GrapeMinds) para completar
campos e mostrar descrição/notas de degustação/harmonização/perfil de sabor
de referência — sem preço nem avaliações, que a API não oferece
([spec 05](./docs/sdd/specs/05-integracao-dados-externos.md)). Endpoint e
payload já confirmados, pronta para implementar.

### Variáveis de ambiente (v1.1)

| Variável | Obrigatória? | Descrição |
|----------|--------------|-----------|
| `BLOB_READ_WRITE_TOKEN` | não | Storage da foto do rótulo (Vercel Blob). Sem ela, em dev a foto é salva em `public/uploads/labels` |
| `GRAPEMINDS_API_KEY` | não (busca externa fica indisponível sem ela, com mensagem amigável) | Base de vinhos GrapeMinds (spec 05) |

## Stack

Next.js (App Router) + TypeScript, Prisma + PostgreSQL, Tailwind CSS, Zod, Vitest.

## Rodando localmente

### Pré-requisitos

- Node.js 20+
- PostgreSQL 16 (local, Docker ou serviço gerenciado)

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie `.env.example` para `.env` e ajuste os valores:

```bash
cp .env.example .env
```

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | String de conexão PostgreSQL |
| `AUTH_SECRET` | Segredo usado para assinar a sessão (string longa e aleatória) |

### 3. Subir o PostgreSQL local

Com Docker:

```bash
docker compose up -d
```

Isso sobe um Postgres em `localhost:5432` com usuário/senha/banco `adega`/`adega`/`adega`,
compatível com o `DATABASE_URL` padrão do `.env.example`.

### 4. Aplicar as migrações

```bash
npx prisma migrate dev
```

### 5. Rodar em desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Testes

Os testes de integração usam um banco de dados de teste separado (`adega_test`),
criado e migrado automaticamente antes da suíte rodar (é necessário que o usuário
do Postgres tenha permissão `CREATEDB`).

```bash
npm test
```

## Scripts

| Script | Função |
|--------|--------|
| `npm run dev` | Sobe o servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm start` | Sobe o build de produção |
| `npm run lint` | ESLint |
| `npm test` | Testes automatizados (Vitest) |
| `npm run db:migrate` | Aplica/edita migrações do Prisma em desenvolvimento |

## Health check

`GET /api/health` — usado para verificação de deploy (checa conexão com o banco).

## CI/CD

O workflow em `.github/workflows/ci.yml` roda lint, type-check, migração,
testes e build a cada push/PR contra `main`, usando um Postgres de serviço.
O job de deploy no Azure Web App é opcional e só executa se o secret
`AZURE_WEBAPP_PUBLISH_PROFILE` estiver configurado no repositório.
