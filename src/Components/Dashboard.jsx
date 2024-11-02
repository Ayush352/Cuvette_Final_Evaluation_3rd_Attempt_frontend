import React from 'react';
import Sidebar from './Sidebar';
import './Dashboard.css';
import TaskBoard from './TaskBoard';
import { useEffect, useState } from 'react';

const Dashboard = () => {
    const [userName, setUserName] = useState('');
    useEffect(() => {
        try {
          const userDataString = localStorage.getItem('user');
          if (userDataString) {
            const userData = JSON.parse(userDataString);
            setUserName(userData.name || 'User');
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
          setUserName('User');
        }
      }, []);


  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content" style={{ marginLeft: '260px' }}>
        <TaskBoard userName={userName}/>
      </main>
    </div>
  );
};

export default Dashboard;
