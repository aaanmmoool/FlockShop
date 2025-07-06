const express = require('express');
const User = require('../models/User');
const Wishlist = require('../models/Wishlist');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/invitations - List pending invitations for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('invitations.wishlist', 'name description owner')
      .populate('invitations.inviter', 'username email');
    const pendingInvitations = user.invitations.filter(invite => invite.status === 'pending');
    res.json(pendingInvitations);
  } catch (error) {
    console.error('Get invitations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/invitations/:invitationId/accept - Accept an invitation
router.post('/:invitationId/accept', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const invitation = user.invitations.id(req.params.invitationId);
    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }
    if (invitation.status !== 'pending') {
      return res.status(400).json({ message: 'Invitation is not pending' });
    }
    // Add user to wishlist members
    const wishlist = await Wishlist.findById(invitation.wishlist);
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }
    // Check if already a member
    const isAlreadyMember = wishlist.members.some(member => member.user.equals(user._id));
    if (!isAlreadyMember) {
      wishlist.members.push({ user: user._id });
      await wishlist.save();
    }
    // Mark invitation as accepted
    invitation.status = 'accepted';
    await user.save();
    res.json({ message: 'Invitation accepted', wishlistId: wishlist._id });
  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/invitations/:invitationId/decline - Decline an invitation
router.post('/:invitationId/decline', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const invitation = user.invitations.id(req.params.invitationId);
    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }
    if (invitation.status !== 'pending') {
      return res.status(400).json({ message: 'Invitation is not pending' });
    }
    invitation.status = 'declined';
    await user.save();
    res.json({ message: 'Invitation declined' });
  } catch (error) {
    console.error('Decline invitation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 