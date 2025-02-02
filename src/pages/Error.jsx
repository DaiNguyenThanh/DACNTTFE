import React from 'react';

const ErrorPage = ({ errorCode }) => {
    let message;

    switch (errorCode) {
        case 401:
            message = "Unauthorized Access";
            break;
        case 404:
            message = "Page Not Found";
            break;
        case 500:
            message = "Internal Server Error";
            break;
        case 403:
            message = "Forbidden Access";
            break;
        default:
            message = "An unexpected error occurred";
    }

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>{errorCode}</h1>
            <p>{message}</p>
            <a href="/">Go to Home</a>
        </div>
    );
};

export default ErrorPage;
