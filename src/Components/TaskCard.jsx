import React, { useState, useEffect, useRef } from 'react';
import { MoreHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';
import "./TaskCard.css";
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Toast.css';  // Import the custom styles

const TaskCard = ({ id, title, priority, checklist, dueDate, status, onUpdateChecklist, collapseToggle, onStatusChange, onDeleteTask,onEdit,assignTo,isAssigned,
    createdBy}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [localChecklist, setLocalChecklist] = useState(checklist);
    const [isUpdating, setIsUpdating] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const currentUserEmail = JSON.parse(localStorage.getItem('user'))?.email;
    const isCreatedByOthers = createdBy?.email !== currentUserEmail;
    const isAssignedToMe = assignTo === currentUserEmail;

    const customToast = () => (
        <div className="custom-toast">
            <p className="custom-toast-text">Link Copied</p>
        </div>
    );

    useEffect(() => {
        setLocalChecklist(checklist);
    }, [checklist]);

    const allStatuses = [
        { type: 'backlog', label: 'BACKLOG' },
        { type: 'todo', label: 'TO-DO' },
        { type: 'inProgress', label: 'PROGRESS' },
        { type: 'done', label: 'DONE' }
    ];

    const getInitials = (name) => {
        if (!name) return '';
        return name.split(' ')
            .map(word => word[0]+word[1])
            .join('')
            .toUpperCase();
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleEdit = () => {
        setShowMenu(false); 
        onEdit({
            id,
            title,
            priority,
            checklist,
            dueDate,
            status,
            assignTo
        });
    };

    const handleShare = async () => {
        setShowMenu(false); 
        try {
            const response = await axios.post(
                `http://localhost:4000/tasks/${id}/share`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (response.data.success && response.data.shareUrl) {
                try {
                    await navigator.clipboard.writeText(response.data.shareUrl);
                    toast(customToast, {
                        position: "top-right",
                        autoClose: 2000,
                        hideProgressBar: true,
                        closeOnClick: true,
                        pauseOnHover: false,
                        draggable: false,
                        className: 'custom-toast-container'
                    });
                } catch (clipboardError) {
                    console.error('Clipboard error:', clipboardError);
                }
            }
        } catch (error) {
            console.error('Error sharing task:', error);
        }
    };


    

    const availableStatuses = allStatuses.filter(s => s.type !== status);

    const handleStatusChange = async (newStatus) => {
        try {
            const response = await axios.patch(
                `http://localhost:4000/tasks/${id}/status`,
                { status: newStatus },
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (response.data.success) {
                onStatusChange(id, newStatus);
            }
        } catch (error) {
            console.error('Error updating task status:', error);
        }
    };

    const isPastDue = (date) => {
        if (!date) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDateTime = new Date(date);
        dueDateTime.setHours(0, 0, 0, 0);
        return dueDateTime < today;
    };

    // Helper function to get date label styles
    const getDateLabelStyles = () => {
        if (!dueDate) return {};

        if (status === 'done') {
            return {
                backgroundColor: 'rgba(99, 192, 91, 1)', // Green background for completed tasks
                color: 'white'
            };
        }

        if (isPastDue(dueDate)) {
            return {
                backgroundColor: 'rgba(207, 54, 54, 1)', // Red background for overdue tasks
                color: 'white'
            };
        }

        return {
            backgroundColor: priority.toLowerCase() === 'high' ? 'rgba(207, 54, 54, 1)' : '#f5f5f5',
            color: priority.toLowerCase() === 'high' ? 'white' : '#666'
        };
    };



    const priorityConfig = {
        low: {
            color: '#22C55E',
            text: 'LOW PRIORITY'
        },
        moderate: {
            color: 'rgba(24, 176, 255, 1)',
            text: 'MODERATE PRIORITY'
        },
        high: {
            color: '#EF4444',
            text: 'HIGH PRIORITY',
            dateBackground: 'rgba(207, 54, 54, 1)'
        }
    };

    useEffect(() => {
        setIsExpanded(false);
    }, [collapseToggle]);

    const completedTasks = localChecklist?.filter(item => item.isCompleted)?.length || 0;
    const totalTasks = localChecklist?.length || 0;

    const handleChecklistToggle = async (checklistItemId, isCompleted) => {
        if (isUpdating || !checklistItemId) return;
        setIsUpdating(true);
    
        try {
            const response = await axios.patch(
                `http://localhost:4000/tasks/${id}/checklist/${checklistItemId}`,
                { isCompleted: !isCompleted },
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
    
            if (response.data.success) {
                const updatedChecklist = localChecklist.map(item => 
                    item._id === checklistItemId 
                        ? { ...item, isCompleted: !isCompleted }
                        : item
                );
                setLocalChecklist(updatedChecklist);
                
                if (onUpdateChecklist) {
                    onUpdateChecklist(id, updatedChecklist);
                }
            }
        } catch (error) {
            console.error('Error updating checklist item:', error);
        } finally {
            setIsUpdating(false);
        }
    };


    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const day = d.getDate();
        
        const getOrdinalSuffix = (day) => {
            if (day > 3 && day < 21) return 'th';
            switch (day % 10) {
                case 1: return 'st';
                case 2: return 'nd';
                case 3: return 'rd';
                default: return 'th';
            }
        };

        return `${d.toLocaleDateString('en-US', { month: 'short' })} ${day}${getOrdinalSuffix(day)}`;
    };

    const handleDeleteClick = () => {
        setShowMenu(false);  // Close the menu
        setShowDeleteModal(true);  // Show the delete confirmation modal
    };

    const handleDeleteConfirm = async () => {
        try {
            await onDeleteTask(id);
            setShowDeleteModal(false);
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };


    const MAX_TITLE_LENGTH = 35; // Adjust this number based on your needs

const truncateTitle = (title) => {
    if (title.length > MAX_TITLE_LENGTH) {
        return `${title.substring(0, MAX_TITLE_LENGTH)}...`;
    }
    return title;
};



    return (
        <div className="task-card-wrapper">
            <div className={`task-card-inner ${isExpanded ? 'expanded' : ''}`}>
                {/* Priority and Menu */}
                <div className="task-header">
                    <div className="priority-label">
                        <span 
                            className="priority-dot"
                            style={{ backgroundColor: priorityConfig[priority.toLowerCase()].color }}
                        ></span>
                        <span className="priority-text">
                            {priorityConfig[priority.toLowerCase()].text}
                        </span>
                        {isAssignedToMe && isCreatedByOthers &&(
                            <div className="assigner-avatar">
                                {getInitials(createdBy.name)}
                            </div>
                        )}
                    </div>
                    <div className="menu-container" ref={menuRef}>
                        <button 
                            className="menu-btn"
                            onClick={() => setShowMenu(!showMenu)}
                        >
                            <MoreHorizontal size={16} />
                        </button>
                        {showMenu && (
                            <div className="menu-dropdown">
                                <button className="menu-item" onClick={handleEdit}>
                                    Edit
                                </button>
                                <button className="menu-item" onClick={handleShare}>
                                    Share
                                </button>
                                <button className="menu-item delete" onClick={handleDeleteClick}>
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Title */}
                <h3 
    className="task-heading" 
    title={title} // Shows full title on hover
>
    {title}
</h3>

                {/* Checklist Counter */}
                <div className="checklist-counter">
                    <span>Checklist ({completedTasks}/{totalTasks})</span>
                    <button 
                        className="chevron-btn"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronDown size={16} />}
                    </button>
                </div>

                {/* Expandable Checklist */}
                {isExpanded && (
                <div className="checklist-expanded">
                    {localChecklist.map((item) => (
                        <div key={item._id} className="checklist-item">
                            <input
                                type="checkbox"
                                checked={item.isCompleted}
                                onChange={() => {
                                    if (item._id) {
                                        handleChecklistToggle(item._id, item.isCompleted);
                                    }
                                }}
                                className="checklist-checkbox"
                                disabled={isUpdating}
                            />
                            <span className="checklist-text">
                                {item.text}
                            </span>
                        </div>
                    ))}
                </div>
            )}

                {/* Footer */}
                <div className="task-footer">
                <div className="date-section">
                    {dueDate && (
                        <span
                            className="date-label"
                            style={getDateLabelStyles()}
                        >
                            {formatDate(dueDate)}
                        </span>
                    )}
                </div>
                    <div className="status-pills">
                        {availableStatuses.map(({ type, label }) => (
                            <button
                                key={type}
                                className="status-pill"
                                onClick={() => handleStatusChange(type)}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <DeleteConfirmationModal 
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteConfirm}
            />
            <ToastContainer 
                position="top-right"
                autoClose={2000}
                hideProgressBar
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss={false}
                draggable={false}
                pauseOnHover={false}
                theme="light"
            />
        </div>
    );
};

export default TaskCard;