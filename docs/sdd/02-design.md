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

### Stack adicional (v1.1 — specs 04 e 05)

| Camada | Escolha | Motivo |
|--------|---------|--------|
| OCR do rótulo | **Tesseract.js** (servidor) | OCR gratuito, sem depender de API paga de visão computacional (spec 04) |
| Storage de imagem | **Vercel Blob** (ou equivalente) | Guardar a foto do rótulo; integra nativamente com o deploy na Vercel |
| Dados externos do vinho | **Wine-Searcher API** atrás de uma interface `WineExternalInfoProvider` | Preço médio, nota e comentários de referência (spec 05); interface própria permite trocar de provedor sem reescrever a spec |

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
├── labelPhotoUrl (spec 04)
├── createdAt, updatedAt
├── pairings[]
└── externalInfo (spec 05, 1:1)

GastronomicSuggestion (Pairing)
├── id
├── wineId (FK, cascade delete)
├── title
├── category
├── description
├── intensity
└── createdAt

ExternalWineInfo (spec 05)
├── id
├── wineId (FK, único, cascade delete)
├── provider (ex.: wine_searcher)
├── averagePrice, currency
├── rating
├── commentsSummary
├── sourceUrl
└── fetchedAt
```

Índices sugeridos:

- `Wine(userId, name)`
- `Wine(userId, type)`
- `GastronomicSuggestion(wineId)`
- `ExternalWineInfo(wineId)` único
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
- `POST /api/wines/label-scan` — multipart (imagem) → `{ labelPhotoUrl, suggested: { name?, producer?, vintage?, type? } }` (spec 04, não salva o vinho)
- `POST /api/wines/:id/external-info` — aciona busca/refresh na fonte externa → `ExternalWineInfo` atualizado (spec 05)

Erros: `400` validação, `401` não autenticado, `403/404` recurso de outro usuário, `409` e-mail duplicado, `502` falha da API externa (spec 05, não derruba a página).

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
- Chaves de API externas (Wine-Searcher, storage de blob) ficam só em variável de ambiente do servidor, nunca expostas ao client (spec 04, 05)
- Upload de imagem (rótulo) validado por tamanho e content-type antes de processar (spec 04)

## Observabilidade (mínimo)

- Logs de erro no servidor
- Página de erro amigável
- Health check simples (`/api/health`) para deploy

## Variáveis de ambiente adicionais (v1.1)

| Variável | Spec | Descrição |
|----------|------|-----------|
| `BLOB_READ_WRITE_TOKEN` (ou equivalente do provedor de storage) | 04 | Acesso ao storage da foto do rótulo |
| `WINE_SEARCHER_API_KEY` | 05 | Chave da API paga de dados externos de vinho |
