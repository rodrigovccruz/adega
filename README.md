# Adega

Controle pessoal de vinhos com autenticação e sugestões gastronômicas.

Construído via **Spec-Driven Development** — plano em [`docs/sdd/README.md`](./docs/sdd/README.md).

## Stack

- Next.js 15 (App Router) + TypeScript
- Auth.js (credentials / e-mail e senha)
- Prisma + PostgreSQL
- Zod + Vitest
- Tailwind CSS 4

## Funcionalidades (MVP)

- Cadastro, login e logout
- CRUD de vinhos (inventário)
- Ajuste de quantidade
- Sugestões gastronômicas por vinho
- Busca por rótulo, uva, produtor ou prato
- Filtros por tipo, estoque e categoria de harmonização

## Setup local

### 1. Dependências

```bash
npm install
```

### 2. Banco (Docker ou Postgres local)

```bash
docker compose up -d
cp .env.example .env
```

Ajuste `DATABASE_URL` e `AUTH_SECRET` no `.env`.

### 3. Migrar

```bash
npm run db:migrate
```

### 4. Rodar

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Sobe o build |
| `npm test` | Testes unitários |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Migrações Prisma |

## Rotas

| Rota | Auth | Função |
|------|------|--------|
| `/` | pública | Landing |
| `/login` / `/cadastro` | pública | Auth |
| `/vinhos` | privada | Listagem |
| `/vinhos/novo` | privada | Criar |
| `/vinhos/[id]` | privada | Detalhe + harmonizações |
| `/vinhos/[id]/editar` | privada | Editar |

## Saúde

`GET /api/health` — verifica conexão com o banco.
