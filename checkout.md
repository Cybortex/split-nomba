> ## Documentation Index
> Fetch the complete documentation index at: https://developer.nomba.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Cancel Checkout Order

> Use this endpoint to cancel an incomplete or pending checkout order.



## OpenAPI

````yaml post /v1/checkout/order/cancel
openapi: 3.0.1
info:
  description: ''
  title: Vendor API
  version: 1.0.0
servers:
  - description: Production
    url: https://api.nomba.com
  - description: Sandbox
    url: https://sandbox.nomba.com
security: []
tags:
  - name: Authenticate
  - name: Accounts
  - name: Virtual Accounts
  - name: Online Checkout
  - name: Charge
  - name: Transfers
  - name: Direct Debits
  - name: Terminals
  - name: Transactions
  - name: Airtime and Data Vending
  - name: Electricity Vending
  - name: CableTV Subscription
  - name: Betting Vending
paths:
  /v1/checkout/order/cancel:
    post:
      tags:
        - Online Checkout
      summary: Cancel Checkout Order
      description: Use this endpoint to cancel an incomplete or pending checkout order.
      operationId: Cancel checkout order
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CancelOrderRequest'
        description: The request payload required to cancel a checkout order.
        required: true
      responses:
        '200':
          content:
            application/json:
              schema:
                type: object
                properties:
                  code:
                    type: string
                    example: '00'
                    description: Response Code
                  description:
                    type: string
                    example: success
                    description: Response description
                  data:
                    $ref: '#/components/schemas/CancelOrderResponse'
                required:
                  - code
                  - description
                  - data
          description: OK - your request was successful.
          headers:
            X-Rate-Limit-Limit:
              description: The number of allowed requests in the current period
              schema:
                type: string
                example: '40'
            X-Rate-Limit-Remaining:
              description: The number of remaining requests in the current period
              schema:
                type: string
                example: '39'
            X-Rate-Limit-Window:
              description: The specified rate limit window
              schema:
                type: string
                example: 1s
        '400':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RequestError'
          description: The request body sent by merchant did not pass the validation checks
        '401':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthenticationError'
          description: >-
            The access_token provided to access the resource is missing or
            invalid.
        '403':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthorizationError'
          description: The client does not have the permissions to access this resource
        '404':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RecordNotFoundError'
          description: The record that the client is trying to access does not exist.
        '429':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RateLimitError'
          description: >-
            The client has maxed out the number of calls within a time period on
            this resource.
        '500':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ServerError'
          description: Downstream system error.
components:
  schemas:
    CancelOrderRequest:
      type: object
      description: The request payload to cancel a checkout order
      properties:
        orderReference:
          type: string
          description: The unique reference of the checkout order to cancel
          example: OD-69923-2e102708-ee34-4a29-b713-a826ca928a12
      required:
        - orderReference
    CancelOrderResponse:
      type: object
      description: The response object for a cancel order operation
      properties:
        success:
          type: boolean
          description: Indicates whether the cancellation was successful
          example: true
        message:
          type: string
          description: A message describing the result of the cancellation
          example: Order cancelled successfully
      required:
        - success
        - message
    RequestError:
      type: object
      description: Request Error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '400'
        description:
          type: string
          description: Additional details about the error.
          example: Request failed.
    AuthenticationError:
      type: object
      description: Authentication Error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '401'
        description:
          type: string
          description: Additional details about the error.
          example: Unauthorized
    AuthorizationError:
      type: object
      description: Permissions error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '403'
        description:
          type: string
          description: Additional details about the error.
          example: Forbidden
    RecordNotFoundError:
      type: object
      description: Record-Not-Found error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '404'
        description:
          type: string
          description: Additional details about the error.
          example: Record not found
    RateLimitError:
      type: object
      description: Rate-limit error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '429'
        description:
          type: string
          description: Additional details about the error.
          example: Too many requests
    ServerError:
      type: object
      description: Server error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '500'
        description:
          type: string
          description: Additional details about the error.
          example: Server error

````

> ## Documentation Index
> Fetch the complete documentation index at: https://developer.nomba.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Refund checkout transaction

> You can use this endpoint to refund a checkout transaction.



## OpenAPI

````yaml post /v1/checkout/refund
openapi: 3.0.1
info:
  description: ''
  title: Vendor API
  version: 1.0.0
servers:
  - description: Production
    url: https://api.nomba.com
  - description: Sandbox
    url: https://sandbox.nomba.com
security: []
tags:
  - name: Authenticate
  - name: Accounts
  - name: Virtual Accounts
  - name: Online Checkout
  - name: Charge
  - name: Transfers
  - name: Direct Debits
  - name: Terminals
  - name: Transactions
  - name: Airtime and Data Vending
  - name: Electricity Vending
  - name: CableTV Subscription
  - name: Betting Vending
paths:
  /v1/checkout/refund:
    post:
      tags:
        - Online Checkout
      summary: Refund checkout transaction
      description: You can use this endpoint to refund a checkout transaction.
      operationId: Refund checkout transaction
      parameters:
        - description: The parent accountId of the business.
          in: header
          name: accountId
          schema:
            type: string
            format: uuid
            example: 890022ce-bae0-45c1-9b9d-ee7872e6ca27
          required: true
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/RefundCheckoutTransactionRequestDTO'
        description: The request payload required to refund a checkout transaction.
        required: true
      responses:
        '200':
          content:
            application/json:
              schema:
                type: object
                properties:
                  code:
                    type: string
                    example: '00'
                    description: Response Code
                  description:
                    type: string
                    example: Success
                    description: Refund successful
                  data:
                    $ref: '#/components/schemas/CheckoutDataResponseDTO'
                required:
                  - code
                  - description
                  - data
          description: OK - your request was successful.
          headers:
            X-Rate-Limit-Limit:
              description: The number of allowed requests in the current period
              schema:
                type: string
                example: '40'
            X-Rate-Limit-Remaining:
              description: The number of remaining requests in the current period
              schema:
                type: string
                example: '39'
            X-Rate-Limit-Window:
              description: The specified rate limit window
              schema:
                type: string
                example: 1s
        '400':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RequestError'
          description: The request body sent by merchant did not pass the validation checks
        '401':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthenticationError'
          description: >-
            The access_token provided to access the resource is missing or
            invalid.
        '403':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthorizationError'
          description: The client does not have the permissions to access this resource
        '404':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RecordNotFoundError'
          description: The record that the client is trying to access does not exist.
        '429':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RateLimitError'
          description: >-
            The client has maxed out the number of calls within a time period on
            this resource.
        '500':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ServerError'
          description: Downstream system error.
      security:
        - BearerAuth: []
components:
  schemas:
    RefundCheckoutTransactionRequestDTO:
      type: object
      description: The request object for refunding a checkout transaction
      properties:
        transactionId:
          type: string
          description: The ID of the transaction to be refunded
          example: TXN-123456789
        amount:
          type: number
          format: double
          description: The amount to be refunded
          example: 5000
        accountNumber:
          type: string
          description: The account number for the refund
          example: '0123456789'
          maxLength: 10
          minLength: 10
        bankCode:
          type: string
          description: The bank code for the refund
          example: '058'
      required:
        - transactionId
    CheckoutDataResponseDTO:
      type: object
      description: The response object for checkout operations
      properties:
        success:
          type: boolean
          description: Indicates whether the operation was successful
          example: true
        message:
          type: string
          description: A message describing the result of the operation
          example: Refund processed successfully
      required:
        - success
        - message
    RequestError:
      type: object
      description: Request Error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '400'
        description:
          type: string
          description: Additional details about the error.
          example: Request failed.
    AuthenticationError:
      type: object
      description: Authentication Error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '401'
        description:
          type: string
          description: Additional details about the error.
          example: Unauthorized
    AuthorizationError:
      type: object
      description: Permissions error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '403'
        description:
          type: string
          description: Additional details about the error.
          example: Forbidden
    RecordNotFoundError:
      type: object
      description: Record-Not-Found error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '404'
        description:
          type: string
          description: Additional details about the error.
          example: Record not found
    RateLimitError:
      type: object
      description: Rate-limit error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '429'
        description:
          type: string
          description: Additional details about the error.
          example: Too many requests
    ServerError:
      type: object
      description: Server error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '500'
        description:
          type: string
          description: Additional details about the error.
          example: Server error
  securitySchemes:
    BearerAuth:
      description: >-
        Nomba authenticates API calls with [OAuth2 HTTP bearer
        tokens](http://tools.ietf.org/html/rfc6750). There are two methods of
        authentication; [Client-Credentials
        method](https://www.rfc-editor.org/rfc/rfc6749) and [PKCE (Proof Key for
        Code Exchange)](https://www.rfc-editor.org/rfc/rfc7636) method. In each
        of the methods, You will get an `ACCESS_TOKEN`. You need to use an
        `"Authorization"` HTTP header to provide your `ACCESS_TOKEN`. For
        example: `Authorization: {ACCESS_TOKEN}`.
      scheme: bearer
      type: http
      bearerFormat: JWT

````

> ## Documentation Index
> Fetch the complete documentation index at: https://developer.nomba.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Fetch checkout transaction

> Fetch checkout transaction



## OpenAPI

````yaml get /v1/checkout/transaction
openapi: 3.0.1
info:
  description: ''
  title: Vendor API
  version: 1.0.0
servers:
  - description: Production
    url: https://api.nomba.com
  - description: Sandbox
    url: https://sandbox.nomba.com
security: []
tags:
  - name: Authenticate
  - name: Accounts
  - name: Virtual Accounts
  - name: Online Checkout
  - name: Charge
  - name: Transfers
  - name: Direct Debits
  - name: Terminals
  - name: Transactions
  - name: Airtime and Data Vending
  - name: Electricity Vending
  - name: CableTV Subscription
  - name: Betting Vending
paths:
  /v1/checkout/transaction:
    get:
      tags:
        - Online Checkout
      summary: Fetch checkout transaction
      description: Fetch checkout transaction
      operationId: Fetch a checkout transaction
      parameters:
        - description: The parent accountId of the business.
          in: header
          name: accountId
          schema:
            type: string
            format: uuid
            example: 890022ce-bae0-45c1-9b9d-ee7872e6ca27
          required: true
        - description: >-
            Checkout id type to use for this query. Valid values are the
            'ORDER_REFERENCE', to use Order reference passed in when generating
            the checkout link, and 'ORDER_ID' to use the uuid value returned in
            the checkout link path.
          example: ORDER_ID
          in: query
          name: idType
          schema:
            type: string
            enum:
              - ORDER_ID
              - ORDER_REFERENCE
        - description: >-
            Checkout transaction id based on the value selected in the idType
            parameter
          example: 120022e-e6ca27-33ed-ee7872e6ca27
          in: query
          name: id
          schema:
            type: string
      responses:
        '200':
          content:
            application/json:
              schema:
                type: object
                properties:
                  code:
                    type: string
                    example: '00'
                    description: Response Code
                  description:
                    type: string
                    example: Success
                    description: response description
                  data:
                    $ref: '#/components/schemas/CheckoutTransaction'
          description: OK - your request was successful.
          headers:
            X-Rate-Limit-Limit:
              description: The number of allowed requests in the current period
              schema:
                type: string
                example: '40'
            X-Rate-Limit-Remaining:
              description: The number of remaining requests in the current period
              schema:
                type: string
                example: '39'
            X-Rate-Limit-Window:
              description: The specified rate limit window
              schema:
                type: string
                example: 1s
        '400':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RequestError'
          description: The request body sent by merchant did not pass the validation checks
        '401':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthenticationError'
          description: >-
            The access_token provided to access the resource is missing or
            invalid.
        '403':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthorizationError'
          description: The client does not have the permissions to access this resource
        '404':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RecordNotFoundError'
          description: The record that the client is trying to access does not exist.
        '429':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RateLimitError'
          description: >-
            The client has maxed out the number of calls within a time period on
            this resource.
        '500':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ServerError'
          description: Downstream system error.
      security:
        - BearerAuth: []
components:
  schemas:
    CheckoutTransaction:
      type: object
      properties:
        success:
          type: boolean
          description: >-
            True if the transaction is already completed and successful, false
            otherwise
          example: 'true'
        message:
          type: string
          description: Response message describing the transaction status
          example: success
        order:
          $ref: '#/components/schemas/OrderDetails'
        transactionDetails:
          $ref: '#/components/schemas/CheckoutTransactionDetails'
        transferDetails:
          $ref: '#/components/schemas/CheckoutTransferDetails'
        cardDetails:
          $ref: '#/components/schemas/CheckoutCardDetails'
    RequestError:
      type: object
      description: Request Error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '400'
        description:
          type: string
          description: Additional details about the error.
          example: Request failed.
    AuthenticationError:
      type: object
      description: Authentication Error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '401'
        description:
          type: string
          description: Additional details about the error.
          example: Unauthorized
    AuthorizationError:
      type: object
      description: Permissions error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '403'
        description:
          type: string
          description: Additional details about the error.
          example: Forbidden
    RecordNotFoundError:
      type: object
      description: Record-Not-Found error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '404'
        description:
          type: string
          description: Additional details about the error.
          example: Record not found
    RateLimitError:
      type: object
      description: Rate-limit error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '429'
        description:
          type: string
          description: Additional details about the error.
          example: Too many requests
    ServerError:
      type: object
      description: Server error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '500'
        description:
          type: string
          description: Additional details about the error.
          example: Server error
    OrderDetails:
      type: object
      properties:
        orderId:
          type: string
          description: Id generated by Nomba for the checkout order
          example: 56e03654-0c32-4d3e-bbd6-a9df22994a12
        orderReference:
          type: string
          description: Reference of the online checkout order to be created
          example: 90e81e8a-bc14-4ebf-89c0-57da752cca58
        customerId:
          type: string
          description: Customer id
          example: '762878332454'
        accountId:
          type: string
          description: The account Id whose wallet will be credited when the order is paid
          example: 56e03654-0c32-4d3e-bbd6-a9df22994a12
        callbackUrl:
          type: string
          description: Merchant callback url for redirect after payment
          example: https://ip:port/merchant.com/callback
        customerEmail:
          type: string
          description: Customer email
          example: abcde@gmail.com
        amount:
          type: number
          format: double
          description: Amount to pay
          example: '10000.00'
        currency:
          type: string
          description: Currency of the money
          enum:
            - NGN
          example: NGN
    CheckoutTransactionDetails:
      type: object
      properties:
        transactionDate:
          type: string
          format: date-time
          description: Date the transaction was created
          example: '2023-12-06T15:46:43.000Z'
        paymentReference:
          type: string
          description: The payment reference for the transaction
          example: '5844858382134'
        paymentVendorReference:
          type: string
          description: The payment reference returned by the payment gateway
          example: '5844858382675493'
        tokenizedCardPayment:
          type: boolean
          description: True if the payment was made by a tokenized card
          example: 'true'
        statusCode:
          type: string
          description: transaction status code returned by the payment gateway
          example: Payment approved
    CheckoutTransferDetails:
      type: object
      properties:
        sessionId:
          type: string
          description: Transfer sessionId
          example: '67584432178569543'
        beneficiaryAccountName:
          type: string
          description: The account name associated with the Merchants Nombank account
          example: Tope Fade
        beneficiaryAccountNumber:
          type: string
          description: The Flash account number, where the payment was made to
          example: '5844858382'
        originatorAccountName:
          type: string
          description: The name of the person making the transfer
          example: Femi Fash
        originatorAccountNumber:
          type: string
          description: Nuban account number of the person making the transfer
          example: '3409082834'
        narration:
          type: string
          description: The naration added by the customer when making the transfer
          example: Checkout payment
        destinationInstitutionCode:
          type: string
          description: Destination bank code
          example: 'true'
        paymentReference:
          type: string
          description: Transfer payment reference passed in from NIBSS for the transfer
          example: '44384586756'
    CheckoutCardDetails:
      type: object
      properties:
        cardPan:
          type: string
          description: The masked card pan
          example: 515123 **** **** 6667
        cardType:
          type: string
          description: The Card type
          example: Verve
        cardCurrency:
          type: string
          description: The card currency
          example: NGN
        cardBank:
          type: string
          description: Card Bank code
          example: '057'
  securitySchemes:
    BearerAuth:
      description: >-
        Nomba authenticates API calls with [OAuth2 HTTP bearer
        tokens](http://tools.ietf.org/html/rfc6750). There are two methods of
        authentication; [Client-Credentials
        method](https://www.rfc-editor.org/rfc/rfc6749) and [PKCE (Proof Key for
        Code Exchange)](https://www.rfc-editor.org/rfc/rfc7636) method. In each
        of the methods, You will get an `ACCESS_TOKEN`. You need to use an
        `"Authorization"` HTTP header to provide your `ACCESS_TOKEN`. For
        example: `Authorization: {ACCESS_TOKEN}`.
      scheme: bearer
      type: http
      bearerFormat: JWT

````

> ## Documentation Index
> Fetch the complete documentation index at: https://developer.nomba.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Charge a customer using tokenized card data

> You can use this endpoint to charge a customer's card using the tokenized card details.



## OpenAPI

````yaml post /v1/checkout/tokenized-card-payment
openapi: 3.0.1
info:
  description: ''
  title: Vendor API
  version: 1.0.0
servers:
  - description: Production
    url: https://api.nomba.com
  - description: Sandbox
    url: https://sandbox.nomba.com
security: []
tags:
  - name: Authenticate
  - name: Accounts
  - name: Virtual Accounts
  - name: Online Checkout
  - name: Charge
  - name: Transfers
  - name: Direct Debits
  - name: Terminals
  - name: Transactions
  - name: Airtime and Data Vending
  - name: Electricity Vending
  - name: CableTV Subscription
  - name: Betting Vending
paths:
  /v1/checkout/tokenized-card-payment:
    post:
      tags:
        - Online Checkout
      summary: Charge a customer using tokenized card data
      description: >-
        You can use this endpoint to charge a customer's card using the
        tokenized card details.
      operationId: charge customer with tokenized card data
      parameters:
        - description: The parent accountId of the business.
          in: header
          name: accountId
          schema:
            type: string
            format: uuid
            example: 890022ce-bae0-45c1-9b9d-ee7872e6ca27
          required: true
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/TokenizedCardPaymentRequest'
        description: The request payload required to perform a tokenized payment.
        required: true
      responses:
        '200':
          content:
            application/json:
              schema:
                type: object
                properties:
                  code:
                    type: string
                    example: '00'
                    description: Response Code
                  description:
                    type: string
                    example: Success
                    description: payment successful
                  data:
                    $ref: '#/components/schemas/TokenizedCardPaymentResponse'
                required:
                  - code
                  - description
                  - data
          description: OK - your request was successful.
          headers:
            X-Rate-Limit-Limit:
              description: The number of allowed requests in the current period
              schema:
                type: string
                example: '40'
            X-Rate-Limit-Remaining:
              description: The number of remaining requests in the current period
              schema:
                type: string
                example: '39'
            X-Rate-Limit-Window:
              description: The specified rate limit window
              schema:
                type: string
                example: 1s
        '400':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RequestError'
          description: The request body sent by merchant did not pass the validation checks
        '401':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthenticationError'
          description: >-
            The access_token provided to access the resource is missing or
            invalid.
        '403':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthorizationError'
          description: The client does not have the permissions to access this resource
        '404':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RecordNotFoundError'
          description: The record that the client is trying to access does not exist.
        '429':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RateLimitError'
          description: >-
            The client has maxed out the number of calls within a time period on
            this resource.
        '500':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ServerError'
          description: Downstream system error.
      security:
        - BearerAuth: []
components:
  schemas:
    TokenizedCardPaymentRequest:
      type: object
      description: The Tokenized card payment request object
      properties:
        order:
          $ref: '#/components/schemas/Order'
        tokenKey:
          type: string
          description: the token key returned in the webhook
          example: '7628788443'
      required:
        - tokenKey
    TokenizedCardPaymentResponse:
      type: object
      properties:
        status:
          type: boolean
          description: status of the transaction
          example: 'true'
        message:
          type: string
          description: some details of the transaction response.
          example: success
    RequestError:
      type: object
      description: Request Error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '400'
        description:
          type: string
          description: Additional details about the error.
          example: Request failed.
    AuthenticationError:
      type: object
      description: Authentication Error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '401'
        description:
          type: string
          description: Additional details about the error.
          example: Unauthorized
    AuthorizationError:
      type: object
      description: Permissions error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '403'
        description:
          type: string
          description: Additional details about the error.
          example: Forbidden
    RecordNotFoundError:
      type: object
      description: Record-Not-Found error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '404'
        description:
          type: string
          description: Additional details about the error.
          example: Record not found
    RateLimitError:
      type: object
      description: Rate-limit error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '429'
        description:
          type: string
          description: Additional details about the error.
          example: Too many requests
    ServerError:
      type: object
      description: Server error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '500'
        description:
          type: string
          description: Additional details about the error.
          example: Server error
    Order:
      type: object
      properties:
        orderReference:
          type: string
          description: reference of the online checkout order to be created
          example: 90e81e8a-bc14-4ebf-89c0-57da752cca58
        customerId:
          type: string
          description: customer id
          example: '762878332454'
        callbackUrl:
          type: string
          description: Merchant callback url for redirect after payment
          example: https://ip:port/merchant.com/callback
        customerEmail:
          type: string
          description: customer email
          example: abcde@gmail.com
        amount:
          type: number
          format: double
          description: Amount to pay
          example: '10000.00'
        currency:
          type: string
          description: >-
            ISO 4217 currency code. Use NGN for Nigerian checkout. For DRC
            accounts, use CDF or USD — NGN is not supported for DRC and will be
            rejected.
          enum:
            - NGN
            - CDF
            - USD
          example: NGN
        accountId:
          type: string
          description: If specified, this is the account where the funds will be deposited.
          example: 01a10aeb-d989-460a-bbde-9842f2b4320f
        allowedPaymentMethods:
          type: array
          description: >-
            Optional list of payment methods to display on the checkout page. If
            not provided, all supported methods for your account and region will
            be shown. Supported values: Card, Transfer, Nomba QR, USSD, Buy Now
            Pay Later (Nigerian checkout); MOMO, Intl Card, Apple Pay (DRC
            checkout).
          items:
            type: string
            enum:
              - Card
              - Transfer
              - Nomba QR
              - USSD
              - Buy Now Pay Later
              - MOMO
              - Intl Card
              - Apple Pay
          example:
            - Card
            - Transfer
        splitRequest:
          type: object
          description: Contains accounts where the inflow will be split into
          properties:
            splitType:
              type: string
              description: The type fo split to use, either PERCENTAGE or AMOUNT
              enum:
                - PERCENTAGE
                - AMOUNT
            splitList:
              type: array
              items:
                type: object
                properties:
                  accountId:
                    type: string
                    description: >-
                      The account Id whose wallet will be credited when the
                      order is paid
                    example: 01a10aeb-d989-460a-bbde-9842f2b4320f
                  value:
                    type: number
                    description: >-
                      The percentage or the order amount or the actual value to
                      credit to this account.
                    example: '65.45'
        orderMetaData:
          type: object
          description: >-
            Arbitrary key-value metadata to attach to the order. Keys and values
            must be strings. Stored on the order and returned in webhook
            payloads. Special key: set "region" to "CD" to route this order
            through DRC checkout (e.g. for a Nigerian merchant accepting DRC
            MoMo payments).
          additionalProperties:
            type: string
          example:
            productName: Premium Plan
            internalRef: INV-2026-001
            region: CD
      required:
        - callbackUrl
        - customerEmail
        - amount
        - currency
  securitySchemes:
    BearerAuth:
      description: >-
        Nomba authenticates API calls with [OAuth2 HTTP bearer
        tokens](http://tools.ietf.org/html/rfc6750). There are two methods of
        authentication; [Client-Credentials
        method](https://www.rfc-editor.org/rfc/rfc6749) and [PKCE (Proof Key for
        Code Exchange)](https://www.rfc-editor.org/rfc/rfc7636) method. In each
        of the methods, You will get an `ACCESS_TOKEN`. You need to use an
        `"Authorization"` HTTP header to provide your `ACCESS_TOKEN`. For
        example: `Authorization: {ACCESS_TOKEN}`.
      scheme: bearer
      type: http
      bearerFormat: JWT

````

> ## Documentation Index
> Fetch the complete documentation index at: https://developer.nomba.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Create an online checkout order

> You can use this endpoint to create an online checkout order. Load the URL returned in 'checkoutLink' property in a browser to allow your customer initiate payment.



## OpenAPI

````yaml post /v1/checkout/order
openapi: 3.0.1
info:
  description: ''
  title: Vendor API
  version: 1.0.0
servers:
  - description: Production
    url: https://api.nomba.com
  - description: Sandbox
    url: https://sandbox.nomba.com
security: []
tags:
  - name: Authenticate
  - name: Accounts
  - name: Virtual Accounts
  - name: Online Checkout
  - name: Charge
  - name: Transfers
  - name: Direct Debits
  - name: Terminals
  - name: Transactions
  - name: Airtime and Data Vending
  - name: Electricity Vending
  - name: CableTV Subscription
  - name: Betting Vending
paths:
  /v1/checkout/order:
    post:
      tags:
        - Online Checkout
      summary: Create an online checkout order
      description: >-
        You can use this endpoint to create an online checkout order. Load the
        URL returned in 'checkoutLink' property in a browser to allow your
        customer initiate payment.
      operationId: Create an online checkout order
      parameters:
        - description: The parent accountId of the business.
          in: header
          name: accountId
          schema:
            type: string
            format: uuid
            example: 890022ce-bae0-45c1-9b9d-ee7872e6ca27
          required: true
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateOrderRequest'
        description: The request payload required to create a checkout order.
        required: true
      responses:
        '200':
          content:
            application/json:
              schema:
                type: object
                properties:
                  code:
                    type: string
                    example: '00'
                    description: Response Code
                  description:
                    type: string
                    example: Success
                    description: checkout order created successful
                  data:
                    $ref: '#/components/schemas/CreateOrderResponse'
                required:
                  - code
                  - description
                  - data
          description: OK - your request was successful.
          headers:
            X-Rate-Limit-Limit:
              description: The number of allowed requests in the current period
              schema:
                type: string
                example: '40'
            X-Rate-Limit-Remaining:
              description: The number of remaining requests in the current period
              schema:
                type: string
                example: '39'
            X-Rate-Limit-Window:
              description: The specified rate limit window
              schema:
                type: string
                example: 1s
        '400':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RequestError'
          description: The request body sent by merchant did not pass the validation checks
        '401':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthenticationError'
          description: >-
            The access_token provided to access the resource is missing or
            invalid.
        '403':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthorizationError'
          description: The client does not have the permissions to access this resource
        '404':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RecordNotFoundError'
          description: The record that the client is trying to access does not exist.
        '429':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RateLimitError'
          description: >-
            The client has maxed out the number of calls within a time period on
            this resource.
        '500':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ServerError'
          description: Downstream system error.
      security:
        - BearerAuth: []
components:
  schemas:
    CreateOrderRequest:
      type: object
      description: The Checkout request object
      properties:
        order:
          $ref: '#/components/schemas/Order'
        tokenizeCard:
          type: boolean
          description: Determines if the card used for payment is to be tokenized
          example: 'true'
      required:
        - order
    CreateOrderResponse:
      type: object
      properties:
        checkoutLink:
          type: string
          description: Payment checkout link
          example: https://ip:port/checkout/78388899938
        orderReference:
          type: string
          description: The reference of the order created
          example: 90e81e8a-bc14-4ebf-89c0-57da752cca58
      required:
        - checkoutLink
        - orderReference
    RequestError:
      type: object
      description: Request Error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '400'
        description:
          type: string
          description: Additional details about the error.
          example: Request failed.
    AuthenticationError:
      type: object
      description: Authentication Error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '401'
        description:
          type: string
          description: Additional details about the error.
          example: Unauthorized
    AuthorizationError:
      type: object
      description: Permissions error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '403'
        description:
          type: string
          description: Additional details about the error.
          example: Forbidden
    RecordNotFoundError:
      type: object
      description: Record-Not-Found error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '404'
        description:
          type: string
          description: Additional details about the error.
          example: Record not found
    RateLimitError:
      type: object
      description: Rate-limit error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '429'
        description:
          type: string
          description: Additional details about the error.
          example: Too many requests
    ServerError:
      type: object
      description: Server error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '500'
        description:
          type: string
          description: Additional details about the error.
          example: Server error
    Order:
      type: object
      properties:
        orderReference:
          type: string
          description: reference of the online checkout order to be created
          example: 90e81e8a-bc14-4ebf-89c0-57da752cca58
        customerId:
          type: string
          description: customer id
          example: '762878332454'
        callbackUrl:
          type: string
          description: Merchant callback url for redirect after payment
          example: https://ip:port/merchant.com/callback
        customerEmail:
          type: string
          description: customer email
          example: abcde@gmail.com
        amount:
          type: number
          format: double
          description: Amount to pay
          example: '10000.00'
        currency:
          type: string
          description: >-
            ISO 4217 currency code. Use NGN for Nigerian checkout. For DRC
            accounts, use CDF or USD — NGN is not supported for DRC and will be
            rejected.
          enum:
            - NGN
            - CDF
            - USD
          example: NGN
        accountId:
          type: string
          description: If specified, this is the account where the funds will be deposited.
          example: 01a10aeb-d989-460a-bbde-9842f2b4320f
        allowedPaymentMethods:
          type: array
          description: >-
            Optional list of payment methods to display on the checkout page. If
            not provided, all supported methods for your account and region will
            be shown. Supported values: Card, Transfer, Nomba QR, USSD, Buy Now
            Pay Later (Nigerian checkout); MOMO, Intl Card, Apple Pay (DRC
            checkout).
          items:
            type: string
            enum:
              - Card
              - Transfer
              - Nomba QR
              - USSD
              - Buy Now Pay Later
              - MOMO
              - Intl Card
              - Apple Pay
          example:
            - Card
            - Transfer
        splitRequest:
          type: object
          description: Contains accounts where the inflow will be split into
          properties:
            splitType:
              type: string
              description: The type fo split to use, either PERCENTAGE or AMOUNT
              enum:
                - PERCENTAGE
                - AMOUNT
            splitList:
              type: array
              items:
                type: object
                properties:
                  accountId:
                    type: string
                    description: >-
                      The account Id whose wallet will be credited when the
                      order is paid
                    example: 01a10aeb-d989-460a-bbde-9842f2b4320f
                  value:
                    type: number
                    description: >-
                      The percentage or the order amount or the actual value to
                      credit to this account.
                    example: '65.45'
        orderMetaData:
          type: object
          description: >-
            Arbitrary key-value metadata to attach to the order. Keys and values
            must be strings. Stored on the order and returned in webhook
            payloads. Special key: set "region" to "CD" to route this order
            through DRC checkout (e.g. for a Nigerian merchant accepting DRC
            MoMo payments).
          additionalProperties:
            type: string
          example:
            productName: Premium Plan
            internalRef: INV-2026-001
            region: CD
      required:
        - callbackUrl
        - customerEmail
        - amount
        - currency
  securitySchemes:
    BearerAuth:
      description: >-
        Nomba authenticates API calls with [OAuth2 HTTP bearer
        tokens](http://tools.ietf.org/html/rfc6750). There are two methods of
        authentication; [Client-Credentials
        method](https://www.rfc-editor.org/rfc/rfc6749) and [PKCE (Proof Key for
        Code Exchange)](https://www.rfc-editor.org/rfc/rfc7636) method. In each
        of the methods, You will get an `ACCESS_TOKEN`. You need to use an
        `"Authorization"` HTTP header to provide your `ACCESS_TOKEN`. For
        example: `Authorization: {ACCESS_TOKEN}`.
      scheme: bearer
      type: http
      bearerFormat: JWT

````

> ## Documentation Index
> Fetch the complete documentation index at: https://developer.nomba.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Cancel Checkout transaction

> Use this endpoint to Cancel an incomplete checkout transaction



## OpenAPI

````yaml post /v1/checkout/transaction/cancel
openapi: 3.0.1
info:
  description: ''
  title: Vendor API
  version: 1.0.0
servers:
  - description: Production
    url: https://api.nomba.com
  - description: Sandbox
    url: https://sandbox.nomba.com
security: []
tags:
  - name: Authenticate
  - name: Accounts
  - name: Virtual Accounts
  - name: Online Checkout
  - name: Charge
  - name: Transfers
  - name: Direct Debits
  - name: Terminals
  - name: Transactions
  - name: Airtime and Data Vending
  - name: Electricity Vending
  - name: CableTV Subscription
  - name: Betting Vending
paths:
  /v1/checkout/transaction/cancel:
    post:
      tags:
        - Charge
      summary: Cancel Checkout transaction
      description: Use this endpoint to Cancel an incomplete checkout transaction
      operationId: Cancel checkout transaction
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CheckoutCancelTransactionRequest'
        description: Submit User OTP
        required: true
      responses:
        '200':
          content:
            application/json:
              schema:
                type: object
                properties:
                  code:
                    type: string
                    example: '00'
                    description: Response Code
                  description:
                    type: string
                    example: Success
                    description: Response description
                  data:
                    $ref: '#/components/schemas/CheckoutDataResponse'
                required:
                  - code
                  - description
                  - data
          description: OK - your request was successful.
          headers:
            X-Rate-Limit-Limit:
              description: The number of allowed requests in the current period
              schema:
                type: string
                example: '40'
            X-Rate-Limit-Remaining:
              description: The number of remaining requests in the current period
              schema:
                type: string
                example: '39'
            X-Rate-Limit-Window:
              description: The specified rate limit window
              schema:
                type: string
                example: 1s
        '400':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RequestError'
          description: The request body sent by merchant did not pass the validation checks
        '401':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthenticationError'
          description: >-
            The access_token provided to access the resource is missing or
            invalid.
        '403':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthorizationError'
          description: The client does not have the permissions to access this resource
        '404':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RecordNotFoundError'
          description: The record that the client is trying to access does not exist.
        '429':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RateLimitError'
          description: >-
            The client has maxed out the number of calls within a time period on
            this resource.
        '500':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ServerError'
          description: Downstream system error.
      security:
        - BearerAuth: []
components:
  schemas:
    CheckoutCancelTransactionRequest:
      type: object
      properties:
        transactionId:
          type: string
          description: the transaction Id returned when the card details were submitted
          example: c4307d58-2513-41d8-b7f7-dfecd5f9fdbe
        forceCancel:
          type: boolean
          description: Force the cancelation of the transaction
          example: 'false'
      required:
        - transactionId
        - forceCancel
    CheckoutDataResponse:
      type: object
      properties:
        success:
          type: boolean
          description: true is the transaction was successful
          example: 'true'
        message:
          type: string
          description: details response message
          example: success
      required:
        - success
        - message
    RequestError:
      type: object
      description: Request Error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '400'
        description:
          type: string
          description: Additional details about the error.
          example: Request failed.
    AuthenticationError:
      type: object
      description: Authentication Error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '401'
        description:
          type: string
          description: Additional details about the error.
          example: Unauthorized
    AuthorizationError:
      type: object
      description: Permissions error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '403'
        description:
          type: string
          description: Additional details about the error.
          example: Forbidden
    RecordNotFoundError:
      type: object
      description: Record-Not-Found error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '404'
        description:
          type: string
          description: Additional details about the error.
          example: Record not found
    RateLimitError:
      type: object
      description: Rate-limit error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '429'
        description:
          type: string
          description: Additional details about the error.
          example: Too many requests
    ServerError:
      type: object
      description: Server error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '500'
        description:
          type: string
          description: Additional details about the error.
          example: Server error
  securitySchemes:
    BearerAuth:
      description: >-
        Nomba authenticates API calls with [OAuth2 HTTP bearer
        tokens](http://tools.ietf.org/html/rfc6750). There are two methods of
        authentication; [Client-Credentials
        method](https://www.rfc-editor.org/rfc/rfc6749) and [PKCE (Proof Key for
        Code Exchange)](https://www.rfc-editor.org/rfc/rfc7636) method. In each
        of the methods, You will get an `ACCESS_TOKEN`. You need to use an
        `"Authorization"` HTTP header to provide your `ACCESS_TOKEN`. For
        example: `Authorization: {ACCESS_TOKEN}`.
      scheme: bearer
      type: http
      bearerFormat: JWT

````

> ## Documentation Index
> Fetch the complete documentation index at: https://developer.nomba.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Fetch checkout Flash account number for transfer payment

> Use this endpoint to Get a flash account number which the customer can use to make a transfer payment.



## OpenAPI

````yaml get /v1/checkout/get-checkout-kta/{orderReference}
openapi: 3.0.1
info:
  description: ''
  title: Vendor API
  version: 1.0.0
servers:
  - description: Production
    url: https://api.nomba.com
  - description: Sandbox
    url: https://sandbox.nomba.com
security: []
tags:
  - name: Authenticate
  - name: Accounts
  - name: Virtual Accounts
  - name: Online Checkout
  - name: Charge
  - name: Transfers
  - name: Direct Debits
  - name: Terminals
  - name: Transactions
  - name: Airtime and Data Vending
  - name: Electricity Vending
  - name: CableTV Subscription
  - name: Betting Vending
paths:
  /v1/checkout/get-checkout-kta/{orderReference}:
    get:
      tags:
        - Charge
      summary: Fetch checkout Flash account number for transfer payment
      description: >-
        Use this endpoint to Get a flash account number which the customer can
        use to make a transfer payment.
      operationId: Fetch Checkout flash account number
      parameters:
        - description: Order reference
          example: 693cd007-cd1e-4ea6-8b79-5f5c4d7a83ea
          in: path
          name: orderReference
          required: true
          schema:
            type: string
      responses:
        '200':
          content:
            application/json:
              schema:
                type: object
                properties:
                  code:
                    type: string
                    example: '00'
                    description: Response Code
                  description:
                    type: string
                    example: Success
                    description: Response description
                  data:
                    $ref: '#/components/schemas/CheckoutAccountNumberResponse'
                required:
                  - code
                  - description
                  - data
          description: OK - your request was successful.
          headers:
            X-Rate-Limit-Limit:
              description: The number of allowed requests in the current period
              schema:
                type: string
                example: '40'
            X-Rate-Limit-Remaining:
              description: The number of remaining requests in the current period
              schema:
                type: string
                example: '39'
            X-Rate-Limit-Window:
              description: The specified rate limit window
              schema:
                type: string
                example: 1s
        '400':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RequestError'
          description: The request body sent by merchant did not pass the validation checks
        '401':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthenticationError'
          description: >-
            The access_token provided to access the resource is missing or
            invalid.
        '403':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthorizationError'
          description: The client does not have the permissions to access this resource
        '404':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RecordNotFoundError'
          description: The record that the client is trying to access does not exist.
        '429':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RateLimitError'
          description: >-
            The client has maxed out the number of calls within a time period on
            this resource.
        '500':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ServerError'
          description: Downstream system error.
      security:
        - BearerAuth: []
components:
  schemas:
    CheckoutAccountNumberResponse:
      type: object
      properties:
        accountNumber:
          type: string
          description: true is the transaction was successful
          example: '5678576432'
        accountName:
          type: string
          description: account name
          example: Femi Fash
        bankName:
          type: string
          description: Bank name
          example: Nombank Mfb
      required:
        - accountNumber
        - accountName
        - bankName
    RequestError:
      type: object
      description: Request Error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '400'
        description:
          type: string
          description: Additional details about the error.
          example: Request failed.
    AuthenticationError:
      type: object
      description: Authentication Error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '401'
        description:
          type: string
          description: Additional details about the error.
          example: Unauthorized
    AuthorizationError:
      type: object
      description: Permissions error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '403'
        description:
          type: string
          description: Additional details about the error.
          example: Forbidden
    RecordNotFoundError:
      type: object
      description: Record-Not-Found error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '404'
        description:
          type: string
          description: Additional details about the error.
          example: Record not found
    RateLimitError:
      type: object
      description: Rate-limit error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '429'
        description:
          type: string
          description: Additional details about the error.
          example: Too many requests
    ServerError:
      type: object
      description: Server error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '500'
        description:
          type: string
          description: Additional details about the error.
          example: Server error
  securitySchemes:
    BearerAuth:
      description: >-
        Nomba authenticates API calls with [OAuth2 HTTP bearer
        tokens](http://tools.ietf.org/html/rfc6750). There are two methods of
        authentication; [Client-Credentials
        method](https://www.rfc-editor.org/rfc/rfc6749) and [PKCE (Proof Key for
        Code Exchange)](https://www.rfc-editor.org/rfc/rfc7636) method. In each
        of the methods, You will get an `ACCESS_TOKEN`. You need to use an
        `"Authorization"` HTTP header to provide your `ACCESS_TOKEN`. For
        example: `Authorization: {ACCESS_TOKEN}`.
      scheme: bearer
      type: http
      bearerFormat: JWT

````

> ## Documentation Index
> Fetch the complete documentation index at: https://developer.nomba.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Fetch checkout transaction details

> Use this endpoint to fetch the checkout transaction details and get the status of the transaction after OTP is submitted or transfer is made



## OpenAPI

````yaml post /v1/checkout/confirm-transaction-receipt
openapi: 3.0.1
info:
  description: ''
  title: Vendor API
  version: 1.0.0
servers:
  - description: Production
    url: https://api.nomba.com
  - description: Sandbox
    url: https://sandbox.nomba.com
security: []
tags:
  - name: Authenticate
  - name: Accounts
  - name: Virtual Accounts
  - name: Online Checkout
  - name: Charge
  - name: Transfers
  - name: Direct Debits
  - name: Terminals
  - name: Transactions
  - name: Airtime and Data Vending
  - name: Electricity Vending
  - name: CableTV Subscription
  - name: Betting Vending
paths:
  /v1/checkout/confirm-transaction-receipt:
    post:
      tags:
        - Charge
      summary: Fetch checkout transaction details
      description: >-
        Use this endpoint to fetch the checkout transaction details and get the
        status of the transaction after OTP is submitted or transfer is made
      operationId: Fetch Checkout transaction details
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CheckoutDataRequest'
        description: Fetch checkout transaction details
        required: true
      responses:
        '200':
          content:
            application/json:
              schema:
                type: object
                properties:
                  code:
                    type: string
                    example: '00'
                    description: Response Code
                  description:
                    type: string
                    example: Success
                    description: Response description
                  data:
                    $ref: '#/components/schemas/CheckoutTransactionDetailsResponse'
                required:
                  - code
                  - description
                  - data
          description: OK - your request was successful.
          headers:
            X-Rate-Limit-Limit:
              description: The number of allowed requests in the current period
              schema:
                type: string
                example: '40'
            X-Rate-Limit-Remaining:
              description: The number of remaining requests in the current period
              schema:
                type: string
                example: '39'
            X-Rate-Limit-Window:
              description: The specified rate limit window
              schema:
                type: string
                example: 1s
        '400':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RequestError'
          description: The request body sent by merchant did not pass the validation checks
        '401':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthenticationError'
          description: >-
            The access_token provided to access the resource is missing or
            invalid.
        '403':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthorizationError'
          description: The client does not have the permissions to access this resource
        '404':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RecordNotFoundError'
          description: The record that the client is trying to access does not exist.
        '429':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RateLimitError'
          description: >-
            The client has maxed out the number of calls within a time period on
            this resource.
        '500':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ServerError'
          description: Downstream system error.
      security:
        - BearerAuth: []
components:
  schemas:
    CheckoutDataRequest:
      type: object
      properties:
        orderReference:
          type: string
          description: order reference
          example: c4307d58-2513-41d8-b7f7-dfecd5f9fdbe
      required:
        - orderReference
    CheckoutTransactionDetailsResponse:
      type: object
      properties:
        status:
          type: boolean
          description: true is the transaction was successful
          example: 'true'
        message:
          type: string
          description: details response message
          example: success
        order:
          $ref: '#/components/schemas/OrderDetailsObject'
      required:
        - status
        - message
    RequestError:
      type: object
      description: Request Error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '400'
        description:
          type: string
          description: Additional details about the error.
          example: Request failed.
    AuthenticationError:
      type: object
      description: Authentication Error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '401'
        description:
          type: string
          description: Additional details about the error.
          example: Unauthorized
    AuthorizationError:
      type: object
      description: Permissions error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '403'
        description:
          type: string
          description: Additional details about the error.
          example: Forbidden
    RecordNotFoundError:
      type: object
      description: Record-Not-Found error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '404'
        description:
          type: string
          description: Additional details about the error.
          example: Record not found
    RateLimitError:
      type: object
      description: Rate-limit error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '429'
        description:
          type: string
          description: Additional details about the error.
          example: Too many requests
    ServerError:
      type: object
      description: Server error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '500'
        description:
          type: string
          description: Additional details about the error.
          example: Server error
    OrderDetailsObject:
      type: object
      properties:
        orderId:
          type: string
          description: Id generated by Nomba for the checkout order
          example: 56e03654-0c32-4d3e-bbd6-a9df22994a12
        orderReference:
          type: string
          description: Reference of the online checkout order to be created
          example: 90e81e8a-bc14-4ebf-89c0-57da752cca58
        customerId:
          type: string
          description: Customer id
          example: '762878332454'
        accountId:
          type: string
          description: The account Id whose wallet will be credited when the order is paid
          example: 56e03654-0c32-4d3e-bbd6-a9df22994a12
        callbackUrl:
          type: string
          description: Merchant callback url for redirect after payment
          example: https://ip:port/merchant.com/callback
        customerEmail:
          type: string
          description: Customer email
          example: abcde@gmail.com
        amount:
          type: number
          format: double
          description: Amount to pay
          example: '10000.00'
        currency:
          type: string
          description: Currency of the money
          enum:
            - NGN
          example: NGN
        businessName:
          type: string
          description: Business Name
          example: Merchant Ltd
        businessEmail:
          type: string
          description: Business email
          example: abcde@gmail.com
        businessLogo:
          type: string
          description: Link to business logo
          example: https://ip:port/merchant.com/logo
  securitySchemes:
    BearerAuth:
      description: >-
        Nomba authenticates API calls with [OAuth2 HTTP bearer
        tokens](http://tools.ietf.org/html/rfc6750). There are two methods of
        authentication; [Client-Credentials
        method](https://www.rfc-editor.org/rfc/rfc6749) and [PKCE (Proof Key for
        Code Exchange)](https://www.rfc-editor.org/rfc/rfc7636) method. In each
        of the methods, You will get an `ACCESS_TOKEN`. You need to use an
        `"Authorization"` HTTP header to provide your `ACCESS_TOKEN`. For
        example: `Authorization: {ACCESS_TOKEN}`.
      scheme: bearer
      type: http
      bearerFormat: JWT

````

> ## Documentation Index
> Fetch the complete documentation index at: https://developer.nomba.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Resend OTP to customer's phone

> Use this endpoint to resend the payment OTP to the customer's phone



## OpenAPI

````yaml post /v1/checkout/resend-otp
openapi: 3.0.1
info:
  description: ''
  title: Vendor API
  version: 1.0.0
servers:
  - description: Production
    url: https://api.nomba.com
  - description: Sandbox
    url: https://sandbox.nomba.com
security: []
tags:
  - name: Authenticate
  - name: Accounts
  - name: Virtual Accounts
  - name: Online Checkout
  - name: Charge
  - name: Transfers
  - name: Direct Debits
  - name: Terminals
  - name: Transactions
  - name: Airtime and Data Vending
  - name: Electricity Vending
  - name: CableTV Subscription
  - name: Betting Vending
paths:
  /v1/checkout/resend-otp:
    post:
      tags:
        - Charge
      summary: Resend OTP to customer's phone
      description: Use this endpoint to resend the payment OTP to the customer's phone
      operationId: Resend customer payment OTP
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CheckoutDataRequest'
        description: The request payload required to resend the Card payment
        required: true
      responses:
        '200':
          content:
            application/json:
              schema:
                type: object
                properties:
                  code:
                    type: string
                    example: '00'
                    description: Response Code
                  description:
                    type: string
                    example: Success
                    description: Response description
                  data:
                    $ref: '#/components/schemas/CheckoutDataResponse'
                required:
                  - code
                  - description
                  - data
          description: OK - your request was successful.
          headers:
            X-Rate-Limit-Limit:
              description: The number of allowed requests in the current period
              schema:
                type: string
                example: '40'
            X-Rate-Limit-Remaining:
              description: The number of remaining requests in the current period
              schema:
                type: string
                example: '39'
            X-Rate-Limit-Window:
              description: The specified rate limit window
              schema:
                type: string
                example: 1s
        '400':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RequestError'
          description: The request body sent by merchant did not pass the validation checks
        '401':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthenticationError'
          description: >-
            The access_token provided to access the resource is missing or
            invalid.
        '403':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthorizationError'
          description: The client does not have the permissions to access this resource
        '404':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RecordNotFoundError'
          description: The record that the client is trying to access does not exist.
        '429':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RateLimitError'
          description: >-
            The client has maxed out the number of calls within a time period on
            this resource.
        '500':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ServerError'
          description: Downstream system error.
      security:
        - BearerAuth: []
components:
  schemas:
    CheckoutDataRequest:
      type: object
      properties:
        orderReference:
          type: string
          description: order reference
          example: c4307d58-2513-41d8-b7f7-dfecd5f9fdbe
      required:
        - orderReference
    CheckoutDataResponse:
      type: object
      properties:
        success:
          type: boolean
          description: true is the transaction was successful
          example: 'true'
        message:
          type: string
          description: details response message
          example: success
      required:
        - success
        - message
    RequestError:
      type: object
      description: Request Error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '400'
        description:
          type: string
          description: Additional details about the error.
          example: Request failed.
    AuthenticationError:
      type: object
      description: Authentication Error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '401'
        description:
          type: string
          description: Additional details about the error.
          example: Unauthorized
    AuthorizationError:
      type: object
      description: Permissions error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '403'
        description:
          type: string
          description: Additional details about the error.
          example: Forbidden
    RecordNotFoundError:
      type: object
      description: Record-Not-Found error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '404'
        description:
          type: string
          description: Additional details about the error.
          example: Record not found
    RateLimitError:
      type: object
      description: Rate-limit error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '429'
        description:
          type: string
          description: Additional details about the error.
          example: Too many requests
    ServerError:
      type: object
      description: Server error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '500'
        description:
          type: string
          description: Additional details about the error.
          example: Server error
  securitySchemes:
    BearerAuth:
      description: >-
        Nomba authenticates API calls with [OAuth2 HTTP bearer
        tokens](http://tools.ietf.org/html/rfc6750). There are two methods of
        authentication; [Client-Credentials
        method](https://www.rfc-editor.org/rfc/rfc6749) and [PKCE (Proof Key for
        Code Exchange)](https://www.rfc-editor.org/rfc/rfc7636) method. In each
        of the methods, You will get an `ACCESS_TOKEN`. You need to use an
        `"Authorization"` HTTP header to provide your `ACCESS_TOKEN`. For
        example: `Authorization: {ACCESS_TOKEN}`.
      scheme: bearer
      type: http
      bearerFormat: JWT

````
> ## Documentation Index
> Fetch the complete documentation index at: https://developer.nomba.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Submit customer card OTP

> Use this endpoint to submit the payment OTP sent to the customer's phones from the payment gateway



## OpenAPI

````yaml post /v1/checkout/checkout-card-otp
openapi: 3.0.1
info:
  description: ''
  title: Vendor API
  version: 1.0.0
servers:
  - description: Production
    url: https://api.nomba.com
  - description: Sandbox
    url: https://sandbox.nomba.com
security: []
tags:
  - name: Authenticate
  - name: Accounts
  - name: Virtual Accounts
  - name: Online Checkout
  - name: Charge
  - name: Transfers
  - name: Direct Debits
  - name: Terminals
  - name: Transactions
  - name: Airtime and Data Vending
  - name: Electricity Vending
  - name: CableTV Subscription
  - name: Betting Vending
paths:
  /v1/checkout/checkout-card-otp:
    post:
      tags:
        - Charge
      summary: Submit customer card OTP
      description: >-
        Use this endpoint to submit the payment OTP sent to the customer's
        phones from the payment gateway
      operationId: Submit customer payment OTP
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SubmitCardOTP'
        description: The request payload required to authenticate the Card payment
        required: true
      responses:
        '200':
          content:
            application/json:
              schema:
                type: object
                properties:
                  code:
                    type: string
                    example: '00'
                    description: Response Code
                  description:
                    type: string
                    example: Success
                    description: Response description
                  data:
                    $ref: '#/components/schemas/SubmitCardOTPResponse'
                required:
                  - code
                  - description
                  - data
          description: OK - your request was successful.
          headers:
            X-Rate-Limit-Limit:
              description: The number of allowed requests in the current period
              schema:
                type: string
                example: '40'
            X-Rate-Limit-Remaining:
              description: The number of remaining requests in the current period
              schema:
                type: string
                example: '39'
            X-Rate-Limit-Window:
              description: The specified rate limit window
              schema:
                type: string
                example: 1s
        '400':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RequestError'
          description: The request body sent by merchant did not pass the validation checks
        '401':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthenticationError'
          description: >-
            The access_token provided to access the resource is missing or
            invalid.
        '403':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthorizationError'
          description: The client does not have the permissions to access this resource
        '404':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RecordNotFoundError'
          description: The record that the client is trying to access does not exist.
        '429':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RateLimitError'
          description: >-
            The client has maxed out the number of calls within a time period on
            this resource.
        '500':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ServerError'
          description: Downstream system error.
      security:
        - BearerAuth: []
components:
  schemas:
    SubmitCardOTP:
      type: object
      properties:
        otp:
          type: string
          description: otp send to the customer's mobile phone
          example: '1234'
        orderReference:
          type: string
          description: order reference
          example: c4307d58-2513-41d8-b7f7-dfecd5f9fdbe
        transactionId:
          type: string
          description: transaction id returend when the card details were submitted
          example: c4307d58-2513-41d8-b7f7-dfecd5f9fdbe
      required:
        - otp
        - orderReference
        - transactionId
    SubmitCardOTPResponse:
      type: object
      properties:
        status:
          type: boolean
          description: true is the transaction was successful
          example: 'true'
        message:
          type: string
          description: details response message
          example: success
      required:
        - status
        - message
    RequestError:
      type: object
      description: Request Error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '400'
        description:
          type: string
          description: Additional details about the error.
          example: Request failed.
    AuthenticationError:
      type: object
      description: Authentication Error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '401'
        description:
          type: string
          description: Additional details about the error.
          example: Unauthorized
    AuthorizationError:
      type: object
      description: Permissions error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '403'
        description:
          type: string
          description: Additional details about the error.
          example: Forbidden
    RecordNotFoundError:
      type: object
      description: Record-Not-Found error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '404'
        description:
          type: string
          description: Additional details about the error.
          example: Record not found
    RateLimitError:
      type: object
      description: Rate-limit error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '429'
        description:
          type: string
          description: Additional details about the error.
          example: Too many requests
    ServerError:
      type: object
      description: Server error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '500'
        description:
          type: string
          description: Additional details about the error.
          example: Server error
  securitySchemes:
    BearerAuth:
      description: >-
        Nomba authenticates API calls with [OAuth2 HTTP bearer
        tokens](http://tools.ietf.org/html/rfc6750). There are two methods of
        authentication; [Client-Credentials
        method](https://www.rfc-editor.org/rfc/rfc6749) and [PKCE (Proof Key for
        Code Exchange)](https://www.rfc-editor.org/rfc/rfc7636) method. In each
        of the methods, You will get an `ACCESS_TOKEN`. You need to use an
        `"Authorization"` HTTP header to provide your `ACCESS_TOKEN`. For
        example: `Authorization: {ACCESS_TOKEN}`.
      scheme: bearer
      type: http
      bearerFormat: JWT

````
> ## Documentation Index
> Fetch the complete documentation index at: https://developer.nomba.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Submit customer card details

> Use this endpoint to submit the customers card details



## OpenAPI

````yaml post /v1/checkout/checkout-card-detail
openapi: 3.0.1
info:
  description: ''
  title: Vendor API
  version: 1.0.0
servers:
  - description: Production
    url: https://api.nomba.com
  - description: Sandbox
    url: https://sandbox.nomba.com
security: []
tags:
  - name: Authenticate
  - name: Accounts
  - name: Virtual Accounts
  - name: Online Checkout
  - name: Charge
  - name: Transfers
  - name: Direct Debits
  - name: Terminals
  - name: Transactions
  - name: Airtime and Data Vending
  - name: Electricity Vending
  - name: CableTV Subscription
  - name: Betting Vending
paths:
  /v1/checkout/checkout-card-detail:
    post:
      tags:
        - Charge
      summary: Submit customer card details
      description: Use this endpoint to submit the customers card details
      operationId: Submit customer card details
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SubmitCardDetails'
        description: The request payload required to filter account transactions.
        required: true
      responses:
        '200':
          content:
            application/json:
              schema:
                type: object
                properties:
                  code:
                    type: string
                    example: '00'
                    description: Response Code
                  description:
                    type: string
                    example: Success
                    description: Response description
                  data:
                    $ref: '#/components/schemas/SubmitCardDetailsResponse'
                required:
                  - code
                  - description
                  - data
          description: OK - your request was successful.
          headers:
            X-Rate-Limit-Limit:
              description: The number of allowed requests in the current period
              schema:
                type: string
                example: '40'
            X-Rate-Limit-Remaining:
              description: The number of remaining requests in the current period
              schema:
                type: string
                example: '39'
            X-Rate-Limit-Window:
              description: The specified rate limit window
              schema:
                type: string
                example: 1s
        '400':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RequestError'
          description: The request body sent by merchant did not pass the validation checks
        '401':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthenticationError'
          description: >-
            The access_token provided to access the resource is missing or
            invalid.
        '403':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthorizationError'
          description: The client does not have the permissions to access this resource
        '404':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RecordNotFoundError'
          description: The record that the client is trying to access does not exist.
        '429':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RateLimitError'
          description: >-
            The client has maxed out the number of calls within a time period on
            this resource.
        '500':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ServerError'
          description: Downstream system error.
      security:
        - BearerAuth: []
components:
  schemas:
    SubmitCardDetails:
      type: object
      properties:
        cardDetails:
          type: string
          description: Stringified card details
          example:
            cardCVV: 11
            cardExpiryMonth: 3
            cardExpiryYear: 2050
            cardNumber: '5190752909999995'
            cardPin: 1111
        key:
          type: string
          description: encryption key is data encrption is in use, else empty string
          example: ''
        orderReference:
          type: string
          description: the order reference returned when the order was created
          example: c4307d58-2513-41d8-b7f7-dfecd5f9fdbe
        saveCard:
          type: boolean
          description: >-
            if true, this this user cardn will be saved for the user's future
            use. Note the process is not complete until the user-card
            verification endpoints are called to authenticate the user's phone
            number.
          example: 'true'
        deviceInformation:
          $ref: '#/components/schemas/DeviceInformation'
    SubmitCardDetailsResponse:
      type: object
      properties:
        status:
          type: boolean
          description: true if the card details were submitted successfully
          example: 'true'
        message:
          type: string
          description: >-
            Response message describing the transaction status or further
            instruction for the user like the case of OTP
          example: Success
        responseCode:
          type: string
          description: >-
            response code from the payment gate way. 00 means transaction was
            successful and completed, T0 means an OTP has been sent to the user
            and should be entered next, SO means  3D Secure authentication is
            required and the client application needs to redirect to the 3D
            secure page based on the information provided in the 
            secureAuthenticationData field
          example: '00'
        transactionId:
          type: string
          description: >-
            the unique id of the transaction just created by the submittion of
            the card details. This value should be passed back to all API calls
            that require it.
          example: c4307d58-2513-41d8-b7f7-dfecd5f9fdbe
        secureAuthenticationData:
          $ref: '#/components/schemas/SecureAuthenticationData'
    RequestError:
      type: object
      description: Request Error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '400'
        description:
          type: string
          description: Additional details about the error.
          example: Request failed.
    AuthenticationError:
      type: object
      description: Authentication Error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '401'
        description:
          type: string
          description: Additional details about the error.
          example: Unauthorized
    AuthorizationError:
      type: object
      description: Permissions error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '403'
        description:
          type: string
          description: Additional details about the error.
          example: Forbidden
    RecordNotFoundError:
      type: object
      description: Record-Not-Found error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '404'
        description:
          type: string
          description: Additional details about the error.
          example: Record not found
    RateLimitError:
      type: object
      description: Rate-limit error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '429'
        description:
          type: string
          description: Additional details about the error.
          example: Too many requests
    ServerError:
      type: object
      description: Server error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '500'
        description:
          type: string
          description: Additional details about the error.
          example: Server error
    DeviceInformation:
      type: object
      description: Contains browser information for the device making the api calls
      properties:
        httpBrowserLanguage:
          type: string
          description: Browser language
          example: en-GB
        httpBrowserJavaEnabled:
          type: boolean
          description: true if Java is enabled in the browser in use
          example: 'true'
        httpBrowserJavaScriptEnabled:
          type: boolean
          description: true if Javascript is enabled in the browser in use
          example: 'true'
        httpBrowserColorDepth:
          type: string
          description: Browser color depth
          example: '30'
        httpBrowserScreenHeight:
          type: string
          description: Browser scren height
          example: '900'
        httpBrowserScreenWidth:
          type: string
          description: Browser screen weidth
          example: '1500'
        httpBrowserTimeDifference:
          type: string
          description: Browser time difference
          example: '-60'
        userAgentBrowserValue:
          type: string
          description: Browser user agent
          example: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)
        deviceChannel:
          type: string
          description: Device channel
          example: Browser
    SecureAuthenticationData:
      type: object
      description: >-
        Authentication data returned from the payment gateway when the payment
        card requires 3D Secure authentication. This data will be passed to the
      properties:
        jwt:
          type: string
          description: jwt token
          example: >-
            eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
        md:
          type: string
          description: encryption key is data encrption is in use, else empty string
          example: '6775843012'
        acsUrl:
          type: string
          description: the order reference returned when the order was created
          example: https://ip:port/merchant.com/callback
        termUrl:
          type: string
          description: the order reference returned when the order was created
          example: https://ip:port/merchant.com/callback
  securitySchemes:
    BearerAuth:
      description: >-
        Nomba authenticates API calls with [OAuth2 HTTP bearer
        tokens](http://tools.ietf.org/html/rfc6750). There are two methods of
        authentication; [Client-Credentials
        method](https://www.rfc-editor.org/rfc/rfc6749) and [PKCE (Proof Key for
        Code Exchange)](https://www.rfc-editor.org/rfc/rfc7636) method. In each
        of the methods, You will get an `ACCESS_TOKEN`. You need to use an
        `"Authorization"` HTTP header to provide your `ACCESS_TOKEN`. For
        example: `Authorization: {ACCESS_TOKEN}`.
      scheme: bearer
      type: http
      bearerFormat: JWT

````

> ## Documentation Index
> Fetch the complete documentation index at: https://developer.nomba.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Order details based on the generated Order reference

> Use this endpoint to fetch a single checkout order, using the order reference that was returned when the Order was created



## OpenAPI

````yaml get /v1/checkout/order/{orderReference}
openapi: 3.0.1
info:
  description: ''
  title: Vendor API
  version: 1.0.0
servers:
  - description: Production
    url: https://api.nomba.com
  - description: Sandbox
    url: https://sandbox.nomba.com
security: []
tags:
  - name: Authenticate
  - name: Accounts
  - name: Virtual Accounts
  - name: Online Checkout
  - name: Charge
  - name: Transfers
  - name: Direct Debits
  - name: Terminals
  - name: Transactions
  - name: Airtime and Data Vending
  - name: Electricity Vending
  - name: CableTV Subscription
  - name: Betting Vending
paths:
  /v1/checkout/order/{orderReference}:
    get:
      tags:
        - Charge
      summary: Get Order details based on the generated Order reference
      description: >-
        Use this endpoint to fetch a single checkout order, using the order
        reference that was returned when the Order was created
      operationId: Fetch Checkout order details
      parameters:
        - description: Order reference
          example: 693cd007-cd1e-4ea6-8b79-5f5c4d7a83ea
          in: path
          name: orderReference
          required: true
          schema:
            type: string
      responses:
        '200':
          content:
            application/json:
              schema:
                type: object
                properties:
                  code:
                    type: string
                    example: '00'
                    description: Response Code
                  description:
                    type: string
                    example: Success
                    description: Response description
                  data:
                    $ref: '#/components/schemas/GetOrderDetails'
                required:
                  - code
                  - description
                  - data
          description: OK - your request was successful.
          headers:
            X-Rate-Limit-Limit:
              description: The number of allowed requests in the current period
              schema:
                type: string
                example: '40'
            X-Rate-Limit-Remaining:
              description: The number of remaining requests in the current period
              schema:
                type: string
                example: '39'
            X-Rate-Limit-Window:
              description: The specified rate limit window
              schema:
                type: string
                example: 1s
        '400':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RequestError'
          description: The request body sent by merchant did not pass the validation checks
        '401':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthenticationError'
          description: >-
            The access_token provided to access the resource is missing or
            invalid.
        '403':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthorizationError'
          description: The client does not have the permissions to access this resource
        '404':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RecordNotFoundError'
          description: The record that the client is trying to access does not exist.
        '429':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RateLimitError'
          description: >-
            The client has maxed out the number of calls within a time period on
            this resource.
        '500':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ServerError'
          description: Downstream system error.
      security:
        - BearerAuth: []
components:
  schemas:
    GetOrderDetails:
      type: object
      properties:
        order:
          $ref: '#/components/schemas/OrderDetailsObject'
        hasSavedCards:
          type: boolean
          description: true if the user has saved cards
          example: 'true'
        base64EncodedRsaPublicKey:
          type: string
          description: >-
            Base64 encoded RSA public key, returned if data encryption is
            enabled to submit the card details, else an empty string
          example: '5844858382'
    RequestError:
      type: object
      description: Request Error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '400'
        description:
          type: string
          description: Additional details about the error.
          example: Request failed.
    AuthenticationError:
      type: object
      description: Authentication Error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '401'
        description:
          type: string
          description: Additional details about the error.
          example: Unauthorized
    AuthorizationError:
      type: object
      description: Permissions error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '403'
        description:
          type: string
          description: Additional details about the error.
          example: Forbidden
    RecordNotFoundError:
      type: object
      description: Record-Not-Found error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '404'
        description:
          type: string
          description: Additional details about the error.
          example: Record not found
    RateLimitError:
      type: object
      description: Rate-limit error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '429'
        description:
          type: string
          description: Additional details about the error.
          example: Too many requests
    ServerError:
      type: object
      description: Server error response.
      properties:
        code:
          type: string
          description: API error code.
          example: '500'
        description:
          type: string
          description: Additional details about the error.
          example: Server error
    OrderDetailsObject:
      type: object
      properties:
        orderId:
          type: string
          description: Id generated by Nomba for the checkout order
          example: 56e03654-0c32-4d3e-bbd6-a9df22994a12
        orderReference:
          type: string
          description: Reference of the online checkout order to be created
          example: 90e81e8a-bc14-4ebf-89c0-57da752cca58
        customerId:
          type: string
          description: Customer id
          example: '762878332454'
        accountId:
          type: string
          description: The account Id whose wallet will be credited when the order is paid
          example: 56e03654-0c32-4d3e-bbd6-a9df22994a12
        callbackUrl:
          type: string
          description: Merchant callback url for redirect after payment
          example: https://ip:port/merchant.com/callback
        customerEmail:
          type: string
          description: Customer email
          example: abcde@gmail.com
        amount:
          type: number
          format: double
          description: Amount to pay
          example: '10000.00'
        currency:
          type: string
          description: Currency of the money
          enum:
            - NGN
          example: NGN
        businessName:
          type: string
          description: Business Name
          example: Merchant Ltd
        businessEmail:
          type: string
          description: Business email
          example: abcde@gmail.com
        businessLogo:
          type: string
          description: Link to business logo
          example: https://ip:port/merchant.com/logo
  securitySchemes:
    BearerAuth:
      description: >-
        Nomba authenticates API calls with [OAuth2 HTTP bearer
        tokens](http://tools.ietf.org/html/rfc6750). There are two methods of
        authentication; [Client-Credentials
        method](https://www.rfc-editor.org/rfc/rfc6749) and [PKCE (Proof Key for
        Code Exchange)](https://www.rfc-editor.org/rfc/rfc7636) method. In each
        of the methods, You will get an `ACCESS_TOKEN`. You need to use an
        `"Authorization"` HTTP header to provide your `ACCESS_TOKEN`. For
        example: `Authorization: {ACCESS_TOKEN}`.
      scheme: bearer
      type: http
      bearerFormat: JWT

````