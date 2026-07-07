> ## Documentation Index
> Fetch the complete documentation index at: https://developer.nomba.com/llms.txt
> Use this file to discover all available pages before exploring further.

> Transfer funds between Nomba accounts (P2P). Bypasses external processors for near-instant settlement. Returns synchronously with `data.status: SUCCESS`. Note: wallet transfers do not return a `sessionId` — use the parent account requery endpoint for status checks.

# Perform wallet transfer from the parent account



## OpenAPI

````yaml post /v2/transfers/wallet
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
  /v2/transfers/wallet:
    post:
      tags:
        - Transfers
      summary: Perform wallet transfer from the parent account
      description: You can use this endpoint to perform a wallet transfer.
      operationId: Perform wallet transfer from the parent account
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
              $ref: '#/components/schemas/WalletTransferRequest'
        description: The request payload required to perform a wallet transfer.
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
                    $ref: '#/components/schemas/WalletTransferResult'
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
        '201':
          content:
            application/json:
              schema:
                type: object
                properties:
                  code:
                    type: string
                    example: '201'
                  description:
                    type: string
                    example: PROCESSING
                  message:
                    type: string
                    example: Unable to process response, please rely on web hook
                  status:
                    type: boolean
                    example: false
                  data:
                    type: object
                    properties:
                      status:
                        type: string
                        example: PENDING_BILLING
          description: >-
            Transfer is being processed — the final status will be delivered via
            webhook. Mark the transaction as pending and do not retry with a new
            reference.
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
    WalletTransferRequest:
      type: object
      description: A structure representing an object required to post a wallet transfer.
      properties:
        amount:
          type: number
          format: double
          description: The amount to be transferred.
          example: 3500
        receiverAccountId:
          type: string
          format: uuid
          description: The receiver's accountId.
          example: 890022ce-bae0-45c1-9b9d-ee7872e6ca27
        merchantTxRef:
          type: string
          description: >-
            Unique reference used to track a transaction from an external
            process. 
             
            This is an idempotency key and must be unique per transaction.
          example: UNQ_123abGGhh5546
        narration:
          type: string
          description: The payment narration
          example: Testing Payment
      required:
        - amount
        - receiverAccountId
        - merchantTxRef
    WalletTransferResult:
      type: object
      properties:
        amount:
          type: number
          format: double
          description: Transfer amount
          example: 5502
        meta:
          $ref: '#/components/schemas/WalletTransferMetaObject'
        fee:
          type: number
          format: double
          description: Transfer fee
          example: 50
        timeCreated:
          type: string
          format: date-time
          description: Creation timestamp
          example: '2023-09-08T14:17:13.634Z'
        id:
          type: string
          description: Transfer ID
          example: API-P2P-C24AD-a6443bf0-011c-4bc2-b739-4a2e33e2a27b
        type:
          type: string
          description: Transaction type
          enum:
            - withdrawal
            - purchase
            - transfer
            - p2p
            - online_checkout
            - qrt_credit
            - qrt_debit
          example: p2p
        status:
          type: string
          description: Transaction status
          enum:
            - SUCCESS
            - PENDING_BILLING
            - REFUND
            - CANCELLED
            - PAYMENT_FAILED
            - REVERSED_BY_VENDOR
          example: SUCCESS
      required:
        - amount
        - meta
        - fee
        - timeCreated
        - id
        - type
        - status
      description: Transfer data
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
    WalletTransferMetaObject:
      type: object
      properties:
        merchantTxRef:
          type: string
          description: Merchant transaction reference
          example: 3JVW2xJCjj443oannREBuTaXDdji
        api_client_id:
          type: string
          description: API client ID
          example: 6a7bed88-7c93-4a1c-a445-f88edbca6489
        api_account_id:
          type: string
          description: API account ID
          example: 01a10aeb-d989-460a-bbde-9842f2b4320f
        rrn:
          type: string
          description: RRN (Retrieval Reference Number)
          example: '230908151711'
      description: Transaction meta data
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

> Transfer funds from a specific sub-account to another Nomba account (P2P). Near-instant settlement with no external processor. Sub-account transfers must be enabled by Nomba before use.

# Perform wallet transfer from a sub account



## OpenAPI

````yaml post /v2/transfers/wallet/{subAccountId}
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
  /v2/transfers/wallet/{subAccountId}:
    post:
      tags:
        - Transfers
      summary: Perform wallet transfer from a sub account
      description: >-
        You can use this endpoint to perform a wallet transfer from a sub
        account
      operationId: Perform wallet transfer from a sub account
      parameters:
        - description: The parent accountId of the business.
          in: header
          name: accountId
          schema:
            type: string
            format: uuid
            example: 890022ce-bae0-45c1-9b9d-ee7872e6ca27
          required: true
        - description: The accountId to transfer from.
          example: 2242b79d-f2cf-4ccc-ada1-e890bd1a9f0d
          in: path
          name: subAccountId
          required: true
          schema:
            type: string
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/WalletTransferRequest'
        description: The request payload required to perform a wallet transfer.
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
                    $ref: '#/components/schemas/WalletTransferResult'
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
        '201':
          content:
            application/json:
              schema:
                type: object
                properties:
                  code:
                    type: string
                    example: '201'
                  description:
                    type: string
                    example: PROCESSING
                  message:
                    type: string
                    example: Unable to process response, please rely on web hook
                  status:
                    type: boolean
                    example: false
                  data:
                    type: object
                    properties:
                      status:
                        type: string
                        example: PENDING_BILLING
          description: >-
            Transfer is being processed — the final status will be delivered via
            webhook. Mark the transaction as pending and do not retry with a new
            reference.
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
    WalletTransferRequest:
      type: object
      description: A structure representing an object required to post a wallet transfer.
      properties:
        amount:
          type: number
          format: double
          description: The amount to be transferred.
          example: 3500
        receiverAccountId:
          type: string
          format: uuid
          description: The receiver's accountId.
          example: 890022ce-bae0-45c1-9b9d-ee7872e6ca27
        merchantTxRef:
          type: string
          description: >-
            Unique reference used to track a transaction from an external
            process. 
             
            This is an idempotency key and must be unique per transaction.
          example: UNQ_123abGGhh5546
        narration:
          type: string
          description: The payment narration
          example: Testing Payment
      required:
        - amount
        - receiverAccountId
        - merchantTxRef
    WalletTransferResult:
      type: object
      properties:
        amount:
          type: number
          format: double
          description: Transfer amount
          example: 5502
        meta:
          $ref: '#/components/schemas/WalletTransferMetaObject'
        fee:
          type: number
          format: double
          description: Transfer fee
          example: 50
        timeCreated:
          type: string
          format: date-time
          description: Creation timestamp
          example: '2023-09-08T14:17:13.634Z'
        id:
          type: string
          description: Transfer ID
          example: API-P2P-C24AD-a6443bf0-011c-4bc2-b739-4a2e33e2a27b
        type:
          type: string
          description: Transaction type
          enum:
            - withdrawal
            - purchase
            - transfer
            - p2p
            - online_checkout
            - qrt_credit
            - qrt_debit
          example: p2p
        status:
          type: string
          description: Transaction status
          enum:
            - SUCCESS
            - PENDING_BILLING
            - REFUND
            - CANCELLED
            - PAYMENT_FAILED
            - REVERSED_BY_VENDOR
          example: SUCCESS
      required:
        - amount
        - meta
        - fee
        - timeCreated
        - id
        - type
        - status
      description: Transfer data
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
    WalletTransferMetaObject:
      type: object
      properties:
        merchantTxRef:
          type: string
          description: Merchant transaction reference
          example: 3JVW2xJCjj443oannREBuTaXDdji
        api_client_id:
          type: string
          description: API client ID
          example: 6a7bed88-7c93-4a1c-a445-f88edbca6489
        api_account_id:
          type: string
          description: API account ID
          example: 01a10aeb-d989-460a-bbde-9842f2b4320f
        rrn:
          type: string
          description: RRN (Retrieval Reference Number)
          example: '230908151711'
      description: Transaction meta data
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

> Initiate a bank transfer from a specific sub-account. Useful when managing multiple balances under your main account. Sub-account transfers must be enabled by Nomba before use. Sub-accounts can only be created from the Nomba dashboard.

# Perform bank account transfer from the sub account



## OpenAPI

````yaml post /v2/transfers/bank/{subAccountId}
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
  /v2/transfers/bank/{subAccountId}:
    post:
      tags:
        - Transfers
      summary: Perform bank account transfer from the sub account
      description: >-
        You can use this endpoint to perform bank account transfer using a sub
        account. 
         To use this, please reach out to us to profile you for sub account transfer.
      operationId: Perform bank account transfer from account
      parameters:
        - description: The parent accountId of the business.
          in: header
          name: accountId
          schema:
            type: string
            format: uuid
            example: 890022ce-bae0-45c1-9b9d-ee7872e6ca27
          required: true
        - description: The sub accountId to transfer from.
          example: 2242b79d-f2cf-4ccc-ada1-e890bd1a9f0d
          in: path
          name: subAccountId
          required: true
          schema:
            type: string
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/BankAccountTransferRequest'
        description: The request payload required to perform bank account transfer.
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
                    $ref: '#/components/schemas/BankAccountTransferResult'
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
        '201':
          content:
            application/json:
              schema:
                type: object
                properties:
                  code:
                    type: string
                    example: '201'
                  description:
                    type: string
                    example: PROCESSING
                  message:
                    type: string
                    example: Unable to process response, please rely on web hook
                  status:
                    type: boolean
                    example: false
                  data:
                    type: object
                    properties:
                      status:
                        type: string
                        example: PENDING_BILLING
          description: >-
            Transfer is being processed — the final status will be delivered via
            webhook. Mark the transaction as pending and do not retry with a new
            reference.
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
    BankAccountTransferRequest:
      type: object
      description: >-
        A structure representing an object required to post a bank account
        transfer.
      properties:
        amount:
          type: number
          format: double
          description: The amount to be transferred.
          example: 3500
        accountNumber:
          type: string
          description: The destination bank account number.
          example: '0554772814'
          maxLength: 10
          minLength: 10
        accountName:
          type: string
          description: The name on the account.
          example: M.A Animashaun
        bankCode:
          type: string
          description: The code of the recipient bank.
          example: '058'
        merchantTxRef:
          type: string
          description: >-
            Unique reference used to track a transaction from an external
            process. 
             
            This is an idempotency key and must be unique per transaction.
          example: UNQ_123abGGhh5546
        senderName:
          type: string
          description: Sender name
          example: Nightly Post
        narration:
          type: string
          description: The payment narration
          example: Testing Payment
      required:
        - amount
        - accountNumber
        - bankCode
        - accountName
        - merchantTxRef
    BankAccountTransferResult:
      type: object
      properties:
        amount:
          type: string
          description: Amount to be transfer
          example: '1.0'
        source:
          type: string
          description: Trnsfer source could be web, api etc..
          example: api
        sourceUserId:
          type: string
          description: Source user ID
          example: 11ec45a1-1fe5-44f5-8baf-cxxxxxxxxxx
        customerBillerId:
          type: string
          description: Customer biller ID
          example: 010784xxxx
        productId:
          type: string
          description: A unique number for the product
          example: '058'
        meta:
          $ref: '#/components/schemas/BankAccountTransferMetaObject'
        fee:
          type: number
          format: double
          description: Transfer fee
          example: 50
        timeCreated:
          type: string
          format: date-time
          description: Creation timestamp
          example: '2026-03-08T14:17:13.634Z'
        id:
          type: string
          description: Transfer ID
          example: API-TRANSFER-C24AD-a6443bf0-011c-4bc2-b739-4a2e33e2a27b
        type:
          type: string
          description: Transaction type
          enum:
            - withdrawal
            - purchase
            - transfer
            - p2p
            - online_checkout
            - qrt_credit
            - qrt_debit
          example: transfer
        status:
          type: string
          description: Transaction status
          enum:
            - SUCCESS
            - PENDING_BILLING
          example: SUCCESS
      required:
        - amount
        - meta
        - fee
        - timeCreated
        - id
        - type
        - status
      description: Transfer data
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
    BankAccountTransferMetaObject:
      type: object
      properties:
        api_rrn:
          type: string
          description: API RRN
          example: 2309081xxxxxx
        narration:
          type: string
          description: Transfer naration
          example: Testing
        recipientName:
          type: string
          description: Fund recipient name
          example: John doe
        sender_name:
          type: string
          description: Name of transfer initiator
          example: Nightly Post
        merchantTxRef:
          type: string
          description: Merchant transaction reference
          example: 3JVW2xJCjj443oannREBuTaXDdji
        api_client_id:
          type: string
          description: API client ID
          example: 6a7bed88-7c93-4a1c-a445-f88edbca6489
        currency:
          type: string
          description: Currency code
          example: NGN
        hooksEligible:
          type: string
          description: Hooks eligible
          example: 'true'
        banking_entity_id:
          type: string
          description: API account ID
          example: 842f2b4320f
        banking_entity_user_id:
          type: string
          description: API account ID
          example: 01a10aeb-d989-460a-bbde-9842f2b4320f
        banking_entity_type:
          type: string
          description: Bank entity type
          example: 9842f2b4320f
        self_transaction:
          type: string
          description: Self transaction
          example: 'true'
        transactionCategory:
          type: string
          description: Family and Kids
          example: '128735648'
        accountNumber:
          type: string
          description: API account ID
          example: '0127667384'
        bankName:
          type: string
          description: Recipient bank name
          example: GTbank
        bankCode:
          type: string
          description: Bank code
          example: '058'
        sessionId:
          type: string
          description: Session ID
          example: ''
        user_referral_code:
          type: string
          description: Referral code
          example: HABI76745
        amount_charged:
          type: string
          description: Amount charged
          example: '21.0'
        paymentVendor:
          type: string
          description: Paytment vendor type
          example: Wallet
        wallet_balance:
          type: string
          description: Wallet balance
          example: '5.38'
        wallet_currency:
          type: string
          description: Currency code for the payment
          example: NGN
        paymentVendorReference:
          type: string
          description: Payment vendor reference
          example: 01a10aeb-d989-460a-bbde-9840f
        agent_commission:
          type: string
          description: Agent commision
          example: '0.0'
        useV2Fulfilment:
          type: string
          description: check fulfulment value
          example: 'true'
      description: Transaction meta data
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

> Initiate a bank transfer from the parent account to an external Nigerian bank. Returns immediately with a `data.status` of `SUCCESS` or `PENDING_BILLING`. Listen for webhook notifications for final status, or poll using the returned `data.id`. On failure, the account is auto-refunded and status becomes `REFUND`.

# Perform bank account transfer from the parent account



## OpenAPI

````yaml post /v2/transfers/bank
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
  /v2/transfers/bank:
    post:
      tags:
        - Transfers
      summary: Perform bank account transfer from the parent account
      description: You can use this endpoint to perform bank account transfer.
      operationId: Perform bank account transfer from the parent account
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
              $ref: '#/components/schemas/BankAccountTransferRequest'
        description: The request payload required to perform bank account transfer.
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
                    example: '200'
                    description: Response Code
                  description:
                    type: string
                    example: SUCCESS
                    enum:
                      - SUCCESS
                      - PROCESSING
                      - FAILED
                      - BAD_REQUEST
                      - INSUFFICIENT_BALANCE
                      - ACCOUNT_NOT_FOUND
                      - INVALID_TRANSACTION
                      - WALLET_NOT_FOUND
                      - BLACKLISTED
                    description: Response description
                  message:
                    type: string
                    example: Success
                    description: Returned response message
                  status:
                    type: boolean
                    example: 'true'
                    description: Response status
                  data:
                    $ref: '#/components/schemas/BankAccountTransferResult'
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
        '201':
          content:
            application/json:
              schema:
                type: object
                properties:
                  code:
                    type: string
                    example: '201'
                  description:
                    type: string
                    example: PROCESSING
                  message:
                    type: string
                    example: Unable to process response, please rely on web hook
                  status:
                    type: boolean
                    example: false
                  data:
                    type: object
                    properties:
                      status:
                        type: string
                        example: PENDING_BILLING
          description: >-
            Transfer is being processed — the final status will be delivered via
            webhook. Mark the transaction as pending and do not retry with a new
            reference.
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
    BankAccountTransferRequest:
      type: object
      description: >-
        A structure representing an object required to post a bank account
        transfer.
      properties:
        amount:
          type: number
          format: double
          description: The amount to be transferred.
          example: 3500
        accountNumber:
          type: string
          description: The destination bank account number.
          example: '0554772814'
          maxLength: 10
          minLength: 10
        accountName:
          type: string
          description: The name on the account.
          example: M.A Animashaun
        bankCode:
          type: string
          description: The code of the recipient bank.
          example: '058'
        merchantTxRef:
          type: string
          description: >-
            Unique reference used to track a transaction from an external
            process. 
             
            This is an idempotency key and must be unique per transaction.
          example: UNQ_123abGGhh5546
        senderName:
          type: string
          description: Sender name
          example: Nightly Post
        narration:
          type: string
          description: The payment narration
          example: Testing Payment
      required:
        - amount
        - accountNumber
        - bankCode
        - accountName
        - merchantTxRef
    BankAccountTransferResult:
      type: object
      properties:
        amount:
          type: string
          description: Amount to be transfer
          example: '1.0'
        source:
          type: string
          description: Trnsfer source could be web, api etc..
          example: api
        sourceUserId:
          type: string
          description: Source user ID
          example: 11ec45a1-1fe5-44f5-8baf-cxxxxxxxxxx
        customerBillerId:
          type: string
          description: Customer biller ID
          example: 010784xxxx
        productId:
          type: string
          description: A unique number for the product
          example: '058'
        meta:
          $ref: '#/components/schemas/BankAccountTransferMetaObject'
        fee:
          type: number
          format: double
          description: Transfer fee
          example: 50
        timeCreated:
          type: string
          format: date-time
          description: Creation timestamp
          example: '2026-03-08T14:17:13.634Z'
        id:
          type: string
          description: Transfer ID
          example: API-TRANSFER-C24AD-a6443bf0-011c-4bc2-b739-4a2e33e2a27b
        type:
          type: string
          description: Transaction type
          enum:
            - withdrawal
            - purchase
            - transfer
            - p2p
            - online_checkout
            - qrt_credit
            - qrt_debit
          example: transfer
        status:
          type: string
          description: Transaction status
          enum:
            - SUCCESS
            - PENDING_BILLING
          example: SUCCESS
      required:
        - amount
        - meta
        - fee
        - timeCreated
        - id
        - type
        - status
      description: Transfer data
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
    BankAccountTransferMetaObject:
      type: object
      properties:
        api_rrn:
          type: string
          description: API RRN
          example: 2309081xxxxxx
        narration:
          type: string
          description: Transfer naration
          example: Testing
        recipientName:
          type: string
          description: Fund recipient name
          example: John doe
        sender_name:
          type: string
          description: Name of transfer initiator
          example: Nightly Post
        merchantTxRef:
          type: string
          description: Merchant transaction reference
          example: 3JVW2xJCjj443oannREBuTaXDdji
        api_client_id:
          type: string
          description: API client ID
          example: 6a7bed88-7c93-4a1c-a445-f88edbca6489
        currency:
          type: string
          description: Currency code
          example: NGN
        hooksEligible:
          type: string
          description: Hooks eligible
          example: 'true'
        banking_entity_id:
          type: string
          description: API account ID
          example: 842f2b4320f
        banking_entity_user_id:
          type: string
          description: API account ID
          example: 01a10aeb-d989-460a-bbde-9842f2b4320f
        banking_entity_type:
          type: string
          description: Bank entity type
          example: 9842f2b4320f
        self_transaction:
          type: string
          description: Self transaction
          example: 'true'
        transactionCategory:
          type: string
          description: Family and Kids
          example: '128735648'
        accountNumber:
          type: string
          description: API account ID
          example: '0127667384'
        bankName:
          type: string
          description: Recipient bank name
          example: GTbank
        bankCode:
          type: string
          description: Bank code
          example: '058'
        sessionId:
          type: string
          description: Session ID
          example: ''
        user_referral_code:
          type: string
          description: Referral code
          example: HABI76745
        amount_charged:
          type: string
          description: Amount charged
          example: '21.0'
        paymentVendor:
          type: string
          description: Paytment vendor type
          example: Wallet
        wallet_balance:
          type: string
          description: Wallet balance
          example: '5.38'
        wallet_currency:
          type: string
          description: Currency code for the payment
          example: NGN
        paymentVendorReference:
          type: string
          description: Payment vendor reference
          example: 01a10aeb-d989-460a-bbde-9840f
        agent_commission:
          type: string
          description: Agent commision
          example: '0.0'
        useV2Fulfilment:
          type: string
          description: check fulfulment value
          example: 'true'
      description: Transaction meta data
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

> Verify a recipient bank account number before initiating a transfer. Returns the account holder's name. Always call this before a bank transfer so users can confirm the recipient.

# Perform bank account lookup



## OpenAPI

````yaml post /v1/transfers/bank/lookup
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
  /v1/transfers/bank/lookup:
    post:
      tags:
        - Transfers
      summary: Perform bank account lookup
      description: You can use this endpoint to perform bank account lookup.
      operationId: Perform bank account lookup
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
              $ref: '#/components/schemas/BankAccountLookupRequest'
        description: The request payload required to perform bank account lookup
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
                    $ref: '#/components/schemas/BankAccountLookupResult'
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
    BankAccountLookupRequest:
      type: object
      description: A structure representing a bank account lookup request
      properties:
        accountNumber:
          type: string
          description: The account number to be looked up.
          example: '0554772814'
          maxLength: 10
          minLength: 10
        bankCode:
          type: string
          description: >-
            The bankCode of the bank the account number belongs to. This can be
            obtained from a call to `/v1/transfers/banks` 
          example: '053'
      required:
        - accountNumber
        - bankCode
    BankAccountLookupResult:
      type: object
      description: A structure representing a bank account lookup result
      properties:
        accountNumber:
          type: string
          description: The account number already looked up.
          example: '0554772814'
          maxLength: 10
          minLength: 10
        accountName:
          type: string
          description: The name on the account.
          example: M.A Animashaun
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

> Retrieve all supported Nigerian banks with their codes and names. Cache this response — bank codes rarely change. Use the `code` field as `bankCode` in transfer and account lookup requests.

# Fetch bank codes and names



## OpenAPI

````yaml get /v1/transfers/banks
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
  /v1/transfers/banks:
    get:
      tags:
        - Transfers
      summary: Fetch bank codes and names
      description: You can use this endpoint to fetch all banks, their names and codes.
      operationId: Fetch bank codes and names
      parameters:
        - description: The parent accountId of the business.
          in: header
          name: accountId
          schema:
            type: string
            format: uuid
            example: 890022ce-bae0-45c1-9b9d-ee7872e6ca27
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
                    $ref: '#/components/schemas/BanksListResults'
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
        '202':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthenticationError'
          description: >-
            The access_token provided to access the resource is missing or
            invalid.
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
    BanksListResults:
      type: object
      properties:
        results:
          type: array
          description: Contains result of all banks fetched
          items:
            $ref: '#/components/schemas/Banks'
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
    Banks:
      type: object
      description: A structure representing a bank
      properties:
        code:
          type: string
          description: The bank's code.
          example: '058'
          maxLength: 6
          minLength: 3
        name:
          type: string
          description: The bank's name.
          example: Guaranty Trust Bank
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

# Fetch transactions on the parent account

> You can use this endpoint to fetch transactions on the parent account.



## OpenAPI

````yaml get /v1/transactions/accounts
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
  /v1/transactions/accounts:
    get:
      tags:
        - Transactions
      summary: Fetch transactions on the parent account
      description: You can use this endpoint to fetch transactions on the parent account.
      operationId: Fetch transactions on the parent account
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
            This endpoint is paginated. `limit` describes the size of the page
            you are querying
          example: 10
          in: query
          name: limit
          schema:
            type: integer
            format: int32
          required: false
        - description: >-
            The `cursor` is used to scroll to the next page. When making the
            first call to list all accounts, there is no need to pass in any
            cursor since the API has not returned any cursor back to you. Only
            use cursor when the API provides it
          example: xchbaVFsjdsbaADddd
          in: query
          name: cursor
          schema:
            type: string
          required: false
        - description: 'This starting date (UTC). Sample date: `2023-01-01T00:00:00`'
          in: query
          name: dateFrom
          example: '2023-09-08T00:00:00.007Z'
          schema:
            type: string
          required: false
        - description: 'This ending date (UTC). Sample date: `2024-09-30T23:59:59`'
          in: query
          name: dateTo
          example: '2023-08-08T23:59:59.007Z'
          schema:
            type: string
          required: false
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
                    $ref: '#/components/schemas/TransactionListResults'
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
    TransactionListResults:
      type: object
      properties:
        results:
          type: array
          description: Contains list of transactions
          items:
            $ref: '#/components/schemas/TransactionResult'
        cursor:
          type: string
          description: >-
            Cursor for pagination. It will be empty if there is no more page to
            scroll to
          example: xchbaVFsjdsbaADddd
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
    TransactionResult:
      type: object
      properties:
        id:
          type: string
          description: Transaction ID
          example: POS-WITHDRAW-DFC05-693cd007-cd1e-4ea6-8b79-5f5c4d7a83ea
        status:
          type: string
          description: |-
            Transaction status. 
             `SUCCESS` means the transaction was successful. 
             `REFUND` means the transaction failed and has been refunded to your account. 
             `PENDING_BILLING`, `CANCELLED`, `PAYMENT_FAILED`, and `REVERSED_BY_VENDOR` mean the transaction is pending.
          enum:
            - SUCCESS
            - PENDING_BILLING
            - REFUND
            - CANCELLED
            - PAYMENT_FAILED
            - REVERSED_BY_VENDOR
          example: SUCCESS
        amount:
          type: number
          format: double
          description: Transaction amount
          example: 4000
        fixedCharge:
          type: number
          format: double
          description: Fixed charge
          example: 0
        source:
          type: string
          description: Transaction source
          enum:
            - api
            - pos
            - web
            - android_app
            - ios_app
          example: pos
        type:
          type: string
          description: Transaction type
          enum:
            - withdrawal
            - purchase
            - transfer
            - p2p
            - online_checkout
            - qrt_credit
            - qrt_debit
          example: withdrawal
        gatewayMessage:
          type: string
          description: Gateway message
          example: SUCCESS
        customerBillerId:
          type: string
          description: Customer biller ID
          example: 539983 **** **** 5118
        timeCreated:
          type: string
          format: date-time
          description: Creation timestamp
          example: '2026-03-08T19:26:34.657000Z'
        posTid:
          type: string
          description: POS terminal ID
          example: 2KUD4AKB
        terminalId:
          type: string
          description: Terminal ID
          example: 2KUD4AKB
        providerTerminalId:
          type: string
          description: Provider terminal ID
          example: 2KUD4AKB
        rrn:
          type: string
          description: RRN (Retrieval Reference Number)
          example: '230908202632'
        posSerialNumber:
          type: string
          description: POS serial number
          example: '91230309116826'
        posTerminalLabel:
          type: string
          description: POS terminal label
          example: KEB MUSA ABUBAKAR
        stan:
          type: string
          description: STAN (System Trace Audit Number)
          example: '556734'
        paymentVendorReference:
          type: string
          description: Payment vendor reference
          example: 2KUD4AKB230908202632
        userId:
          type: string
          description: User ID
          example: dfc05ca1-4e75-41dd-8e41-2d362d565893
        posRrn:
          type: string
          description: POS RRN (Retrieval Reference Number)
          example: '230908202632'
        merchantTxRef:
          type: string
          description: Merchant transaction reference
          example: c90d-4b25-ad0f
      required:
        - id
        - status
        - amount
        - source
        - type
        - gatewayMessage
        - timeCreated
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

# Fetch transactions on a sub account

> You can use this endpoint to fetch transactions on a sub account.



## OpenAPI

````yaml get /v1/transactions/accounts/{subAccountId}
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
  /v1/transactions/accounts/{subAccountId}:
    get:
      tags:
        - Transactions
      summary: Fetch transactions on a sub account
      description: You can use this endpoint to fetch transactions on a sub account.
      operationId: Fetch transactions on a sub account
      parameters:
        - description: The parent accountId of the business.
          in: header
          name: accountId
          schema:
            type: string
            format: uuid
            example: 890022ce-bae0-45c1-9b9d-ee7872e6ca27
          required: true
        - description: The sub accountId of the business.
          example: 2242b79d-f2cf-4ccc-ada1-e890bd1a9f0d
          in: path
          name: subAccountId
          required: true
          schema:
            type: string
        - description: >-
            This endpoint is paginated. `limit` describes the size of the page
            you are querying
          example: 10
          in: query
          name: limit
          schema:
            type: integer
            format: int32
          required: false
        - description: >-
            The `cursor` is used to scroll to the next page. When making the
            first call to list all accounts, there is no need to pass in any
            cursor since the API has not returned any cursor back to you. Only
            use cursor when the API provides it
          example: xchbaVFsjdsbaADddd
          in: query
          name: cursor
          schema:
            type: string
          required: false
        - description: 'This starting date (UTC). Sample date: `2023-01-01T00:00:00`'
          in: query
          name: dateFrom
          example: '2023-09-08T00:00:00.007Z'
          schema:
            type: string
          required: false
        - description: 'This ending date (UTC). Sample date: `2024-09-30T23:59:59`'
          in: query
          name: dateTo
          example: '2023-08-08T23:59:59.007Z'
          schema:
            type: string
          required: false
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
                    $ref: '#/components/schemas/TransactionListResults'
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
    TransactionListResults:
      type: object
      properties:
        results:
          type: array
          description: Contains list of transactions
          items:
            $ref: '#/components/schemas/TransactionResult'
        cursor:
          type: string
          description: >-
            Cursor for pagination. It will be empty if there is no more page to
            scroll to
          example: xchbaVFsjdsbaADddd
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
    TransactionResult:
      type: object
      properties:
        id:
          type: string
          description: Transaction ID
          example: POS-WITHDRAW-DFC05-693cd007-cd1e-4ea6-8b79-5f5c4d7a83ea
        status:
          type: string
          description: |-
            Transaction status. 
             `SUCCESS` means the transaction was successful. 
             `REFUND` means the transaction failed and has been refunded to your account. 
             `PENDING_BILLING`, `CANCELLED`, `PAYMENT_FAILED`, and `REVERSED_BY_VENDOR` mean the transaction is pending.
          enum:
            - SUCCESS
            - PENDING_BILLING
            - REFUND
            - CANCELLED
            - PAYMENT_FAILED
            - REVERSED_BY_VENDOR
          example: SUCCESS
        amount:
          type: number
          format: double
          description: Transaction amount
          example: 4000
        fixedCharge:
          type: number
          format: double
          description: Fixed charge
          example: 0
        source:
          type: string
          description: Transaction source
          enum:
            - api
            - pos
            - web
            - android_app
            - ios_app
          example: pos
        type:
          type: string
          description: Transaction type
          enum:
            - withdrawal
            - purchase
            - transfer
            - p2p
            - online_checkout
            - qrt_credit
            - qrt_debit
          example: withdrawal
        gatewayMessage:
          type: string
          description: Gateway message
          example: SUCCESS
        customerBillerId:
          type: string
          description: Customer biller ID
          example: 539983 **** **** 5118
        timeCreated:
          type: string
          format: date-time
          description: Creation timestamp
          example: '2026-03-08T19:26:34.657000Z'
        posTid:
          type: string
          description: POS terminal ID
          example: 2KUD4AKB
        terminalId:
          type: string
          description: Terminal ID
          example: 2KUD4AKB
        providerTerminalId:
          type: string
          description: Provider terminal ID
          example: 2KUD4AKB
        rrn:
          type: string
          description: RRN (Retrieval Reference Number)
          example: '230908202632'
        posSerialNumber:
          type: string
          description: POS serial number
          example: '91230309116826'
        posTerminalLabel:
          type: string
          description: POS terminal label
          example: KEB MUSA ABUBAKAR
        stan:
          type: string
          description: STAN (System Trace Audit Number)
          example: '556734'
        paymentVendorReference:
          type: string
          description: Payment vendor reference
          example: 2KUD4AKB230908202632
        userId:
          type: string
          description: User ID
          example: dfc05ca1-4e75-41dd-8e41-2d362d565893
        posRrn:
          type: string
          description: POS RRN (Retrieval Reference Number)
          example: '230908202632'
        merchantTxRef:
          type: string
          description: Merchant transaction reference
          example: c90d-4b25-ad0f
      required:
        - id
        - status
        - amount
        - source
        - type
        - gatewayMessage
        - timeCreated
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