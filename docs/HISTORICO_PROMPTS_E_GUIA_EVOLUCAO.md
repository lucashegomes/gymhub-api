# Historico De Prompts E Guia De Evolucao - Gymhub API

## 1) Historico De Prompts

### 2026-03-06 - Prompt 1
**Solicitacao:**
"Aprimore o projeto gymhub-api para expor uma API que seja consumida pelo projeto gymhub. Leia esse projeto e crie os recursos, módulos e serviços necessários para atendê-lo"

**O que foi entregue:**
- Nova API REST para o dominio Gymhub com CRUD de:
  - `students`
  - `teachers`
  - `courses`
  - `classes`
  - `checkins`
- Paginacao, busca e ordenacao (`page`, `pageSize`, `search`, `sortBy`, `sortOrder`).
- Validacoes de relacionamento e regras de negocio.
- Store em memoria com seed inicial.
- Endpoint de reset para ambiente local: `POST /api/dev/reset`.
- CORS habilitado para consumo por frontend.
- Padronizacao de resposta de erro (`message`, `statusCode`, `errors?`).

### 2026-03-06 - Prompt 2
**Solicitacao:**
"Agora quero que crie um arquivo com o histórico de prompts e orientações gerais do que foi usado e como modificar o projeto para futuras versões"

**O que foi entregue:**
- Este documento com historico e orientacoes de evolucao.

---

## 2) Estrutura Tecnica Criada

### Rotas
- `src/routes/gymhubRoutes.js`
- Prefixo: `/api`

Padrao por recurso:
- `GET /<resource>`
- `GET /<resource>/:id`
- `POST /<resource>`
- `PUT /<resource>/:id`
- `PATCH /<resource>/:id`
- `DELETE /<resource>/:id`

Recursos atuais:
- `/students`
- `/teachers`
- `/courses`
- `/classes`
- `/checkins`

### Modulos
- `src/modules/gymhub/controllers/*`
- `src/modules/gymhub/services/*`
- `src/modules/gymhub/data/*`
- `src/modules/gymhub/utils/*`

### Integracao No App
- `src/app.js`
  - `app.use('/api', gymhubRoutes)`
  - `app.use('/api/gympass', gympassRoutes)`

### Erros
- `src/lib/appError.js`
- `src/middlewares/errorHandler.js`

---

## 3) Regras De Negocio Implementadas

- Curso exige `teacherId` existente.
- Aula exige `teacherId` e `courseId` existentes.
- `classes.capacity` nao pode ser maior que `courses.capacity`.
- Check-in exige `studentId` e `classId` existentes.
- Check-in duplicado (mesmo aluno + mesma aula) e bloqueado.
- Exclusao com dependencias retorna conflito (`409`).

---

## 4) Contrato De Resposta

### Listagem
```json
{
  "data": [],
  "total": 0,
  "page": 1,
  "pageSize": 10,
  "totalPages": 1
}
```

### CRUD (create/update/delete/getById)
```json
{
  "data": {},
  "success": true,
  "message": "Created"
}
```

### Erro
```json
{
  "message": "Descricao do erro",
  "statusCode": 400,
  "errors": {}
}
```

---

## 5) Como Evoluir Para Futuras Versoes

## 5.1 Adicionar Novo Recurso (ex.: `plans`)
1. Criar service em `src/modules/gymhub/services/plansService.js` (herdando `BaseEntityService`).
2. Registrar no `src/modules/gymhub/services/index.js`.
3. Criar controller via `createEntityController` em `src/modules/gymhub/controllers/index.js`.
4. Montar rotas no `src/routes/gymhubRoutes.js` com `mountCrud('/plans', plansController)`.
5. Se precisar seed, incluir em `src/modules/gymhub/data/seedData.js` e no store.
6. Atualizar `README.md` e este historico.

## 5.2 Alterar Regra De Negocio
- Centralize em `services/*Service.js`.
- Use `throw new AppError('mensagem', statusCode)` para manter padrao de erro.
- Evite regra em controller/rota.

## 5.3 Migrar De Memoria Para Banco
1. Manter contrato das rotas e payloads.
2. Substituir `InMemoryStore` por camada de repositorio (Prisma/TypeORM/Knex).
3. Preservar assinatura dos services (`list/getById/create/update/delete`).
4. Criar migracoes e seed equivalentes.
5. Manter `POST /api/dev/reset` apenas em ambiente de desenvolvimento (ou remover).

## 5.4 Versionamento De API
- Quando houver quebra de contrato, criar prefixo de versao:
  - `/api/v1` (legado)
  - `/api/v2` (novo)
- Evite breaking changes sem versao.

## 5.5 Convivencia Com Integracao Gympass
- As rotas Gympass continuam em `/api/gympass`.
- Evite misturar regras de dominio Gymhub com proxy Gympass.
- Se houver correlacao (ex.: checkin local + Gympass), crie um service orquestrador especifico.

---

## 6) Checklist Antes De Publicar Nova Versao

- Validar contrato de resposta com frontend `gymhub`.
- Testar casos de erro (400, 404, 409).
- Testar filtros de listagem (`search`, `sortBy`, `sortOrder`, `page`, `pageSize`).
- Revisar impacto em seeds e dados dependentes.
- Atualizar `README.md` e este arquivo com novo prompt/escopo.

---

## 7) Convencoes Recomendadas

- Nomes de arquivo: `camelCase.js` para services/controllers utilitarios.
- Mensagens de erro claras e deterministicas.
- Regras de dominio apenas em `services`.
- Controllers sem logica de negocio (apenas adaptacao HTTP).
- Uma fonte de verdade do contrato no backend + validacao no frontend.

---

## 8) Registro De Alteracao Deste Documento

- 2026-03-06: criacao inicial do historico e guia de evolucao.
