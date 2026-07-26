# Spec 04 — Foto do Rótulo com OCR

## Status

`aprovada para planejamento`

## Objetivo

Permitir que o usuário tire ou envie uma foto do rótulo ao cadastrar um vinho,
com extração automática (best-effort) de nome, produtor, safra e tipo via
OCR, agilizando o preenchimento — sempre com revisão do usuário antes de salvar.

## História de usuário

Como usuário autenticado, quero tirar uma foto do rótulo ao cadastrar um vinho
para preencher o formulário mais rápido, sem digitar tudo manualmente.

## Abordagem técnica

OCR tradicional via **Tesseract** (processamento no servidor, sem depender de
API paga de visão computacional). Extrai texto bruto da imagem; uma camada de
heurística tenta identificar nome, produtor, safra e tipo a partir desse texto.

## Modelo de dados (mudança)

| Campo | Tipo | Obrigatório | Notas |
|-------|------|-------------|-------|
| `labelPhotoUrl` (em `Wine`) | string | não | URL da foto do rótulo armazenada em blob storage |

## Requisitos funcionais

| ID | Requisito |
|----|-----------|
| OCR-01 | Usuário pode anexar uma foto do rótulo na tela de cadastro de vinho (câmera ou galeria) |
| OCR-02 | Sistema extrai texto da imagem via OCR no servidor |
| OCR-03 | Sistema tenta identificar nome, produtor, safra (ano de 4 dígitos) e tipo a partir do texto extraído e pré-preenche os campos correspondentes como sugestão |
| OCR-04 | Usuário pode revisar e corrigir qualquer campo sugerido antes de salvar — nada é salvo automaticamente sem confirmação explícita |
| OCR-05 | Foto do rótulo fica associada ao vinho salvo e é exibida no detalhe do vinho |
| OCR-06 | Cadastro funciona normalmente sem foto — o campo é opcional e a feature é apenas um atalho |
| OCR-07 | Se o OCR não identificar um campo, ele fica em branco para preenchimento manual (não trava o fluxo) |

## Requisitos não funcionais

| ID | Requisito |
|----|-----------|
| OCR-N1 | Processamento não trava a UI — usuário vê indicador de carregamento durante a extração |
| OCR-N2 | Falha no OCR (imagem ilegível, erro de processamento) não impede o cadastro manual |
| OCR-N3 | Upload limitado a um tamanho máximo razoável (8MB) e formatos comuns (jpeg/png/webp) |
| OCR-N4 | Foto do rótulo segue a mesma regra de autorização do vinho (`resource.userId === session.userId`); URL não deve ser adivinhável/listável por outro usuário |

## Critérios de aceite

- [ ] Cadastrar um vinho tirando foto do rótulo pré-preenche o formulário com pelo menos um campo reconhecido corretamente, em rótulo com texto legível e não estilizado
- [ ] Qualquer campo sugerido pelo OCR pode ser editado antes de salvar
- [ ] Salvar vinho sem foto continua funcionando normalmente (fluxo atual preservado)
- [ ] Foto ilegível/sem texto reconhecível não bloqueia o cadastro — formulário fica vazio, sem erro fatal
- [ ] Foto do rótulo aparece no detalhe do vinho depois de salvo
- [ ] Usuário não consegue acessar foto de rótulo de vinho de outro usuário

## Regras de negócio

1. OCR é apenas um atalho de preenchimento — nunca salva o vinho sozinho, sempre passa pela confirmação do usuário no formulário.
2. A precisão depende da legibilidade/estilo do rótulo; não há garantia de acerto total.
3. Uva não entra na extração automática nesta versão (texto livre / blend é mais difícil de heurística) — fica de fora do parsing automático.

## Fora de escopo

- Reconhecimento de safra/uva com garantia de acerto (heurística best-effort, sem validação contra base de dados externa)
- Múltiplas fotos por vinho — apenas uma foto de rótulo por vinho nesta versão
- Edição/recorte de imagem no app — usuário deve enviar já enquadrada

## Riscos e decisões conhecidas

- **Storage de imagem**: precisa de um blob storage (ex.: Vercel Blob). Requer configuração de conta/variável de ambiente própria antes da implementação.
- **Tesseract.js roda via WASM**: tempo de execução e tamanho do pacote de idioma podem ser sensíveis em ambiente serverless (limites de tempo/tamanho de function). Validar em ambiente de deploy real antes de considerar pronta para produção.
- **Rótulos com fontes decorativas/artísticas** (comuns em vinhos) reduzem bastante a precisão do OCR tradicional comparado a uma IA de visão — trade-off aceito para não depender de API paga de visão computacional (decisão registrada em `03-plano-implementacao.md`).
- Upload que não vira um vinho salvo (usuário cancela o formulário) pode deixar uma imagem órfã no storage — aceito como débito conhecido no MVP desta feature, sem job de limpeza automática por ora.
