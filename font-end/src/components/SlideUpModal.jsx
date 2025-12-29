import React, { useEffect } from 'react';
import './SlideUpModal.less';

const SlideUpModal = ({ visible, onClose, title, children }) => {
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = visible ? 'hidden' : '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className="slide-up-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="slide-up-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" aria-hidden="true" />
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <button className="modal-close" onClick={onClose} aria-label="关闭">✕</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

export default SlideUpModal;
