import express from 'express';
import { mockAppSettings } from '../../services/mockData.js';

export const router = express.Router();

let currentSettings = { ...mockAppSettings };

router.get('/', (req, res) => {
  res.json(currentSettings);
});

router.post('/', (req, res) => {
  const updates = req.body;
  
  // Don't allow updating sensitive fields from frontend
  delete updates.twilioAuthToken;
  delete updates.elevenLabsApiKey;
  delete updates.botToken;

  currentSettings = { ...currentSettings, ...updates };
  res.json(currentSettings);
});