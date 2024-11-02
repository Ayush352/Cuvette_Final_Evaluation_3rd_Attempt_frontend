// AddPeopleModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FiChevronDown } from 'react-icons/fi';
import './AddPeopleModal.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Toast.css';

const AddPeopleModal = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [users, setUsers] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const customToast = () => (
        <div className="custom-toast">
            <p className="custom-toast-text">User Added to dashboard</p>
        </div>
    );

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('https://cuvette-final-evaluation-3rd-attempt.onrender.com/users', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                const currentUserEmail = JSON.parse(localStorage.getItem('user'))?.email;
                const filteredUsers = response.data.users.filter(user => 
                    user.email !== currentUserEmail
                );
                setUsers(filteredUsers);
            } catch (err) {
                console.error('Error fetching users:', err);
                setError('Failed to load users');
            }
        };

        if (isOpen) {
            fetchUsers();
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email.trim()) {
            setError('Email is required');
            return;
        }

        try {
            const response = await axios.post(
                'https://cuvette-final-evaluation-3rd-attempt.onrender.com/inviteUser',
                { email },
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (response.data.success) {
                toast('User Added to dashboard', {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    className: 'custom-toast',
                    bodyClassName: 'custom-toast-text',
                });
                onClose();
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to add user');
        }
    };

    if (!isOpen) return null;

    return (
        <>
        <div className="modal-overlay" onClick={onClose}>
            <div className="add-people-modal" onClick={e => e.stopPropagation()}>
                <h2 className="modal-title">Add people to the board</h2>
                <form onSubmit={handleSubmit}>
                    <div className="custom-dropdown" ref={dropdownRef}>
                        <button 
                            type="button"
                            className="dropdown-trigger"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            {email || 'Select User'}
                            <FiChevronDown size={20} />
                        </button>
                        
                        {isDropdownOpen && (
                            <div className="dropdown-menu">
                                {users.map(user => (
                                    <div key={user.id} className="dropdown-item">
                                        <div className="user-info">
                                            <span className="user-email">{user.email}</span>
                                        </div>
                                        <button
                                            type="button"
                                            className="assign-button"
                                            onClick={() => {
                                                setEmail(user.email);
                                                setIsDropdownOpen(false);
                                            }}
                                        >
                                            Add
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {error && <div className="error-message">{error}</div>}
                    
                    <div className="modal-buttons">
                        <button 
                            type="button" 
                            className="cancel-button"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="add-button"
                            disabled={!email}
                        >
                            Add Email
                        </button>
                    </div>
                </form>
            </div>
        </div>
        <ToastContainer />
        </>
    );
};

export default AddPeopleModal;