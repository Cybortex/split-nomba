> ## Documentation Index
> Fetch the complete documentation index at: https://developer.nomba.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Update a virtual account

> You can use this endpoint to update a virtual account.



## OpenAPI

````yaml put /v1/accounts/virtual/{identifier}
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
  /v1/accounts/virtual/{identifier}:
    put:
      tags:
        - Virtual Accounts
      summary: Update a virtual account
      description: You can use this endpoint to update a virtual account.
      operationId: Update a virtual account
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
            The account reference or 10 digit Virtual account number of the VA
            to be updated.
          example: INVOICE-20230823-0000 or 0107841806
          in: path
          name: identifier
          required: true
          schema:
            type: string
            example: INVOICE-20230823-0000 or 0107841806
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpdateVirtualAccountRequest'
        description: |-
          The request payload required to update a virtual account. 
           Please note that it might take a few seconds for the update to reflect in other banks depending on the bank's notification system.
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
                    $ref: '#/components/schemas/UpdateVirtualAccountResponse'
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
    UpdateVirtualAccountRequest:
      type: object
      properties:
        newAccountRef:
          type: string
          description: >-
            The new accountReference you want to issue to the Virtual account.
            This will be the value advised in webhook post update
          minLength: 8
          maxLength: 64
          example: INVOICE_20230908_0001
        accountName:
          type: string
          description: Account holder's name you want to update to
          minLength: 8
          maxLength: 64
          example: Daniel Scorsese
        callbackUrl:
          type: string
          description: Callback url you want to update to
          format: url
          example: https://webhook.site/98ef100f-5adc-4434-800a-0808h60bd8d7
        expectedAmount:
          type: string
          description: >-
            If passed, the virtual account will only accept payments for this
            amount. Be careful as once being set this Virtual account can never
            take any amount again, thou you can always update the expected
            amount
          example: '100.0'
    UpdateVirtualAccountResponse:
      type: object
      properties:
        updated:
          type: boolean
          description: Successfully updated
          example: true
      required:
        - updated
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

# Fetch a virtual account

> You can use this endpoint to fetch a virtual account.



## OpenAPI

````yaml get /v1/accounts/virtual/{identifier}
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
  /v1/accounts/virtual/{identifier}:
    get:
      tags:
        - Virtual Accounts
      summary: Fetch a virtual account
      description: You can use this endpoint to fetch a virtual account.
      operationId: Fetch a virtual account
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
            The account reference or virtual account number of the virtual
            account to be fetched.
          example: 3UixJxjfeEZacxYbiNNAJa5R4e9DR
          in: path
          name: identifier
          required: true
          schema:
            type: string
            example: 3UixJxjfeEZacxYbiNNAJa5R4e9DR
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
                    $ref: '#/components/schemas/VirtualAccountObject'
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
    VirtualAccountObject:
      type: object
      properties:
        createdAt:
          type: string
          description: Creation timestamp
          format: date-time
          example: '2023-09-04T07:09:06.900Z'
        accountHolderId:
          type: string
          description: Account holder ID
          minLength: 36
          maxLength: 36
          example: 01a10aeb-d989-460a-bbde-9842f2b4320f
        accountRef:
          type: string
          description: Account reference
          minLength: 16
          maxLength: 64
          example: 1oWbJQQHLyQqqf1SwxjSpudeA21
        bvn:
          type: string
          description: Bank Verification Number (BVN)
          minLength: 11
          maxLength: 11
          example: '12234412345'
        accountName:
          type: string
          description: Account holder's name
          minLength: 8
          maxLength: 64
          example: Daniel Scorsese
        bankName:
          type: string
          description: Bank name
          example: Nombank MFB
        bankAccountNumber:
          type: string
          description: Bank account number
          example: '9391076543'
        bankAccountName:
          type: string
          description: Bank account holder name
          example: Nomba/Ifeoluwa Adeboye
        currency:
          type: string
          description: Currency code
          minLength: 3
          maxLength: 3
          enum:
            - NGN
          example: NGN
        callbackUrl:
          type: string
          description: Callback url
          format: url
          example: https://webhook.site/98ef100f-5adc-4434-800a-0808h60bd8d7
        expired:
          type: boolean
          description: Successfully updated
          example: true
      required:
        - createdAt
        - accountHolderId
        - accountRef
        - bvn
        - accountName
        - bankName
        - bankAccountName
        - bankAccountNumber
        - currency
        - callbackUrl
        - expired
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

# Filter virtual accounts

> You can use this endpoint to filter your virtual accounts.



## OpenAPI

````yaml post /v1/accounts/virtual/list
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
  /v1/accounts/virtual/list:
    post:
      tags:
        - Virtual Accounts
      summary: Filter virtual accounts
      description: You can use this endpoint to filter your virtual accounts.
      operationId: Filter virtual accounts
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
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/FilterVirtualAccountRequest'
        description: The request payload required to filter virtual accounts.
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
                    $ref: '#/components/schemas/VirtualAccountListResults'
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
    FilterVirtualAccountRequest:
      type: object
      properties:
        accountName:
          type: string
          description: Account holder's name
          minLength: 8
          maxLength: 64
          example: Daniel Scorsese
        accountRef:
          type: string
          description: Account reference
          minLength: 16
          maxLength: 64
          example: 1oWbJQQHLyQqqf1SwxjSpudeA21
        bvn:
          type: string
          description: Bank Verification Number (BVN)
          minLength: 11
          maxLength: 11
          example: '12234412345'
        bankAccountNumber:
          type: string
          description: Bank account number
          example: '9391076543'
        dateCreatedFrom:
          type: string
          format: date-time
          description: Date created from
          example: '2023-08-30T14:56:59.000Z'
        dateCreatedTo:
          type: string
          format: date-time
          description: Date created to
          example: '2024-08-30T14:56:59.000Z'
        expired:
          type: boolean
          description: Whether the virtual account is expired or not
          example: false
        resourceAcquired:
          type: boolean
          description: Whether the virtual account is in use or not
          example: false
    VirtualAccountListResults:
      type: object
      properties:
        results:
          type: array
          description: Contains list of virtual accounts
          items:
            $ref: '#/components/schemas/VirtualAccountObject'
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
    VirtualAccountObject:
      type: object
      properties:
        createdAt:
          type: string
          description: Creation timestamp
          format: date-time
          example: '2023-09-04T07:09:06.900Z'
        accountHolderId:
          type: string
          description: Account holder ID
          minLength: 36
          maxLength: 36
          example: 01a10aeb-d989-460a-bbde-9842f2b4320f
        accountRef:
          type: string
          description: Account reference
          minLength: 16
          maxLength: 64
          example: 1oWbJQQHLyQqqf1SwxjSpudeA21
        bvn:
          type: string
          description: Bank Verification Number (BVN)
          minLength: 11
          maxLength: 11
          example: '12234412345'
        accountName:
          type: string
          description: Account holder's name
          minLength: 8
          maxLength: 64
          example: Daniel Scorsese
        bankName:
          type: string
          description: Bank name
          example: Nombank MFB
        bankAccountNumber:
          type: string
          description: Bank account number
          example: '9391076543'
        bankAccountName:
          type: string
          description: Bank account holder name
          example: Nomba/Ifeoluwa Adeboye
        currency:
          type: string
          description: Currency code
          minLength: 3
          maxLength: 3
          enum:
            - NGN
          example: NGN
        callbackUrl:
          type: string
          description: Callback url
          format: url
          example: https://webhook.site/98ef100f-5adc-4434-800a-0808h60bd8d7
        expired:
          type: boolean
          description: Successfully updated
          example: true
      required:
        - createdAt
        - accountHolderId
        - accountRef
        - bvn
        - accountName
        - bankName
        - bankAccountName
        - bankAccountNumber
        - currency
        - callbackUrl
        - expired
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

# Create virtual account for a sub account

> You can use this endpoint to create a virtual account to receive payments for a sub account. Funds sent to the virtual account is collected in the sub account specified



## OpenAPI

````yaml post /v1/accounts/virtual/{subAccountId}
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
  /v1/accounts/virtual/{subAccountId}:
    post:
      tags:
        - Virtual Accounts
      summary: Create virtual account for a sub account
      description: >-
        You can use this endpoint to create a virtual account to receive
        payments for a sub account. Funds sent to the virtual account is
        collected in the sub account specified
      operationId: Create virtual account for a sub Account
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
          example: 2242b79d-f2cf-4ccc-ada1-e890bd1a9f0e
          in: path
          name: subAccountId
          required: true
          schema:
            type: string
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateVirtualAccountRequest'
        description: The request payload required to create a virtual account
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
                    $ref: '#/components/schemas/CreateVirtualAccountResponse'
                required:
                  - code
                  - description
                  - data
          description: Virtual account creation successful.
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
    CreateVirtualAccountRequest:
      type: object
      properties:
        accountRef:
          type: string
          description: Account reference
          minLength: 16
          maxLength: 64
          example: 1oWbJQQHLyQqqf1SwxjSpudeA21
        accountName:
          type: string
          description: Account holder's name
          minLength: 8
          maxLength: 64
          example: Daniel Scorsese
        bvn:
          type: string
          description: Account holder's BVN. Optional.
          example: '12345678'
        expiryDate:
          type: string
          description: Account expiry date. Optional. ⚠️Be careful with this.
          example: '2026-01-30 12:15:00'
        expectedAmount:
          type: number
          format: double
          description: Amount the account can receive. Optional.
          example: '200.00'
      required:
        - accountRef
        - accountName
    CreateVirtualAccountResponse:
      type: object
      properties:
        createdAt:
          type: string
          description: Creation timestamp
          format: date-time
          example: '2023-09-04T07:09:06.900Z'
        accountHolderId:
          type: string
          description: Account holder ID
          minLength: 36
          maxLength: 36
          example: 01a10aeb-d989-460a-bbde-9842f2b4320f
        accountRef:
          type: string
          description: Account reference
          minLength: 16
          maxLength: 64
          example: 1oWbJQQHLyQqqf1SwxjSpudeA21
        bvn:
          type: string
          description: Bank Verification Number (BVN)
          minLength: 11
          maxLength: 11
          example: '12234412345'
        accountName:
          type: string
          description: Account holder's name
          minLength: 8
          maxLength: 64
          example: Daniel Scorsese
        bankName:
          type: string
          description: Bank name
          example: Nombank MFB
        bankAccountNumber:
          type: string
          description: Bank account number
          example: '9391076543'
        bankAccountName:
          type: string
          description: Bank account holder name
          example: Nomba/Ifeoluwa Adeboye
        currency:
          type: string
          description: Currency code
          minLength: 3
          maxLength: 3
          enum:
            - NGN
          example: NGN
        callbackUrl:
          type: string
          description: Callback url
          format: url
          example: https://webhook.site/98ef100f-5adc-4434-800a-0808h60bd8d7
        expired:
          type: boolean
          description: Successfully updated
          example: true
      required:
        - createdAt
        - accountId
        - accountHolderId
        - accountRef
        - bvn
        - status
        - type
        - accountName
        - banks
        - currency
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

# Create virtual account

> You can use this endpoint to create a virtual account to receive payments.



## OpenAPI

````yaml post /v1/accounts/virtual
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
  /v1/accounts/virtual:
    post:
      tags:
        - Virtual Accounts
      summary: Create virtual account
      description: >-
        You can use this endpoint to create a virtual account to receive
        payments.
      operationId: Create virtual account
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
              $ref: '#/components/schemas/CreateVirtualAccountRequest'
        description: The request payload required to create an account
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
                    $ref: '#/components/schemas/CreateVirtualAccountResponse'
                required:
                  - code
                  - description
                  - data
          description: Virtual account creation successful.
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
    CreateVirtualAccountRequest:
      type: object
      properties:
        accountRef:
          type: string
          description: Account reference
          minLength: 16
          maxLength: 64
          example: 1oWbJQQHLyQqqf1SwxjSpudeA21
        accountName:
          type: string
          description: Account holder's name
          minLength: 8
          maxLength: 64
          example: Daniel Scorsese
        bvn:
          type: string
          description: Account holder's BVN. Optional.
          example: '12345678'
        expiryDate:
          type: string
          description: Account expiry date. Optional. ⚠️Be careful with this.
          example: '2026-01-30 12:15:00'
        expectedAmount:
          type: number
          format: double
          description: Amount the account can receive. Optional.
          example: '200.00'
      required:
        - accountRef
        - accountName
    CreateVirtualAccountResponse:
      type: object
      properties:
        createdAt:
          type: string
          description: Creation timestamp
          format: date-time
          example: '2023-09-04T07:09:06.900Z'
        accountHolderId:
          type: string
          description: Account holder ID
          minLength: 36
          maxLength: 36
          example: 01a10aeb-d989-460a-bbde-9842f2b4320f
        accountRef:
          type: string
          description: Account reference
          minLength: 16
          maxLength: 64
          example: 1oWbJQQHLyQqqf1SwxjSpudeA21
        bvn:
          type: string
          description: Bank Verification Number (BVN)
          minLength: 11
          maxLength: 11
          example: '12234412345'
        accountName:
          type: string
          description: Account holder's name
          minLength: 8
          maxLength: 64
          example: Daniel Scorsese
        bankName:
          type: string
          description: Bank name
          example: Nombank MFB
        bankAccountNumber:
          type: string
          description: Bank account number
          example: '9391076543'
        bankAccountName:
          type: string
          description: Bank account holder name
          example: Nomba/Ifeoluwa Adeboye
        currency:
          type: string
          description: Currency code
          minLength: 3
          maxLength: 3
          enum:
            - NGN
          example: NGN
        callbackUrl:
          type: string
          description: Callback url
          format: url
          example: https://webhook.site/98ef100f-5adc-4434-800a-0808h60bd8d7
        expired:
          type: boolean
          description: Successfully updated
          example: true
      required:
        - createdAt
        - accountId
        - accountHolderId
        - accountRef
        - bvn
        - status
        - type
        - accountName
        - banks
        - currency
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

# Fetch sub account balance

> You can use this endpoint to get the balance of a sub account



## OpenAPI

````yaml get /v1/accounts/{subAccountId}/balance
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
  /v1/accounts/{subAccountId}/balance:
    get:
      tags:
        - Accounts
      summary: Fetch sub account balance
      description: You can use this endpoint to get the balance of a sub account
      operationId: Fetch account balance
      parameters:
        - description: The parent accountId of the business.
          in: header
          name: accountId
          schema:
            type: string
            format: uuid
            example: 890022ce-bae0-45c1-9b9d-ee7872e6ca27
          required: true
        - description: The sub account whose balance is to be fetched.
          example: 2242b79d-f2cf-4ccc-ada1-e890bd1a9f0d
          in: path
          name: subAccountId
          required: true
          schema:
            type: string
            format: uuid
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
                    $ref: '#/components/schemas/AccountBalanceResponse'
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
    AccountBalanceResponse:
      type: object
      properties:
        amount:
          type: string
          description: Account balance
          example: '281946.0'
        currency:
          type: string
          description: Currency code
          minLength: 3
          maxLength: 3
          enum:
            - NGN
          example: NGN
        timeCreated:
          type: string
          format: date-time
          description: Account creation timestamp
          example: '2026-03-08T14:56:59.000Z'
      required:
        - amount
        - currency
        - timeCreated
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

# Fetch parent account balance

> You can use this endpoint to get the balance of the parent account.



## OpenAPI

````yaml get /v1/accounts/balance
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
  /v1/accounts/balance:
    get:
      tags:
        - Accounts
      summary: Fetch parent account balance
      description: You can use this endpoint to get the balance of the parent account.
      operationId: Fetch parent account balance
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
                    $ref: '#/components/schemas/AccountBalanceResponse'
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
    AccountBalanceResponse:
      type: object
      properties:
        amount:
          type: string
          description: Account balance
          example: '281946.0'
        currency:
          type: string
          description: Currency code
          minLength: 3
          maxLength: 3
          enum:
            - NGN
          example: NGN
        timeCreated:
          type: string
          format: date-time
          description: Account creation timestamp
          example: '2026-03-08T14:56:59.000Z'
      required:
        - amount
        - currency
        - timeCreated
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

# Fetch sub account details

> You can use this endpoint to get details of a sub account.

***


## OpenAPI

````yaml get /v1/accounts/sub-account-details
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
  /v1/accounts/sub-account-details:
    get:
      tags:
        - Accounts
      summary: Fetch sub account details
      description: You can use this endpoint to get details of a sub account.
      operationId: Fetch account details
      parameters:
        - description: The parent accountId of the business.
          in: header
          name: accountId
          schema:
            type: string
            format: uuid
            example: 890022ce-bae0-45c1-9b9d-ee7872e6ca27
          required: true
        - description: The id of the sub account whose details is to be fetched
          example: 2242b79d-f2cf-4ccc-ada1-e890bd1a9f0d
          in: query
          name: accountId
          required: false
          schema:
            type: string
            format: uuid
        - description: The unique reference you passed when creating the sub account
          example: my_unique_reference
          in: query
          name: accountRef
          required: false
          schema:
            type: string
            format: uuid
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
                    $ref: '#/components/schemas/AccountDetailsResponse'
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
    AccountDetailsResponse:
      type: object
      properties:
        createdAt:
          type: string
          description: Creation timestamp
          format: date-time
          example: '2023-09-04T07:09:06.900Z'
        accountId:
          type: string
          description: Account ID
          minLength: 36
          maxLength: 36
          example: fc81b80e-e607-4b86-8591-840925191733
        accountHolderId:
          type: string
          description: Account holder ID
          minLength: 36
          maxLength: 36
          example: 01a10aeb-d989-460a-bbde-9842f2b4320f
        accountRef:
          type: string
          description: Account reference
          minLength: 16
          maxLength: 64
          example: 1oWbJQQHLyQqqf1SwxjSpudeA21
        bvn:
          type: string
          description: Bank Verification Number (BVN)
          minLength: 11
          maxLength: 11
          example: '12234412345'
        status:
          type: string
          description: Account status
          enum:
            - ACTIVE
            - INACTIVE
            - SUSPENDED
            - PND
            - BLACKLISTED
          example: ACTIVE
        type:
          type: string
          description: Account type
          enum:
            - virtual
            - outlet
          example: virtual
        accountName:
          type: string
          description: Account holder's name
          minLength: 8
          maxLength: 64
          example: Daniel Scorsese
        currency:
          type: string
          description: Currency code
          minLength: 3
          maxLength: 3
          enum:
            - NGN
          example: NGN
        banks:
          type: array
          description: List of associated bank accounts
          items:
            type: object
            properties:
              bankAccountNumber:
                type: string
                description: Bank account number
                example: '93910'
              bankName:
                type: string
                description: Bank name
                example: Sterling Bank
              bankAccountName:
                type: string
                description: Bank account holder name
                example: Nomba/Ifeoluwa Adeboye
            required:
              - bankAccountNumber
              - bankName
              - bankAccountName
      required:
        - createdAt
        - accountId
        - accountHolderId
        - accountRef
        - bvn
        - status
        - type
        - accountName
        - banks
        - currency
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

# Fetch parent account details

> You can use this endpoint to get details of the parent account.



## OpenAPI

````yaml get /v1/accounts/parent
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
  /v1/accounts/parent:
    get:
      tags:
        - Accounts
      summary: Fetch parent account details
      description: You can use this endpoint to get details of the parent account.
      operationId: Fetch parent account details
      parameters:
        - in: header
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
                    $ref: '#/components/schemas/AccountDetailsResponse'
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
    AccountDetailsResponse:
      type: object
      properties:
        createdAt:
          type: string
          description: Creation timestamp
          format: date-time
          example: '2023-09-04T07:09:06.900Z'
        accountId:
          type: string
          description: Account ID
          minLength: 36
          maxLength: 36
          example: fc81b80e-e607-4b86-8591-840925191733
        accountHolderId:
          type: string
          description: Account holder ID
          minLength: 36
          maxLength: 36
          example: 01a10aeb-d989-460a-bbde-9842f2b4320f
        accountRef:
          type: string
          description: Account reference
          minLength: 16
          maxLength: 64
          example: 1oWbJQQHLyQqqf1SwxjSpudeA21
        bvn:
          type: string
          description: Bank Verification Number (BVN)
          minLength: 11
          maxLength: 11
          example: '12234412345'
        status:
          type: string
          description: Account status
          enum:
            - ACTIVE
            - INACTIVE
            - SUSPENDED
            - PND
            - BLACKLISTED
          example: ACTIVE
        type:
          type: string
          description: Account type
          enum:
            - virtual
            - outlet
          example: virtual
        accountName:
          type: string
          description: Account holder's name
          minLength: 8
          maxLength: 64
          example: Daniel Scorsese
        currency:
          type: string
          description: Currency code
          minLength: 3
          maxLength: 3
          enum:
            - NGN
          example: NGN
        banks:
          type: array
          description: List of associated bank accounts
          items:
            type: object
            properties:
              bankAccountNumber:
                type: string
                description: Bank account number
                example: '93910'
              bankName:
                type: string
                description: Bank name
                example: Sterling Bank
              bankAccountName:
                type: string
                description: Bank account holder name
                example: Nomba/Ifeoluwa Adeboye
            required:
              - bankAccountNumber
              - bankName
              - bankAccountName
      required:
        - createdAt
        - accountId
        - accountHolderId
        - accountRef
        - bvn
        - status
        - type
        - accountName
        - banks
        - currency
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