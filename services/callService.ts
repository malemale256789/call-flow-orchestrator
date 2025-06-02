import { InitiateCallPayload, InitiateCallResponse, SubmitOtpDecisionResponse, ActiveCallSession, CapturedOtpDetails } from '../types';
import { AVAILABLE_SCENARIOS } from '../constants';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock in-memory store for active call sessions for simulation purposes
const activeCallSessions: Map<string, Partial<ActiveCallSession>> = new Map();

export const initiateCall = async (payload: InitiateCallPayload): Promise<InitiateCallResponse> => {
  await delay(1000); // Simulate network latency for call initiation
  console.log('Initiating call with payload:', payload);

  const scenarioConfig = AVAILABLE_SCENARIOS.find(s => s.type === payload.scenarioType);
  if (!scenarioConfig) {
    return { success: false, message: 'Invalid scenario type selected.' };
  }

  const isSuccess = Math.random() > 0.1; // 90% success rate for initiation

  if (isSuccess) {
    const callId = `sim_call_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    
    if (scenarioConfig.expectsOtpValidation) {
      activeCallSessions.set(callId, { scenarioType: payload.scenarioType, uiState: 'OTP_PENDING_USER_VALIDATION' });
      // Simulate backend capturing OTP after a delay
      setTimeout(() => {
        const mockOtpValue = Math.floor(100000 + Math.random() * 900000).toString();
        const session = activeCallSessions.get(callId);
        if (session && session.uiState === 'OTP_PENDING_USER_VALIDATION') {
          activeCallSessions.set(callId, {
            ...session,
            capturedOtp: { otpValue: mockOtpValue, message: `Victim entered OTP: ${mockOtpValue}. Please validate.` },
          });
          // In a real app, this update would be pushed to the client via WebSockets
          console.log(`SIM_BACKEND: Call ${callId} captured OTP ${mockOtpValue}. Notifying client (simulated).`);
        }
      }, 3000 + Math.random() * 2000); // Simulate victim taking time to enter OTP

      return {
        success: true,
        message: 'Call initiated. Awaiting OTP capture from victim...',
        callId: callId,
        initialUiState: 'OTP_PENDING_USER_VALIDATION',
      };
    } else {
      activeCallSessions.set(callId, { scenarioType: payload.scenarioType, uiState: 'CALL_PROCEEDING' });
      return {
        success: true,
        message: 'Call initiated successfully! (No web OTP validation for this scenario)',
        callId: callId,
        initialUiState: 'CALL_PROCEEDING',
      };
    }
  } else {
    return { success: false, message: 'Failed to initiate call (simulated backend error). Please try again.' };
  }
};

export const submitOtpDecision = async (
  callId: string,
  decision: 'accept' | 'deny',
  otpValue: string
): Promise<SubmitOtpDecisionResponse> => {
  await delay(700); // Simulate network latency for submitting decision
  console.log(`Submitting OTP decision for call ${callId}: ${decision}, OTP: ${otpValue}`);

  const session = activeCallSessions.get(callId);
  if (!session) {
    return { success: false, message: `Call session ${callId} not found (simulated).`, nextUiState: 'FAILED' };
  }

  if (decision === 'accept') {
    activeCallSessions.set(callId, { ...session, uiState: 'COMPLETED', capturedOtp: null });
    return {
      success: true,
      message: `OTP ${otpValue} accepted. Call proceeding/completed.`,
      nextUiState: 'COMPLETED',
    };
  } else { // Deny
    activeCallSessions.set(callId, { ...session, uiState: 'REPROMPTING_VICTIM', capturedOtp: null, lastAttemptedOtp: otpValue });
    
    // Simulate backend re-prompting and capturing a new OTP
    setTimeout(() => {
      const newMockOtpValue = Math.floor(100000 + Math.random() * 900000).toString();
      const currentSession = activeCallSessions.get(callId);
      if (currentSession && currentSession.uiState === 'REPROMPTING_VICTIM') {
        const newOtpDetails: CapturedOtpDetails = { 
            otpValue: newMockOtpValue, 
            message: `Victim denied OTP ${otpValue}. Re-prompted. New OTP: ${newMockOtpValue}. Please validate.` 
        };
        activeCallSessions.set(callId, {
          ...currentSession,
          uiState: 'OTP_PENDING_USER_VALIDATION',
          capturedOtp: newOtpDetails,
        });
        console.log(`SIM_BACKEND: Call ${callId} RE-captured OTP ${newMockOtpValue} after denial. Notifying client (simulated).`);
      }
    }, 3000 + Math.random() * 2000);

    return {
      success: true,
      message: `OTP ${otpValue} denied. Re-prompting victim for new OTP...`,
      nextUiState: 'REPROMPTING_VICTIM',
    };
  }
};

// Function to periodically check for simulated OTP updates (REPLACEMENT FOR WEBSOCKETS IN THIS MOCK)
export const pollForOtpUpdates = (callId: string, callback: (otpDetails: CapturedOtpDetails) => void): (() => void) => {
  let cancelled = false;
  const intervalId = setInterval(() => {
    if (cancelled) {
      clearInterval(intervalId);
      return;
    }
    const session = activeCallSessions.get(callId);
    if (session && session.uiState === 'OTP_PENDING_USER_VALIDATION' && session.capturedOtp) {
      // Only callback if there's new OTP data to show
      // To prevent repeated callbacks for the same OTP, we could add a flag or compare OTP values.
      // For simplicity, this mock will call back if capturedOtp is present.
      // A real WebSocket would only push new data.
      callback(session.capturedOtp);
      // Potentially clear session.capturedOtp here after sending to avoid resending,
      // or manage an "isNew" flag on capturedOtp.
      // activeCallSessions.set(callId, {...session, capturedOtp: null }); // Example: clear after sending
    }
  }, 1500); // Poll every 1.5 seconds

  return () => { // Cleanup function
    cancelled = true;
    clearInterval(intervalId);
  };
};
