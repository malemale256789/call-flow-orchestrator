
import { AppSettings } from '../types';
import { mockAppSettings } from './mockData';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let currentSettings = { ...mockAppSettings };

export const fetchSettings = async (): Promise<AppSettings> => {
  await delay(500);
  // In a real app, this would be an API call to fetch settings
  return Promise.resolve({ ...currentSettings }); // Return a copy
};

export const updateSettings = async (newSettings: Partial<AppSettings>): Promise<AppSettings> => {
  await delay(700);
  // In a real app, this would be an API call to update settings
  // e.g., await fetch('/api/settings', { method: 'POST', body: JSON.stringify(newSettings) });
  currentSettings = { ...currentSettings, ...newSettings };
  return Promise.resolve({ ...currentSettings });
};
