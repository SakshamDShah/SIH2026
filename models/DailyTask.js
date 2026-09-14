const mongoose = require('mongoose');

const dailyTaskSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true 
  },
  date: { 
    type: Date, 
    required: true // The specific day this task should appear
  },
  taskType: { 
    type: String, 
    enum: ['Irrigation', 'Fertilizer', 'Disease Check', 'General'], 
    required: true 
  },
  description: { 
    type: String, 
    required: true // e.g., "Water tomatoes at 9 AM due to high heat"
  },
  isCompleted: { 
    type: Boolean, 
    default: false 
  },
  relatedCropId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'CropCycle',
    required: false // Optional, as some tasks might be general farm maintenance
  }
}, { timestamps: true });

module.exports = mongoose.model('DailyTask', dailyTaskSchema);