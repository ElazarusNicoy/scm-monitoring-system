import React from 'react';
import './login.css';

const DescriptionPanel = () => {
    return (
        <div className="description-panel">
            <h2>Welcome to the SCM Monitoring System</h2>
            <p>
                This interface allows users to log in and access the SCM Monitoring System. 
                Here, you can track workflows, manage transactions, and ensure timely approvals 
                within your organization. Please enter your credentials to get started.
            </p>
        </div>
    );
};

export default DescriptionPanel;