import axios from 'axios';
import { fetchAuthSession } from '../auth/cognito';

const apiBaseUrl = process.env.REACT_APP_API_BASE;

if (!apiBaseUrl) {
  console.error('Missing REACT_APP_API_BASE. API requests will fail.');
}

const api = axios.create({ baseURL: apiBaseUrl });

api.interceptors.request.use(async (config) => {
  config.headers = config.headers ?? {};

  try {
    const session = await fetchAuthSession();
    // const access = session.tokens?.accessToken?.toString?.();
    const id = session.tokens?.idToken?.toString?.();
    const token = id;
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch (e) {
        console.log("Interceptor: not logged in", e);
  }
  return config;
});

export default api;

