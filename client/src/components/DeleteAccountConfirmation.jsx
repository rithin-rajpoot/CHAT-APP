import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const DeleteAccountConfirmation = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isLoading = false,
  userName = "your account" 
}) => {
  const [confirmText, setConfirmText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const expectedText = 'DELETE';
  const isConfirmValid = confirmText === expectedText;

  const handleConfirm = () => {
    if (isConfirmValid && !isLoading) {
      onConfirm();
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setConfirmText('');
      setIsTyping(false);
      onClose();
    }
  };

  const handleInputChange = (e) => {
    setConfirmText(e.target.value);
    setIsTyping(true);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        {/* Modal */}
        <div className="bg-base-100 rounded-lg shadow-xl max-w-md w-full mx-4 relative">
          {/* Close button */}
          {!isLoading && (
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-base-content/60 hover:text-base-content transition-colors"
            >
              <X size={20} />
            </button>
          )}

          {/* Content */}
          <div className="p-6">
            {/* Icon and Title */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-error/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-error" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-base-content">
                  Delete Account
                </h3>
                <p className="text-sm text-base-content/70">
                  This action cannot be undone
                </p>
              </div>
            </div>

            {/* Warning Message */}
            <div className="bg-error/10 border border-error/20 rounded-lg p-4 mb-6">
              <p className="text-sm text-base-content mb-3">
                <strong>Warning:</strong> You are about to permanently delete{' '}
                <span className="font-medium text-error">{userName}</span>.
              </p>
              <ul className="text-xs text-base-content/80 space-y-1 list-disc list-inside">
                <li>All your messages will be permanently deleted</li>
                <li>Your profile information will be removed</li>
                <li>This action cannot be reversed</li>
                <li>You will be logged out immediately</li>
              </ul>
            </div>

            {/* Confirmation Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-base-content mb-2">
                To confirm, type <span className="font-mono bg-base-200 px-1 rounded text-error font-bold">DELETE</span> in the box below:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={handleInputChange}
                disabled={isLoading}
                placeholder="Type DELETE to confirm"
                className={`input input-bordered w-full ${
                  isTyping 
                    ? isConfirmValid 
                      ? 'input-success' 
                      : 'input-error'
                    : ''
                } ${isLoading ? 'input-disabled' : ''}`}
                autoComplete="off"
              />
              {isTyping && !isConfirmValid && (
                <p className="text-xs text-error mt-1">
                  Please type "DELETE" exactly as shown
                </p>
              )}
              {isConfirmValid && (
                <p className="text-xs text-success mt-1">
                  ✓ Confirmation text is correct
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="btn btn-outline btn-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={!isConfirmValid || isLoading}
                className={`btn btn-error btn-sm ${
                  isLoading ? 'loading loading-spinner' : ''
                }`}
              >
                {isLoading ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DeleteAccountConfirmation;
