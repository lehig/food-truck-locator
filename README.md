### Backend API Endpoints (Go Lambdas)

1. POST /subscribe

    - Creates Subscriptions item.
    - Idempotent: ignore if item already exists.

2. DELETE /subscribe

    - Deletes that subscription row.

3. GET /subscriptions/customer/{customer_id}

    - Queries GSI by customer_id to get list of business_ids the user is following.
    - Used by the Dashboard to know which cards say "Subscribed".

4. POST /business/{business_id}/message (for business accounts)

    - Verifies caller is that business (check user_type and user_id).
    - Queries Subscriptions for all customer_ids for this business_id.
    - For each subscriber, writes a row into Messages table.

5. GET /messages/customer/{customer_id} (later, for a customer inbox UI)

    - Query Messages table by customer_id.
    - Return list of messages.

#### IAM permissions needed

- dynamodb:PutItem, dynamodb:DeleteItem, dynamodb:Query, dynamodb:BatchWriteItem (if you fan out messages in batches) on the Subscriptions and Messages table ARNs.
- Plus the usual logs:CreateLogGroup, logs:CreateLogStream, logs:PutLogEvents for CloudWatch logs

### Frontend Changes

1. Dashboard business cards (customer view)
2. Button behavior
3. Business UI (business user sends messages)
