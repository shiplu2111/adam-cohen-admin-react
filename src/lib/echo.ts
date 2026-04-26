import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import api from './axios';

// @ts-ignore
window.Pusher = Pusher;

let echoInstance: Echo | null = null;

export const getEcho = async () => {
  if (echoInstance) return echoInstance;

  try {
    // Fetch Pusher settings dynamically from the backend
    const res = await api.get('/settings/pusher');
    const settings = res.data.data;

    if (!settings?.key) {
      console.warn('Pusher key not found in settings');
      return null;
    }

    const baseUrl = import.meta.env.VITE_API_URL.replace(/\/api$/, '');
    
    echoInstance = new Echo({
      broadcaster: 'pusher',
      key: settings.key,
      cluster: settings.cluster || 'mt1',
      forceTLS: true,
      authEndpoint: `${baseUrl}/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('apex-token')}`,
          Accept: 'application/json',
        },
      },
    });

    echoInstance.connector.pusher.connection.bind('connected', () => {
      console.log('Real-time: Connected to Pusher');
    });

    echoInstance.connector.pusher.connection.bind('error', (err: any) => {
      console.error('Real-time: Pusher connection error', err);
    });

    return echoInstance;
  } catch (error) {
    console.error('Failed to initialize Echo:', error);
    return null;
  }
};

export const resetEcho = () => {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
  }
};
