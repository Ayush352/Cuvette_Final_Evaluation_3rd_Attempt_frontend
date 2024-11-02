import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './TaskModal.css';
import axios from 'axios';
import { FiChevronDown } from 'react-icons/fi';

const EditTaskModal = ({ isOpen, onClose, task, onUpdate }) => {
    const [title, setTitle] = useState('');
    const [priority, setPriority] = useState('');
    const [checklist, setChecklist] = useState([]);
    const [dueDate, setDueDate] = useState('');
    const [assignee, setAssignee] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [users, setUsers] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [isAssignFieldDisabled, setIsAssignFieldDisabled] = useState(false);

    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setPriority(task.priority);
            setChecklist(task.checklist);
            setDueDate(task.dueDate ? new Date(task.dueDate) : '');
            setAssignee(task.assignTo || '');
        }
    }, [task]);

    useEffect(() => {
        let timeoutId;
        
        if (error) {
            timeoutId = setTimeout(() => {
                setError(null);
            }, 5000); 
        }

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [error]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:4000/users', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const currentUserEmail = JSON.parse(localStorage.getItem('user'))?.email;
                const filteredUsers = response.data.users.filter(user => 
                    user.email !== currentUserEmail
                );
                setUsers(filteredUsers);

                if (task && task.assignTo === currentUserEmail) {
                    setIsAssignFieldDisabled(true);
                }
            } catch (err) {
                console.error('Error fetching users:', err);
                setError('Failed to load users');
            }
        };

        if (isOpen) {
            fetchUsers();
        }
    }, [isOpen, task]);

    if (!isOpen) return null;

    const validateForm = () => {
        setError(null);

        if (!title.trim()) {
            setError('Title is required');
            return false;
        }

        if (title.trim().length < 3) {
            setError('Title must be at least 3 characters long');
            return false;
        }

        if (!priority) {
            setError('Please select a priority level');
            return false;
        }

        if (checklist.length === 0) {
            setError('Add at least one checklist item');
            return false;
        }

        const validChecklist = checklist.filter(item => item.text.trim());
        if (validChecklist.length === 0) {
            setError('Checklist items cannot be empty');
            return false;
        }

        if (dueDate) {
            const selectedDate = new Date(dueDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (selectedDate < today) {
                setError('Due date cannot be in the past');
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
    
        setLoading(true);
        setError(null);
    
        try {
            const updatedTask = {
                title: title.trim(),
                priority,
                checklist: checklist.map(item => ({
                    text: item.text.trim(),
                    isCompleted: item.isCompleted,
                    _id: item._id 
                })).filter(item => item.text.trim()), 
                dueDate,
                assignTo: assignee,
                status: task.status
            };
    
            const response = await axios.patch(
                `http://localhost:4000/tasks/${task.id}`,
                updatedTask,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
    
            if (response.data.success) {
                onUpdate(response.data.task);
                onClose();
            }
        } catch (err) {
            console.error('Error updating task:', err);
            setError('Failed to update task');
        } finally {
            setLoading(false);
        }
    };

    const getInitials = (email) => {
        const parts = email.split('@')[0].split('.');
        return parts.map(part => part[0].toUpperCase()).join('');
    };

    const handleAssign = (email) => {
        setAssignee(email);
        setIsDropdownOpen(false);
    };


    const handleChecklistChange = (index, newText) => {
        const newChecklist = [...checklist];
        newChecklist[index].text = newText;
        setChecklist(newChecklist);
    };
    

    const handleChecklistToggle = (index) => {
        const newChecklist = [...checklist];
        newChecklist[index].isCompleted = !newChecklist[index].isCompleted;
        setChecklist(newChecklist);
    };

    const handleRemoveChecklistItem = (index) => {
        const newChecklist = checklist.filter((_, i) => i !== index);
        setChecklist(newChecklist);
    };
    
    const handleAddChecklistItem = () => {
        setChecklist([
            ...checklist,
            {
                text: '',
                isCompleted: false
            }
        ]);
    };

    const completedCount = checklist.filter(item => item.isCompleted).length;

    const CustomInput = ({ value, onClick }) => (
        <button 
            type="button"
            className="date-input" 
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClick();
            }}
        >
            {value || 'Select Due Date'}
        </button>
    );

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <form onSubmit={handleSubmit} noValidate>
                    <div className="modal-body">
                        <div className='title-label'>
                            <span>Title</span>
                            <span className="required-asterisk">*</span>
                        </div>
                        <div className="form-group">
                            <input
                                type="text"
                                className="task-input"
                                placeholder="Enter Task Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        <div className="priority-section">
                            <div className="priority-label">
                                <span>Select Priority</span>
                                <span className="required-asterisk">*</span>
                            </div>
                            <div className="priority-buttons">
                                <button
                                    type="button"
                                    className={`priority-btn high ${priority === 'high' ? 'selected' : ''}`}
                                    onClick={() => setPriority('high')}
                                >
                                    HIGH PRIORITY
                                </button>
                                <button
                                    type="button"
                                    className={`priority-btn moderate ${priority === 'moderate' ? 'selected' : ''}`}
                                    onClick={() => setPriority('moderate')}
                                >
                                    MODERATE PRIORITY
                                </button>
                                <button
                                    type="button"
                                    className={`priority-btn low ${priority === 'low' ? 'selected' : ''}`}
                                    onClick={() => setPriority('low')}
                                >
                                    LOW PRIORITY
                                </button>
                            </div>
                        </div>

                        <div className="assign-container" ref={dropdownRef}>
                        <label className="assign-label">Assign to</label>
                        <div className="custom-dropdown">
                            <button 
                                type="button"
                                className={`dropdown-trigger ${isAssignFieldDisabled ? 'disabled' : ''}`}
                                onClick={() => !isAssignFieldDisabled && setIsDropdownOpen(!isDropdownOpen)}
                                disabled={isAssignFieldDisabled}
                            >
                                {assignee || 'Select User'}
                                <FiChevronDown size={20} />
                            </button>
                            
                            {isDropdownOpen && !isAssignFieldDisabled && (
                                <div className="dropdown-menu">
                                    {users.map(user => (
                                        <div key={user.id} className="dropdown-item">
                                            <div className="user-info">
                                                <div className="user-avatar">
                                                    {getInitials(user.email)}
                                                </div>
                                                <span className="user-email">{user.email}</span>
                                            </div>
                                            <button
                                                type="button"
                                                className="assign-button"
                                                onClick={() => handleAssign(user.email)}
                                            >
                                                {assignee === user.email ? 'Assigned' : 'Assign'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                        <div className="checklist-section">
                            <div className="checklist-header">
                                <label className="form-label">
                                    Checklist ({completedCount}/{checklist.length}) *
                                </label>
                            </div>
                            {checklist.map((item, index) => (
                                <div key={item._id || index} className="checklist-item">
                                    <input
                                        type="checkbox"
                                        checked={item.isCompleted}
                                        onChange={() => handleChecklistToggle(index)}
                                        className="checklist-checkbox"
                                    />
                                    <input
                                        type="text"
                                        className="task-input checklist-input"
                                        placeholder="Task to be done"
                                        value={item.text}
                                        onChange={(e) => handleChecklistChange(index, e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="delete-checklist-btn"
                                        onClick={() => handleRemoveChecklistItem(index)}
                                    >
                                        <Trash size={16} color="red" />
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                className="add-checklist-btn"
                                onClick={handleAddChecklistItem}
                            >
                                <Plus size={16} />
                                Add New
                            </button>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <div className="date-picker-wrapper">
                            <DatePicker
                                selected={dueDate}
                                onChange={(date) => setDueDate(date)}
                                customInput={<CustomInput />}
                                dateFormat="dd/MM/yyyy"
                                placeholderText="Select Due Date"
                            />
                        </div>
                        <button 
                            type="button" 
                            className="btn btn-cancel" 
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-save"
                            disabled={!title || !priority || loading}
                        >
                            {loading ? 'Updating...' : 'Update'}
                        </button>
                    </div>
                    
                    {error && (
                        <div className="error-container">
                            <div className="error-message">
                                {error}
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default EditTaskModal;