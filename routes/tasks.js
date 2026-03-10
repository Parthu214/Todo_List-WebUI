const express = require('express');
const Task = require('../models/Task');

const router = express.Router();

// Get all tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tasks', error });
  }
});

// Create a task
router.post('/', async (req, res) => {
  try {
    const payload = req.body;
    const task = new Task(payload);
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create task', error });
  }
});

// Update a task (including toggling status, updating subtasks etc)
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update task', error });
  }
});

// Delete a task
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete task', error });
  }
});

module.exports = router;
