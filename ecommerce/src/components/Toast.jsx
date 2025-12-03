import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import '../css/Toast.css';

const Toast = ({ message, type = 'success', onClose, duration = 3000, navigateTo = null }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClick = () => {
    if (navigateTo) {
      onClose();
      navigate(navigateTo);
    }
  };

  return (
    <div className={`toast toast-${type} ${navigateTo ? 'toast-clickable' : ''}`}>
      <div 
        className="toast-content" 
        onClick={handleClick}
        role={navigateTo ? 'button' : undefined}
        tabIndex={navigateTo ? 0 : undefined}
      >
        <span className="toast-icon">
          {type === 'success' ? '✅' : type === 'warning' ? '⚠️' : '❌'}
        </span>
        <span className="toast-message">{message}</span>
        {navigateTo && (
          <span className="toast-action">
            View Cart <ArrowForwardIcon className="toast-action-icon" />
          </span>
        )}
      </div>
      <button className="toast-close" onClick={(e) => { e.stopPropagation(); onClose(); }}>×</button>
    </div>
  );
};

export default Toast;