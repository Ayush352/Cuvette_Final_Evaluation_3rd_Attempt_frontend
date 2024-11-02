import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Analytics.css';
import Sidebar from './Sidebar';

const Analytics = () => {
    const [taskStats, setTaskStats] = useState({
        statusCounts: {
            backlog: 0,
            todo: 0,
            inProgress: 0,
            done: 0
        },
        priorityCounts: {
            low: 0,
            moderate: 0,
            high: 0
        },
        dueDateTasksCount: 0
    });

    useEffect(() => {
        const fetchTaskStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('https://cuvette-final-evaluation-3rd-attempt.onrender.com/getTasks', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.success) {
                    const tasks = response.data.tasks;
                    
                    const statusCounts = {
                        backlog: tasks.filter(task => task.status === 'backlog').length,
                        todo: tasks.filter(task => task.status === 'todo').length,
                        inProgress: tasks.filter(task => task.status === 'inProgress').length,
                        done: tasks.filter(task => task.status === 'done').length
                    };

                    const priorityCounts = {
                        low: tasks.filter(task => task.priority === 'low').length,
                        moderate: tasks.filter(task => task.priority === 'moderate').length,
                        high: tasks.filter(task => task.priority === 'high').length
                    };

                    const dueDateTasksCount = tasks.filter(task => task.dueDate).length;

                    setTaskStats({
                        statusCounts,
                        priorityCounts,
                        dueDateTasksCount
                    });
                }
            } catch (error) {
                console.error('Error fetching task statistics:', error);
            }
        };

        fetchTaskStats();
    }, []);

    return (
        <div className="dashboard-container">
            <Sidebar />
            <div className="analytics-page">
                <div className="analytics-container">
                    <h1 className="analytics-title">Analytics</h1>
                    
                    <div className="stats-grid">
                        <div className="stats-column">
                            <div className="stat-item">
                                <div className="stat-label">
                                    <div className="dot"></div>
                                    Backlog Tasks
                                </div>
                                <div className="stat-value">
                                    {String(taskStats.statusCounts.backlog).padStart(2, '0')}
                                </div>
                            </div>

                            <div className="stat-item">
                                <div className="stat-label">
                                    <div className="dot"></div>
                                    To-do Tasks
                                </div>
                                <div className="stat-value">
                                    {String(taskStats.statusCounts.todo).padStart(2, '0')}
                                </div>
                            </div>

                            <div className="stat-item">
                                <div className="stat-label">
                                    <div className="dot"></div>
                                    In-Progress Tasks
                                </div>
                                <div className="stat-value">
                                    {String(taskStats.statusCounts.inProgress).padStart(2, '0')}
                                </div>
                            </div>

                            <div className="stat-item">
                                <div className="stat-label">
                                    <div className="dot"></div>
                                    Completed Tasks
                                </div>
                                <div className="stat-value">
                                    {String(taskStats.statusCounts.done).padStart(2, '0')}
                                </div>
                            </div>
                        </div>

                        <div className="stats-column">
                            <div className="stat-item">
                                <div className="stat-label">
                                    <div className="dot"></div>
                                    Low Priority
                                </div>
                                <div className="stat-value">
                                    {String(taskStats.priorityCounts.low).padStart(2, '0')}
                                </div>
                            </div>

                            <div className="stat-item">
                                <div className="stat-label">
                                    <div className="dot"></div>
                                    Moderate Priority
                                </div>
                                <div className="stat-value">
                                    {String(taskStats.priorityCounts.moderate).padStart(2, '0')}
                                </div>
                            </div>

                            <div className="stat-item">
                                <div className="stat-label">
                                    <div className="dot"></div>
                                    High Priority
                                </div>
                                <div className="stat-value">
                                    {String(taskStats.priorityCounts.high).padStart(2, '0')}
                                </div>
                            </div>

                            <div className="stat-item">
                                <div className="stat-label">
                                    <div className="dot"></div>
                                    Due Date Tasks
                                </div>
                                <div className="stat-value">
                                    {String(taskStats.dueDateTasksCount).padStart(2, '0')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default Analytics;