import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from './ConfirmDialog';
import ErrorPopup from './ErrorPopup';
import SuccessPopup from './SuccessPopup';
import './Templates.css';

const Templates = ({ user, token }) => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showUseForm, setShowUseForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    category: '',
    isPublic: true,
    templateProducts: []
  });
  const [useForm, setUseForm] = useState({
    name: '',
    description: '',
    isPublic: false
  });
  const [newProduct, setNewProduct] = useState({
    name: '',
    imageUrl: '',
    price: '',
    category: 'Uncategorized',
    tags: [],
    description: ''
  });
  const [newTag, setNewTag] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    templateId: null,
    templateName: ''
  });
  const [errorPopup, setErrorPopup] = useState({
    isOpen: false,
    message: ''
  });
  const [successPopup, setSuccessPopup] = useState({
    isOpen: false,
    message: ''
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/templates`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      } else {
        const data = await response.json();
        showErrorPopup(data.message || 'Failed to fetch templates');
      }
    } catch (err) {
      showErrorPopup('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(createForm)
      });

      if (response.ok) {
        const newTemplate = await response.json();
        setTemplates([newTemplate, ...templates]);
        setCreateForm({
          name: '',
          description: '',
          category: '',
          isPublic: true,
          templateProducts: []
        });
        setShowCreateForm(false);
        showSuccessPopup('Template created successfully!');
      } else {
        const data = await response.json();
        showErrorPopup(data.message || 'Failed to create template');
      }
    } catch (err) {
      showErrorPopup('Network error');
    }
  };

  const handleUseTemplate = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/templates/${selectedTemplate._id}/use`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(useForm)
      });

      if (response.ok) {
        const data = await response.json();
        setShowUseForm(false);
        setSelectedTemplate(null);
        showSuccessPopup('Wishlist created from template!');
        navigate(`/wishlist/${data.wishlist._id}`);
      } else {
        const data = await response.json();
        showErrorPopup(data.message || 'Failed to use template');
      }
    } catch (err) {
      showErrorPopup('Network error');
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/templates/${templateId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setTemplates(prev => prev.filter(t => t._id !== templateId));
        closeDeleteDialog();
        showSuccessPopup('Template deleted successfully!');
      } else {
        const data = await response.json();
        showErrorPopup(data.message || 'Failed to delete template');
      }
    } catch (err) {
      showErrorPopup('Network error');
    }
  };

  const addProductToTemplate = () => {
    if (newProduct.name && newProduct.imageUrl && newProduct.price) {
      setCreateForm(prev => ({
        ...prev,
        templateProducts: [...prev.templateProducts, { ...newProduct }]
      }));
      setNewProduct({
        name: '',
        imageUrl: '',
        price: '',
        category: 'Uncategorized',
        tags: [],
        description: ''
      });
    }
  };

  const removeProductFromTemplate = (index) => {
    setCreateForm(prev => ({
      ...prev,
      templateProducts: prev.templateProducts.filter((_, i) => i !== index)
    }));
  };

  const addTagToProduct = () => {
    if (newTag.trim() && !newProduct.tags.includes(newTag.trim())) {
      setNewProduct(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTagFromProduct = (tagToRemove) => {
    setNewProduct(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const openDeleteDialog = (templateId, templateName) => {
    setDeleteDialog({
      isOpen: true,
      templateId,
      templateName
    });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({
      isOpen: false,
      templateId: null,
      templateName: ''
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

  if (loading) {
    return <div className="loading">Loading templates...</div>;
  }

  return (
    <div className="templates">
      <div className="templates-header">
        <h2>Wishlist Templates</h2>
        <div className="templates-actions">
          <button 
            onClick={() => setShowCreateForm(true)} 
            className="create-template-button"
          >
            + Create Template
          </button>
        </div>
      </div>

      <div className="templates-grid">
        {templates.length === 0 ? (
          <div className="empty-state">
            <h3>No templates available</h3>
            <p>Create your first template to get started!</p>
            <button 
              onClick={() => setShowCreateForm(true)} 
              className="create-template-button"
            >
              Create Template
            </button>
          </div>
        ) : (
          templates.map(template => (
            <div key={template._id} className="template-card">
              <div className="template-info">
                <h3>{template.name}</h3>
                <p className="description">{template.description}</p>
                <p className="category">Category: {template.category}</p>
                <p className="products-count">{template.templateProducts.length} products</p>
                <p className="usage-count">Used {template.usageCount} times</p>
                <p className="creator">Created by: {template.createdBy.username}</p>
                <p className="visibility">{template.isPublic ? 'Public' : 'Private'}</p>
              </div>
              
              <div className="template-actions">
                <button 
                  onClick={() => {
                    setSelectedTemplate(template);
                    setUseForm({
                      name: template.name,
                      description: template.description,
                      isPublic: false
                    });
                    setShowUseForm(true);
                  }}
                  className="use-template-button"
                >
                  Use Template
                </button>
                {template.createdBy._id === user.id && (
                  <button 
                    onClick={() => openDeleteDialog(template._id, template.name)}
                    className="delete-template-button"
                  >
                    Delete
                  </button>
                )}
              </div>

              {template.templateProducts.length > 0 && (
                <div className="template-products-preview">
                  <h4>Products:</h4>
                  <div className="products-preview">
                    {template.templateProducts.slice(0, 3).map((product, index) => (
                      <div key={index} className="product-preview">
                        <img src={product.imageUrl} alt={product.name} />
                        <span>{product.name}</span>
                      </div>
                    ))}
                    {template.templateProducts.length > 3 && (
                      <span className="more-products">+{template.templateProducts.length - 3} more</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Create Template Modal */}
      {showCreateForm && (
        <div className="modal">
          <div className="modal-content large">
            <h3>Create Template</h3>
            <form onSubmit={handleCreateTemplate}>
              <div className="form-group">
                <label>Template Name</label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                  required
                  placeholder="Enter template name"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                  placeholder="Enter template description"
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  value={createForm.category}
                  onChange={(e) => setCreateForm({...createForm, category: e.target.value})}
                  required
                  placeholder="Enter category"
                />
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={createForm.isPublic}
                    onChange={(e) => setCreateForm({...createForm, isPublic: e.target.checked})}
                  />
                  Make template public
                </label>
              </div>

              <div className="template-products-section">
                <h4>Template Products</h4>
                
                {/* Add Product Form */}
                <div className="add-product-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Product Name</label>
                      <input
                        type="text"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                        placeholder="Product name"
                      />
                    </div>
                    <div className="form-group">
                      <label>Image URL</label>
                      <input
                        type="url"
                        value={newProduct.imageUrl}
                        onChange={(e) => setNewProduct({...newProduct, imageUrl: e.target.value})}
                        placeholder="Image URL"
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Price</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                        placeholder="Price"
                      />
                    </div>
                    <div className="form-group">
                      <label>Category</label>
                      <input
                        type="text"
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                        placeholder="Category"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                      placeholder="Product description"
                      rows="2"
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
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTagToProduct())}
                      />
                      <button type="button" onClick={addTagToProduct} className="add-tag-btn">+</button>
                    </div>
                    <div className="tags-display">
                      {newProduct.tags.map(tag => (
                        <span key={tag} className="tag">
                          {tag}
                          <button 
                            type="button" 
                            onClick={() => removeTagFromProduct(tag)}
                            className="remove-tag-btn"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                  <button type="button" onClick={addProductToTemplate} className="add-product-btn">
                    Add Product to Template
                  </button>
                </div>

                {/* Template Products List */}
                {createForm.templateProducts.length > 0 && (
                  <div className="template-products-list">
                    <h5>Products in Template:</h5>
                    {createForm.templateProducts.map((product, index) => (
                      <div key={index} className="template-product-item">
                        <img src={product.imageUrl} alt={product.name} />
                        <div className="product-details">
                          <h6>{product.name}</h6>
                          <p>${product.price}</p>
                          <p>Category: {product.category}</p>
                          {product.tags.length > 0 && (
                            <div className="product-tags">
                              {product.tags.map(tag => (
                                <span key={tag} className="product-tag">{tag}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <button 
                          type="button" 
                          onClick={() => removeProductFromTemplate(index)}
                          className="remove-product-btn"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button type="submit" className="primary-button">Create Template</button>
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

      {/* Use Template Modal */}
      {showUseForm && selectedTemplate && (
        <div className="modal">
          <div className="modal-content">
            <h3>Use Template: {selectedTemplate.name}</h3>
            <form onSubmit={handleUseTemplate}>
              <div className="form-group">
                <label>Wishlist Name</label>
                <input
                  type="text"
                  value={useForm.name}
                  onChange={(e) => setUseForm({...useForm, name: e.target.value})}
                  required
                  placeholder="Enter wishlist name"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={useForm.description}
                  onChange={(e) => setUseForm({...useForm, description: e.target.value})}
                  placeholder="Enter wishlist description"
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={useForm.isPublic}
                    onChange={(e) => setUseForm({...useForm, isPublic: e.target.checked})}
                  />
                  Make wishlist public
                </label>
              </div>
              <div className="template-preview">
                <h4>Template Preview:</h4>
                <p><strong>Category:</strong> {selectedTemplate.category}</p>
                <p><strong>Products:</strong> {selectedTemplate.templateProducts.length}</p>
                <p><strong>Description:</strong> {selectedTemplate.description}</p>
              </div>
              <div className="modal-actions">
                <button type="submit" className="primary-button">Create Wishlist</button>
                <button 
                  type="button" 
                  onClick={() => setShowUseForm(false)}
                  className="secondary-button"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Template"
        message={`Are you sure you want to delete "${deleteDialog.templateName}"? This action cannot be undone.`}
        onConfirm={() => handleDeleteTemplate(deleteDialog.templateId)}
        onCancel={closeDeleteDialog}
      />

      {/* Error Popup */}
      <ErrorPopup
        isOpen={errorPopup.isOpen}
        message={errorPopup.message}
        onClose={closeErrorPopup}
      />

      {/* Success Popup */}
      <SuccessPopup
        isOpen={successPopup.isOpen}
        message={successPopup.message}
        onClose={closeSuccessPopup}
      />
    </div>
  );
};

export default Templates; 