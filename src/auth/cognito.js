import { Amplify } from '@aws-amplify/core';
import { signIn, signOut, fetchAuthSession } from '@aws-amplify/auth';

// Amplify JS v6 expects the Auth configuration under the Cognito key with a loginWith section
const authConfig = {
  Cognito: {
    userPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
    userPoolClientId: process.env.REACT_APP_COGNITO_CLIENT_ID,
    loginWith: {
      username: true,
      email: true,
      phone: false,
      oauth: {
        domain: process.env.REACT_APP_COGNITO_DOMAIN,
        scopes: ['openid', 'email', 'profile'],
        redirectSignIn: [process.env.REACT_APP_REDIRECT_SIGNIN],
        redirectSignOut: [process.env.REACT_APP_REDIRECT_SIGNOUT],
        responseType: 'code',
      },
    },
    // region is optional when using the new modular packages, but include for clarity
    region: process.env.REACT_APP_COGNITO_REGION,
  },
};

Amplify.configure({ Auth: authConfig });

export { signIn, signOut, fetchAuthSession };
