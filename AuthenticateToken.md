> ## Documentation Index
> Fetch the complete documentation index at: https://developer.nomba.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Refresh an expired token

> You can use this endpoint to refresh an expired `access_token`.



## OpenAPI

````yaml post /v1/auth/token/refresh
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
  /v1/auth/token/refresh:
    post:
      tags:
        - Authenticate
      summary: Refresh an expired token
      description: You can use this endpoint to refresh an expired `access_token`.
      operationId: Refresh an expired token
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
              $ref: '#/components/schemas/RefreshTokenRequest'
        description: The request payload required to refresh the client's `access_token`
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
                    $ref: '#/components/schemas/IssueTokenResponse'
                required:
                  - code
                  - description
                  - data
          description: Your request to refresh a token was successful.
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
    RefreshTokenRequest:
      type: object
      description: A structure representing a refresh token request.
      properties:
        grant_type:
          type: string
          description: The grant type of the authentication.
          enum:
            - client_credentials
            - refresh_token
          example: refresh_token
        refresh_token:
          type: string
          description: A Base64 Encoded String used to refresh an expired access_token
          example: 01h4gdx2tctxfjgacbdwrcvs5d1688473602892
          maxLength: 60
          minLength: 30
      required:
        - grant_type
        - refresh_token
    IssueTokenResponse:
      type: object
      description: A structure representing an authentication result.
      properties:
        businessId:
          type: string
          description: >-
            The accountId of the merchant/business that is connecting to the
            Nomba system via API
          example: 01a10aeb-d989-460a-bbde-9842f2b4320f
        access_token:
          type: string
          description: >-
            A JWT (Json Web Token) token used to grant access to resources on
            the Nomba API.
          example: >-
            eyJhbGciOiJIUzI1NiJ9.eyJHOjhmYWM4M2FjLTc2YjAtNDM1Zi1hYTM1LThkOTU3ZGQ5MjdkZCI6Ikc6OGZhYzgzYWMtNzZiMC00MzVmLWFhMzUtOGQ5NTdkZDkyN2RkIiwiUjpURUFNU19PV05FUiI6IlI6VEVBTVNfT1dORVIiLCJFbWFpbDp2aWN0b3JzaG9hZ2FAZ21haWwuY29tIjoiRW1haWw6dmljdG9yc2hvYWdhQGdtYWlsLmNvbSIsImlhdCI6MTY4MTkxODU3OSwic3ViIjoiNWUyNmNmYjAtNTI5Zi00MTdiLWI4ZDItYWJjNDcxZjRjOWRiIiwiZXhwIjoxNjgxOTIyMTc5fQ.lQOsyhR1gajKdzE9IHQEtxhQyUrArctEDZiP9pWVTFY
          maxLength: 600
          minLength: 300
        refresh_token:
          type: string
          description: A Base64 Encoded String used to refresh an expired access_token
          example: 01h4gdx2tctxfjgacbdwrcvs5d1688473602892
          maxLength: 60
          minLength: 30
        expiresAt:
          type: string
          description: >-
            The date and time this entity was created. This value uses
            Coordinated Universal Time (UTC) and ISO 8601 format –
            `YYYY-MM-DDThh:mm:ssZ`.
          example: '2022-07-08T14:33:00Z'
      required:
        - businessId
        - access_token
        - refresh_token
        - expiresAt
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

# Obtain access token

> You can use this endpoint to authenticate with Nomba.



## OpenAPI

````yaml post /v1/auth/token/issue
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
  /v1/auth/token/issue:
    post:
      tags:
        - Authenticate
      summary: Obtain access token
      description: You can use this endpoint to authenticate with Nomba.
      operationId: Obtain access token
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
              $ref: '#/components/schemas/IssueTokenRequest'
        description: The request payload required for authentication
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
                    $ref: '#/components/schemas/IssueTokenResponse'
                required:
                  - code
                  - description
                  - data
          description: Your authentication request was successful.
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
    IssueTokenRequest:
      type: object
      description: A structure representing an authentication request.
      properties:
        grant_type:
          type: string
          description: The grant type of the authentication.
          enum:
            - client_credentials
            - refresh_token
          example: client_credentials
        client_id:
          type: string
          description: The client's id as obtained from your Nomba dashboard.
          example: 2242b79d-f2cf-4ccc-ada1-e890bd1a9f0d
          maxLength: 36
          minLength: 36
        client_secret:
          type: string
          description: >-
            The client's secret as obtained from your Nomba dashboard. It is
            securely generated by the Nomba system
          example: JFJ8yq3G4+DvjivJMsji0YkZBkkKdSdjifR+TgT9RLM=
          maxLength: 44
          minLength: 44
      required:
        - grant_type
        - client_id
        - client_secret
    IssueTokenResponse:
      type: object
      description: A structure representing an authentication result.
      properties:
        businessId:
          type: string
          description: >-
            The accountId of the merchant/business that is connecting to the
            Nomba system via API
          example: 01a10aeb-d989-460a-bbde-9842f2b4320f
        access_token:
          type: string
          description: >-
            A JWT (Json Web Token) token used to grant access to resources on
            the Nomba API.
          example: >-
            eyJhbGciOiJIUzI1NiJ9.eyJHOjhmYWM4M2FjLTc2YjAtNDM1Zi1hYTM1LThkOTU3ZGQ5MjdkZCI6Ikc6OGZhYzgzYWMtNzZiMC00MzVmLWFhMzUtOGQ5NTdkZDkyN2RkIiwiUjpURUFNU19PV05FUiI6IlI6VEVBTVNfT1dORVIiLCJFbWFpbDp2aWN0b3JzaG9hZ2FAZ21haWwuY29tIjoiRW1haWw6dmljdG9yc2hvYWdhQGdtYWlsLmNvbSIsImlhdCI6MTY4MTkxODU3OSwic3ViIjoiNWUyNmNmYjAtNTI5Zi00MTdiLWI4ZDItYWJjNDcxZjRjOWRiIiwiZXhwIjoxNjgxOTIyMTc5fQ.lQOsyhR1gajKdzE9IHQEtxhQyUrArctEDZiP9pWVTFY
          maxLength: 600
          minLength: 300
        refresh_token:
          type: string
          description: A Base64 Encoded String used to refresh an expired access_token
          example: 01h4gdx2tctxfjgacbdwrcvs5d1688473602892
          maxLength: 60
          minLength: 30
        expiresAt:
          type: string
          description: >-
            The date and time this entity was created. This value uses
            Coordinated Universal Time (UTC) and ISO 8601 format –
            `YYYY-MM-DDThh:mm:ssZ`.
          example: '2022-07-08T14:33:00Z'
      required:
        - businessId
        - access_token
        - refresh_token
        - expiresAt
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

````> ## Documentation Index
> Fetch the complete documentation index at: https://developer.nomba.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Revoke an access_token

> You can use this endpoint to revoke an `access_token`.



## OpenAPI

````yaml post /v1/auth/token/revoke
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
  /v1/auth/token/revoke:
    post:
      tags:
        - Authenticate
      summary: Revoke an access_token
      description: You can use this endpoint to revoke an `access_token`.
      operationId: Revoke an access_token
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/RevokeTokenRequest'
        description: The request payload required to revoke a clients `access_token`
        required: true
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RevokeTokenResponse'
          description: Your request to revoke an access_token was successful.
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
    RevokeTokenRequest:
      type: object
      description: A structure representing a request to revoke a token.
      properties:
        clientId:
          type: string
          description: The client's id as obtained from your Nomba dashboard.
          example: 2242b79d-f2cf-4ccc-ada1-e890bd1a9f0d
          maxLength: 36
          minLength: 36
        access_token:
          type: string
          description: The JWT (Json Web Token) token to be revoked
          example: >-
            eyJhbGciOiJIUzI1NiJ9.eyJHOjhmYWM4M2FjLTc2YjAtNDM1Zi1hYTM1LThkOTU3ZGQ5MjdkZCI6Ikc6OGZhYzgzYWMtNzZiMC00MzVmLWFhMzUtOGQ5NTdkZDkyN2RkIiwiUjpURUFNU19PV05FUiI6IlI6VEVBTVNfT1dORVIiLCJFbWFpbDp2aWN0b3JzaG9hZ2FAZ21haWwuY29tIjoiRW1haWw6dmljdG9yc2hvYWdhQGdtYWlsLmNvbSIsImlhdCI6MTY4MTkxODU3OSwic3ViIjoiNWUyNmNmYjAtNTI5Zi00MTdiLWI4ZDItYWJjNDcxZjRjOWRiIiwiZXhwIjoxNjgxOTIyMTc5fQ.lQOsyhR1gajKdzE9IHQEtxhQyUrArctEDZiP9pWVTFY
          maxLength: 600
          minLength: 300
      required:
        - clientId
        - access_token
    RevokeTokenResponse:
      type: object
      description: A structure representing a response from an attempt to revoke a token
      properties:
        code:
          type: string
          description: Tells if the access_token has been revoked
          example: '00'
        description:
          type: string
          description: Describes the result of the action performed
          example: Token revoked successfully
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