# javascriptCRM_backend

## Running the server

Install dependencies and start the API:

```sh
npm install
npm start
```

The server listens on port `9001` by default. Set `PORT` to use another port.
At startup, it reads `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and
`DB_NAME` from `.env`, creates the database if needed, and ensures the
`companies` and `contacts` tables have their required columns.
The API allows cross-origin requests from any origin and handles browser
preflight requests.
Set `JWT_SECRET` to a random secret of at least 32 bytes and
`EMAIL_ENCRYPTION_KEY` to a base64-encoded random 32-byte key in `.env`. For
example, generate both values with:

```sh
node -e "const c=require('node:crypto'); console.log('JWT_SECRET='+c.randomBytes(32).toString('base64')); console.log('EMAIL_ENCRYPTION_KEY='+c.randomBytes(32).toString('base64'))"
```

Keep these secrets private and persistent; changing either will invalidate
existing login tokens or make stored user emails unreadable, respectively.

The API reads and writes companies and contacts in these PostgreSQL tables, so
changes persist across server restarts. During initial setup, the three sample
companies and contacts are inserted only if both tables are empty. This seed
is recorded once, so deleting all records does not recreate them on restart.

User accounts are stored in the `users` table. Passwords are hashed with
bcrypt, and email addresses are encrypted at rest with AES-256-GCM.

## API

Base URL: `http://localhost:9001`

All responses use JSON. Successful responses have this shape:

```json
{
  "success": true,
  "result": {}
}
```

### Authentication

Create an account with `POST /auth/register`, providing a username, password,
and email. Usernames are case-insensitive, 3-32 characters, and may contain
letters, numbers, `.`, `_`, or `-`. Passwords must be 12-72 bytes.

```sh
curl -X POST http://localhost:9001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"taylor","password":"a-long-unique-password","email":"taylor@example.com"}'
```

Log in with `POST /auth/login` to receive a one-hour bearer token:

```sh
curl -X POST http://localhost:9001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"taylor","password":"a-long-unique-password"}'
```

Send the returned token in the `Authorization: Bearer <token>` header for all
`/contacts` and `/companies` requests. The greeting and authentication routes
remain public.

Errors have this shape, with `errorCode` matching the HTTP status:

```json
{
  "success": false,
  "errorCode": 404,
  "result": {
    "message": "Contact not found"
  }
}
```

For `POST` and `PATCH` requests, send a JSON body with
`Content-Type: application/json`.

### Health / greeting

#### `GET /`

Returns a greeting. No parameters or body are required.

```sh
curl http://localhost:9001/
```

Success: `200 OK`, with `result` containing `{ "message": "Hello World!" }`.

### Contacts

Contact objects have this shape:

| Property | Requirement | Description |
| --- | --- | --- |
| `id` | Generated | UUID assigned by the server |
| `firstName` | Required on create | Contact's first name |
| `lastName` | Required on create | Contact's last name |
| `email` | Optional | Email address |
| `phone` | Optional | Phone number |
| `companyId` | Optional | UUID of the associated company |
| `company` | Response only | Name of the associated company, when present |
| `createdAt` | Generated | Creation time in ISO 8601 format |
| `updatedAt` | Generated | Last update time in ISO 8601 format |

Names must be non-empty strings when creating a contact. The API does not trim
or validate their format. Email and phone values are not format-checked.
`companyId` must be a UUID belonging to an existing company. A contact can
reference zero or one company. Multiple contacts can reference the same
company. Set `companyId` to `null` to remove the association; deleting a
company also clears the association on its contacts.
The response's `company` is the associated company name (or legacy text for
unmatched values migrated from the previous schema).

#### `GET /contacts`

Lists all contacts. No parameters or body are required.

```sh
curl http://localhost:9001/contacts
```

Success: `200 OK`, with `result` as an array of contacts.

#### `GET /contacts/:id`

Returns one contact. Replace `:id` with the contact's `id`; no request body is
required.

```sh
curl http://localhost:9001/contacts/CONTACT_ID
```

Success: `200 OK`. Errors: `400` for a missing/invalid ID or `404` if no
contact has that ID.

#### `POST /contacts`

Creates a contact. `firstName` and `lastName` are required; `email`, `phone`,
and `companyId` are optional. Supply the UUID of an existing company to
associate it. Replace `COMPANY_UUID` below with the `id` from `GET /companies`.
The server generates `id`, `createdAt`, and `updatedAt`.

```sh
curl -X POST http://localhost:9001/contacts \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Taylor",
    "lastName": "Lee",
    "email": "taylor.lee@example.com",
    "phone": "555-0100",
    "companyId": "COMPANY_UUID"
  }'
```

Success: `201 Created`, with the created contact in `result`. Error: `400` if
`firstName` or `lastName` is missing/empty, or `companyId` is not a UUID.
Error: `404` if `companyId` does not identify an existing company.

#### `PATCH /contacts/:id`

Updates the supplied contact properties; omitted properties are unchanged.
Use the contact's `id` in the path. The body may contain any subset of
`firstName`, `lastName`, `email`, `phone`, and `companyId`. Set `companyId` to
an existing company's UUID to associate the contact, or `null` to clear the
association.

```sh
curl -X PATCH http://localhost:9001/contacts/CONTACT_ID \
  -H "Content-Type: application/json" \
  -d '{"companyId": "COMPANY_UUID"}'
```

Success: `200 OK`, with the updated contact in `result`. Errors: `400` for a
missing/invalid ID, a non-object body, an empty supplied name, or an invalid
`companyId`; `404` if the contact or associated company does not exist. Other
update fields are not validated.

#### `DELETE /contacts/:id`

Deletes the contact identified by `id`. No request body is required.

```sh
curl -X DELETE http://localhost:9001/contacts/CONTACT_ID
```

Success: `200 OK`, with `{ "id": "...", "deleted": true }` in `result`.
Errors: `400` for a missing/invalid ID or `404` if no contact has that ID.

### Companies

Company objects have this shape:

| Property | Requirement | Description |
| --- | --- | --- |
| `id` | Generated | UUID assigned by the server |
| `name` | Required by the input contract | Company name |
| `industry` | Optional | Industry |
| `website` | Optional | Website URL |
| `phone` | Optional | Phone number |
| `address` | Optional | Postal address |
| `contactIds` | Response only | UUIDs of contacts associated with the company |
| `createdAt` | Generated | Creation time in ISO 8601 format |
| `updatedAt` | Generated | Last update time in ISO 8601 format |

Each company can be associated with multiple contacts through their
`companyId`. Every company response includes `contactIds`, which is empty if
the company has no contacts. Creating or updating a contact's `companyId`
updates this association automatically. Company properties are intended to be
strings. The API requires a non-empty `name` when creating or updating a
company. It does not validate optional properties or check website and phone
formats.

#### `GET /companies`

Lists all companies. No parameters or body are required.

```sh
curl http://localhost:9001/companies
```

Success: `200 OK`, with `result` as an array of companies.

#### `GET /companies/:id`

Returns one company. Replace `:id` with the company's `id`; no request body is
required.

```sh
curl http://localhost:9001/companies/COMPANY_ID
```

Success: `200 OK`. Errors: `400` for a missing/invalid ID or `404` if no
company has that ID.

#### `POST /companies`

Creates a company. The input contract requires `name`; `industry`, `website`,
`phone`, and `address` are optional. The server generates `id`, `createdAt`,
and `updatedAt`. `name` must be a non-empty string.

```sh
curl -X POST http://localhost:9001/companies \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Example Company",
    "industry": "Technology",
    "website": "https://example.com",
    "phone": "555-0200",
    "address": "10 Main Street"
  }'
```

Success: `201 Created`, with the created company in `result`. Error: `400` if
the body is not an object or `name` is missing/empty.

#### `PATCH /companies/:id`

Updates the supplied company properties; omitted properties are unchanged.
Use the company's `id` in the path. The body may contain any subset of `name`,
`industry`, `website`, `phone`, and `address`. A supplied `name` must be a
non-empty string; optional properties are not validated.

```sh
curl -X PATCH http://localhost:9001/companies/COMPANY_ID \
  -H "Content-Type: application/json" \
  -d '{"industry": "Design"}'
```

Success: `200 OK`, with the updated company in `result`. Errors: `400` for a
missing/invalid ID, a non-object body, or an empty supplied name; `404` if no
company has that ID.

#### `DELETE /companies/:id`

Deletes the company identified by `id`. No request body is required.

```sh
curl -X DELETE http://localhost:9001/companies/COMPANY_ID
```

Success: `200 OK`, with `{ "id": "...", "deleted": true }` in `result`.
Errors: `400` for a missing/invalid ID or `404` if no company has that ID.
Deleting a company sets `companyId` to `null` for its contacts.
