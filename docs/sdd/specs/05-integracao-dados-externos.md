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

Integração com **GrapeMinds API** (provedor pago), base
`https://api.grapeminds.eu/public/v1`, autenticação via header
`Authorization: Bearer <chave>`. O acesso é feito sob demanda (usuário aciona
a busca), nunca automaticamente em toda visita à página, para controlar custo
de chamadas de API.

Endpoints confirmados (via coleção Postman oficial):

| Chamada | Uso nesta spec |
|---------|----------------|
| `GET /wines/search?q=<termo>&limit=` | Buscar candidatos por nome + produtor (mín. 3 caracteres) |
| `GET /wines/{id}` | Detalhe do vinho (descrições, notas de degustação, harmonizações, perfil de sabor) |
| `POST /licence/{wine_id}` | Adquirir licença de armazenamento persistente **antes** de gravar o dado em `ExternalWineInfo` (ver regra de negócio 4) |

> Pendente de confirmação: um exemplo real do corpo de resposta de
> `GET /wines/{id}` / `GET /wines/search` — a coleção Postman fornecida não
> inclui respostas salvas, então os nomes exatos dos campos de preço, nota e
> comentários ainda não estão confirmados. `averagePrice`/`rating`/
> `commentsSummary` no modelo de dados abaixo são nomes provisórios do nosso
> lado; o mapeamento de campo a campo da resposta da GrapeMinds só é escrito
> na implementação, quando tivermos um payload de exemplo.
>
> A integração é desenhada atrás de uma interface própria
> (`WineExternalInfoProvider`) para permitir trocar de provedor no futuro sem
> reescrever a spec.

## Modelo de dados (novo)

### `ExternalWineInfo`

| Campo | Tipo | Obrigatório | Notas |
|-------|------|-------------|-------|
| `wineId` | ref (único, 1:1 com `Wine`) | sim | Cascade delete com o vinho |
| `provider` | enum | sim | `grapeminds` (permite adicionar outros no futuro) |
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
| EXT-02 | Sistema busca por nome + produtor + safra na GrapeMinds API |
| EXT-03 | Resultado (preço médio, nota, resumo de comentários, link de origem) é exibido no detalhe do vinho |
| EXT-04 | Resultado buscado fica em cache (`fetchedAt`); nova busca automática não ocorre a cada visita à página |
| EXT-05 | Usuário pode forçar atualização manual do dado externo (novo fetch) |
| EXT-06 | Se a busca não encontrar o vinho no provedor, sistema mostra mensagem clara ("não encontramos esse vinho na fonte externa"), sem erro fatal |
| EXT-07 | Dado externo é exibido com atribuição da fonte (nome do provedor + link), nunca como se fosse dado próprio do sistema |
| EXT-08 | Antes de persistir o resultado em `ExternalWineInfo`, sistema adquire a Licença de Armazenamento Persistente (PSL) do vinho via `POST /licence/{wine_id}` |
| EXT-09 | Se a PSL não puder ser adquirida (402: sem assinatura ativa; 403: termos da PSL não aceitos no dashboard da GrapeMinds), sistema exibe o resultado da busca **sem salvar** e informa ao usuário que a informação não pôde ser guardada para consulta futura |

## Requisitos não funcionais

| ID | Requisito |
|----|-----------|
| EXT-N1 | Busca externa exige sessão e só opera sobre vinho do próprio usuário (`resource.userId === session.userId`) |
| EXT-N2 | Falha/indisponibilidade da API externa não derruba a página do vinho — mostra estado de erro isolado nesse bloco |
| EXT-N3 | Chamadas à API externa são limitadas por debounce/cache para conter custo (não permitir refresh em loop) |
| EXT-N4 | Chave de API do provedor fica só no servidor (variável de ambiente), nunca exposta ao client |
| EXT-N5 | Persistência de dado externo respeita os termos da GrapeMinds (PSL) — nunca grava em `ExternalWineInfo` sem a licença adquirida (EXT-08/EXT-09) |

## Critérios de aceite

- [ ] Ao acionar "Buscar informações externas" em um vinho existente na fonte, preço médio/nota/comentários aparecem no detalhe
- [ ] Buscar novamente sem forçar atualização reaproveita o cache (`fetchedAt` não muda)
- [ ] Forçar atualização gera nova consulta e atualiza `fetchedAt`
- [ ] Vinho não encontrado na fonte externa mostra mensagem clara, sem quebrar a página
- [ ] Indisponibilidade da API externa (erro/timeout) não impede visualizar o resto dos dados do vinho
- [ ] Usuário não consegue acionar/ver dado externo de vinho de outro usuário
- [ ] Toda informação externa exibida traz a atribuição da fonte (GrapeMinds) e link de origem quando disponível
- [ ] Sem PSL adquirida (402/403), o resultado aparece na tela mas não fica salvo — buscar de novo consulta a API outra vez, sem reaproveitar cache

## Regras de negócio

1. Dado externo é só uma referência complementar — nunca sobrescreve campos que o usuário preencheu manualmente no vinho.
2. Um vinho tem no máximo um registro de `ExternalWineInfo` por provedor (1:1); nova busca atualiza o existente em vez de duplicar.
3. Excluir o vinho remove o `ExternalWineInfo` associado em cascata.
4. Persistir o resultado da GrapeMinds no nosso banco depende de adquirir a PSL daquele vinho primeiro (`POST /licence/{wine_id}`, idempotente — repetir para um vinho já licenciado não cobra de novo). Sem a licença, o dado é mostrado só naquela resposta, nunca gravado em `ExternalWineInfo`.

## Fora de escopo

- Atualização automática em background (cron) dos dados externos — é sempre sob ação do usuário nesta versão
- Comparação de preço entre múltiplos provedores
- Histórico de variação de preço ao longo do tempo (mantém apenas o registro mais recente)

## Riscos e decisões conhecidas

- **Contrato/chave da GrapeMinds API**: `GRAPEMINDS_API_KEY` já disponível. Confirmados: URL base, autenticação (`Bearer`), endpoints de busca/detalhe (`/wines/search`, `/wines/{id}`) e o endpoint de licença (`/licence/{wine_id}`).
- **Formato de resposta ainda não confirmado**: não temos um exemplo real do JSON de `/wines/{id}` ou `/wines/search` (a coleção Postman não trouxe respostas salvas). Os nomes de campo do modelo `ExternalWineInfo` (`averagePrice`, `rating`, `commentsSummary`) são provisórios — o mapeamento real só é feito na implementação, com um payload de exemplo em mãos. As descrições da GrapeMinds mencionam "tasting notes", "pairing suggestions" e "flavor profile" no detalhe do vinho, mas não citam preço explicitamente — precisa confirmar se a API realmente expõe preço de mercado ou se isso vem de outro endpoint/plano.
- **Persistent Storage License (PSL)**: a GrapeMinds exige adquirir uma licença por vinho (`POST /licence/{wine_id}`) antes de guardarmos os dados dela permanentemente (retorna 402 sem assinatura ativa, 403 sem termos aceitos no dashboard). Isso está refletido em EXT-08/EXT-09 — sem a licença, mostramos o resultado mas não persistimos.
- **Endpoint de análise de foto** (`POST /photo/analyze`, "Enterprise only"): a GrapeMinds também oferece OCR de rótulo via IA de visão. Não usado aqui — a spec 04 já decidiu por Tesseract (sem API paga de visão) — mas registrado para referência caso essa decisão seja revisitada.
- **Custo por chamada**: por ser API paga, o design evita buscas automáticas/recorrentes; todo fetch é uma ação explícita do usuário.
- **Confiabilidade do matching** (nome + produtor + safra pode não bater exatamente com o catálogo do provedor): aceitar que nem todo vinho cadastrado terá correspondência exata: comportamento definido em EXT-06.
