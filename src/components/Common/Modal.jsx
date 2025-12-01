import React from 'react';

const Modal = ({ open, title, children, onClose }) => {
  if (!open) return null;
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(2,6,23,0.45)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:60}}>
      <div style={{width:'min(720px,95%)',background:'#fff',borderRadius:12,padding:20,boxShadow:'0 12px 40px rgba(2,6,23,0.2)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <h3 style={{margin:0}}>{title}</h3>
          <button onClick={onClose} style={{background:'transparent',border:0,fontSize:18,cursor:'pointer'}}>×</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
