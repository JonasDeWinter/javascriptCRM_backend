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

The current API stores companies and contacts in memory, not in those database
tables. It starts with three sample records of each type. Changes made through
the API are cleared when the server restarts, and the sample records are
recreated.

## API

Base URL: `http://localhost:9001`

All responses use JSON. Successful responses have this shape:

```json
{
  "success": true,
  "result": {}
}
```

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
| `company` | Optional | Company name |
| `createdAt` | Generated | Creation time in ISO 8601 format |
| `updatedAt` | Generated | Last update time in ISO 8601 format |

Names must be non-empty/truthy values when creating a contact. The API does
not trim or validate their format. Optional fields are not checked for email,
phone, or other formats.

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

Creates a contact. `firstName` and `lastName` are required; all other
properties are optional. The server generates `id`, `createdAt`, and
`updatedAt`.

```sh
curl -X POST http://localhost:9001/contacts \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Taylor",
    "lastName": "Lee",
    "email": "taylor.lee@example.com",
    "phone": "555-0100",
    "company": "Northstar Design"
  }'
```

Success: `201 Created`, with the created contact in `result`. Error: `400` if
`firstName` or `lastName` is missing or empty.

#### `PATCH /contacts/:id`

Updates the supplied contact properties; omitted properties are unchanged.
Use the contact's `id` in the path. The body may contain any subset of
`firstName`, `lastName`, `email`, `phone`, and `company`.

```sh
curl -X PATCH http://localhost:9001/contacts/CONTACT_ID \
  -H "Content-Type: application/json" \
  -d '{"phone": "555-0110"}'
```

Success: `200 OK`, with the updated contact in `result`. Errors: `400` for a
missing/invalid ID or `404` if no contact has that ID. Update fields are not
validated.

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
| `createdAt` | Generated | Creation time in ISO 8601 format |
| `updatedAt` | Generated | Last update time in ISO 8601 format |

Company properties are intended to be strings. The current API does not
validate company fields, including the required `name`, or check website and
phone formats.

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
and `updatedAt`. Note that the current handler does not enforce the required
`name`.

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

Success: `201 Created`, with the created company in `result`.

#### `PATCH /companies/:id`

Updates the supplied company properties; omitted properties are unchanged.
Use the company's `id` in the path. The body may contain any subset of `name`,
`industry`, `website`, `phone`, and `address`. Fields are not validated.

```sh
curl -X PATCH http://localhost:9001/companies/COMPANY_ID \
  -H "Content-Type: application/json" \
  -d '{"industry": "Design"}'
```

Success: `200 OK`, with the updated company in `result`. Errors: `400` for a
missing/invalid ID or `404` if no company has that ID.

#### `DELETE /companies/:id`

Deletes the company identified by `id`. No request body is required.

```sh
curl -X DELETE http://localhost:9001/companies/COMPANY_ID
```

Success: `200 OK`, with `{ "id": "...", "deleted": true }` in `result`.
Errors: `400` for a missing/invalid ID or `404` if no company has that ID.
