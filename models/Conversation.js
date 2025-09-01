const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const conversationSchema = new Schema(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }], // exactly two users
    job: { type: Schema.Types.ObjectId, ref: 'Job' }, // optional link to a job
    lastMessage: { type: String, trim: true },
    lastMessageAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// helpful indexes
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);
