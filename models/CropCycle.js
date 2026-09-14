const mongoose = require('mongoose');

const cropCycleSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true,
    // Note: If you have a User model, you can use mongoose.Schema.Types.ObjectId here
  },
  cropName: { 
    type: String, 
    required: true 
  },
  sowingDate: { 
    type: Date, 
    required: true 
  },
  expectedHarvestDate: { 
    type: Date 
  },
  status: { 
    type: String, 
    enum: ['Active', 'Harvested', 'Failed'], 
    default: 'Active' 
  }
}, { timestamps: true });

module.exports = mongoose.model('CropCycle', cropCycleSchema);