import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import './Registration.css';
import groupIcon from "../images/Group.png"
import backIcon from "../images/Back.png"

const Registration = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('All fields are required');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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
      const registrationData = formData;
      
      const response = await axios.post('http://localhost:4000/register', registrationData);
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      });

      navigate('/dashboard');
      
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
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

  console.log(formData)

  return (
    <div className="registration-container">
      <div className="blue-panel">
      <div className="background-circle">
        <img src={backIcon} alt="Background" />
      </div>
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
          <h1 className="form-title">Register</h1>
          
          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <User className="input-icon" />
              <input
                type="text"
                name="name"
                className="input-field"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

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

            <div className="input-group">
              <Lock className="input-icon" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                className="input-field"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button 
              type="submit" 
              className="register-button"
              disabled={isLoading}
            >
              {isLoading ? 'Registering...' : 'Register'}
            </button>

            <p className="login-text">
              Have an account?
            </p>

            <div 
              type="submit" 
              className="redirectLogin"
              onClick={()=>{navigate("/login")}}
            >
              Login
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Registration;