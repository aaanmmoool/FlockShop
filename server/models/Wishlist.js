const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
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
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Virtual for products count
wishlistSchema.virtual('productsCount', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'wishlistId',
  count: true
});

// Ensure virtual fields are serialized
wishlistSchema.set('toJSON', { virtuals: true });
wishlistSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Wishlist', wishlistSchema); 