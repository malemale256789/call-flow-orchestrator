
import React, { useState, useEffect } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { VoiceProfile } from '../types';
import { fetchVoiceProfiles } from '../services/voiceProfileService';
import { ScriptIcon, UserCircleIcon, PlayIcon, InformationCircleIcon } from '../components/common/Icons'; // Added InformationCircleIcon

const ScriptsPage: React.FC = () => {
  const [voiceProfiles, setVoiceProfiles] = useState<VoiceProfile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfiles = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchVoiceProfiles();
        setVoiceProfiles(data);
      } catch (err) {
        setError('Failed to load voice profiles. Please try again.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadProfiles();
  }, []);

  // Placeholder for future actions
  const handleEditProfile = (id: string) => alert(`Edit profile ${id} (not implemented)`);
  const handlePlaySample = (voiceId: string) => alert(`Play sample for voice ${voiceId} (not implemented)`);

  return (
    <PageWrapper title="Voice Profiles Management" icon={<ScriptIcon className="w-8 h-8"/>}
      actions={
        <Button variant="primary" onClick={() => alert('Add new profile (not implemented)')}>
          Add New Profile
        </Button>
      }
    >
      {isLoading && <p className="text-center text-secondary-600">Loading voice profiles...</p>}
      {error && <p className="text-center text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
      
      {!isLoading && !error && voiceProfiles.length === 0 && (
        <p className="text-center text-secondary-600">No voice profiles found.</p>
      )}

      {!isLoading && !error && voiceProfiles.length > 0 && (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-secondary-200">
            <thead className="bg-secondary-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Profile Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">ElevenLabs Voice ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">User ID</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-secondary-200">
              {voiceProfiles.map((profile) => (
                <tr key={profile.id} className="hover:bg-secondary-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <UserCircleIcon className="h-6 w-6 text-primary-500 mr-3"/>
                      <div className="text-sm font-medium text-secondary-900">{profile.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">{profile.voice}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">{profile.userid}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Button variant="secondary" size="sm" onClick={() => handlePlaySample(profile.voice)} title="Play Voice Sample" icon={<PlayIcon className="w-4 h-4"/>}>
                       {/* Play button text removed for icon-only button feel, or add sr-only text */}
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => handleEditProfile(profile.id)} title="Edit Profile">
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Card title="About Voice Profiles" className="mt-6" icon={<InformationCircleIcon className="w-6 h-6"/>}>
        <p className="text-sm text-secondary-600">
          Voice Profiles link a friendly name and user to a specific <strong className="text-primary-600">ElevenLabs Voice ID</strong>.
          These profiles are used during call initiation to select the desired voice for Text-to-Speech generation.
          You can manage your available voices in your ElevenLabs dashboard.
        </p>
      </Card>
    </PageWrapper>
  );
};

export default ScriptsPage;
