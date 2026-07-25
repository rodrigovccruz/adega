# Spec 01 — Autenticação

## Status

`implementada`

## Objetivo

Permitir que o usuário crie conta, entre com e-mail e senha, e acesse apenas a própria adega.

## História de usuário

Como visitante, quero me cadastrar e entrar com usuário e senha para manter minha coleção de vinhos privada.

## Requisitos funcionais

| ID | Requisito |
|----|-----------|
| AUTH-01 | Cadastro com nome, e-mail e senha |
| AUTH-02 | Login com e-mail e senha |
| AUTH-03 | Logout encerra a sessão |
| AUTH-04 | Sessão persistente entre refreshes (cookie/token httpOnly) |
| AUTH-05 | Rotas da adega exigem usuário autenticado |
| AUTH-06 | E-mail único no sistema |
| AUTH-07 | Senha com mínimo de 8 caracteres |

## Requisitos não funcionais

| ID | Requisito |
|----|-----------|
| AUTH-N1 | Senha armazenada com hash seguro (bcrypt/argon2) |
| AUTH-N2 | Mensagens de erro não revelam se o e-mail existe no login |
| AUTH-N3 | Proteção básica contra brute-force no login (rate limit simples) |

## Critérios de aceite

- [x] Cadastro com dados válidos cria conta e autentica o usuário
- [x] Cadastro com e-mail já usado retorna erro claro
- [x] Login com credenciais corretas abre a adega
- [x] Login com credenciais inválidas mostra erro genérico
- [x] Acessar `/vinhos` sem sessão redireciona para login
- [x] Logout impede acesso às rotas protegidas
- [x] Senha nunca é retornada em respostas da API

## Fora de escopo

- OAuth / login social
- Recuperação de senha por e-mail (backlog imediato pós-MVP)
- 2FA
