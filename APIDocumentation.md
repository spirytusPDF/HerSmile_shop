_Methods and endpoints_
-

POST
-
1. **/api/auth/signup**\
   Registers a new user with bcrypt password hashing and initializes an empty cart.\
    Required input: `JSON: { "login", "password" }`
2. **/api/auth/login**\
   Authenticates a user and manages duplicate or missing account exceptions.\
      Required input: `JSON: { "login", "password" }`
3. **/api/cart/add**\
   Adds a product to a user's cart or increments the quantity if it already exists.\
   Required input: `JSON: { "userId", "productId" }`
4. **/api/orders/checkout**\
   Calculates total cost, generates a permanent order receipt, and clears the active cart.\
   Required input: `JSON: { "userId" }`
5. **/api/chat**\
   Prompts Gemini to recommend exactly one perfume from the current database inventory.\
   Required input: `JSON: { "message" }`

GET
-
1. **/api/products**\
   Fetches the product catalog. Supports dynamic filtering.\
   Required input: `Optional Queries: ?category= or ?search=`
2.  **/api/products/:id**\
    Fetches the specific details of a single product based on its ID.\
    Required input: `URL Parameter: id`
3. **/api/cart/:userid**\
   Retrieves all items currently stored in a user's shopping cart.\
   Required input: `URL Parameter: userId`
4. **/api/orders/user/:userid**\
   Fetches a user's past order history sorted chronologically.\
   Required input: `URL Parameter: userId`

DELETE
-
1. **/api/cart/remove**\
    Deletes the product from user's cart.\
    Required input: `JSON: { "userId", "productId" }`
