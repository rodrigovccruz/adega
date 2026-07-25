# Spec 03 — Sugestões Gastronômicas

## Status

`implementada`

## Objetivo

Associar cada vinho a sugestões de harmonização (pratos, ingredientes, ocasiões) e permitir encontrar vinhos a partir de um prato.

## História de usuário

Como usuário autenticado, quero ligar cada vinho a sugestões gastronômicas para saber o que servir com a refeição.

## Modelo de dados (conceitual)

### Sugestão Gastronômica

| Campo | Tipo | Obrigatório | Notas |
|-------|------|-------------|-------|
| vinhoId | ref | sim | Pertence a um vinho do usuário |
| titulo | string | sim | Ex.: "Risoto de cogumelos" |
| categoria | enum | sim | carne, peixe, massa, queijo, sobremesa, vegetariano, ocasiao, outro |
| descricao | string | não | Por que combina |
| intensidade | enum | não | leve, media, intensa |

Um vinho pode ter **N sugestões**.

## Requisitos funcionais

| ID | Requisito |
|----|-----------|
| PAIR-01 | Adicionar sugestão a um vinho |
| PAIR-02 | Editar sugestão |
| PAIR-03 | Remover sugestão |
| PAIR-04 | Listar sugestões no detalhe do vinho |
| PAIR-05 | Buscar vinhos por texto da sugestão (ex.: "cordeiro") |
| PAIR-06 | Filtrar vinhos por categoria de sugestão |
| PAIR-07 | Na listagem, indicar se o vinho tem sugestões (contagem) |

## Critérios de aceite

- [x] Posso cadastrar 1+ sugestões em um vinho
- [x] Sugestão sem título ou categoria falha validação
- [x] Remover sugestão não remove o vinho
- [x] Busca por "queijo" retorna vinhos com sugestão contendo esse termo ou categoria queijo
- [x] Usuário não consegue criar sugestão em vinho de outro usuário
- [x] Excluir vinho remove suas sugestões em cascata

## Regras de negócio

1. Sugestão só existe ligada a um vinho válido do mesmo usuário.
2. Não há catálogo global de pratos no MVP — texto livre + categoria.
3. Harmonização é opinião do usuário; o sistema não valida "acerto" enológico.

## Exemplos de aceite (cenários)

### Cenário feliz

1. Usuário abre "Malbec Reserva"
2. Adiciona sugestão: título "Picanha na brasa", categoria `carne`, intensidade `intensa`
3. Na busca global, digita "picanha"
4. O Malbec aparece nos resultados

### Cenário de autorização

1. Usuário B tenta `POST /wines/{idDoUsuarioA}/pairings`
2. API responde 404 ou 403 (sem vazar existência)
