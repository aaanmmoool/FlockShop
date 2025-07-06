import './ErrorPopup.css';

const ErrorPopup = ({ isOpen, message, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="error-popup-overlay">
      <div className="error-popup">
        <div className="error-popup-header">
          <h3>⚠️ Error</h3>
          <button 
            onClick={onClose}
            className="error-popup-close"
          >
            ×
          </button>
        </div>
        <div className="error-popup-body">
          <p>{message}</p>
        </div>
        <div className="error-popup-actions">
          <button 
            onClick={onClose}
            className="error-popup-ok"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPopup; 