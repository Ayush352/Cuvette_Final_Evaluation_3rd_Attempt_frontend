import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import './Registration.css'; 
import groupIcon from "../images/Group.png"
import backIcon from "../images/Back.png"

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('All fields are required');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
if (!emailRegex.test(formData.email)) {
  setError('Invalid email format');
  return false;
}


    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const loginData = formData;
      
      const response = await axios.post('https://cuvette-final-evaluation-3rd-attempt.onrender.com/login', loginData);
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      navigate('/dashboard');
      
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setError(''); 
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="registration-container">
      <div className="blue-panel">
    <div className="astronaut-container">
        <div className="circle-background" />
        <img
            src={groupIcon}
            alt="Astronaut with laptop"
            className="astronaut-image"
        />
    </div>
    <div className="welcome-content">
        <h2 className="welcome-title">Welcome aboard my friend</h2>
        <p className="welcome-subtitle">just a couple of clicks and we start</p>
    </div>
</div>

      <div className="form-container">
        <div className="form-wrapper">
          <h1 className="form-title">Login</h1>
          
          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <Mail className="input-icon" />
              <input
                type="email"
                name="email"
                className="input-field"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div className="input-group">
              <Lock className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="input-field"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button 
              type="submit" 
              className="register-button"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>

            <p className="login-text">
            Have no account yet? 
            </p>

            <div 
              type="submit" 
              className="redirectLogin"
              onClick={()=>{navigate("/")}}
            >
              Register
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
