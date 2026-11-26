# javascriptCRM_backend

## Contacts

The API starts with three sample contacts and companies and stores data in
memory. Changes are cleared when the server restarts, and the sample data is
recreated.

Successful requests return `{ "success": true, "result": ... }`. Errors return
`{ "success": false, "errorCode": 404, "result": { "message": "..." } }`, with
`errorCode` matching the HTTP status code.

- `GET /contacts` - list contacts
- `GET /contacts/:id` - retrieve a contact
- `POST /contacts` - create a contact with `firstName` and `lastName`; `email`,
  `phone`, and `company` are optional
- `PATCH /contacts/:id` - update one or more contact fields
- `DELETE /contacts/:id` - delete a contact

## Companies

- `GET /companies` - list companies
- `GET /companies/:id` - retrieve a company
- `POST /companies` - create a company with `name`; `industry`, `website`,
  `phone`, and `address` are optional
- `PATCH /companies/:id` - update one or more company fields
- `DELETE /companies/:id` - delete a company
