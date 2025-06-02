
import { VoiceProfile, AppSettings } from '../types';

export const mockVoiceProfiles: VoiceProfile[] = [
  {
    id: '64f7338f8d92e126ae676f9b',
    userid: '5291591455',
    name: 'OTP France (Brigitte)',
    voice: 'fr-FR-BrigitteNeural', // Example ElevenLabs voice ID or name
  },
  {
    id: '655a00b654105e766fd23050',
    userid: '5836806295',
    name: 'Microsoft OTP (Jenny)',
    voice: 'en-US-JennyMultilingualNeural',
  },
  {
    id: 'unique-voice-profile-1',
    userid: '1234567890',
    name: 'Standard English (Adam)',
    voice: 'Adam', // Example standard ElevenLabs voice
  },
  {
    id: 'unique-voice-profile-2',
    userid: '0987654321',
    name: 'Friendly Female (Rachel)',
    voice: 'Rachel',
  },
];

export const mockAppSettings: AppSettings = {
  botToken: 'TELEGRAM_BOT_TOKEN_HERE', // Typically not shown/edited in frontend
  ngrokUrl: 'https://your-ngrok-url.ngrok-free.app',
  twilioAccountSid: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  twilioAuthToken: 'TWILIO_AUTH_TOKEN_MASKED', // Masked or handled server-side
  twilioPhoneNumber: '+12345678901',
  elevenLabsApiKey: 'ELEVENLABS_API_KEY_MASKED', // Masked or handled server-side
  spoofNumbers: ['+12109647678', '+18001112222', '+15558889999'],
  defaultSpoofNumber: '+12109647678',
  publicChatId: '-1002216623779',
};
