# Plano de Implementação (SDD)

Ordem: **spec → design → tasks → código → verificação**.

Cada fase gera um PR vertical com critérios de aceite da spec correspondente.

---

## Fase 0 — Fundação do repositório

**Entrega**

- Scaffold Next.js + TypeScript
- Prisma + PostgreSQL (docker-compose local)
- ESLint/Prettier básicos
- README com setup (`pnpm/npm`, env vars, migrate)
- Variáveis: `DATABASE_URL`, `AUTH_SECRET`

**Saída verificável**

- App sobe localmente
- Migração inicial aplica schema vazio/usuário

---

## Fase 1 — Autenticação (Spec 01)

**Tasks**

1. Model `User` + migration
2. Cadastro (hash senha)
3. Login / logout / sessão
4. Middleware/guard de rotas privadas
5. Páginas `/login` e `/cadastro`
6. Testes: registro, login inválido, rota protegida

**DoD**

- Todos os critérios de aceite de `specs/01-autenticacao.md` marcados

---

## Fase 2 — Inventário de vinhos (Spec 02)

**Tasks**

1. Models `Wine` + enums
2. Server actions/API CRUD
3. Listagem com busca/filtros/ordenação
4. Formulários criar/editar
5. Ajuste de quantidade
6. Exclusão com confirmação
7. Testes de isolamento entre usuários

**DoD**

- Critérios de `specs/02-vinhos.md` atendidos

---

## Fase 3 — Sugestões gastronômicas (Spec 03)

**Tasks**

1. Model `GastronomicSuggestion`
2. CRUD de sugestões no detalhe do vinho
3. Busca/filtro por prato e categoria
4. Contagem de sugestões na listagem
5. Cascade delete com vinho
6. Testes de autorização e busca por pairing

**DoD**

- Critérios de `specs/03-sugestoes-gastronomicas.md` atendidos

---

## Fase 4 — Polimento MVP

**Tasks**

1. Landing pública curta (marca Adega + CTA)
2. Empty states ("Sua adega está vazia")
3. Mensagens de validação em PT-BR
4. Smoke E2E: cadastro → vinho → sugestão → busca
5. Deploy (ex.: Vercel + Neon/Supabase Postgres)

**DoD**

- Fluxo de sucesso da visão (`00-visao.md`) completo em produção/staging

---

## Backlog pós-MVP (não implementar agora)

| Item | Spec futura |
|------|-------------|
| Recuperação de senha | Spec 04 |
| Upload de foto do rótulo | Spec 05 |
| Notas de degustação | Spec 06 |
| Export CSV da adega | Spec 07 |
| Adega compartilhada (família) | Spec 08 |

---

## Ordem de PRs sugerida

1. `chore: scaffold app + prisma`
2. `feat: authentication`
3. `feat: wine inventory crud`
4. `feat: gastronomic pairings`
5. `feat: mvp polish + e2e`

---

## Como trabalhar em SDD daqui pra frente

1. Toda feature nova começa por arquivo em `docs/sdd/specs/`
2. Atualizar design se mudar modelo/API
3. Quebrar em tasks no PR
4. Só então implementar
5. Fechar a spec marcando critérios de aceite

## Decisão pendente (para você confirmar)

| Tópico | Default deste plano | Alternativa |
|--------|---------------------|-------------|
| Stack | Next.js + Prisma + Postgres | Outra full-stack |
| Auth | Credentials (e-mail/senha) | Incluir Google depois |
| Foto do vinho | Fora do MVP | Incluir upload simples na Fase 2 |
| Idioma UI | pt-BR | — |
