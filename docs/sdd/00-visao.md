# Visão do Produto — Adega

## Problema

Quem guarda vinhos em casa ou em uma adega pequena perde o controle do que tem, onde está e com o que combina. Anotações soltas e planilhas não ajudam na hora de escolher um vinho para uma refeição.

## Solução

**Adega** é um web app para controle pessoal de vinhos, com autenticação por usuário e senha, inventário da coleção e sugestões gastronômicas associadas a cada rótulo.

## Persona principal

**Colecionador / anfitrião doméstico** — tem dezenas de garrafas, quer saber o que ainda tem e o que servir com cada prato.

## Proposta de valor

- Entrar com usuário e senha e ver só a própria adega.
- Cadastrar, editar e baixar estoque de vinhos.
- Associar cada vinho a sugestões gastronômicas (pratos, queijos, ocasiões).
- Buscar vinhos por tipo, uva, região ou por prato sugerido.

## Escopo do MVP

Inclui:

- Cadastro / login / logout
- CRUD de vinhos (inventário)
- Sugestões gastronômicas por vinho
- Listagem com busca e filtros básicos
- Área autenticada (dados por usuário)

Fora do MVP (backlog):

- Compartilhamento público de adega
- App mobile nativo
- Multi-usuário na mesma adega (família)
- Avaliações e notas de degustação avançadas

## Critério de sucesso do MVP

Um usuário consegue, em menos de 5 minutos após o cadastro:

1. Entrar na conta
2. Cadastrar um vinho
3. Associar ao menos uma sugestão gastronômica
4. Encontrar esse vinho filtrando por prato ou tipo

## Escopo v1.1 (pós-MVP, aprovado para spec)

MVP validado, mas o usuário ainda cadastra tudo manualmente e não tem nenhuma
referência externa sobre o vinho. Duas evoluções aprovadas para especificação:

- **Scanner de rótulo (OCR)** — tirar foto do rótulo na hora de cadastrar e
  pré-preencher nome/produtor/safra/tipo automaticamente. Ver
  [`specs/04-foto-rotulo-ocr.md`](./specs/04-foto-rotulo-ocr.md).
- **Integração com base de vinhos (GrapeMinds)** — buscar um vinho numa base
  externa para completar campos vazios e ver descrição, notas de degustação,
  harmonização sugerida e perfil de sabor de referência (a API não expõe
  preço nem avaliações/comentários de usuários). Ver
  [`specs/05-integracao-dados-externos.md`](./specs/05-integracao-dados-externos.md).

Continuam fora de escopo (backlog não priorizado): Integração com e-commerce
(compra direta), compartilhamento público de adega, app mobile nativo,
multi-usuário na mesma adega, avaliações e notas de degustação avançadas.
