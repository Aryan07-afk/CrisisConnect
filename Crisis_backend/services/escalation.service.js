const HelpRequest = require('../models/HelpRequest');

/**
 * Checks for "high" or "critical" priority requests that have been pending for more than 30 minutes.
 * Marks them as escalated.
 */
const checkEscalations = async () => {
  try {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    const expiredRequests = await HelpRequest.find({
      status: 'pending',
      priority: { $in: ['high', 'critical'] },
      escalated: false,
      createdAt: { $lt: thirtyMinutesAgo }
    });

    if (expiredRequests.length > 0) {
      console.log(`🚨 Escalating ${expiredRequests.length} pending requests.`);
      for (const req of expiredRequests) {
        req.escalated = true;
        req.escalatedAt = new Date();
        await req.save();
      }
    }
  } catch (error) {
    console.error('Error in escalation check routine:', error);
  }
};

module.exports = {
  checkEscalations
};
