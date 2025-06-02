import express from 'express';
import { mockVoiceProfiles } from '../../services/mockData.js';

export const router = express.Router();

router.get('/', (req, res) => {
  res.json(mockVoiceProfiles);
});

router.get('/:id', (req, res) => {
  const profile = mockVoiceProfiles.find(p => p.id === req.params.id);
  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }
  res.json(profile);
});