
import { VoiceProfile } from '../types';
import { mockVoiceProfiles } from './mockData';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchVoiceProfiles = async (): Promise<VoiceProfile[]> => {
  await delay(500);
  // In a real app, this would be an API call:
  // const response = await fetch('/api/voice-profiles');
  // if (!response.ok) throw new Error('Failed to fetch voice profiles');
  // return response.json();
  return Promise.resolve([...mockVoiceProfiles]); // Return a copy
};

export const fetchVoiceProfileById = async (id: string): Promise<VoiceProfile | undefined> => {
  await delay(300);
  return Promise.resolve(mockVoiceProfiles.find(vp => vp.id === id));
};

// Add create, update, delete functions as needed, modifying mockVoiceProfiles
// For now, these are not implemented to keep the example concise.
// export const createVoiceProfile = async (profileData: Omit<VoiceProfile, 'id'>): Promise<VoiceProfile> => { ... }
// export const updateVoiceProfile = async (id: string, updates: Partial<VoiceProfile>): Promise<VoiceProfile> => { ... }
// export const deleteVoiceProfile = async (id: string): Promise<void> => { ... }
