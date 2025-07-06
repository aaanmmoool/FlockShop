import './ConfirmDialog.css';

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Delete', cancelText = 'Cancel' }) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-dialog-overlay">
      <div className="confirm-dialog">
        <div className="confirm-dialog-header">
          <h3>{title}</h3>
        </div>
        <div className="confirm-dialog-body">
          <p>{message}</p>
        </div>
        <div className="confirm-dialog-actions">
          <button 
            onClick={onCancel}
            className="confirm-dialog-cancel"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            className="confirm-dialog-confirm"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog; 