const mongoose = require('mongoose');

const SubtaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false }
});

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true, default: '' },
  dueDate: { type: Date },
  reminder: { type: Date },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  subtasks: { type: [SubtaskSchema], default: [] },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Task', TaskSchema);
