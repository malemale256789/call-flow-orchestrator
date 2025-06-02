
import React, { useState, useEffect, useCallback } from 'react';
import { CallScenario, VoiceProfile, CallParams, ScenarioType, CallParamField } from '../../types';
import Card from '../common/Card';
import Input from '../common/Input';
import Button from '../common/Button';
import { PlayIcon, ChevronDownIcon } from '../common/Icons';

interface CallTriggerFormProps {
  scenarios: CallScenario[];
  voiceProfiles: VoiceProfile[];
  isLoadingProfiles: boolean;
  isSubmittingCall: boolean;
  onSubmit: (params: CallParams, selectedScenarioType: ScenarioType, selectedVoiceProfileId: string) => void;
}

const CallTriggerForm: React.FC<CallTriggerFormProps> = ({
  scenarios,
  voiceProfiles,
  isLoadingProfiles,
  isSubmittingCall,
  onSubmit,
}) => {
  const [selectedScenarioType, setSelectedScenarioType] = useState<ScenarioType | ''>('');
  const [selectedVoiceProfileId, setSelectedVoiceProfileId] = useState<string>('');
  const [currentParams, setCurrentParams] = useState<CallParams>({});
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CallParams, string>>>({});

  const selectedScenario = scenarios.find(s => s.type === selectedScenarioType);

  useEffect(() => {
    // Set default voice profile if available
    if (voiceProfiles.length > 0 && !selectedVoiceProfileId) {
      setSelectedVoiceProfileId(voiceProfiles[0].id);
    }
  }, [voiceProfiles, selectedVoiceProfileId]);
  
  useEffect(() => {
    // Reset params when scenario changes
    setCurrentParams({});
    setFormErrors({});
  }, [selectedScenarioType]);


  const handleParamChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target as { name: keyof CallParams, value: string };
    setCurrentParams(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
        setFormErrors(prev => ({...prev, [name]: undefined}));
    }
  };

  const validateForm = useCallback((): boolean => {
    if (!selectedScenario) return false;
    const errors: Partial<Record<keyof CallParams, string>> = {};
    let isValid = true;

    selectedScenario.fields.forEach(field => {
      if (field.required && !currentParams[field.name]?.trim()) {
        errors[field.name] = `${field.label} is required.`;
        isValid = false;
      }
    });
    
    if (!selectedVoiceProfileId) {
        // This should ideally not happen if a default is set or selection is forced.
        // You might want a specific error message for this.
        alert("Please select a voice profile."); 
        isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  }, [selectedScenario, currentParams, selectedVoiceProfileId]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScenarioType || !selectedScenario) {
      alert('Please select a call scenario.');
      return;
    }
    if (!selectedVoiceProfileId) {
      alert('Please select a voice profile.');
      return;
    }
    if (validateForm()) {
      onSubmit(currentParams, selectedScenarioType, selectedVoiceProfileId);
    }
  };

  return (
    <Card title="Initiate a New Call" icon={<PlayIcon className="w-6 h-6"/>}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="scenarioSelect" className="block text-sm font-medium text-secondary-700 mb-1">
            Call Scenario
          </label>
          <div className="relative">
            <select
              id="scenarioSelect"
              value={selectedScenarioType}
              onChange={(e) => setSelectedScenarioType(e.target.value as ScenarioType | '')}
              className="block w-full px-4 py-2.5 pr-8 border border-secondary-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm appearance-none bg-white"
              required
            >
              <option value="" disabled>Select a scenario...</option>
              {scenarios.map(s => (
                <option key={s.type} value={s.type}>{s.displayName}</option>
              ))}
            </select>
            <ChevronDownIcon className="w-5 h-5 text-secondary-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"/>
          </div>
          {selectedScenario && (
            <p className="mt-1 text-xs text-secondary-500">{selectedScenario.description}</p>
          )}
        </div>

        {selectedScenario && (
          <Card title={`${selectedScenario.displayName} Parameters`} bodyClassName="space-y-4 pt-4 border-t border-secondary-200" className="bg-secondary-50 shadow-inner">
            {selectedScenario.fields.map((field: CallParamField) => (
              <Input
                key={field.name}
                label={field.label}
                name={field.name}
                type={field.type}
                value={currentParams[field.name] || ''}
                onChange={handleParamChange}
                placeholder={field.placeholder}
                error={formErrors[field.name]}
                required={field.required}
              />
            ))}
          </Card>
        )}

        <div>
          <label htmlFor="voiceProfileSelect" className="block text-sm font-medium text-secondary-700 mb-1">
            Voice Profile (ElevenLabs Voice)
          </label>
          {isLoadingProfiles ? (
            <p className="text-sm text-secondary-500">Loading voice profiles...</p>
          ) : (
            <div className="relative">
            <select
              id="voiceProfileSelect"
              value={selectedVoiceProfileId}
              onChange={(e) => setSelectedVoiceProfileId(e.target.value)}
              className="block w-full px-4 py-2.5 pr-8 border border-secondary-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm appearance-none bg-white"
              required
              disabled={voiceProfiles.length === 0}
            >
              {voiceProfiles.length === 0 && <option value="" disabled>No voice profiles available</option>}
              {voiceProfiles.map(vp => (
                <option key={vp.id} value={vp.id}>{vp.name} (Voice: {vp.voice})</option>
              ))}
            </select>
            <ChevronDownIcon className="w-5 h-5 text-secondary-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"/>
            </div>
          )}
        </div>
        
        <div className="pt-2">
          <Button 
            type="submit" 
            variant="primary" 
            className="w-full" 
            isLoading={isSubmittingCall} 
            disabled={isSubmittingCall || !selectedScenarioType || isLoadingProfiles || voiceProfiles.length === 0}
            icon={<PlayIcon className="w-5 h-5"/>}
          >
            Initiate Call
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default CallTriggerForm;
