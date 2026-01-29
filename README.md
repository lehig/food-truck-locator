## Food Truck Locator

React frontend for a food-truck discovery app with AWS Cognito auth and a backend hosted on AWS API Gateway + Lambda.

### Architecture

- Frontend: React (Create React App), Axios for API calls.
- Auth: AWS Cognito via Amplify; the ID token is sent as a Bearer token for API calls.
- Backend: AWS API Gateway + Lambda functions.
- Legacy: `auth-backend/` contains an older Go auth server and is no longer used by the app.

### Environment Variables

These are expected at runtime (see `.env` for current values):

- `REACT_APP_API_BASE` (API Gateway base URL, e.g. `https://<id>.execute-api.<region>.amazonaws.com/dev`)
- `REACT_APP_COGNITO_REGION`
- `REACT_APP_COGNITO_USER_POOL_ID`
- `REACT_APP_COGNITO_CLIENT_ID`
- `REACT_APP_COGNITO_DOMAIN`
- `REACT_APP_REDIRECT_SIGNIN`
- `REACT_APP_REDIRECT_SIGNOUT`

### Local Development

1. `npm install`
2. `npm start`

### API Endpoints Used by the Frontend

All endpoints are relative to `REACT_APP_API_BASE` unless noted.

Auth / onboarding
- `POST /login`
- `POST /register`
- `POST /confirm-signup`

Business discovery + subscriptions
- `GET /business` (by state)
- `GET /subscriptions` (by customer)
- `POST /subscribe`
- `DELETE /subscribe`

Profiles + messaging
- `GET /account-type`
- `GET /business/profile`
- `PUT /business/profile`
- `GET /messages`
- `POST /messages/broadcast`

Support
- `POST /contact` (multipart/form-data)

Test-only endpoints (used by `Test*` components)
- `GET /customerdb`

Note: Some `Test*` components still call a hard-coded API Gateway URL. Consider switching those to `REACT_APP_API_BASE` for consistency.
