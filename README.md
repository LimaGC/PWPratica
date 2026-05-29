# PWPratica — Backend Biblioteca

Trabalho prático de Programação Web. Backend de uma biblioteca escolar/universitária onde utilizadores autenticados consultam e reservam livros.

- **Stack:** Node.js + Express + Knex + SQLite (modo `test`) / PostgreSQL (modo `staging`/`production`)
- **Auth:** Passport.js (`passport-jwt`) + `jwt-simple` (JWT no header `Authorization: Bearer <token>`)
- **Arquitetura:** MVC simplificado — *services* fazem o papel de model+controller, *routes* são apenas thin wrappers HTTP. Tudo é auto-carregado via `consign`.
- **Hashing de password:** `bcrypt`
- **Auto-load:** `consign` lê `src/services/*.js` e `src/routes/*.js` por convenção e injecta-os em `app.services.<nome>` / `app.routes.<nome>`.

---

## Índice

1. [Setup e arranque](#1-setup-e-arranque)
2. [Estrutura do projeto](#2-estrutura-do-projeto)
3. [Explicação ficheiro a ficheiro](#3-explicação-ficheiro-a-ficheiro)
4. [Partes mais importantes do código](#4-partes-mais-importantes-do-código)
5. [Endpoints da API](#5-endpoints-da-api)
6. [Setup completo do Postman](#6-setup-completo-do-postman)

---

## 1. Setup e arranque

```bash
cd Backend
npm install
npm run knex:test
```

O script `knex:test` faz três coisas em sequência:
1. Corre as migrations contra `data/database.sqlite`
2. Corre os seeds (cria 3 utilizadores e 3 livros de teste)
3. Arranca o server em `http://localhost:3001`

> Variáveis de ambiente em `Backend/env/test.env` (porta, etc.). O secret JWT está hard-coded em `routes/auths.js` e `config/passport.js` (`ERSC202526`) — para um trabalho académico está ok; em produção iria para `.env`.

### Outros scripts úteis
- `npm start` — arranca o server **sem** correr migrations/seeds
- `npm run knex:migrate:test` — só corre as migrations
- `npm run knex:seed:test` — só corre os seeds
- `npm run knex:staging` — equivalente em PostgreSQL (precisa do Postgres a correr localmente)

### Utilizadores de seed (password = `123456`)
- `psousa@biblioteca.pt`
- `ana@biblioteca.pt`
- `margarida@biblioteca.pt`

### Livros de seed
- *Os Lusíadas* — Luís de Camões
- *Mensagem* — Fernando Pessoa
- *Memorial do Convento* — José Saramago

---

## 2. Estrutura do projeto

```
PWPratica/
├── README.md                   ← este ficheiro
└── Backend/
    ├── package.json            ← scripts npm e dependências
    ├── knexfile.js             ← config Knex (test/staging/production)
    ├── data/
    │   └── database.sqlite     ← BD SQLite criada pelas migrations
    ├── env/
    │   └── test.env            ← PORT, HOST, etc.
    └── src/
        ├── app.js              ← bootstrap do Express + consign + error handler
        ├── server.js           ← .listen()
        ├── config.js           ← lê .env e exporta NODE_ENV/HOST/PORT
        ├── config/
        │   ├── middlewares.js  ← body-parser
        │   ├── passport.js     ← estratégia JWT
        │   └── router.js       ← regista rotas públicas e privadas
        ├── errors/
        │   ├── authenticationError.js
        │   └── validationError.js
        ├── migrations/         ← Knex migrations (uma por tabela)
        ├── seeds/test/         ← dados de demo
        ├── services/           ← lógica de negócio + acesso à BD
        └── routes/             ← endpoints HTTP (thin wrappers)
```

---

## 3. Explicação ficheiro a ficheiro

### Raiz / configuração

#### `Backend/package.json`
Define os scripts npm e dependências. As deps mais relevantes:
- `express` + `body-parser` — servidor HTTP
- `knex` + `sqlite3` + `pg` — query builder e drivers
- `consign` — auto-loader de módulos por convenção
- `passport` + `passport-jwt` + `jwt-simple` — autenticação
- `bcrypt` — hash de passwords
- `moment` — formatação de datas (estilo do projeto)
- `dotenv` — leitura de `.env`

#### `Backend/knexfile.js`
Config do Knex com **três environments**: `test` (SQLite local), `staging` (Postgres local), `production` (Postgres com vars de ambiente). Aponta migrations para `src/migrations` e seeds para `src/seeds/test`.

#### `Backend/env/test.env`
Variáveis para o ambiente de teste (PORT, HOST). Lido por `dotenv` em `config.js` e `knexfile.js`.

#### `Backend/data/database.sqlite`
Ficheiro SQLite criado/populado pelas migrations. Apaga-o e corre `npm run knex:test` outra vez para resetar tudo.

---

### Bootstrap

#### `src/server.js`
Trivial: `require('./app')` e `.listen(PORT)`. Separar `app` de `server` é a convenção que torna a app testável sem abrir porta.

#### `src/app.js`
**Coração do bootstrap.** Faz, por ordem:
1. Liga o Knex em `app.db` (`app.db = knex(knexfile[config.NODE_ENV])`)
2. Auto-carrega módulos com `consign` na ordem correta:
   ```js
   consign({ cwd: 'src' })
     .include('./config/passport.js')   // 1º: estratégia auth disponível
     .then('./config/middlewares.js')   // 2º: body-parser
     .then('./services')                // 3º: services em app.services.<nome>
     .then('./routes')                  // 4º: routes em app.routes.<nome>
     .then('./config/router.js')        // 5º: monta tudo
     .into(app);
   ```
3. Define um GET `/` de debug.
4. **Error handler global** que mapeia o `err.name` para HTTP status:
   - `validationError` → `400`
   - `authenticationError` → `400`
   - `forbiddenError` → `403`
   - resto → `500` com UUID

#### `src/config.js`
Lê `env/<NODE_ENV>.env` e exporta `{ NODE_ENV, HOST, PORT }`. Default `NODE_ENV=test`, `PORT=3001`.

---

### Configuração de runtime (`src/config/`)

#### `src/config/middlewares.js`
Aplica `body-parser.json()`. Único middleware global.

#### `src/config/passport.js`
Define a estratégia JWT do Passport. Pontos importantes:
- Token vem do header `Authorization: Bearer <token>`
- Verifica `payload.expires >= Date.now()` (manualmente; o token usa `jwt-simple` que não trata de expiry)
- Vai à BD confirmar que o utilizador (pelo email) ainda existe
- Em sucesso, injecta `req.user = payload` nas rotas privadas

#### `src/config/router.js`
**Monta todas as rotas.** Separa explicitamente públicas e privadas:
```js
app.use('/auths', app.routes.auths);              // PÚBLICA: signin
app.use('/livros', app.routes.livros_publicos);   // PÚBLICA: livros disponíveis

const standardRouter = express.Router();
standardRouter.use('/names', app.routes.names);
standardRouter.use('/contactstypes', app.routes.contacts_types);
standardRouter.use('/skills', app.routes.skills);
standardRouter.use('/livros', app.routes.livros);
standardRouter.use('/reservas', app.routes.reservas);

app.use('/v1', app.config.passport.authenticate(), standardRouter);  // PRIVADAS
```
Tudo o que está em `/v1/*` passa pelo middleware do Passport. Tudo o que está fora não.

---

### Erros (`src/errors/`)

#### `src/errors/validationError.js` e `authenticationError.js`
Construtores de erro custom, ultra-simples:
```js
module.exports = function validationError(message) {
  this.name = 'validationError';
  this.message = message;
};
```
O `name` é o que o error handler em `app.js` usa para decidir o status HTTP. Os services lançam estes erros com `throw new ValidationError('mensagem')` em vez de devolverem códigos.

---

### Migrations (`src/migrations/`)

Cada migration cria uma tabela. Knex lê pela ordem alfabética/timestamp do nome do ficheiro.

| Ficheiro | Tabela | Notas |
|---|---|---|
| `202605080950_create_table_names.js` | `names` | tabela base do exemplo do prof |
| `202605141630_alter_table_names.js` | `names` | adiciona colunas (email, password, etc.) |
| `202605151000_create_table_contacts_type.js` | `contacts_type` | |
| `202605151010_create_table_contacts.js` | `contacts` | FK para `names` e `contacts_type` |
| `202605151020_create_table_skills.js` | `skills` | FK para `names` |
| **`202605290900_create_table_utilizadores.js`** | **`utilizadores`** | **id, nome, email (unique), password, criado_em** |
| **`202605290910_create_table_livros.js`** | **`livros`** | **id, titulo, autor, isbn (unique), estado, criado_em** |
| **`202605290920_create_table_reservas.js`** | **`reservas`** | **id, utilizador_id (FK), livro_id (FK), data_reserva, estado** |

> As três tabelas a **negrito** são as do sistema da biblioteca. As outras vieram do scaffold base.

### Seeds (`src/seeds/test/`)

| Ficheiro | Tabela | O que insere |
|---|---|---|
| `01.1_names.js` | `names` | dados de exemplo |
| `02.1_contacts_types.js` | `contacts_type` | tipos (email, telefone, etc.) |
| **`03.1_utilizadores.js`** | **`utilizadores`** | **3 utilizadores com password `123456` em bcrypt** |
| **`04.1_livros.js`** | **`livros`** | **3 livros, todos `disponivel`** |

Todos os seeds são **idempotentes**: verificam se o registo já existe antes de inserir.

---

### Services (`src/services/`)

Cada service exporta uma factory `(app) => ({ findAll, findOne, save, update, remove, findByField })`. Acedem à BD via `app.db('<tabela>')`. **Toda a lógica de negócio e validações vivem aqui.**

| Ficheiro | Responsabilidade |
|---|---|
| `name.js` | CRUD de `names` (legado) |
| `contact_type.js` | CRUD de `contacts_type` |
| `skill.js` | CRUD de `skills`, com verificação de owner via `req.user` |
| **`utilizador.js`** | **CRUD de utilizadores; valida nome obrigatório** |
| **`livro.js`** | **CRUD de livros + `findAllDisponiveis()` para a rota pública; valida titulo/autor/isbn obrigatórios** |
| **`reserva.js`** | **CRUD de reservas + regras de negócio (ver secção 4)** |

### Routes (`src/routes/`)

Wrappers HTTP — recebem `req`, chamam o service, devolvem `res.json(...)`. Não têm lógica de negócio.

| Ficheiro | Endpoints | Auth |
|---|---|---|
| `auths.js` | `POST /auths/signin` | pública |
| `names.js`, `contacts_types.js`, `skills.js` | CRUD legado | privada (`/v1`) |
| **`livros_publicos.js`** | **`GET /livros`** | **pública** (só disponíveis) |
| **`livros.js`** | **`GET/POST/PUT/DELETE /v1/livros[/:id]`** | **privada** |
| **`reservas.js`** | **`GET/POST/PUT/DELETE /v1/reservas[/:id]`** | **privada, scoped por utilizador** |

---

## 4. Partes mais importantes do código

### 4.1 Auto-loading com `consign` (`src/app.js`)
```js
consign({ cwd: 'src', verbose: false })
  .include('./config/passport.js')
  .then('./config/middlewares.js')
  .then('./services')
  .then('./routes')
  .then('./config/router.js')
  .into(app);
```
A **ordem importa**: services têm de existir antes das rotas, e o router (que usa ambos) tem de ser o último. Cada ficheiro em `services/` ou `routes/` deve exportar `module.exports = (app) => {...}` e fica acessível como `app.services.<nome_ficheiro>` / `app.routes.<nome_ficheiro>`.

> Implicação prática: para criar um novo recurso basta acrescentar `services/foo.js` e `routes/foo.js` — não é preciso registar nada manualmente, exceto adicionar a linha em `config/router.js`.

### 4.2 Error handler centralizado (`src/app.js`)
```js
app.use((err, req, res, next) => {
  const { name, message } = err;
  if (name === 'validationError') res.status(400).json({ error: message });
  else if (name === 'authenticationError') res.status(400).json({ error: message });
  else if (name === 'forbiddenError') res.status(403).json({ error: message });
  else res.status(500).json({ id: uuidv4(), error: 'System error...' });
});
```
Como os services lançam `throw new ValidationError(...)` e as rotas fazem `.catch(next)` ou `try/catch + next(err)`, todos os erros caem aqui. Vantagem: zero `if/else` de status code dispersos pelas rotas.

### 4.3 Login e geração de JWT (`src/routes/auths.js`)
```js
router.post('/signin', (req, res, next) => {
  app.services.utilizador.findByField({ email: req.body.email })
    .then(async (user) => {
      if (user && bcryptUp.compareSync(req.body.password, user.password)) {
        const payload = {
          id: user.id,
          email: user.email,
          expires: Date.now() + (1000 * 60 * 60), // 1 hora
        };
        const token = jwt.encode(payload, secret);
        res.status(200).json({ token });
      } else {
        throw new AuthenticationError('Autentication Error');
      }
    }).catch((err) => next(err));
});
```
**Pontos-chave:**
- `bcryptUp.compareSync` compara a password em texto com o hash da BD.
- Payload contém o **mínimo**: `id`, `email`, `expires`. É ele que vais ter em `req.user` em todas as rotas privadas.
- Em vez de `jsonwebtoken` standard usa-se `jwt-simple` (já existente no scaffold) — não suporta `exp` automático, daí o campo manual `expires` que o passport valida.

### 4.4 Validação do JWT (`src/config/passport.js`)
```js
const strategy = new Strategy(params, (payload, done) => {
  if (new Date() >= payload.expires) done(null, false);   // expirado

  app.services.utilizador.findByField({ email: payload.email })
    .then((user) => {
      if (user) done(null, { ...payload });               // user.req = payload
      else done(null, false);
    }).catch((err) => done(err, false));
});
```
Verifica expiry **e** confirma que o user ainda existe na BD (caso tenha sido apagado depois do token ter sido emitido). Em sucesso, o `payload` (com `id` e `email`) fica em `req.user`.

### 4.5 Regras de negócio das reservas (`src/services/reserva.js`)
Esta é a peça com mais lógica:

**Criar reserva** — dois efeitos numa só operação:
```js
const save = async (dataset, token) => {
  if (!dataset.livro_id) throw new ValidationError('O campo [Livro Id] é obrigatório!');

  const livro = await app.db('livros').where('id', dataset.livro_id).first();
  if (!livro) throw new ValidationError('Livro não encontrado!');
  if (livro.estado !== 'disponivel') throw new ValidationError('Livro não está disponível!');

  const newDataset = {
    utilizador_id: token.id,            // veio do JWT, nunca do body
    livro_id: dataset.livro_id,
    estado: 'ativa',
    data_reserva: moment().format("YYYY-MM-DD HH:mm:ss"),
  };
  const result = await app.db('reservas').insert(newDataset, '*');
  await app.db('livros').where('id', dataset.livro_id).update({ estado: 'reservado' });
  return result;
};
```
Notas:
- `utilizador_id` vem **sempre do token**, nunca do `req.body` — impede um utilizador de criar reservas em nome de outro.
- Verifica que o livro existe e está disponível antes de inserir.
- O update do livro para `'reservado'` acontece no mesmo handler. (Para um sistema mais robusto seria uma transaction.)

**Cancelar / apagar** — devolve o livro a `disponivel`:
```js
const update = async (id, dataset, token) => {
  const reserva = await app.db('reservas').where('id', id).first();
  if (!reserva) throw new ValidationError('Reserva não encontrada!');
  if (reserva.utilizador_id != token.id) throw new ValidationError('Não tem permissão para atualizar');

  const newDataset = { ...dataset };
  const result = await app.db('reservas').where('id', id).update(newDataset, '*');

  if (newDataset.estado === 'cancelada' && reserva.estado === 'ativa') {
    await app.db('livros').where('id', reserva.livro_id).update({ estado: 'disponivel' });
  }
  return result;
};
```
Verificação dupla: **owner** (a reserva é do utilizador autenticado?) e **transição válida** (de `ativa` → `cancelada` é que devolve o livro).

### 4.6 Scoping por utilizador (`src/services/reserva.js`)
```js
const findAll = async (token) => {
  return app.db('reservas').select('*').where('utilizador_id', token.id);
};
```
`GET /v1/reservas` nunca devolve reservas de outros utilizadores — o filtro está no service, não dependente de query params do cliente.

---

## 5. Endpoints da API

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `POST` | `/auths/signin` | – | Login. Devolve `{ token }`. |
| `GET`  | `/livros` | – | Lista livros com `estado='disponivel'`. |
| `GET`  | `/v1/livros` | JWT | Lista todos os livros. |
| `GET`  | `/v1/livros/:id` | JWT | Detalhes de um livro. |
| `POST` | `/v1/livros` | JWT | Criar livro. |
| `PUT`  | `/v1/livros/:id` | JWT | Atualizar livro. |
| `DELETE` | `/v1/livros/:id` | JWT | Apagar livro. |
| `GET`  | `/v1/reservas` | JWT | Reservas **do utilizador autenticado**. |
| `GET`  | `/v1/reservas/:id` | JWT | Detalhe (só se for dele). |
| `POST` | `/v1/reservas` | JWT | Criar reserva (livro passa a `reservado`). |
| `PUT`  | `/v1/reservas/:id` | JWT | Atualizar / cancelar (livro volta a `disponivel`). |
| `DELETE` | `/v1/reservas/:id` | JWT | Apagar (livro volta a `disponivel` se estava `ativa`). |

---

## 6. Setup completo do Postman

### 6.1 Criar a Collection

1. Abre o Postman → painel **Collections** → botão **+** → **Blank Collection**
2. Nome: **`Biblioteca PW`**
3. Cria 3 pastas (botão direito na collection → *Add folder*):
   - `Auth`
   - `Livros`
   - `Reservas`

### 6.2 Criar o Environment

1. Painel **Environments** → botão **+**
2. Nome: **`Biblioteca Local`**
3. Adiciona estas variáveis:

| Variable | Type | Initial value | Current value |
|---|---|---|---|
| `base_url` | default | `http://localhost:3001` | `http://localhost:3001` |
| `token` | secret | *(vazio)* | *(vazio)* |

4. **Save** e selecciona o environment no dropdown do canto superior direito.

### 6.3 Configurar autenticação ao nível da Collection

1. Click na collection **Biblioteca PW** → tab **Authorization**
2. **Type:** `Bearer Token`
3. **Token:** `{{token}}`
4. **Save**

> Assim, todos os requests **herdam** a auth automaticamente. Os públicos (signin e GET /livros) trocam para `No Auth` individualmente — passo 6.5.

### 6.4 Auto-save do token no signin

No request **POST `/auths/signin`** (criado a seguir), tab **Tests**:

```javascript
const res = pm.response.json();
if (res && res.token) {
  pm.environment.set("token", res.token);
  console.log("Token guardado:", res.token.substring(0, 20) + "...");
}
```

Sempre que correres o signin, o token é gravado em `{{token}}` e todos os requests privados passam a usá-lo.

### 6.5 Criar os requests

> Para todos: **Headers** → `Content-Type: application/json` (o Postman costuma adicionar automaticamente quando há body JSON).

#### Pasta `Auth`

**POST Signin** *(público — Auth: No Auth)*
- URL: `{{base_url}}/auths/signin`
- Body → raw → JSON:
  ```json
  {
    "email": "psousa@biblioteca.pt",
    "password": "123456"
  }
  ```
- Tests: o script da secção 6.4
- Resposta esperada (200):
  ```json
  { "token": "eyJ0eXAiOiJKV1Qi..." }
  ```

#### Pasta `Livros`

**GET Listar disponíveis** *(público — Auth: No Auth)*
- URL: `{{base_url}}/livros`

**GET Listar todos** *(privado)*
- URL: `{{base_url}}/v1/livros`

**GET Detalhe** *(privado)*
- URL: `{{base_url}}/v1/livros/1`

**POST Criar** *(privado)*
- URL: `{{base_url}}/v1/livros`
- Body:
  ```json
  {
    "titulo": "Os Maias",
    "autor": "Eça de Queirós",
    "isbn": "978-972-0-04000-3",
    "estado": "disponivel"
  }
  ```

**PUT Atualizar** *(privado)*
- URL: `{{base_url}}/v1/livros/1`
- Body:
  ```json
  {
    "titulo": "Os Lusíadas (edição revista)"
  }
  ```

**DELETE Apagar** *(privado)*
- URL: `{{base_url}}/v1/livros/1`

#### Pasta `Reservas`

**GET Listar minhas** *(privado)*
- URL: `{{base_url}}/v1/reservas`

**GET Detalhe** *(privado)*
- URL: `{{base_url}}/v1/reservas/1`

**POST Criar** *(privado)*
- URL: `{{base_url}}/v1/reservas`
- Body:
  ```json
  {
    "livro_id": 1
  }
  ```
- *Side effect:* o livro passa a `estado: "reservado"`.

**PUT Cancelar** *(privado)*
- URL: `{{base_url}}/v1/reservas/1`
- Body:
  ```json
  {
    "estado": "cancelada"
  }
  ```
- *Side effect:* o livro volta a `disponivel`.

**DELETE Apagar** *(privado)*
- URL: `{{base_url}}/v1/reservas/1`

### 6.6 Fluxo completo de teste recomendado

Corre esta sequência para validar tudo numa passagem:

1. **POST Signin** → token gravado automaticamente
2. **GET /livros** → vê os 3 livros do seed (todos `disponivel`)
3. **POST /v1/reservas** com `{ "livro_id": 1 }` → cria reserva
4. **GET /livros** → o livro 1 já não aparece (passou a `reservado`)
5. **GET /v1/livros/1** → confirma `estado: "reservado"`
6. **GET /v1/reservas** → vê a tua reserva
7. **PUT /v1/reservas/1** com `{ "estado": "cancelada" }` → cancela
8. **GET /livros** → o livro 1 volta a aparecer
9. **DELETE /v1/reservas/1** → apaga (já estava cancelada, não mexe no livro)

### 6.7 Troubleshooting

| Problema | Causa provável | Solução |
|---|---|---|
| `401 Unauthorized` em rotas `/v1/*` | Token expirado (1h) ou em falta | Corre o signin outra vez |
| `400 Autentication Error` | Email/password errados | Confirma seeds, password é `123456` |
| `400 Livro não está disponível!` | Livro já reservado | Cancela a reserva existente primeiro |
| `400 Não tem permissão para...` | Estás autenticado como utilizador A a tentar mexer em reserva do utilizador B | Faz signin com o utilizador correto |
| `ECONNREFUSED localhost:3001` | Server não está a correr | `npm run knex:test` no `Backend/` |
