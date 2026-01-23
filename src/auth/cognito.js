import { Amplify } from 'aws-amplify';
import {
  signIn as amplifySignIn,
  signOut as amplifySignOut,
  fetchAuthSession as amplifyFetchAuthSession,
  resetPassword as amplifyResetPassword,
  confirmResetPassword as amplifyConfirmResetPassword,
  confirmSignUp as amplifyConfirmSignUp,
  resendSignUpCode as amplifyResendSignUpCode,
} from 'aws-amplify/auth';
import axios from 'axios';

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

export async function startPasswordReset(usernameOrEmail) {
  // triggers delivery of a confirmation code (email/sms)
  // returns infor about where the code was sent
  if (!usernameOrEmail) throw new Error("Username is required for password reset.");
  return amplifyResetPassword({ username: usernameOrEmail });
}

export async function finishPasswordReset(usernameOrEmail, code, newPassword) {
  // confirms code + sets new password
  return await amplifyConfirmResetPassword({
    username: usernameOrEmail,
    confirmationCode: code, 
    newPassword,
  });
}

export async function confirmSignUp(username, code) {
  const payload = {
    username,
    code,
  };

  const response = await axios.post(
    `${process.env.REACT_APP_API_BASE}/confirm-signup`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
}

export async function resendSignUpCode(username) {
  return amplifyResendSignUpCode({ username });
}