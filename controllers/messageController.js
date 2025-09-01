const mongoose = require('mongoose');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

exports.createOrGetConversation = async (req, res) => {
  try {
    const { toUserId, jobId } = req.body;
    if (!toUserId) return res.status(400).json({ message: 'toUserId required' });

    // find existing 1:1 conversation
    let convo = await Conversation.findOne({
      participants: { $all: [req.user.id, toUserId] },
    });

    if (!convo) {
      convo = await Conversation.create({
        participants: [req.user.id, toUserId],
        job: jobId || undefined,
        createdBy: req.user.id,
        lastMessageAt: new Date(),
      });
    }

    res.json(convo);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to create/get conversation' });
  }
};

exports.getMyConversations = async (req, res) => {
  try {
    const convos = await Conversation.find({ participants: req.user.id })
      .populate('participants', 'name email role')
      .populate('job', 'title company')
      .sort({ lastMessageAt: -1 })
      .lean();

    res.json(convos);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to fetch conversations' });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    if (!mongoose.isValidObjectId(conversationId)) {
      return res.status(400).json({ message: 'Invalid conversationId' });
    }

    const isMember = await Conversation.exists({
      _id: conversationId,
      participants: req.user.id,
    });
    if (!isMember) return res.status(403).json({ message: 'Not in this conversation' });

    const msgs = await Message.find({ conversation: conversationId })
      .sort({ createdAt: 1 })
      .lean();

    res.json(msgs);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ message: 'text required' });

    const convo = await Conversation.findOne({
      _id: conversationId,
      participants: req.user.id,
    });
    if (!convo) return res.status(403).json({ message: 'Not in this conversation' });

    const msg = await Message.create({
      conversation: convo._id,
      sender: req.user.id,
      text: text.trim(),
      readBy: [req.user.id],
    });

    convo.lastMessage = text.trim();
    convo.lastMessageAt = new Date();
    await convo.save();

    res.status(201).json(msg);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to send message' });
  }
};

exports.markRead = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const isMember = await Conversation.exists({
      _id: conversationId,
      participants: req.user.id,
    });
    if (!isMember) return res.status(403).json({ message: 'Not in this conversation' });

    await Message.updateMany(
      { conversation: conversationId, readBy: { $ne: req.user.id } },
      { $addToSet: { readBy: req.user.id } }
    );

    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to mark read' });
  }
};
