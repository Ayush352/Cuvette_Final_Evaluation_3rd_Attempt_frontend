// Settings.jsx
import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, User, Mail, Lock } from 'lucide-react';
import axios from 'axios';
import Sidebar from './Sidebar';
import './Settings.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Settings = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        oldPassword: '',
        newPassword: ''
    });
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [error, setError] = useState('');

    const validateUpdate = () => {
        const filledFields = Object.entries(formData).filter(([key, value]) => value.trim() !== '');
        
        if (filledFields.some(([key]) => key.includes('Password'))) {
            if (!formData.oldPassword || !formData.newPassword) {
                setError('Both old and new passwords are required');
                return false;
            }
            if (filledFields.length > 2) {
                setError('Only one item can be updated at a time');
                return false;
            }
            return 'password';
        }

        if (filledFields.length > 1) {
            setError('Only one item can be updated at a time');
            return false;
        }
        
        if (filledFields.length === 0) {
            setError('Please fill at least one field to update');
            return false;
        }

        return filledFields[0][0]; 
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const updateField = validateUpdate();
        if (!updateField) return;

        try {
            const token = localStorage.getItem('token');
            let endpoint = 'http://localhost:4000/settings/';
            let data = {};

            if (updateField === 'password') {
                endpoint += 'password';
                data = { 
                    oldPassword: formData.oldPassword,
                    newPassword: formData.newPassword
                };
            } else {
                endpoint += updateField;
                data = { [updateField]: formData[updateField] };
            }

            const response = await axios.patch(endpoint, data, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                toast.success('Updated successfully!', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                
                if (updateField === 'name' || updateField === 'email') {
                    const userData = JSON.parse(localStorage.getItem('user'));
                    localStorage.setItem('user', JSON.stringify({
                        ...userData,
                        [updateField]: formData[updateField]
                    }));
                }

                setFormData({
                    name: '',
                    email: '',
                    oldPassword: '',
                    newPassword: ''
                });
            }
        } catch (error) {
            setError(error.response?.data?.error || 'Update failed');
        }
    };

    return (
        <div className="dashboard-container">
            <Sidebar />
            <div className="settings-page">
                <ToastContainer />
                <div className="settings-container">
                    <h1 className="settings-title">Settings</h1>

                    <form onSubmit={handleSubmit} className="settings-form">
                        <div className="input-group">
                            <User className="input-icon" size={20} />
                            <input
                                type="text"
                                placeholder="Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="settings-input"
                            />
                        </div>

                        <div className="input-group">
                            <Mail className="input-icon" size={20} />
                            <input
                                type="email"
                                placeholder="Update Email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="settings-input"
                            />
                        </div>

                        <div className="input-group">
                            <Lock className="input-icon" size={20} />
                            <input
                                type={showOldPassword ? "text" : "password"}
                                placeholder="Old Password"
                                value={formData.oldPassword}
                                onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
                                className="settings-input"
                            />
                            <button
                                type="button"
                                onClick={() => setShowOldPassword(!showOldPassword)}
                                className="password-toggle-settings"
                            >
                                {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        <div className="input-group-settings">
                            <Lock className="input-icon" size={20} />
                            <input
                                type={showNewPassword ? "text" : "password"}
                                placeholder="New Password"
                                value={formData.newPassword}
                                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                className="settings-input"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="password-toggle-settings"
                            >
                                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        {error && <div className="error-message">{error}</div>}

                        <button type="submit" className="update-button">
                            Update
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Settings;