
import React, { useState, useEffect, useCallback } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { AppSettings } from '../types';
import { fetchSettings, updateSettings } from '../services/settingsService';
import { CogIcon, CheckCircleIcon, ExclamationTriangleIcon } from '../components/common/Icons';

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Partial<AppSettings>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchSettings();
      setSettings(data);
    } catch (err) {
      setError('Failed to load settings. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'text' && name === 'spoofNumbers') {
       setSettings(prev => ({ ...prev, [name]: value.split(',').map(s => s.trim()).filter(s => s) }));
    } else {
       setSettings(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    try {
      // Filter out potentially sensitive fields that shouldn't be sent from client if they are masked
      // Create a new object for savableSettings to avoid direct mutation of state parts that should not be sent.
      const savableSettings: Partial<AppSettings> = { ...settings };
      delete savableSettings.twilioAuthToken; // Ensure these are not sent even if somehow present
      delete savableSettings.elevenLabsApiKey;
      delete savableSettings.botToken;

      const updatedSettings = await updateSettings(savableSettings);
      setSettings(updatedSettings); // Reflect potentially modified/validated settings from backend
      setSuccessMessage('Settings updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Failed to save settings. Please try again.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };
  
  const maskedFieldPlaceholder = "******** (Handled by Backend)";

  if (isLoading) {
    return <PageWrapper title="Application Settings" icon={<CogIcon className="w-8 h-8"/>}><p className="text-center">Loading settings...</p></PageWrapper>;
  }

  if (error && !isLoading) {
     return <PageWrapper title="Application Settings" icon={<CogIcon className="w-8 h-8"/>}><p className="text-center text-red-500">{error}</p></PageWrapper>;
  }

  return (
    <PageWrapper title="Application Settings" icon={<CogIcon className="w-8 h-8"/>}>
      <form onSubmit={handleSubmit}>
        <Card title="Service Configuration" className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Ngrok URL"
              name="ngrokUrl"
              type="text"
              value={settings.ngrokUrl || ''}
              onChange={handleChange}
              placeholder="https://your-id.ngrok-free.app"
            />
             <Input
              label="Twilio Phone Number"
              name="twilioPhoneNumber"
              type="text"
              value={settings.twilioPhoneNumber || ''}
              onChange={handleChange}
              placeholder="+1234567890"
            />
            <Input
              label="Twilio Account SID"
              name="twilioAccountSid"
              type="text"
              value={settings.twilioAccountSid || ''}
              onChange={handleChange}
              placeholder="ACxxxxxxxxxxxxxx"
            />
            <Input
              label="Twilio Auth Token"
              name="twilioAuthToken"
              type="text"
              value={maskedFieldPlaceholder}
              disabled
              helpText="This value is managed by the backend configuration."
            />
            <Input
              label="ElevenLabs API Key"
              name="elevenLabsApiKey"
              type="text"
              value={maskedFieldPlaceholder}
              disabled
              helpText="This value is managed by the backend configuration."
            />
             <Input
              label="Default Spoof Number"
              name="defaultSpoofNumber"
              type="text"
              value={settings.defaultSpoofNumber || ''}
              onChange={handleChange}
              placeholder="+12025550104"
            />
            <Input
              label="Additional Spoof Numbers (comma-separated)"
              name="spoofNumbers"
              as="textarea"
              value={settings.spoofNumbers?.join(', ') || ''}
              onChange={handleChange}
              placeholder="+12025550105, +12025550106"
              containerClassName="md:col-span-2"
            />
            <Input
              label="Telegram Bot Token"
              name="botToken"
              type="text"
              value={maskedFieldPlaceholder}
              disabled
              helpText="This value is managed by the backend configuration."
            />
            <Input
              label="Telegram Public Chat ID"
              name="publicChatId"
              type="text"
              value={settings.publicChatId || ''}
              onChange={handleChange}
              placeholder="-100xxxxxxxxxx"
            />
          </div>
        </Card>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-100 text-red-700 text-sm flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 mr-2"/> {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-3 rounded-md bg-green-100 text-green-700 text-sm flex items-center">
            <CheckCircleIcon className="w-5 h-5 mr-2"/> {successMessage}
          </div>
        )}

        <div className="flex justify-end">
          <Button type="submit" variant="primary" isLoading={isSaving} disabled={isSaving}>
            Save Settings
          </Button>
        </div>
      </form>
    </PageWrapper>
  );
};

export default SettingsPage;
