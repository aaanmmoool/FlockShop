const mongoose = require('mongoose');

const wishlistTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  templateProducts: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    imageUrl: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    category: {
      type: String,
      trim: true,
      default: 'Uncategorized'
    },
    tags: [{
      type: String,
      trim: true
    }],
    description: {
      type: String,
      trim: true,
      default: ''
    }
  }],
  usageCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('WishlistTemplate', wishlistTemplateSchema); 