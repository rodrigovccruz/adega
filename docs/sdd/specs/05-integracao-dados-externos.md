# Spec 05 — Integração com API de Vinhos (GrapeMinds)

## Status

`aprovada para planejamento`

## Objetivo

Enriquecer o cadastro de vinhos com dados de uma base externa (GrapeMinds):
completar campos vazios a partir de uma busca, e mostrar informação editorial
de referência (descrição, notas de degustação, sugestão de harmonização,
perfil de sabor) no detalhe do vinho.

> Ajuste em relação à primeira versão desta spec: o payload real da
> GrapeMinds **não tem preço nem avaliação/comentários de usuário** — só
> conteúdo editorial (descrição, notas de degustação, harmonização sugerida,
> perfil de sabor 1–10). A spec foi reescrita para refletir só o que a API
> realmente oferece.

## História de usuário

Como usuário autenticado, quero buscar um vinho numa base externa para
completar campos que não preenchi e ver notas de degustação, sugestão de
harmonização e perfil de sabor de referência.

## Abordagem técnica

Integração com a **GrapeMinds API** (plano gratuito, 250 requisições/mês),
base `https://api.grapeminds.eu/public/v1`, autenticação via header
`Authorization: Bearer {GRAPEMINDS_API_KEY}`. Chamadas só acontecem sob ação
explícita do usuário (nunca automáticas), com **cache em memória no servidor
por 1 hora** — sem persistência em banco. Se o servidor reiniciar, o cache é
reconstruído sob demanda.

### Endpoints usados

| Chamada | Uso |
|---------|-----|
| `GET /wines?search={termo}&per_page=10&page=` | Buscar candidatos por nome/produtor — retorna lista paginada |
| `GET /wines/{id}` | Detalhe enriquecido de um candidato selecionado |

### Exemplo de resposta — busca (`GET /wines?search=...`)

```json
{
  "data": [
    {
      "id": 1,
      "display_name": "Schieferkopf, Lieu Dit Buehl Riesling",
      "color": "white",
      "type": "wine",
      "sub_type": "still",
      "residual_sugar": null,
      "producer": { "id": 1, "name": "Schieferkopf", "title": null, "display_name": "Schieferkopf" },
      "region": { "id": 1, "name": "Alsace", "country": "fr", "language": "en" }
    }
  ],
  "meta": { "current_page": 1, "last_page": 144315, "per_page": 10, "total": 288629, "from": 1, "to": 10 }
}
```

### Exemplo de resposta — detalhe (`GET /wines/{id}`)

```json
{
  "data": {
    "id": 1,
    "display_name": "Schieferkopf, Lieu Dit Buehl Riesling",
    "color": "white",
    "producer": { "id": 1, "name": "Schieferkopf" },
    "region": { "id": 1, "name": "Alsace", "country": "fr" },
    "grapes": [{ "id": 1, "name": "Riesling" }],
    "description": { "text": "...", "text_long": "...", "language": "en" },
    "pairing": { "text": "...", "text_long": "...", "language": "en" },
    "tasting_notes": { "text": "...", "text_long": "...", "language": "en" },
    "flavor_profile": { "sweetness": 1, "acidity": 8, "tannins": 1, "alcohol": 4, "body": 5, "finish": 7 }
  }
}
```

**Sem campo de preço, nota ou comentário em nenhuma das duas respostas.**

### Mapeamento de campos (GrapeMinds → Adega)

| Campo GrapeMinds | Campo Adega | Conversão |
|---|---|---|
| `display_name` | `name` | Direto |
| `producer.name` | `producer` | Direto |
| `color` | `type` | `red`→`tinto`, `white`→`branco`, `rose`→`rose`, `sparkling`→`espumante`, `fortified`→`fortificado`, outro valor→`outro` |
| `region.name` | `region` | Direto |
| `region.country` | `country` | ISO-2 → nome PT-BR (tabela fixa; código não mapeado usa o próprio código em maiúsculas) |
| `grapes[0].name` | `grape` | Primeira uva da lista |
| `description`, `pairing`, `tasting_notes`, `flavor_profile` | — | Exibidos como informação de referência (nunca gravados em campo do vinho) |

Só campos **vazios** do vinho são preenchidos pela busca — nunca sobrescreve o que o usuário já digitou (regra de negócio 1).

## Requisitos funcionais

| ID | Requisito |
|----|-----------|
| EXT-01 | No formulário de cadastro/edição, usuário pode clicar "Buscar em base de vinhos" (usa o nome já digitado como termo inicial, editável) |
| EXT-02 | Resultado da busca aparece como lista (nome, produtor, região) para o usuário escolher o vinho correto |
| EXT-03 | Ao escolher um resultado, dados do detalhe completam campos vazios do formulário (nome, produtor, tipo, região, país, uva) |
| EXT-04 | Descrição, notas de degustação, harmonização sugerida e perfil de sabor do resultado escolhido são exibidos como referência no formulário (não são salvos em nenhum campo do vinho) |
| EXT-05 | No detalhe de um vinho já salvo, botão "Ver informações de mercado" repete a busca/seleção e mostra o mesmo bloco de referência |
| EXT-06 | A partir do bloco de referência no detalhe, usuário pode aplicar ao cadastro os campos ainda vazios (mesma regra do EXT-03), via atualização do vinho |
| EXT-07 | Nenhum resultado encontrado mostra mensagem clara ("Nenhum vinho encontrado para '{termo}'"), sem erro fatal |
| EXT-08 | Toda informação externa exibida traz a atribuição da fonte (GrapeMinds) |

## Requisitos não funcionais

| ID | Requisito |
|----|-----------|
| EXT-N1 | Busca externa exige sessão; aplicar ao cadastro só opera sobre vinho do próprio usuário (`resource.userId === session.userId`) |
| EXT-N2 | Busca responde em até 5s (timeout no lado servidor); falha/indisponibilidade não derruba a página — mostra estado de erro isolado no bloco |
| EXT-N3 | Resultados de busca ficam em cache em memória no servidor por 1h (chave = termo de busca); sem persistência em banco |
| EXT-N4 | Chave de API (`GRAPEMINDS_API_KEY`) fica só no servidor, nunca exposta ao client |
| EXT-N5 | Mensagens de erro em PT-BR conforme tabela abaixo |

### Tratamento de erros

| Cenário | Mensagem |
|---|---|
| `GRAPEMINDS_API_KEY` não configurada | "API de vinhos não configurada" |
| Rate limit (HTTP 429) | "Limite de consultas atingido. Tente novamente mais tarde." |
| Nenhum resultado | "Nenhum vinho encontrado para '{termo}'" |
| Erro de rede / API indisponível / timeout | "Não foi possível buscar informações. Tente novamente." |

## Critérios de aceite

- [ ] Buscar por um termo com resultado retorna lista de candidatos (nome, produtor, região)
- [ ] Selecionar um candidato preenche os campos vazios do formulário, sem sobrescrever campos já preenchidos
- [ ] Descrição, notas de degustação, harmonização e perfil de sabor aparecem como referência ao selecionar um candidato
- [ ] Buscar termo sem resultado mostra mensagem clara, sem quebrar a tela
- [ ] Indisponibilidade/timeout da API externa não impede o resto do formulário/página de funcionar
- [ ] Botão "Ver informações de mercado" funciona no detalhe de um vinho já salvo, incluindo aplicar campos vazios ao cadastro
- [ ] Usuário não consegue aplicar dado externo a vinho de outro usuário
- [ ] Toda informação externa exibida traz a atribuição da fonte (GrapeMinds)

## Regras de negócio

1. Dado externo é só uma referência complementar — nunca sobrescreve campos que o usuário preencheu manualmente no vinho.
2. Descrição/notas de degustação/harmonização/perfil de sabor são sempre exibidos ao vivo (buscados na hora), nunca persistidos no banco — não existe tabela/coluna nova para eles.
3. "Aplicar ao cadastro" (EXT-06) só grava os campos mapeáveis do vinho (nome, produtor, tipo, região, país, uva) que estiverem vazios; o restante do bloco de referência continua sendo só exibição.

## Fora de escopo

- Preço de mercado e avaliação/comentários de usuários — **não existem na GrapeMinds**; ficam de fora até (se algum dia fizer sentido) surgir outra fonte de dados para isso
- Persistência/histórico do dado externo no banco
- Gráfico sofisticado para o perfil de sabor — MVP usa uma exibição simples dos 6 valores (barras/números), sem biblioteca de gráficos

## Riscos e decisões conhecidas

- **Contrato confirmado**: URL base, autenticação (`Bearer`), endpoint de busca (`GET /wines?search=`) e de detalhe (`GET /wines/{id}`), com exemplos reais de payload — sem mais pendências de descoberta de API.
- **Sem preço/comentários**: decisão registrada — a feature segue só com o que a GrapeMinds realmente oferece (descrição, notas de degustação, harmonização, perfil de sabor). Se preço/comentários forem importantes no futuro, precisa de outra fonte de dados e uma spec nova.
- **Cache só em memória**: reinício do servidor (comum em serverless/deploy) limpa o cache; aceito, já que é só uma otimização de custo, não uma garantia.
- **Rate limit real** (250 req/mês no plano gratuito) não é contado pelo nosso lado — dependemos do HTTP 429 da própria API para sinalizar limite atingido; não há contador local persistente (resetaria a cada reinício e daria falsa sensação de proteção).
- **Endpoint de análise de foto** (`POST /photo/analyze`, "Enterprise only" na GrapeMinds) faz OCR de rótulo via IA de visão — não usado aqui; spec 04 já decidiu por Tesseract sem API paga.
