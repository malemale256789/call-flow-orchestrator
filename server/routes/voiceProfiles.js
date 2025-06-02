import { mockVoiceProfiles } from '../../services/mockData.ts';
import express from 'express';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // Using mock data for now
    res.json(mockVoiceProfiles);
  } catch (error) {
    console.error('Error fetching voice profiles:', error);
    res.status(500).json({ error: 'Failed to fetch voice profiles' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const profile = mockVoiceProfiles.find(p => p.id === req.params.id);
    if (!profile) {
      return res.status(404).json({ error: 'Voice profile not found' });
    }
    res.json(profile);
  } catch (error) {
    console.error('Error fetching voice profile:', error);
    res.status(500).json({ error: 'Failed to fetch voice profile' });
  }
});

export default router;