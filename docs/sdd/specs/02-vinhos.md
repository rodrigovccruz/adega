# Spec 02 — Inventário de Vinhos

## Status

`implementada`

## Objetivo

Permitir o controle da coleção: cadastrar, editar, listar, filtrar e ajustar quantidade de garrafas.

## História de usuário

Como usuário autenticado, quero cadastrar e controlar meus vinhos para saber o que tenho na adega.

## Modelo de dados (conceitual)

| Campo | Tipo | Obrigatório | Notas |
|-------|------|-------------|-------|
| nome | string | sim | Ex.: "Malbec Reserva 2020" |
| produtor | string | sim | Adega / vinícola |
| tipo | enum | sim | tinto, branco, rose, espumante, fortificado, outro |
| uva | string | não | Pode ser blend (texto livre) |
| pais | string | não | |
| regiao | string | não | |
| safra | number | não | Ano |
| teorAlcoolico | number | não | % |
| quantidade | integer ≥ 0 | sim | Garrafas em estoque |
| precoCompra | number | não | Opcional |
| localizacao | string | não | Ex.: "Prateleira A3" |
| notas | string | não | Observações livres |
| fotoUrl | string | não | Pós-MVP se complexo; MVP pode omitir upload |

## Requisitos funcionais

| ID | Requisito |
|----|-----------|
| WINE-01 | Criar vinho com campos obrigatórios |
| WINE-02 | Editar qualquer campo do vinho |
| WINE-03 | Excluir vinho (com confirmação) |
| WINE-04 | Listar vinhos do usuário autenticado |
| WINE-05 | Ver detalhe de um vinho |
| WINE-06 | Ajustar quantidade (+/− ou valor absoluto) |
| WINE-07 | Buscar por nome, produtor ou uva |
| WINE-08 | Filtrar por tipo e por quantidade > 0 |
| WINE-09 | Ordenar por nome, safra ou quantidade |

## Critérios de aceite

- [x] Usuário A não vê vinhos do usuário B
- [x] Criar vinho sem nome/produtor/tipo/quantidade falha com validação
- [x] Quantidade não pode ficar negativa
- [x] Exclusão remove o vinho e suas sugestões gastronômicas
- [x] Busca "malbec" encontra vinhos cujo nome/uva/produtor contenha o termo
- [x] Filtro "somente em estoque" oculta quantidade = 0

## Regras de negócio

1. Todo vinho pertence a exatamente um usuário (`ownerId`).
2. Quantidade zero significa "já bebi / esgotado", não apaga o histórico.
3. Exclusão é permanente no MVP (sem soft-delete).
