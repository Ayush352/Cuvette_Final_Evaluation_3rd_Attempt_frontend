import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, UserPlus } from 'lucide-react';
import TaskModal from './TaskModal';
import TaskCard from './TaskCard';
import './TaskBoard.css';
import collapseAllIcon from '../images/collapseAll.png';
import EditTaskModal from './EditTaskModal';
import peopleIcon from "../images/people.png"
import AddPeopleModal from './AddPeopleModal';
import Loader from './Loader'

const Column = ({ title, tasks = [], onAddTask, onUpdateChecklist,onStatusChange, onDeleteTask,onEditTask   }) => {
    const isToDoColumn = title.toLowerCase() === 'to do';
    const [collapseToggle, setCollapseToggle] = useState(true);

    const collapseAllTasks = () => {
        setCollapseToggle(prev => !prev);
    };

    return (
        <div className="board-column">
            <div className="column-header">
                <h2 className="column-title">{title}</h2>
                <div className="column-actions">
                    {isToDoColumn && (
                        <button
                            className="add-task-btn primary"
                            onClick={onAddTask}
                            title="Add new task"
                        >
                            <Plus size={16} />
                        </button>
                    )}
                    <button
                        className="options-btn"
                        title={"Collapse All"}
                        onClick={collapseAllTasks}
                    >
                        <img 
                            src={collapseAllIcon}
                            alt="Collapse All"
                            width={20}
                            height={20}
                        />
                    </button>
                </div>
            </div>
            <div className="tasks-container">
                {tasks.length === 0 ? (
                    <div className="empty-column">
                        No tasks yet
                    </div>
                ) : (
                    <div className="tasks-wrapper">
                        {tasks.map(task => (
                            <TaskCard
                                key={task._id + task.checklist.length}
                                id={task._id}
                                title={task.title}
                                priority={task.priority}
                                checklist={task.checklist}
                                dueDate={task.dueDate}
                                status={task.status}
                                onUpdateChecklist={onUpdateChecklist}
                                collapseToggle={collapseToggle}
                                onStatusChange={onStatusChange}
                                onDeleteTask={onDeleteTask} 
                                onEdit={onEditTask}
                                createdBy={task.createdBy}
                                assignTo={task.assignTo} 
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const TaskBoard = ({ userName }) => {
    const [timeFilter, setTimeFilter] = useState('week');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState(null);
    const [isAddPeopleModalOpen, setIsAddPeopleModalOpen] = useState(false);

    useEffect(() => {
      console.log('Modal state changed:', isAddPeopleModalOpen);
  }, [isAddPeopleModalOpen]);

    useEffect(() => {
      return () => {
          setIsAddPeopleModalOpen(false);
      };
  }, []);

    const handleEditTask = (task) => {
      setTaskToEdit({
          ...task,
          checklist: task.checklist.map(item => ({
              _id: item._id,
              text: item.text,
              isCompleted: item.isCompleted
          }))
      });
      setIsEditModalOpen(true);
  };

  const handleUpdateTask = (updatedTask) => {
    setTasks(prevTasks =>
        prevTasks.map(task =>
            task._id === updatedTask._id ? {
                ...task, 
                ...updatedTask, 
                createdBy: task.createdBy, 
                checklist: updatedTask.checklist.map(item => ({
                    _id: item._id,
                    text: item.text,
                    isCompleted: item.isCompleted
                }))
            } : task
        )
    );
    setIsEditModalOpen(false);
    setTaskToEdit(null);
};

    
const fetchTasks = async () => {
  try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`https://cuvette-final-evaluation-3rd-attempt.onrender.com/getTasks?filter=${timeFilter}`, {
          headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
          const transformedTasks = response.data.tasks.map(task => ({
              _id: task._id,
              title: task.title,
              priority: task.priority,
              checklist: task.checklist.map(item => ({
                  _id: item._id,
                  text: item.text,
                  isCompleted: item.completed || item.isCompleted
              })),
              dueDate: task.dueDate,
              status: task.status || 'todo',
              assignTo: task.assignTo,
              createdBy: task.createdBy,
          }));
          
          setTasks(transformedTasks);
      }
  } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to load tasks. Please try again later.');
  } finally {
      setLoading(false);
  }
};

useEffect(() => {
  fetchTasks();
}, [timeFilter]); 

    const handleUpdateChecklist = (taskId, updatedChecklist) => {
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task._id === taskId
                    ? { ...task, checklist: updatedChecklist }
                    : task
            )
        );
    };

    const handleStatusChange = (taskId, newStatus) => {
      setTasks(prevTasks =>
          prevTasks.map(task =>
              task._id === taskId
                  ? { ...task, status: newStatus }
                  : task
          )
      );
  };

  const getCurrentDate = () => {
    const date = new Date();
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();

    const getOrdinalSuffix = (d) => {
        if (d > 3 && d < 21) return 'th';
        switch (d % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    };

    return `${day}${getOrdinalSuffix(day)} ${month}, ${year}`;
};

    const handleAddTask = () => {
        setIsModalOpen(true);
    };

    const handleSaveTask = (newTask) => {
      setTasks(prevTasks => [...prevTasks, {
        ...newTask,
        checklist: newTask.checklist.map(item => ({
            ...item,
            _id: item._id 
        }))
    }]);
        setIsModalOpen(false);
    };

    const handleDeleteTask = async (taskId) => {
      try {
          const response = await axios.delete(`https://cuvette-final-evaluation-3rd-attempt.onrender.com/tasks/${taskId}`, {
              headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
          });
  
          if (response.data.success) {
              setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
          }
      } catch (error) {
          console.error('Error deleting task:', error);
      }
  };
  

    const columns = [
        { title: 'Backlog', type: 'backlog' },
        { title: 'To do', type: 'todo' },
        { title: 'In progress', type: 'inProgress' },
        { title: 'Done', type: 'done' }
    ];

    return (
        <>
        {loading && <Loader />}
        <div className='task-board-wrapper'>
            <div className="board-container">
<div className="board-header">
    <div className="welcome-date-row">
        <h1 className="welcome-text">Welcome! {userName}</h1>
        <div className="date-text">{getCurrentDate()}</div>
    </div>
    <div className="title-filter-row">
    <div className="title-section">
        <h2 className="Taskboard-title">Board</h2>
        <button 
          className="add-people-btn"
          onClick={() => setIsAddPeopleModalOpen(true)}
        >
            <img
            src={peopleIcon}
            sizes={20}
            />
            <span>Add People</span>
        </button>
    </div>
    <select
            className="filter-dropdown"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            disabled={loading}
        >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
        </select>
</div>
</div>

                <div className="scrollable-content">
                    <div className="board-columns">
                        {columns.map(({ title, type }) => (
                           <Column
                           key={type}
                           title={title}
                           tasks={tasks.filter(task => task.status === type)}
                           onAddTask={title === 'To do' ? handleAddTask : undefined}
                           onUpdateChecklist={handleUpdateChecklist}
                           onStatusChange={handleStatusChange}
                           onDeleteTask={handleDeleteTask} 
                           onEditTask={handleEditTask}
                       />
                        ))}
                    </div>
                </div>

                <TaskModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveTask}
                />

                    {isEditModalOpen && (
                    <EditTaskModal
                        isOpen={isEditModalOpen}
                        onClose={() => {
                            setIsEditModalOpen(false);
                            setTaskToEdit(null);
                        }}
                        task={taskToEdit}
                        onUpdate={handleUpdateTask}
                    />
                )}

                    <AddPeopleModal
                    isOpen={isAddPeopleModalOpen}
                    onClose={() => setIsAddPeopleModalOpen(false)}
                />
            </div>
        </div>
        </>
    );
};

TaskBoard.defaultProps = {
    userName: 'User'
};

export default TaskBoard;