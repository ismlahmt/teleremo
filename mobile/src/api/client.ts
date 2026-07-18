import axios from 'axios';
import { store } from '../store';

export const sendCommand = async (endpoint: string) => {
  const state = store.getState().settings;
  const ip = state.serverIp;
  if (!ip) {
    throw new Error('IP adresi girilmedi!');
  }

  const token = state.savedTokens[ip] || '';

  try {
    const url = `http://${ip}:3000/api/${endpoint}`;
    const response = await axios.post(url, {}, { 
      timeout: 3000,
      headers: {
        'X-Auth-Token': token
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('API Error:', error);
    throw error;
  }
};
