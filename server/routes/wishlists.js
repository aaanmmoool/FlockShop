const express = require('express');
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/wishlists
// @desc    Get user's wishlists
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const wishlists = await Wishlist.find({
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id },
        { isPublic: true }
      ]
    }).populate('owner', 'username email')
      .populate('members.user', 'username email')
      .populate('productsCount');

    res.json(wishlists);
  } catch (error) {
    console.error('Get wishlists error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/wishlists
// @desc    Create a new wishlist
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;

    const wishlist = new Wishlist({
      name,
      description: description || '',
      owner: req.user._id,
      isPublic: isPublic || false
    });

    await wishlist.save();
    await wishlist.populate('owner', 'username email');

    res.status(201).json(wishlist);
  } catch (error) {
    console.error('Create wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/wishlists/:id
// @desc    Get specific wishlist with products
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const wishlist = await Wishlist.findById(req.params.id)
      .populate('owner', 'username email')
      .populate('members.user', 'username email');

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    // Check if user has access
    const hasAccess = wishlist.owner.equals(req.user._id) || 
                     wishlist.members.some(member => member.user.equals(req.user._id)) ||
                     wishlist.isPublic;

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get products
    const products = await Product.find({ wishlistId: req.params.id })
      .populate('addedBy', 'username')
      .populate('editedBy', 'username')
      .populate('comments.author', 'username')
      .populate('reactions.user', 'username')
      .sort({ createdAt: -1 });

    res.json({
      wishlist,
      products
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/wishlists/:id
// @desc    Update wishlist
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;

    const wishlist = await Wishlist.findById(req.params.id);

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    // Check if user is owner
    if (!wishlist.owner.equals(req.user._id)) {
      return res.status(403).json({ message: 'Only owner can update wishlist' });
    }

    wishlist.name = name || wishlist.name;
    wishlist.description = description !== undefined ? description : wishlist.description;
    wishlist.isPublic = isPublic !== undefined ? isPublic : wishlist.isPublic;

    await wishlist.save();
    await wishlist.populate('owner', 'username email');
    await wishlist.populate('members.user', 'username email');

    res.json(wishlist);
  } catch (error) {
    console.error('Update wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/wishlists/:id
// @desc    Delete wishlist
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const wishlist = await Wishlist.findById(req.params.id);

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    // Check if user is owner
    if (!wishlist.owner.equals(req.user._id)) {
      return res.status(403).json({ message: 'Only owner can delete wishlist' });
    }

    // Delete associated products
    await Product.deleteMany({ wishlistId: req.params.id });
    await wishlist.deleteOne();

    res.json({ message: 'Wishlist deleted successfully' });
  } catch (error) {
    console.error('Delete wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/wishlists/:id/products
// @desc    Add product to wishlist
// @access  Private
router.post('/:id/products', auth, async (req, res) => {
  try {
    const { name, imageUrl, price, category, tags } = req.body;

    const wishlist = await Wishlist.findById(req.params.id);

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    // Check if user has access
    const hasAccess = wishlist.owner.equals(req.user._id) || 
                     wishlist.members.some(member => member.user.equals(req.user._id));

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const product = new Product({
      name,
      imageUrl,
      price,
      category: category || 'Uncategorized',
      tags: tags || [],
      addedBy: req.user._id,
      wishlistId: req.params.id
    });

    await product.save();
    await product.populate('addedBy', 'username');
    await product.populate('comments.author', 'username');
    await product.populate('reactions.user', 'username');

    // Emit real-time update
    const io = req.app.get('io');
    io.to(req.params.id).emit('product-added', {
      product,
      wishlistId: req.params.id
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Add product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/wishlists/:id/products/:productId
// @desc    Update product
// @access  Private
router.put('/:id/products/:productId', auth, async (req, res) => {
  try {
    const { name, imageUrl, price, category, tags } = req.body;

    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!product.wishlistId.equals(req.params.id)) {
      return res.status(400).json({ message: 'Product does not belong to this wishlist' });
    }

    // Check if user has access to wishlist
    const wishlist = await Wishlist.findById(req.params.id);
    const hasAccess = wishlist.owner.equals(req.user._id) || 
                     wishlist.members.some(member => member.user.equals(req.user._id));

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    product.name = name || product.name;
    product.imageUrl = imageUrl || product.imageUrl;
    product.price = price !== undefined ? price : product.price;
    product.category = category !== undefined ? category : product.category;
    product.tags = tags !== undefined ? tags : product.tags;
    product.editedBy = req.user._id;

    await product.save();
    await product.populate('addedBy', 'username');
    await product.populate('editedBy', 'username');
    await product.populate('comments.author', 'username');
    await product.populate('reactions.user', 'username');

    // Emit real-time update
    const io = req.app.get('io');
    io.to(req.params.id).emit('product-updated', {
      product,
      wishlistId: req.params.id
    });

    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/wishlists/:id/products/:productId/comments
// @desc    Add comment to product
// @access  Private
router.post('/:id/products/:productId/comments', auth, async (req, res) => {
  try {
    const { text } = req.body;

    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!product.wishlistId.equals(req.params.id)) {
      return res.status(400).json({ message: 'Product does not belong to this wishlist' });
    }

    // Check if user has access to wishlist
    const wishlist = await Wishlist.findById(req.params.id);
    const hasAccess = wishlist.owner.equals(req.user._id) || 
                     wishlist.members.some(member => member.user.equals(req.user._id));

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Add comment
    product.comments.push({
      text,
      author: req.user._id
    });

    await product.save();
    await product.populate('comments.author', 'username');
    await product.populate('addedBy', 'username');
    await product.populate('editedBy', 'username');

    // Emit real-time update
    const io = req.app.get('io');
    io.to(req.params.id).emit('comment-added', {
      product,
      wishlistId: req.params.id
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/wishlists/:id/products/:productId/comments/:commentId
// @desc    Delete comment from product
// @access  Private
router.delete('/:id/products/:productId/comments/:commentId', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!product.wishlistId.equals(req.params.id)) {
      return res.status(400).json({ message: 'Product does not belong to this wishlist' });
    }

    // Check if user has access to wishlist
    const wishlist = await Wishlist.findById(req.params.id);
    const hasAccess = wishlist.owner.equals(req.user._id) || 
                     wishlist.members.some(member => member.user.equals(req.user._id));

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Find and remove comment
    const commentIndex = product.comments.findIndex(
      comment => comment._id.toString() === req.params.commentId
    );

    if (commentIndex === -1) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user is comment author or wishlist owner
    const comment = product.comments[commentIndex];
    if (!comment.author.equals(req.user._id) && !wishlist.owner.equals(req.user._id)) {
      return res.status(403).json({ message: 'Only comment author or wishlist owner can delete comment' });
    }

    product.comments.splice(commentIndex, 1);
    await product.save();
    await product.populate('comments.author', 'username');
    await product.populate('addedBy', 'username');
    await product.populate('editedBy', 'username');

    // Emit real-time update
    const io = req.app.get('io');
    io.to(req.params.id).emit('comment-deleted', {
      product,
      wishlistId: req.params.id
    });

    res.json(product);
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/wishlists/:id/products/:productId/reactions
// @desc    Add reaction to product
// @access  Private
router.post('/:id/products/:productId/reactions', auth, async (req, res) => {
  try {
    const { emoji } = req.body;

    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!product.wishlistId.equals(req.params.id)) {
      return res.status(400).json({ message: 'Product does not belong to this wishlist' });
    }

    // Check if user has access to wishlist
    const wishlist = await Wishlist.findById(req.params.id);
    const hasAccess = wishlist.owner.equals(req.user._id) || 
                     wishlist.members.some(member => member.user.equals(req.user._id));

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if user already reacted with this emoji
    const existingReaction = product.reactions.find(
      reaction => reaction.user.equals(req.user._id) && reaction.emoji === emoji
    );

    if (existingReaction) {
      // Remove the existing reaction instead of showing error
      const reactionIndex = product.reactions.findIndex(
        reaction => reaction.user.equals(req.user._id) && reaction.emoji === emoji
      );
      product.reactions.splice(reactionIndex, 1);
    } else {
      // Add reaction
      product.reactions.push({
        emoji,
        user: req.user._id
      });
    }

    await product.save();
    await product.populate('reactions.user', 'username');
    await product.populate('addedBy', 'username');
    await product.populate('editedBy', 'username');

    // Emit real-time update
    const io = req.app.get('io');
    io.to(req.params.id).emit('reaction-added', {
      product,
      wishlistId: req.params.id
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/wishlists/:id/products/:productId/reactions/:emoji
// @desc    Remove reaction from product
// @access  Private
router.delete('/:id/products/:productId/reactions/:emoji', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!product.wishlistId.equals(req.params.id)) {
      return res.status(400).json({ message: 'Product does not belong to this wishlist' });
    }

    // Check if user has access to wishlist
    const wishlist = await Wishlist.findById(req.params.id);
    const hasAccess = wishlist.owner.equals(req.user._id) || 
                     wishlist.members.some(member => member.user.equals(req.user._id));

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Find and remove reaction
    const reactionIndex = product.reactions.findIndex(
      reaction => reaction.user.equals(req.user._id) && reaction.emoji === req.params.emoji
    );

    if (reactionIndex === -1) {
      return res.status(404).json({ message: 'Reaction not found' });
    }

    product.reactions.splice(reactionIndex, 1);
    await product.save();
    await product.populate('reactions.user', 'username');
    await product.populate('addedBy', 'username');
    await product.populate('editedBy', 'username');

    // Emit real-time update
    const io = req.app.get('io');
    io.to(req.params.id).emit('reaction-removed', {
      product,
      wishlistId: req.params.id
    });

    res.json(product);
  } catch (error) {
    console.error('Remove reaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/wishlists/:id/products/:productId
// @desc    Remove product from wishlist
// @access  Private
router.delete('/:id/products/:productId', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!product.wishlistId.equals(req.params.id)) {
      return res.status(400).json({ message: 'Product does not belong to this wishlist' });
    }

    // Check if user has access to wishlist
    const wishlist = await Wishlist.findById(req.params.id);
    const hasAccess = wishlist.owner.equals(req.user._id) || 
                     wishlist.members.some(member => member.user.equals(req.user._id));

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await product.deleteOne();

    // Emit real-time update
    const io = req.app.get('io');
    io.to(req.params.id).emit('product-deleted', {
      productId: req.params.productId,
      wishlistId: req.params.id
    });

    res.json({ message: 'Product removed successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/wishlists/:id/categories
// @desc    Get all categories in a wishlist
// @access  Private
router.get('/:id/categories', auth, async (req, res) => {
  try {
    const wishlist = await Wishlist.findById(req.params.id);

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    // Check if user has access
    const hasAccess = wishlist.owner.equals(req.user._id) || 
                     wishlist.members.some(member => member.user.equals(req.user._id)) ||
                     wishlist.isPublic;

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const categories = await Product.distinct('category', { wishlistId: req.params.id });
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/wishlists/:id/products/filter
// @desc    Filter products by category and tags
// @access  Private
router.get('/:id/products/filter', auth, async (req, res) => {
  try {
    const { category, tags, search } = req.query;

    const wishlist = await Wishlist.findById(req.params.id);

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    // Check if user has access
    const hasAccess = wishlist.owner.equals(req.user._id) || 
                     wishlist.members.some(member => member.user.equals(req.user._id)) ||
                     wishlist.isPublic;

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    let filter = { wishlistId: req.params.id };

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (tags && tags.length > 0) {
      filter.tags = { $in: tags };
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const products = await Product.find(filter)
      .populate('addedBy', 'username')
      .populate('editedBy', 'username')
      .populate('comments.author', 'username')
      .populate('reactions.user', 'username')
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    console.error('Filter products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/wishlists/:id/invite
// @desc    Invite user to wishlist (pending invitation)
// @access  Private
router.post('/:id/invite', auth, async (req, res) => {
  try {
    const { email } = req.body;

    const wishlist = await Wishlist.findById(req.params.id);

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    // Check if user is owner
    if (!wishlist.owner.equals(req.user._id)) {
      return res.status(403).json({ message: 'Only owner can invite users' });
    }

    // Find user by email
    const invitedUser = await User.findOne({ email: email.toLowerCase() });
    if (!invitedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is already a member
    const isAlreadyMember = wishlist.members.some(member => 
      member.user.equals(invitedUser._id)
    );
    if (isAlreadyMember) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    // Check if invitation already exists and is pending
    const hasPendingInvite = invitedUser.invitations.some(invite =>
      invite.wishlist.equals(wishlist._id) && invite.status === 'pending'
    );
    if (hasPendingInvite) {
      return res.status(400).json({ message: 'User already has a pending invitation' });
    }

    // Add invitation to invited user's invitations
    invitedUser.invitations.push({
      wishlist: wishlist._id,
      inviter: req.user._id,
      status: 'pending'
    });
    await invitedUser.save();

    res.json({ 
      message: 'Invitation sent successfully',
      invitedUser: { id: invitedUser._id, email: invitedUser.email }
    });
  } catch (error) {
    console.error('Invite user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 