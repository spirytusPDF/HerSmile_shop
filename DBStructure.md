User
-
Stores encrypted account details and credentials.
Has one `Cart`, has many `Orders`

Product
-
The central store catalog(perfumes and makeup).
Connected to `CartItem` and `OrderItem`.

Cart
-
The active, temporary shopping save for a specific user.
Belongs to one `User`, contains `CartItems`.

CartItem
-
Represents a specific product unlinked from the origin.
Belongs to `Cart`, references to `Product`.

Order
-
Receipts generated after checkout.
Belongs to one `User`, contains `OrderITems`.

OrderItem
-
The locked-in price and quantity of a purchased item.
Belongs to `Order`, references one `Product`.