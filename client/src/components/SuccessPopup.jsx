import './SuccessPopup.css';

const SuccessPopup = ({ isOpen, message, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="success-popup-overlay">
      <div className="success-popup">
        <div className="success-popup-header">
          <h3>✅ Success</h3>
          <button 
            onClick={onClose}
            className="success-popup-close"
          >
            ×
          </button>
        </div>
        <div className="success-popup-body">
          <p>{message}</p>
        </div>
        <div className="success-popup-actions">
          <button 
            onClick={onClose}
            className="success-popup-ok"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessPopup; 