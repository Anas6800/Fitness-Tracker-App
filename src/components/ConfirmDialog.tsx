import * as React from 'react';

type Props = {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  danger = false,
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;

  const confirmClass = danger ? 'btn btn-danger btn-sm' : 'btn btn-primary btn-sm';

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={title}>
      <div className="modal">
        <div className="modal-title">{title}</div>
        {description ? <div className="modal-desc">{description}</div> : null}
        <div className="modal-actions">
          <button className="btn btn-sm" onClick={onCancel}>
            {cancelText}
          </button>
          <button className={confirmClass} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
