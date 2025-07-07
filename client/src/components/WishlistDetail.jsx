import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ConfirmDialog from './ConfirmDialog';
import ErrorPopup from './ErrorPopup';
import SuccessPopup from './SuccessPopup';
import reactLogo from '../assets/react.svg';
import './WishlistDetail.css';

const WishlistDetail = ({ user, token, socket }) => {
  const { id } = useParams();
  const [wishlist, setWishlist] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    imageUrl: '',
    price: '',
    category: 'Uncategorized',
    tags: []
  });
  const [inviteEmail, setInviteEmail] = useState('');
  const [error, setError] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showComments, setShowComments] = useState({});
  const [newComment, setNewComment] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [newTag, setNewTag] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    productId: null,
    productName: ''
  });
  const [errorPopup, setErrorPopup] = useState({
    isOpen: false,
    message: ''
  });
  const [successPopup, setSuccessPopup] = useState({
    isOpen: false,
    message: ''
  });
  const [allUsers, setAllUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [imageErrors, setImageErrors] = useState(new Set());

  useEffect(() => {
    fetchWishlist();
    fetchCategories();
    
    if (socket) {
      socket.emit('join-wishlist', id);
      
      socket.on('product-added', handleProductAdded);
      socket.on('product-updated', handleProductUpdated);
      socket.on('product-deleted', handleProductDeleted);
      socket.on('comment-added', handleCommentAdded);
      socket.on('comment-deleted', handleCommentDeleted);
      socket.on('reaction-added', handleReactionAdded);
      socket.on('reaction-removed', handleReactionRemoved);

      return () => {
        socket.emit('leave-wishlist', id);
        socket.off('product-added');
        socket.off('product-updated');
        socket.off('product-deleted');
        socket.off('comment-added');
        socket.off('comment-deleted');
        socket.off('reaction-added');
        socket.off('reaction-removed');
        setImageErrors(new Set()); // Clear image errors on unmount
      };
    }
  }, [id, socket]);

  const fetchWishlist = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/wishlists/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setWishlist(data.wishlist);
        setProducts(data.products);
      } else {
        const data = await response.json();
        showErrorPopup(data.message || 'Failed to fetch wishlist');
      }
    } catch (err) {
      showErrorPopup('Network error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/wishlists/${id}/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(['All', ...data]);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleProductAdded = (data) => {
    if (data.wishlistId === id) {
      setProducts(prev => [data.product, ...prev]);
    }
  };

  const handleProductUpdated = (data) => {
    if (data.wishlistId === id) {
      setProducts(prev => prev.map(p => p._id === data.product._id ? data.product : p));
      // Clear image error for updated product
      setImageErrors(prev => {
        const newErrors = new Set(prev);
        newErrors.delete(data.product._id);
        return newErrors;
      });
    }
  };

  const handleProductDeleted = (data) => {
    if (data.wishlistId === id) {
      setProducts(prev => prev.filter(p => p._id !== data.productId));
    }
  };

  const handleCommentAdded = (data) => {
    if (data.wishlistId === id) {
      setProducts(prev => prev.map(p => p._id === data.product._id ? data.product : p));
    }
  };

  const handleCommentDeleted = (data) => {
    if (data.wishlistId === id) {
      setProducts(prev => prev.map(p => p._id === data.product._id ? data.product : p));
    }
  };

  const handleReactionAdded = (data) => {
    if (data.wishlistId === id) {
      setProducts(prev => prev.map(p => p._id === data.product._id ? data.product : p));
    }
  };

  const handleReactionRemoved = (data) => {
    if (data.wishlistId === id) {
      setProducts(prev => prev.map(p => p._id === data.product._id ? data.product : p));
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/wishlists/${id}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: addForm.name,
          imageUrl: addForm.imageUrl,
          price: parseFloat(addForm.price),
          category: addForm.category,
          tags: addForm.tags
        })
      });

      if (response.ok) {
        const newProduct = await response.json();
        setProducts([newProduct, ...products]);
        setAddForm({ name: '', imageUrl: '', price: '', category: 'Uncategorized', tags: [] });
        setShowAddForm(false);
        fetchCategories(); // Refresh categories
      } else {
        const data = await response.json();
        showErrorPopup(data.message || 'Failed to add product');
      }
    } catch (err) {
      showErrorPopup('Network error');
    }
  };

  const handleUpdateProduct = async (productId, updatedData) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/wishlists/${id}/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      });

      if (response.ok) {
        const updatedProduct = await response.json();
        setProducts(prev => prev.map(p => p._id === productId ? updatedProduct : p));
        fetchCategories(); // Refresh categories
      } else {
        showErrorPopup('Failed to update product');
      }
    } catch (err) {
      showErrorPopup('Network error');
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/wishlists/${id}/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setProducts(prev => prev.filter(p => p._id !== productId));
      } else {
        showErrorPopup('Failed to remove product');
      }
    } catch (err) {
      showErrorPopup('Network error');
    }
  };

  const openDeleteDialog = (productId, productName) => {
    setDeleteDialog({
      isOpen: true,
      productId,
      productName
    });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({
      isOpen: false,
      productId: null,
      productName: ''
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

  const showSuccessPopup = (message) => {
    setSuccessPopup({
      isOpen: true,
      message
    });
  };

  const closeSuccessPopup = () => {
    setSuccessPopup({
      isOpen: false,
      message: ''
    });
  };

  const addTag = () => {
    if (newTag.trim() && !addForm.tags.includes(newTag.trim())) {
      setAddForm(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setAddForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleInviteUser = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/wishlists/${id}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: inviteEmail })
      });
      if (response.ok) {
        setInviteEmail('');
        setUserSearch('');
        setShowInviteForm(false);
        showSuccessPopup('Invitation sent successfully!');
      } else {
        const data = await response.json();
        showErrorPopup(data.message || 'Failed to invite user');
      }
    } catch (err) {
      showErrorPopup('Network error');
    }
  };

  const handleAddComment = async (productId, commentText) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/wishlists/${id}/products/${productId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: commentText })
      });

      if (response.ok) {
        const updatedProduct = await response.json();
        setProducts(prev => prev.map(p => p._id === productId ? updatedProduct : p));
        setNewComment('');
      } else {
        const data = await response.json();
        showErrorPopup(data.message || 'Failed to add comment');
      }
    } catch (err) {
      showErrorPopup('Network error');
    }
  };

  const handleDeleteComment = async (productId, commentId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/wishlists/${id}/products/${productId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const updatedProduct = await response.json();
        setProducts(prev => prev.map(p => p._id === productId ? updatedProduct : p));
      } else {
        const data = await response.json();
        showErrorPopup(data.message || 'Failed to delete comment');
      }
    } catch (err) {
      showErrorPopup('Network error');
    }
  };

  const handleAddReaction = async (productId, emoji) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/wishlists/${id}/products/${productId}/reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ emoji })
      });

      if (response.ok) {
        const updatedProduct = await response.json();
        setProducts(prev => prev.map(p => p._id === productId ? updatedProduct : p));
      } else {
        const data = await response.json();
        showErrorPopup(data.message || 'Failed to add reaction');
      }
    } catch (err) {
      showErrorPopup('Network error');
    }
  };

  const handleRemoveReaction = async (productId, emoji) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/wishlists/${id}/products/${productId}/reactions/${encodeURIComponent(emoji)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const updatedProduct = await response.json();
        setProducts(prev => prev.map(p => p._id === productId ? updatedProduct : p));
      } else {
        const data = await response.json();
        showErrorPopup(data.message || 'Failed to remove reaction');
      }
    } catch (err) {
      showErrorPopup('Network error');
    }
  };

  // Fetch all users for invite autocomplete
  const fetchAllUsers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const users = await response.json();
        setAllUsers(users);
      }
    } catch (err) {
      setAllUsers([]);
    }
  };

  useEffect(() => {
    if (showInviteForm) fetchAllUsers();
  }, [showInviteForm]);

  useEffect(() => {
    // Filter users for invite dropdown
    if (!showInviteForm) return;
    if (!userSearch) {
      setFilteredUsers([]);
      return;
    }
    const lower = userSearch.toLowerCase();
    setFilteredUsers(
      allUsers.filter(u =>
        (u.username.toLowerCase().includes(lower) || u.email.toLowerCase().includes(lower)) &&
        u.email !== user.email &&
        (!wishlist || !wishlist.members.some(m => m.user._id === u._id)) &&
        (!wishlist || wishlist.owner._id !== u._id)
      )
    );
  }, [userSearch, allUsers, showInviteForm, wishlist]);

  if (loading) {
    return <div className="loading">Loading wishlist...</div>;
  }

  if (!wishlist) {
    return <div className="error-message">Wishlist not found</div>;
  }

  return (
    <div className="wishlist-detail">
      <div className="wishlist-header">
        <div className="wishlist-info">
          <h2>{wishlist.name}</h2>
          {wishlist.description && <p className="description">{wishlist.description}</p>}
          <div className="meta">
            <span>Owner: {wishlist.owner.username}</span>
            <span>Members: {wishlist.members.length + 1}</span>
            <span>Products: {products.length}</span>
          </div>
        </div>
        
        <div className="wishlist-actions">
          <button 
            onClick={() => setShowAddForm(true)} 
            className="add-product-button"
          >
            + Add Product
          </button>
          {/* Only show Invite User button to the owner */}
          {wishlist && wishlist.owner && wishlist.owner._id === user.id && (
            <button 
              onClick={() => setShowInviteForm(true)} 
              className="invite-button"
            >
              Invite User
            </button>
          )}
          <Link to="/" className="back-button">← Back to Dashboard</Link>
        </div>
      </div>

      {/* Filtering Section */}
      <div className="filtering-section">
        <div className="filters">
          <div className="filter-group">
            <label>Category:</label>
            <select 
              value={selectedCategory} 
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="filter-select"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Search:</label>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search products, categories, or tags..."
              className="search-input"
            />
          </div>
        </div>
        
        <div className="filter-results">
          <span>Showing {filteredProducts.length} of {products.length} products</span>
        </div>
      </div>

      {showAddForm && (
        <div className="modal">
          <div className="modal-content">
            <h3>Add Product</h3>
            <form onSubmit={handleAddProduct}>
              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={(e) => setAddForm({...addForm, name: e.target.value})}
                  required
                  placeholder="Enter product name"
                />
              </div>
              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="url"
                  value={addForm.imageUrl}
                  onChange={(e) => setAddForm({...addForm, imageUrl: e.target.value})}
                  required
                  placeholder="Enter image URL"
                />
              </div>
              <div className="form-group">
                <label>Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={addForm.price}
                  onChange={(e) => setAddForm({...addForm, price: e.target.value})}
                  required
                  placeholder="Enter price"
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  value={addForm.category}
                  onChange={(e) => setAddForm({...addForm, category: e.target.value})}
                  placeholder="Enter category"
                />
              </div>
              <div className="form-group">
                <label>Tags</label>
                <div className="tags-input">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag and press Enter"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <button type="button" onClick={addTag} className="add-tag-btn">+</button>
                </div>
                <div className="tags-display">
                  {addForm.tags.map(tag => (
                    <span key={tag} className="tag">
                      {tag}
                      <button 
                        type="button" 
                        onClick={() => removeTag(tag)}
                        className="remove-tag-btn"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="modal-actions">
                <button type="submit" className="primary-button">Add Product</button>
                <button 
                  type="button" 
                  onClick={() => setShowAddForm(false)}
                  className="secondary-button"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showInviteForm && (
        <div className="modal">
          <div className="modal-content">
            <h3>Invite User</h3>
            <form onSubmit={handleInviteUser}>
              <div className="form-group">
                <label>Email or Username</label>
                <input
                  type="text"
                  value={userSearch}
                  onChange={e => {
                    setUserSearch(e.target.value);
                    setInviteEmail(e.target.value);
                  }}
                  required
                  placeholder="Type username or email to invite"
                  autoComplete="off"
                />
                {filteredUsers.length > 0 && (
                  <ul className="invite-autocomplete-list">
                    {filteredUsers.slice(0, 6).map(u => (
                      <li
                        key={u._id}
                        className="invite-autocomplete-item"
                        onClick={() => {
                          setInviteEmail(u.email);
                          setUserSearch(u.email);
                          setFilteredUsers([]);
                        }}
                      >
                        {u.username} <span className="invite-email">({u.email})</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="modal-actions">
                <button type="submit" className="primary-button">Send Invite</button>
                <button 
                  type="button" 
                  onClick={() => setShowInviteForm(false)}
                  className="secondary-button"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="products-grid">
        {filteredProducts.length === 0 ? (
          <div className="empty-state">
            <h3>No products found</h3>
            <p>Try adjusting your filters or add a new product!</p>
            <button 
              onClick={() => setShowAddForm(true)} 
              className="add-product-button"
            >
              Add Product
            </button>
          </div>
        ) : (
          filteredProducts.map(product => (
            <div key={product._id} className="product-card">
              <div className="image-container">
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  className="product-image"
                  onError={(e) => {
                    console.error(`Failed to load image for product: ${product.name}`);
                    setImageErrors(prev => new Set(prev).add(product._id));
                    e.target.src = reactLogo;
                    e.target.onerror = null; // Prevent infinite loop
                  }}
                />
                {imageErrors.has(product._id) && (
                  <div className="image-error-overlay" title="Original image failed to load">
                    ⚠️
                  </div>
                )}
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="price">${product.price}</p>
                {product.category && product.category !== 'Uncategorized' && (
                  <p className="category">Category: {product.category}</p>
                )}
                {product.tags && product.tags.length > 0 && (
                  <div className="product-tags">
                    {product.tags.map(tag => (
                      <span key={tag} className="product-tag">{tag}</span>
                    ))}
                  </div>
                )}
                <p className="added-by">Added by: {product.addedBy.username}</p>
                {product.editedBy && (
                  <p className="edited-by">Edited by: {product.editedBy.username}</p>
                )}
                
                {/* Reactions */}
                <div className="reactions-section">
                  <div className="reactions-display">
                    {product.reactions && product.reactions.length > 0 && (
                      <div className="reactions-list">
                        {Object.entries(
                          product.reactions.reduce((acc, reaction) => {
                            acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
                            return acc;
                          }, {})
                        ).map(([emoji, count]) => (
                          <span key={emoji} className="reaction-badge">
                            {emoji} {count}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="reaction-buttons">
                    {['👍', '❤️', '😍', '🎉', '🔥'].map(emoji => {
                      const hasReacted = product.reactions?.some(
                        r => r.user === user.id && r.emoji === emoji
                      );
                      return (
                        <button
                          key={emoji}
                          onClick={() => hasReacted 
                            ? handleRemoveReaction(product._id, emoji)
                            : handleAddReaction(product._id, emoji)
                          }
                          className={`reaction-button ${hasReacted ? 'reacted' : ''}`}
                          title={hasReacted ? 'Remove reaction' : 'Add reaction'}
                        >
                          {emoji}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Comments */}
                <div className="comments-section">
                  <button
                    onClick={() => setShowComments(prev => ({
                      ...prev,
                      [product._id]: !prev[product._id]
                    }))}
                    className="comments-toggle"
                  >
                    💬 {product.comments?.length || 0} comments
                  </button>
                  
                  {showComments[product._id] && (
                    <div className="comments-container">
                      <div className="comments-list">
                        {product.comments?.map(comment => (
                          <div key={comment._id} className="comment">
                            <div className="comment-header">
                              <span className="comment-author">{comment.author.username}</span>
                              <span className="comment-time">
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </span>
                              {(comment.author._id === user.id || wishlist.owner._id === user.id) && (
                                <button
                                  onClick={() => handleDeleteComment(product._id, comment._id)}
                                  className="delete-comment-btn"
                                  title="Delete comment"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                            <p className="comment-text">{comment.text}</p>
                          </div>
                        ))}
                      </div>
                      <div className="add-comment">
                        <input
                          type="text"
                          placeholder="Add a comment..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && newComment.trim()) {
                              handleAddComment(product._id, newComment.trim());
                            }
                          }}
                        />
                        <button
                          onClick={() => {
                            if (newComment.trim()) {
                              handleAddComment(product._id, newComment.trim());
                            }
                          }}
                          disabled={!newComment.trim()}
                        >
                          Post
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="product-actions">
                <button 
                  onClick={() => openDeleteDialog(product._id, product.name)}
                  className="delete-button"
                  title="Remove product"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Remove Product"
        message={`Are you sure you want to remove "${deleteDialog.productName}" from this wishlist?`}
        onConfirm={() => {
          handleDeleteProduct(deleteDialog.productId);
          closeDeleteDialog();
        }}
        onCancel={closeDeleteDialog}
        confirmText="Remove"
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

export default WishlistDetail; 