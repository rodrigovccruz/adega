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
| [04-foto-rotulo-ocr.md](./specs/04-foto-rotulo-ocr.md) | implementada (reconhecimento em produção não verificado — ver spec) |
| [05-integracao-dados-externos.md](./specs/05-integracao-dados-externos.md) | aprovada para planejamento (aguardando contrato da GrapeMinds) |

## MVP em uma frase

Usuário cria conta, cadastra vinhos da adega e associa sugestões gastronômicas a cada rótulo, podendo buscar pelo vinho ou pelo prato.

## v1.1 em uma frase

Ao cadastrar, o usuário pode tirar foto do rótulo para pré-preencher o formulário (OCR) e buscar o vinho numa base externa (GrapeMinds) para completar campos vazios e ver descrição, notas de degustação, harmonização sugerida e perfil de sabor de referência.

## Próximo passo

MVP (Fases 0–4) implementado e em produção. **Fase 5 — Foto do rótulo com
OCR** implementada (spec 04); falta validar em produção que o
reconhecimento de texto funciona de ponta a ponta. Próximo passo:
**Fase 6 — Integração com a GrapeMinds API** (spec 05) — endpoint, payload
e chave já confirmados, pronta para implementar.
