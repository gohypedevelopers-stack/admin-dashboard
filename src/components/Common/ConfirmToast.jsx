import React, { useEffect } from 'react';

const ConfirmToast = ({ show, message, onClose, timeout = 3000 }) => {
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => onClose && onClose(), timeout);
    return () => clearTimeout(t);
  }, [show, timeout, onClose]);

  if (!show) return null;
  return (
    <div style={{position:'fixed',right:20,bottom:20,background:'#111827',color:'#fff',padding:'12px 16px',borderRadius:8,boxShadow:'0 8px 24px rgba(2,6,23,0.2)'}}>
      {message}
    </div>
  );
};

export default ConfirmToast;
