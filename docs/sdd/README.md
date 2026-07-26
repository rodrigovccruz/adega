# Adega — Spec-Driven Development (SDD)

Índice do plano para construir o site de controle de vinhos com autenticação e sugestões gastronômicas.

## Fluxo SDD

```
Visão → Constituição → Specs → Design → Plano → Implementação → Aceite
```

1. **Visão** define o problema e o MVP
2. **Constituição** fixa regras que não se negociam a cada PR
3. **Specs** descrevem comportamento e critérios de aceite
4. **Design** escolhe stack, dados e contratos
5. **Plano** fatia o trabalho em fases/PRs
6. **Implementação** só começa com spec aprovada

## Documentos

| Doc | Conteúdo |
|-----|----------|
| [00-visao.md](./00-visao.md) | Problema, persona, escopo MVP |
| [01-constituicao.md](./01-constituicao.md) | Princípios de produto, tech e qualidade |
| [02-design.md](./02-design.md) | Stack, ER, rotas, segurança |
| [03-plano-implementacao.md](./03-plano-implementacao.md) | Fases 0–6 e ordem de PRs |

## Specs

| Spec | Status |
|------|--------|
| [01-autenticacao.md](./specs/01-autenticacao.md) | implementada |
| [02-vinhos.md](./specs/02-vinhos.md) | implementada |
| [03-sugestoes-gastronomicas.md](./specs/03-sugestoes-gastronomicas.md) | implementada |
| [04-foto-rotulo-ocr.md](./specs/04-foto-rotulo-ocr.md) | aprovada para planejamento |
| [05-integracao-dados-externos.md](./specs/05-integracao-dados-externos.md) | aprovada para planejamento |

## MVP em uma frase

Usuário cria conta, cadastra vinhos da adega e associa sugestões gastronômicas a cada rótulo, podendo buscar pelo vinho ou pelo prato.

## v1.1 em uma frase

Ao cadastrar, o usuário pode tirar foto do rótulo para pré-preencher o formulário (OCR) e consultar preço/nota/comentários de referência de uma fonte externa (GrapeMinds) para cada vinho.

## Próximo passo

MVP (Fases 0–4) implementado e em produção. Specs 04 e 05 aprovadas para
planejamento — próximo passo é **Fase 5 — Foto do rótulo com OCR**, seguida
da **Fase 6 — Integração com dados externos** (esta última depende de
confirmar o acesso à GrapeMinds API antes de implementar a chamada real).
