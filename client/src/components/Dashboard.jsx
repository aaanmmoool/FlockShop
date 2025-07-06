import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ConfirmDialog from './ConfirmDialog';
import ErrorPopup from './ErrorPopup';
import SuccessPopup from './SuccessPopup';
import './Dashboard.css';

const Dashboard = ({ user, token, socket }) => {
  const [wishlists, setWishlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    isPublic: false
  });
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    wishlistId: null,
    wishlistName: ''
  });
  const [errorPopup, setErrorPopup] = useState({
    isOpen: false,
    message: ''
  });
  const [invitations, setInvitations] = useState([]);
  const [invLoading, setInvLoading] = useState(true);
  const [invActionLoading, setInvActionLoading] = useState(false);
  const [successPopup, setSuccessPopup] = useState({ isOpen: false, message: '' });

  useEffect(() => {
    fetchWishlists();
    fetchInvitations();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('product-added', handleProductUpdate);
      socket.on('product-updated', handleProductUpdate);
      socket.on('product-deleted', handleProductUpdate);
      socket.on('comment-added', handleProductUpdate);
      socket.on('comment-deleted', handleProductUpdate);
      socket.on('reaction-added', handleProductUpdate);
      socket.on('reaction-removed', handleProductUpdate);

      return () => {
        socket.off('product-added');
        socket.off('product-updated');
        socket.off('product-deleted');
        socket.off('comment-added');
        socket.off('comment-deleted');
        socket.off('reaction-added');
        socket.off('reaction-removed');
      };
    }
  }, [socket]);

  const fetchWishlists = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/wishlists', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setWishlists(data);
      } else {
        const data = await response.json();
        showErrorPopup(data.message || 'Failed to fetch wishlists');
      }
    } catch (err) {
      showErrorPopup('Network error');
    } finally {
      setLoading(false);
    }
  };

  const fetchInvitations = async () => {
    setInvLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/invitations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setInvitations(data);
      } else {
        setInvitations([]);
      }
    } catch (err) {
      setInvitations([]);
    } finally {
      setInvLoading(false);
    }
  };

  const handleProductUpdate = () => {
    fetchWishlists();
  };

  const handleCreateWishlist = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/wishlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(createForm)
      });

      if (response.ok) {
        const newWishlist = await response.json();
        setWishlists([...wishlists, newWishlist]);
        setCreateForm({ name: '', description: '', isPublic: false });
        setShowCreateForm(false);
      } else {
        const data = await response.json();
        showErrorPopup(data.message || 'Failed to create wishlist');
      }
    } catch (err) {
      showErrorPopup('Network error');
    }
  };

  const handleDeleteWishlist = async (wishlistId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/wishlists/${wishlistId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setWishlists(wishlists.filter(w => w._id !== wishlistId));
      } else {
        showErrorPopup('Failed to delete wishlist');
      }
    } catch (err) {
      showErrorPopup('Network error');
    }
  };

  const openDeleteDialog = (wishlistId, wishlistName) => {
    setDeleteDialog({
      isOpen: true,
      wishlistId,
      wishlistName
    });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({
      isOpen: false,
      wishlistId: null,
      wishlistName: ''
    });
  };

  const showErrorPopup = (message) => {
    setErrorPopup({
      isOpen: true,
      message
    });
  };

  const closeErrorPopup = () => {
    setErrorPopup({
      isOpen: false,
      message: ''
    });
  };

  const handleAcceptInvitation = async (invitationId) => {
    setInvActionLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/invitations/${invitationId}/accept`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setSuccessPopup({ isOpen: true, message: 'Invitation accepted! You can now access the wishlist.' });
        fetchInvitations();
        fetchWishlists();
      } else {
        const data = await response.json();
        showErrorPopup(data.message || 'Failed to accept invitation');
      }
    } catch (err) {
      showErrorPopup('Network error');
    } finally {
      setInvActionLoading(false);
    }
  };

  const handleDeclineInvitation = async (invitationId) => {
    setInvActionLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/invitations/${invitationId}/decline`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setSuccessPopup({ isOpen: true, message: 'Invitation declined.' });
        fetchInvitations();
      } else {
        const data = await response.json();
        showErrorPopup(data.message || 'Failed to decline invitation');
      }
    } catch (err) {
      showErrorPopup('Network error');
    } finally {
      setInvActionLoading(false);
    }
  };

  const closeSuccessPopup = () => setSuccessPopup({ isOpen: false, message: '' });

  if (loading) {
    return <div className="loading">Loading your wishlists...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>My Wishlists</h2>
        <div className="dashboard-actions">
          <Link to="/templates" className="templates-button">
            📋 Templates
          </Link>
          <button 
            onClick={() => setShowCreateForm(true)} 
            className="create-button"
          >
            + Create New Wishlist
          </button>
        </div>
      </div>

      {invLoading ? (
        <div className="loading">Loading invitations...</div>
      ) : invitations.length > 0 ? (
        <div className="invitations-section">
          <h3>Pending Invitations</h3>
          <ul className="invitations-list">
            {invitations.map(invite => (
              <li key={invite._id} className="invitation-item">
                <div>
                  <span className="inv-wishlist">Wishlist: <b>{invite.wishlist?.name || 'N/A'}</b></span>
                  <span className="inv-from">From: <b>{invite.inviter?.username || 'N/A'}</b></span>
                </div>
                <div className="inv-actions">
                  <button 
                    className="primary-button" 
                    disabled={invActionLoading}
                    onClick={() => handleAcceptInvitation(invite._id)}
                  >Accept</button>
                  <button 
                    className="secondary-button" 
                    disabled={invActionLoading}
                    onClick={() => handleDeclineInvitation(invite._id)}
                  >Decline</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {showCreateForm && (
        <div className="create-wishlist-modal">
          <div className="modal-content">
            <h3>Create New Wishlist</h3>
            <form onSubmit={handleCreateWishlist}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                  required
                  placeholder="Enter wishlist name"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                  placeholder="Enter description (optional)"
                />
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={createForm.isPublic}
                    onChange={(e) => setCreateForm({...createForm, isPublic: e.target.checked})}
                  />
                  Make this wishlist public
                </label>
              </div>
              <div className="modal-actions">
                <button type="submit" className="primary-button">Create</button>
                <button 
                  type="button" 
                  onClick={() => setShowCreateForm(false)}
                  className="secondary-button"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="wishlists-grid">
        {wishlists.length === 0 ? (
          <div className="empty-state">
            <h3>No wishlists yet</h3>
            <p>Create your first wishlist to get started!</p>
            <button 
              onClick={() => setShowCreateForm(true)} 
              className="create-button"
            >
              Create Wishlist
            </button>
          </div>
        ) : (
          wishlists.map(wishlist => (
            <div key={wishlist._id} className="wishlist-card">
              <div className="wishlist-header">
                <h3>{wishlist.name}</h3>
                {wishlist.owner._id === user.id && (
                  <button 
                    onClick={() => openDeleteDialog(wishlist._id, wishlist.name)}
                    className="delete-button"
                    title="Delete wishlist"
                  >
                    🗑️
                  </button>
                )}
              </div>
              
              {wishlist.description && (
                <p className="wishlist-description">{wishlist.description}</p>
              )}
              
              <div className="wishlist-meta">
                <span className="owner">
                  Owner: {wishlist.owner.username}
                </span>
                <span className="members">
                  Members: {wishlist.members.length + 1}
                </span>
                <span className="products">
                  Products: {wishlist.productsCount || 0}
                </span>
                {wishlist.owner._id !== user.id && (
                  <span className="shared-indicator">
                    📤 Shared with you
                  </span>
                )}
                {wishlist.isPublic && (
                  <span className="public-indicator">
                    🌐 Public
                  </span>
                )}
              </div>
              
              <Link 
                to={`/wishlist/${wishlist._id}`} 
                className="view-wishlist-button"
              >
                View Wishlist
              </Link>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Wishlist"
        message={`Are you sure you want to delete "${deleteDialog.wishlistName}"? This action cannot be undone.`}
        onConfirm={() => {
          handleDeleteWishlist(deleteDialog.wishlistId);
          closeDeleteDialog();
        }}
        onCancel={closeDeleteDialog}
        confirmText="Delete"
        cancelText="Cancel"
      />

      <ErrorPopup
        isOpen={errorPopup.isOpen}
        message={errorPopup.message}
        onClose={closeErrorPopup}
      />

      <SuccessPopup
        isOpen={successPopup.isOpen}
        message={successPopup.message}
        onClose={closeSuccessPopup}
      />
    </div>
  );
};

export default Dashboard; 