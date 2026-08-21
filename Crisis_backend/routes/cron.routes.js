const express = require('express');
const router = express.Router();
const { checkEscalations } = require('../services/escalation.service');

/**
 * Vercel Cron entry point (replaces the in-process setInterval, which does
 * not survive serverless). Configure in vercel.json / dashboard:
 *   Path:   /api/cron/escalations
 *   Header: x-cron-secret: <CRON_SECRET>
 */
router.get('/escalations', async (req, res) => {
  // Vercel Cron automatically sends "Authorization: Bearer <CRON_SECRET>"
  // when a CRON_SECRET env var exists; manual calls can use x-cron-secret or ?secret=
  const authHeader = req.get('authorization');
  const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const secret = bearer || req.get('x-cron-secret') || req.query.secret;

  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ success: false, message: 'Unauthorised' });
  }

  const escalated = await checkEscalations();
  return res.json({
    success: true,
    message: `Escalation check complete. ${escalated} request(s) escalated.`,
    escalated,
  });
});

module.exports = router;
