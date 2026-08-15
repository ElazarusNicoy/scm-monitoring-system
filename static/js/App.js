import React from 'react';
import LoginForm from '.loginForm';
import DescriptionPanel from 'descriptionPanel';
import 'login.css';

function App() {
    return (
        <div className="login-container">
            <DescriptionPanel />
            <LoginForm />
        </div>
    );
}

export default App;