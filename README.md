# Gymhub API

Serviço Node/Express para consumir os recursos da Gympass (Booking API, Access Control API, Setup API) e expor uma API própria para gerenciamento.

## Requisitos

- Node.js 18+
- PostgreSQL
- Credenciais de API da Gympass

## Configuração

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Copie o arquivo de exemplo `.env` e configure as variáveis de ambiente:
   ```bash
   cp .env.example .env
   ```
3. Preencha as variáveis obrigatórias no arquivo `.env`:
   - `GYMPASS_API_KEY`
   - `GYMPASS_WEBHOOK_SECRET` (opcional, para validação de assinatura)
   - Configurações do banco de dados: `DATABASE_HOST`, `DATABASE_USER`, `DATABASE_PASSWORD`, etc.

## Execução

Para iniciar o servidor em modo de desenvolvimento:
```bash
npm run dev
```

### Endpoints de Healthcheck

- Verificar status da API:
  ```bash
  GET /health
  ```
- Verificar status do banco de dados:
  ```bash
  GET /health/db
  ```

### Scripts Úteis

- Testar conexão com o banco de dados:
  ```bash
  npm run db:check
  ```
- Executar migrations:
  ```bash
  npm run migrate
  ```

Migrations (criação/alteração de tabelas):

```bash
npm run migrate
npm run migrate:status
```

Arquivos SQL de migration ficam em `src/database/migrations`.

## Auth, RBAC E Auditoria

Novos módulos:
- `src/modules/auth`
- `src/modules/users`
- `src/modules/roles`
- `src/modules/permissions`
- `src/modules/featureFlags`
- `src/modules/logs`
- `src/modules/menus`

Middlewares:
- `authMiddleware` (JWT)
- `permissionMiddleware` (RBAC/resource-action e screen)

Principais endpoints:
- `POST /api/auth/login` (email ou cpf + senha)
- `GET /api/auth/me`
- `POST /api/auth/request-password-reset`
- `POST /api/auth/reset-password`
- `GET|POST|PATCH|DELETE /api/users`
- `POST /api/users/:id/photo` (multipart/form-data)
- `GET|POST|PATCH|DELETE /api/roles`
- `PUT /api/roles/:id/permissions`
- `PUT /api/roles/:id/feature-flags`
- `GET|POST|PATCH|DELETE /api/permissions`
- `GET|POST|PATCH|DELETE /api/feature-flags`
- `GET /api/logs`
- `GET /api/menus/me`

Scripts:
- `npm run migrate`
- `npm run migrate:status`
- `npm run auth:bootstrap`

Migrations agora ficam em:
- `src/database/migrations`

## API exposta

Prefixo base para Gymhub (CRUD): `/api`

Fluxo de comunicação:
- Frontend (`gymhub`) chama `VITE_API_URL` (ex.: `http://localhost:3300/api`).
- Rotas Express recebem requisições em `/api/*`.
- Serviços do módulo `src/modules/gymhub/services` persistem dados no PostgreSQL.
- Banco é versionado por migrations SQL em `src/db/migrations`.

### Recursos Gymhub

Todos os recursos suportam:
- `GET /:resource?page=1&pageSize=10&search=&sortBy=&sortOrder=asc|desc`
- `GET /:resource/:id`
- `POST /:resource`
- `PUT /:resource/:id`
- `PATCH /:resource/:id`
- `DELETE /:resource/:id`

Recursos disponíveis:
- `/students`
- `/teachers`
- `/courses`
- `/classes`
- `/checkins`

Formato de retorno:
- Listagem: `{ data, total, page, pageSize, totalPages }`
- CRUD: `{ data, success, message }`
- Erro: `{ message, statusCode, errors? }`

Validações de negócio implementadas:
- Curso exige `teacherId` válido.
- Aula exige `teacherId` e `courseId` válidos.
- Capacidade da aula (`classes.capacity`) não pode ultrapassar a capacidade do curso (`courses.capacity`).
- Check-in exige `studentId` e `classId` válidos.
- Check-in duplicado (mesmo aluno + mesma aula) é bloqueado.
- Exclusão com dependências (ex: curso com aula, aluno com check-in) retorna `409`.

Endpoint auxiliar para ambiente local:
- `POST /api/dev/reset` (recarrega dados seed em memória)

Prefixo base para integração Gympass: `/api/gympass`

### Classes

- `POST /gyms/:gymId/classes`
- `GET /gyms/:gymId/classes`
- `GET /gyms/:gymId/classes/:classId?showDeleted=false`
- `PUT /gyms/:gymId/classes/:classId`

### Slots

- `POST /gyms/:gymId/classes/:classId/slots`
- `GET /gyms/:gymId/classes/:classId/slots?from=...&to=...`
- `GET /gyms/:gymId/classes/:classId/slots/:slotId`
- `PATCH /gyms/:gymId/classes/:classId/slots/:slotId`
- `PUT /gyms/:gymId/classes/:classId/slots/:slotId`
- `DELETE /gyms/:gymId/classes/:classId/slots/:slotId`

### Bookings

- `PATCH /gyms/:gymId/bookings/:bookingNumber`

### Produtos

- `GET /gyms/:gymId/products`

### Access Control (check-in)

- `POST /gyms/:gymId/checkins/validate`

Body esperado:

```json
{
  "gympass_id": "1000000000001"
}
```

### Webhook Gympass

- `POST /webhooks/gympass`

Se `GYMPASS_WEBHOOK_SECRET` estiver configurado, o serviço valida `x-gympass-signature` com HMAC SHA1 do body bruto.

## Exemplo rápido (criar classe)

```bash
curl --request POST \
  --url http://localhost:3000/api/gympass/gyms/42/classes \
  --header 'Content-Type: application/json' \
  --data '{
    "classes": [
      {
        "name": "Test Class",
        "description": "Test class description",
        "notes": "Test class notes",
        "bookable": true,
        "visible": true,
        "is_virtual": true,
        "product_id": 100003
      }
    ]
  }'
```

## Execucao com Docker

Arquivos adicionados:
- `Dockerfile`
- `docker-compose.yml`
- `.dockerignore`

### Subir ambiente

```bash
docker compose up --build
```

API disponivel em:
- `http://localhost:3000`

### Encerrar

```bash
docker compose down
```

### Subir API + Frontend juntos

Use o compose unificado (requer o projeto `../gymhub` existente):

```bash
docker compose -f docker-compose.local.yml up --build
```

Servicos:
- API: `http://localhost:3000`
- Frontend: `http://localhost:5173`
