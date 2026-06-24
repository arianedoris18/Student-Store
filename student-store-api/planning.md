# Student Store API System Spec

## Section 1: Data Models

### Product
- **Purpose:** Represents an individual product available in the store catalog.
- **Fields:**
  - `id`: `Int`, required, primary key, auto-increment (`@id @default(autoincrement())`)
  - `name`: `String`, required
  - `description`: `String`, required
  - `price`: `Float`, required
  - `image_url`: `String`, required
  - `category`: `String`, required
  - `order_items`: relation field to `OrderItem[]` (virtual relation, not a DB scalar column)
- **Relationships:**
  - One Product can appear in many OrderItem records.
  - `OrderItem.product_id` references `Product.id`.
- **Cascade behavior:**
  - Deleting a Product must also delete all OrderItem rows that reference that product (`onDelete: Cascade` on the Product relation in `OrderItem`).
  - Deleting a Product does **not** delete Order rows directly. Orders remain, but the deleted product's item rows are removed by cascade.

### Order
- **Purpose:** Represents a customer order.
- **Fields:**
  - `order_id`: `Int`, required, primary key, auto-increment (`@id @default(autoincrement())`)
  - `customer_id`: `Int`, required
  - `total_price`: `Float`, required
  - `status`: `String`, required, default `"pending"`
  - `created_at`: `DateTime`, required, default `now()`
  - `order_items`: relation field to `OrderItem[]` (virtual relation)
- **Relationships:**
  - One Order has many OrderItem records.
  - `OrderItem.order_id` references `Order.order_id`.
- **Cascade behavior:**
  - Deleting an Order must also delete all OrderItem rows that reference that order (`onDelete: Cascade` on the Order relation in `OrderItem`).

### OrderItem
- **Purpose:** Join/line-item model that links products to orders with quantity and unit price.
- **Fields:**
  - `order_item_id`: `Int`, required, primary key, auto-increment (`@id @default(autoincrement())`)
  - `order_id`: `Int`, required, foreign key to `Order.order_id`
  - `product_id`: `Int`, required, foreign key to `Product.id`
  - `quantity`: `Int`, required
  - `price`: `Float`, required (unit price at purchase time)
- **Relationships:**
  - Many OrderItem rows belong to one Order.
  - Many OrderItem rows reference one Product.
- **Cascade behavior:**
  - If the parent Order is deleted, dependent OrderItem rows are deleted.
  - If the referenced Product is deleted, dependent OrderItem rows are deleted.

### Cascade reasoning
`OrderItem` is downstream of both `Order` and `Product`, so it participates in two cascade paths. If a Product that appears in an existing order is deleted, only its matching line items are removed; the Order record itself remains. This can leave an order with fewer items than originally created, which is acceptable for this project because the required rule explicitly asks for dependent `OrderItem` cleanup. In production, alternatives could include soft-delete for products or disallowing product deletes when referenced, but this spec follows the required cascade behavior.

## Section 2: API Contract

**Global error shape:** all errors use JSON like:

```json
{ "error": "human-readable message" }
```

### Product endpoints

#### GET `/products`
- **Request:** no body, no params.
- **Query Parameters:**
  - `category` (string, optional): filters products by exact category match.
    - Example: `GET /products?category=Apparel`
  - `sort` (string, optional): sorts by a supported field.
    - Supported values: `price`, `name`
    - Example: `GET /products?sort=price`
  - **Combined usage:** both can be used together, e.g. `GET /products?category=Snacks&sort=name`
  - **Default behavior:** if no query parameters are provided, return all products with no explicit ordering applied.
- **Success:** `200 OK`
  - Body: `Product[]`
- **Invalid/unknown query behavior:**
  - Unknown `category` values return `200 OK` with an empty array `[]`.
  - Unsupported `sort` values are ignored and results are returned without explicit ordering.
- **Error example:** `500 Internal Server Error`
  - Body: `{ "error": "Failed to fetch products" }`

#### GET `/products/:id`
- **Request:** route param `id` (integer).
- **Success:** `200 OK`
  - Body: `Product`
- **Error examples:**
  - `404 Not Found` with `{ "error": "Product not found" }`
  - `500 Internal Server Error` with `{ "error": "Failed to fetch product" }`

#### POST `/products`
- **Request body:**
  - `name` (string)
  - `description` (string)
  - `price` (number)
  - `image_url` (string)
  - `category` (string)
- **Success:** `201 Created`
  - Body: created `Product`
- **Error example:** `500 Internal Server Error` with `{ "error": "Failed to create product" }`

#### PUT `/products/:id`
- **Request:** route param `id` (integer)
- **Request body:** one or more product fields to update (currently expects product fields in body)
- **Success:** `200 OK`
  - Body: updated `Product`
- **Error examples:**
  - `404 Not Found` with `{ "error": "Product not found" }`
  - `500 Internal Server Error` with `{ "error": "Failed to update product" }`

#### DELETE `/products/:id`
- **Request:** route param `id` (integer)
- **Success:** `200 OK`
  - Body: `{ "message": "Product deleted successfully" }`
- **Error examples:**
  - `404 Not Found` with `{ "error": "Product not found" }`
  - `500 Internal Server Error` with `{ "error": "Failed to delete product" }`

### Order endpoints

#### GET `/orders`
- **Request:** no body, no params.
- **Success:** `200 OK`
  - Body: array of orders including nested `order_items`.
- **Error example:** `500 Internal Server Error` with `{ "error": "Failed to fetch orders" }`

#### GET `/orders/:order_id`
- **Request:** route param `order_id` (integer)
- **Success:** `200 OK`
  - Body: one order including nested `order_items`
- **Error examples:**
  - `404 Not Found` with `{ "error": "Order not found" }`
  - `500 Internal Server Error` with `{ "error": "Failed to fetch order" }`

#### POST `/orders`
- **Request body:**
  - `customer_id` (integer)
  - `status` (string, optional; defaults to `"pending"`)
  - `items`: array of objects:
    - `product_id` (integer)
    - `quantity` (integer)
    - `price` (number)
- **Success:** `201 Created`
  - Body: created order object including nested `order_items`.
- **Error examples:**
  - `400 Bad Request` with validation message such as `{ "error": "items must include at least one order item" }`
  - `400 Bad Request` for invalid product references: `{ "error": "Invalid product_id in order items" }`
  - `500 Internal Server Error` with `{ "error": "Failed to create order" }`

#### PUT `/orders/:order_id`
- **Request:** route param `order_id` (integer)
- **Request body:** one or both:
  - `status` (string)
  - `customer_id` (integer)
- **Success:** `200 OK`
  - Body: updated order including nested `order_items`
- **Error examples:**
  - `400 Bad Request` with `{ "error": "Provide at least one field to update" }`
  - `404 Not Found` with `{ "error": "Order not found" }`
  - `500 Internal Server Error` with `{ "error": "Failed to update order" }`

#### DELETE `/orders/:order_id`
- **Request:** route param `order_id` (integer)
- **Success:** `200 OK`
  - Body: `{ "message": "Order deleted successfully" }`
- **Error examples:**
  - `404 Not Found` with `{ "error": "Order not found" }`
  - `500 Internal Server Error` with `{ "error": "Failed to delete order" }`

## Section 3: Transactional Flow (POST `/orders`)

### Request body shape
`POST /orders` expects:

```json
{
  "customer_id": 101,
  "status": "pending",
  "items": [
    { "product_id": 1, "quantity": 2, "price": 29.99 },
    { "product_id": 4, "quantity": 1, "price": 1.99 }
  ]
}
```

### Data-layer steps
1. Validate request data:
   - `customer_id` must be a positive integer.
   - `items` must be a non-empty array.
   - each item must include valid `product_id`, `quantity`, and `price`.
2. Compute `total_price` as `sum(quantity * price)` across all items.
3. Start `prisma.$transaction(...)` so every write is inside one atomic unit.
4. Inside the transaction:
   - create the parent `Order` row first,
   - create all `OrderItem` rows linked by the generated `order_id`,
   - query the created order back with `include: { order_items: true }`.
5. Return the created order with included `order_items` and status `201`.

### Atomicity and rollback behavior
Because the endpoint runs in `prisma.$transaction`, all writes either succeed together or fail together. If any line item fails (for example, a `product_id` does not exist and violates foreign key constraints), Prisma rolls back the full transaction. No partial order remains in the database.

### Failure response for nonexistent product
If any item references a missing product:
- request fails with `400 Bad Request`
- response body: `{ "error": "Invalid product_id in order items" }`
- no `Order` or `OrderItem` rows are created.

## Decisions Log — Product Model

- **Schema translation that went smoothly**: `id`, `name`, `description`, `price`, `image_url`, and `category` mapped directly from the Product spec into Prisma with no type ambiguity.
- **Field decision I made during implementation that wasn't in the original spec**: kept all Product fields required (no optional `?` fields) so `POST /products` always creates complete catalog records.
- **Route behavior that needed a spec update**: `PUT /products/:id` now accepts and persists `category` updates in addition to name/description/price/image_url to stay consistent with the Product model fields.

## Spec Reconciliation — Milestone 4 (Schema Audit)

### Schema vs. spec gaps found
- No gaps found: `Product`, `Order`, and `OrderItem` fields in `schema.prisma` match the Data Models section.
- Relationship wiring matches spec: `OrderItem.order_id` references `Order.order_id` and `OrderItem.product_id` references `Product.id`.
- Cascade rules match spec: both relations on `OrderItem` use `onDelete: Cascade`.

### Cascade delete verification
- Deleting a Product removes associated OrderItems: ✅ tested
- Deleting an Order removes associated OrderItems: ✅ tested

## Decisions Log — Order Creation Transaction

- **What my Transactional Flow spec got right**: the order of operations was correct: validate input, compute total, create order, create order items, return the order with items.
- **What the spec missed that I discovered during implementation**: the implementation now explicitly uses `prisma.$transaction` rather than relying on nested writes so the transactional boundary is obvious in code.
- **How the transaction error handling works**: if any statement inside `prisma.$transaction` throws (for example invalid `product_id` foreign key), Prisma aborts and rolls back all prior writes in that transaction.
- **One thing I'd design differently if starting over**: I would derive each item price from the Product table server-side instead of accepting item prices from the client request body.

## Final Spec Reconciliation: Project Complete

### Full-system audit result
- Product API contract and Order API contract match backend behavior for the implemented endpoints (`/products`, `/products/:id`, `/orders`, `/orders/:order_id`, `POST /orders`, update/delete endpoints).
- `POST /orders` request/response now matches the spec and returns created order data with associated `order_items`.
- CORS middleware is enabled in `server.js` and supports frontend-backend communication from the Vite dev server.

### Gaps resolved during frontend integration
- Frontend had no active API requests implemented; added product list fetch, product detail fetch, and checkout order creation calls aligned to the API contract.
- Checkout UI expected `order.purchase.receipt` shape, but API returns order records with `order_items`; updated frontend receipt rendering to use actual API response fields.
- Payment form state used mismatched fields (`id`/`email`) while backend expects `customer_id`; updated frontend mapping so student ID input is used to produce numeric `customer_id`.

### What the spec enabled during this project
The written API and transactional specs made it much faster to identify integration mismatches because request/response shapes were explicit before wiring the frontend. During debugging, the spec gave a concrete source of truth for whether to change frontend code, backend code, or both.