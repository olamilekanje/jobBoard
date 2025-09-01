const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  salary: { type: Number, required: true },
  category: { type: String, required: true },
  description: { type: String },
  deadline: { type: Date },

  //  employer: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'User', // or 'Employer'
  //   required: true
  // },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // the employer or admin who created it
    required: true,
  },

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  }
}, { timestamps: true });

module.exports = mongoose.model("Job", jobSchema);
