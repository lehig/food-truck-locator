import axios from 'axios';
import { fetchAuthSession } from '../auth/cognito';

const api = axios.create({ baseURL: process.env.REACT_APP_API_BASE });

api.interceptors.request.use(async (config) => {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.accessToken?.toString();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {
    // not logged in
  }
  return config;
});

export default api;

