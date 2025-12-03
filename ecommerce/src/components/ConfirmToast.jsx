import { useEffect } from 'react';
import '../css/ConfirmToast.css';

const ConfirmToast = ({ message, onConfirm, onCancel, itemName, itemSize }) => {
  useEffect(() => {
    // Don't auto-close confirmation dialogs
  }, []);

  return (
    <div className="confirm-toast">
      <div className="confirm-toast-content">
        <span className="confirm-toast-icon">⚠️</span>
        <div className="confirm-toast-message-container">
          <span className="confirm-toast-message">{message}</span>
          {itemName && (
            <span className="confirm-toast-item">
              "{itemName}" {itemSize && `(Size: ${itemSize})`}
            </span>
          )}
        </div>
      </div>
      <div className="confirm-toast-actions">
        <button 
          className="confirm-toast-btn confirm-btn"
          onClick={onConfirm}
        >
          Remove
        </button>
        <button 
          className="confirm-toast-btn cancel-btn"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ConfirmToast;

