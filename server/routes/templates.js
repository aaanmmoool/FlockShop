const express = require('express');
const WishlistTemplate = require('../models/WishlistTemplate');
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/templates
// @desc    Get all public templates and user's private templates
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const templates = await WishlistTemplate.find({
      $or: [
        { isPublic: true },
        { createdBy: req.user._id }
      ]
    }).populate('createdBy', 'username')
      .sort({ usageCount: -1, createdAt: -1 });

    res.json(templates);
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/templates/:id
// @desc    Get specific template
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const template = await WishlistTemplate.findById(req.params.id)
      .populate('createdBy', 'username');

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // Check if user has access
    if (!template.isPublic && !template.createdBy.equals(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(template);
  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/templates
// @desc    Create a new template
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, category, isPublic, templateProducts } = req.body;

    const template = new WishlistTemplate({
      name,
      description: description || '',
      category,
      isPublic: isPublic !== undefined ? isPublic : true,
      createdBy: req.user._id,
      templateProducts: templateProducts || []
    });

    await template.save();
    await template.populate('createdBy', 'username');

    res.status(201).json(template);
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/templates/:id/use
// @desc    Use template to create a new wishlist
// @access  Private
router.post('/:id/use', auth, async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;

    const template = await WishlistTemplate.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // Check if user has access
    if (!template.isPublic && !template.createdBy.equals(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Create new wishlist
    const wishlist = new Wishlist({
      name: name || template.name,
      description: description || template.description,
      owner: req.user._id,
      isPublic: isPublic !== undefined ? isPublic : false
    });

    await wishlist.save();

    // Create products from template
    const products = [];
    for (const templateProduct of template.templateProducts) {
      const product = new Product({
        name: templateProduct.name,
        imageUrl: templateProduct.imageUrl,
        price: templateProduct.price,
        category: templateProduct.category,
        tags: templateProduct.tags,
        addedBy: req.user._id,
        wishlistId: wishlist._id
      });
      await product.save();
      products.push(product);
    }

    // Update template usage count
    template.usageCount += 1;
    await template.save();

    await wishlist.populate('owner', 'username email');

    res.status(201).json({
      wishlist,
      products
    });
  } catch (error) {
    console.error('Use template error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/templates/:id
// @desc    Update template
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, description, category, isPublic, templateProducts } = req.body;

    const template = await WishlistTemplate.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // Check if user is creator
    if (!template.createdBy.equals(req.user._id)) {
      return res.status(403).json({ message: 'Only creator can update template' });
    }

    template.name = name || template.name;
    template.description = description !== undefined ? description : template.description;
    template.category = category || template.category;
    template.isPublic = isPublic !== undefined ? isPublic : template.isPublic;
    template.templateProducts = templateProducts || template.templateProducts;

    await template.save();
    await template.populate('createdBy', 'username');

    res.json(template);
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/templates/:id
// @desc    Delete template
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const template = await WishlistTemplate.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // Check if user is creator
    if (!template.createdBy.equals(req.user._id)) {
      return res.status(403).json({ message: 'Only creator can delete template' });
    }

    await template.deleteOne();

    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 