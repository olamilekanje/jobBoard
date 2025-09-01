const router = require('express').Router();
const { protect } = require('../middlewares/authMiddleware');          
const C = require('../controllers/messageController');

router.post('/conversations', protect, C.createOrGetConversation);
router.get('/conversations', protect, C.getMyConversations);
router.get('/conversations/:conversationId/messages', protect, C.getMessages);
router.post('/conversations/:conversationId/messages', protect, C.sendMessage);
router.post('/conversations/:conversationId/read', protect, C.markRead);

module.exports = router;
