# Spec 05 — Integração com Dados Externos do Vinho

## Status

`aprovada para planejamento`

## Objetivo

Buscar, para cada vinho cadastrado, informações de referência de mercado
(preço médio, nota/avaliação, comentários) numa fonte externa, dando ao
usuário contexto além do que ele mesmo digitou.

## História de usuário

Como usuário autenticado, quero ver preço médio de mercado, nota e comentários
de um vinho da minha adega para ter uma referência externa sobre o rótulo.

## Abordagem técnica

Integração com **Wine-Searcher API** (provedor pago). O acesso é feito sob
demanda (usuário aciona a busca), nunca automaticamente em toda visita à
página, para controlar custo de chamadas de API.

> Decisão pendente antes da implementação: confirmar que a conta/plano da
> Wine-Searcher API está contratado e a chave de API disponível. A integração
> é desenhada atrás de uma interface própria (`WineExternalInfoProvider`) para
> permitir trocar de provedor no futuro sem reescrever a spec.

## Modelo de dados (novo)

### `ExternalWineInfo`

| Campo | Tipo | Obrigatório | Notas |
|-------|------|-------------|-------|
| `wineId` | ref (único, 1:1 com `Wine`) | sim | Cascade delete com o vinho |
| `provider` | enum | sim | `wine_searcher` (permite adicionar outros no futuro) |
| `averagePrice` | number | não | Preço médio de mercado, na moeda retornada pelo provedor |
| `currency` | string | não | Ex.: `BRL`, `USD` |
| `rating` | number | não | Nota/avaliação agregada do provedor |
| `commentsSummary` | string | não | Resumo/trecho de comentários retornado pelo provedor |
| `sourceUrl` | string | não | Link para a página de origem no provedor |
| `fetchedAt` | datetime | sim | Quando os dados foram buscados (para exibir "atualizado em" e permitir refresh) |

## Requisitos funcionais

| ID | Requisito |
|----|-----------|
| EXT-01 | No detalhe do vinho, usuário pode acionar "Buscar informações externas" |
| EXT-02 | Sistema busca por nome + produtor + safra na Wine-Searcher API |
| EXT-03 | Resultado (preço médio, nota, resumo de comentários, link de origem) é exibido no detalhe do vinho |
| EXT-04 | Resultado buscado fica em cache (`fetchedAt`); nova busca automática não ocorre a cada visita à página |
| EXT-05 | Usuário pode forçar atualização manual do dado externo (novo fetch) |
| EXT-06 | Se a busca não encontrar o vinho no provedor, sistema mostra mensagem clara ("não encontramos esse vinho na fonte externa"), sem erro fatal |
| EXT-07 | Dado externo é exibido com atribuição da fonte (nome do provedor + link), nunca como se fosse dado próprio do sistema |

## Requisitos não funcionais

| ID | Requisito |
|----|-----------|
| EXT-N1 | Busca externa exige sessão e só opera sobre vinho do próprio usuário (`resource.userId === session.userId`) |
| EXT-N2 | Falha/indisponibilidade da API externa não derruba a página do vinho — mostra estado de erro isolado nesse bloco |
| EXT-N3 | Chamadas à API externa são limitadas por debounce/cache para conter custo (não permitir refresh em loop) |
| EXT-N4 | Chave de API do provedor fica só no servidor (variável de ambiente), nunca exposta ao client |

## Critérios de aceite

- [ ] Ao acionar "Buscar informações externas" em um vinho existente na fonte, preço médio/nota/comentários aparecem no detalhe
- [ ] Buscar novamente sem forçar atualização reaproveita o cache (`fetchedAt` não muda)
- [ ] Forçar atualização gera nova consulta e atualiza `fetchedAt`
- [ ] Vinho não encontrado na fonte externa mostra mensagem clara, sem quebrar a página
- [ ] Indisponibilidade da API externa (erro/timeout) não impede visualizar o resto dos dados do vinho
- [ ] Usuário não consegue acionar/ver dado externo de vinho de outro usuário
- [ ] Toda informação externa exibida traz a atribuição da fonte (Wine-Searcher) e link de origem quando disponível

## Regras de negócio

1. Dado externo é só uma referência complementar — nunca sobrescreve campos que o usuário preencheu manualmente no vinho.
2. Um vinho tem no máximo um registro de `ExternalWineInfo` por provedor (1:1); nova busca atualiza o existente em vez de duplicar.
3. Excluir o vinho remove o `ExternalWineInfo` associado em cascata.

## Fora de escopo

- Atualização automática em background (cron) dos dados externos — é sempre sob ação do usuário nesta versão
- Comparação de preço entre múltiplos provedores
- Histórico de variação de preço ao longo do tempo (mantém apenas o registro mais recente)

## Riscos e decisões conhecidas

- **Contrato/chave da Wine-Searcher API**: precisa ser confirmado e configurado (`WINE_SEARCHER_API_KEY`) antes da implementação real da chamada — sem isso, a integração fica implementada atrás da interface `WineExternalInfoProvider` mas sem provedor real conectado.
- **Custo por chamada**: por ser API paga, o design evita buscas automáticas/recorrentes; todo fetch é uma ação explícita do usuário.
- **Confiabilidade do matching** (nome + produtor + safra pode não bater exatamente com o catálogo do provedor): aceitar que nem todo vinho cadastrado terá correspondência exata: comportamento definido em EXT-06.
