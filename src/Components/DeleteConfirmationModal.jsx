import React from 'react';
import './DeleteConfirmationModal.css';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="delete-modal-overlay" onClick={onClose}>
            <div className="delete-modal" onClick={e => e.stopPropagation()}>
                <div className="delete-modal-title">
                    Are you sure you want to Delete?
                </div>
                <div className="delete-modal-buttons">
                    <button 
                        className="delete-button"
                        onClick={onConfirm}
                    >
                        Yes, Delete
                    </button>
                    <button 
                        className="cancel-button"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;