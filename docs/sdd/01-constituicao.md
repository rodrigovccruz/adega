# Constituição do Projeto (SDD)

Regras permanentes. Toda spec, design e implementação deve respeitar estes princípios.

## Princípios de produto

1. **Adega pessoal primeiro** — cada usuário vê e gerencia apenas os próprios vinhos.
2. **Vinho + mesa** — o valor central é ligar o rótulo à sugestão gastronômica; inventário sem pairing é incompleto.
3. **Simplicidade operacional** — fluxos curtos: cadastrar, ajustar quantidade, sugerir prato, buscar.
4. **Clareza sobre cleverness** — UI legível e direta; sem dashboards densos no MVP.

## Princípios técnicos

1. **Spec antes do código** — nenhuma feature entra sem spec com critérios de aceite.
2. **Uma feature, um incremento** — cada PR implementa uma fatia vertical testável.
3. **Segurança por padrão** — senhas hasheadas; rotas protegidas; sem vazamento entre usuários.
4. **Dados do usuário são privados** — autorização sempre no servidor, nunca só na UI.
5. **Stack web moderna e enxuta** — preferir um monólito full-stack tipado a microserviços no MVP.

## Princípios de qualidade

1. Critérios de aceite devem ser verificáveis (pass/fail).
2. Fluxos críticos (auth, CRUD vinho, pairing) precisam de testes automatizados.
3. Acessibilidade básica: formulários com labels, contraste legível, navegação por teclado.
4. Responsivo: uso confortável em desktop e mobile.

## Anti-padrões (evitar)

- Feature sem spec ou sem critérios de aceite
- Auth só no frontend
- Cards e widgets decorativos sem função
- Over-engineering (cache distribuído, filas, etc.) antes de necessidade real
- Misturar dados de usuários diferentes na mesma query sem filtro de `userId`

## Idioma

- Specs e docs do produto: **português**
- Código (identificadores, commits técnicos): **inglês**
- UI do produto: **português (Brasil)**
