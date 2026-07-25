# Design Técnico — Adega

## Stack proposta (MVP)

| Camada | Escolha | Motivo |
|--------|---------|--------|
| Framework | **Next.js (App Router) + TypeScript** | Full-stack, rotas UI + API no mesmo repo |
| Auth | **Auth.js (NextAuth) Credentials** ou sessão própria com cookies httpOnly | E-mail/senha simples, sem OAuth no MVP |
| Banco | **PostgreSQL + Prisma** | Relacional claro para User → Wine → Pairing |
| UI | **React + CSS Modules ou Tailwind** | UI em PT-BR, layout simples (lista + detalhe + forms) |
| Validação | **Zod** | Contratos compartilhados form/API |
| Testes | **Vitest + Playwright (smoke)** | Unitários de regras + fluxo crítico E2E |

> Alternativa aceitável: Remix ou SvelteKit com o mesmo modelo de dados. A stack acima é a default deste plano.

## Arquitetura

```
┌─────────────┐     cookie sessão      ┌──────────────────┐
│  Browser    │ ─────────────────────► │  Next.js App     │
│  UI PT-BR   │ ◄───────────────────── │  Server Actions  │
└─────────────┘                        │  / API Routes    │
                                       └────────┬─────────┘
                                                │ Prisma
                                       ┌────────▼─────────┐
                                       │   PostgreSQL     │
                                       └──────────────────┘
```

Padrão: **monólito full-stack**. Sem microserviços no MVP.

## Modelo de dados (ER)

```
User
├── id
├── name
├── email (unique)
├── passwordHash
├── createdAt
└── wines[]

Wine
├── id
├── userId (FK)
├── name, producer, type, grape, country, region
├── vintage, alcoholPct, quantity, purchasePrice
├── location, notes
├── createdAt, updatedAt
└── pairings[]

GastronomicSuggestion (Pairing)
├── id
├── wineId (FK, cascade delete)
├── title
├── category
├── description
├── intensity
└── createdAt
```

Índices sugeridos:

- `Wine(userId, name)`
- `Wine(userId, type)`
- `GastronomicSuggestion(wineId)`
- Full-text simples via `ILIKE` no MVP; evoluir para search dedicado se necessário

## Rotas de UI

| Rota | Auth | Função |
|------|------|--------|
| `/` | pública | Landing mínima + CTA entrar/cadastrar |
| `/login` | pública | Login |
| `/cadastro` | pública | Cadastro |
| `/vinhos` | privada | Listagem + busca/filtros |
| `/vinhos/novo` | privada | Formulário criar |
| `/vinhos/[id]` | privada | Detalhe + sugestões |
| `/vinhos/[id]/editar` | privada | Editar vinho |

## Contratos de API (resumo)

Todas as rotas de dados exigem sessão. Sempre filtrar por `session.userId`.

- `POST /api/auth/register`
- `POST /api/auth/login` / `POST /api/auth/logout` (ou fluxo Auth.js)
- `GET/POST /api/wines`
- `GET/PATCH/DELETE /api/wines/:id`
- `POST /api/wines/:id/quantity` — body `{ delta }` ou `{ quantity }`
- `GET/POST /api/wines/:id/pairings`
- `PATCH/DELETE /api/pairings/:id`

Erros: `400` validação, `401` não autenticado, `403/404` recurso de outro usuário, `409` e-mail duplicado.

## Autorização

Regra única e obrigatória:

```
resource.userId === session.userId
```

Implementar em camada de repositório/serviço, não só no componente React.

## UX (diretrizes)

- Primeira tela autenticada = **lista da adega**, não dashboard com cards de métricas.
- Detalhe do vinho: dados do rótulo + bloco "Harmonizações".
- Busca unificada: texto livre cobre nome do vinho **e** título da sugestão.
- Visual: atmosfera de adega (tons terrosos/vinho, tipografia expressiva), sem layout genérico de SaaS roxo.
- Mobile: listagem empilhável; forms em coluna única.

## Segurança

- Hash de senha (argon2 ou bcrypt)
- Cookie de sessão httpOnly + Secure + SameSite
- Validação Zod em toda entrada
- Rate limit no login
- CSRF protegido pelo padrão do framework (Server Actions / tokens)

## Observabilidade (mínimo)

- Logs de erro no servidor
- Página de erro amigável
- Health check simples (`/api/health`) para deploy
