const ClassStream = require('../models/ClassStream');

exports.createClassStream = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    
    const id = await ClassStream.create(name);
    res.status(201).json({ id, name, message: 'Class stream created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllClassStreams = async (req, res) => {
  try {
    const streams = await ClassStream.getAll();
    res.json(streams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getClassStreamById = async (req, res) => {
  try {
    const { id } = req.params;
    const stream = await ClassStream.getById(id);
    if (!stream) return res.status(404).json({ error: 'Class stream not found' });
    res.json(stream);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateClassStream = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    
    const stream = await ClassStream.getById(id);
    if (!stream) return res.status(404).json({ error: 'Class stream not found' });
    
    await ClassStream.update(id, name);
    res.json({ id, name, message: 'Class stream updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteClassStream = async (req, res) => {
  try {
    const { id } = req.params;
    const stream = await ClassStream.getById(id);
    if (!stream) return res.status(404).json({ error: 'Class stream not found' });
    
    await ClassStream.delete(id);
    res.json({ message: 'Class stream deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
