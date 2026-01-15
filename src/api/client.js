import axios from 'axios';
import { fetchAuthSession } from '../auth/cognito';

const api = axios.create({ baseURL: process.env.REACT_APP_API_BASE });

api.interceptors.request.use(async (config) => {
  config.headers = config.headers ?? {};

  try {
    const session = await fetchAuthSession();
    const access = session.tokens?.accessToken?.toString?.();
    // const id = session.tokens?.idToken?.toString?.();
    const token = access;
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch (e) {
        console.log("Interceptor: not logged in", e);
  }
  return config;
});

export default api;

