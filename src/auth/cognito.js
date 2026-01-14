import { Amplify } from 'aws-amplify';
import {
  signIn as amplifySignIn,
  signOut as amplifySignOut,
  fetchAuthSession as amplifyFetchAuthSession
} from 'aws-amplify/auth';

console.log("loaded cognito.js config");

const userPoolId = process.env.REACT_APP_COGNITO_USER_POOL_ID;
const userPoolClientId = process.env.REACT_APP_COGNITO_CLIENT_ID;
const region = process.env.REACT_APP_COGNITO_REGION;

if (!userPoolId || !userPoolClientId || !region) {
  // This will make the root cause obvious in your console
  console.error('Missing Cognito env vars:', {
    REACT_APP_COGNITO_USER_POOL_ID: userPoolId,
    REACT_APP_COGNITO_CLIENT_ID: userPoolClientId,
    REACT_APP_COGNITO_REGION: region,
  });
}

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId,
      userPoolClientId,
      region,
      loginWith: {
        username: true,
        email: false,
        phone: false,
      },
    },
  },
});

export async function signIn({ username, password }) {
  return amplifySignIn({ username, password });
}

export async function fetchAuthSession() {
  return amplifyFetchAuthSession();
}

export async function signOut() {
  return amplifySignOut();
}
