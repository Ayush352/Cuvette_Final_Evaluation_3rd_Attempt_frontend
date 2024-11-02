import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './SharedTaskView.css';
import { Box } from 'lucide-react';
import codeIcon from "../images/codesandbox.png";

const SharedTaskView = () => {
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTask = async () => {
            try {
                const shareId = window.location.pathname.split('/share/')[1];
                const response = await axios.get(`https://cuvette-final-evaluation-3rd-attempt.onrender.com/tasks/share/${shareId}`);
                setTask(response.data.task);
            } catch (err) {
                setError('Task not found or link has expired');
            } finally {
                setLoading(false);
            }
        };

        fetchTask();
    }, []);

    const getDateLabelStyles = () => {
        if (!task.dueDate) return {};

        if (task.status === 'done') {
            return {
                backgroundColor: 'rgba(99, 192, 91, 1)', 
                color: 'white'
            };
        }

        const isPastDue = new Date(task.dueDate) < new Date().setHours(0, 0, 0, 0);
        if (isPastDue) {
            return {
                backgroundColor: 'rgba(207, 54, 54, 1)', 
                color: 'white'
            };
        }

        return {
            backgroundColor: task.priority.toLowerCase() === 'high' ? 'rgba(207, 54, 54, 1)' : '#f5f5f5',
            color: task.priority.toLowerCase() === 'high' ? 'white' : '#666'
        };
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

    if (loading) return <div className="shared-task-loading">Loading...</div>;
    if (error) return <div className="shared-task-error">{error}</div>;
    if (!task) return null;

    return (
        <div className="shared-view-container">
            <div className="shared-view-header">
                <div className="logo-container">
                    <img 
                        src={codeIcon} 
                        alt="Pro Manage Logo" 
                        className="logo-icon"
                    />
                    <span className="logo-text">Pro Manage</span>
                </div>
            </div>
        <div className="shared-task-container">
            <div className="shared-task-card">
                <div className="priority-label">
                    <span 
                        className="priority-dot"
                        style={{ backgroundColor: 
                            task.priority === 'high' ? '#EF4444' : 
                            task.priority === 'moderate' ? '#3B82F6' : 
                            '#22C55E' 
                        }}
                    ></span>
                    <span className="priority-text">
                        {task.priority.toUpperCase()} PRIORITY
                    </span>
                </div>

                <h2 className="task-title">{task.title}</h2>

                <div className="checklist-header-fixed">
                    Checklist ({task.checklist.filter(item => item.isCompleted).length}/{task.checklist.length})
                </div>

                <div className="checklist-scroll-container">
                    {task.checklist.map((item, index) => (
                        <div key={index} className="checklist-item">
                            <input
                                type="checkbox"
                                checked={item.isCompleted}
                                readOnly
                                className="checklist-checkbox"
                            />
                            <span className="checklist-text">{item.text}</span>
                        </div>
                    ))}
                </div>

                {task.dueDate && (
                    <div className="due-date-section">
                        <span className="due-date-title">Due Date</span>
                        <span 
                            className="date-label-taskview"
                            style={getDateLabelStyles()}
                        >
                            {formatDate(task.dueDate)}
                        </span>
                    </div>
                )}
            </div>
        </div>
        </div>
    );
};

export default SharedTaskView;