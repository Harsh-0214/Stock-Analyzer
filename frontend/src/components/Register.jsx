import React from 'react';
import './Register.css';

const Register = () => {
  return (
    <div className="register-page fade-in">
      <h1>Register</h1>
      <form>
        <input type="text" placeholder="Username" required />
        <input type="password" placeholder="Password" required />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
