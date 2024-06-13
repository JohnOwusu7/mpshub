import React from 'react';

const NotFound = () => {
  const goBack = () => {
    window.history.back();
  };

  return (
    <div>
      <h1>404 Error, Page not found</h1>
      <button onClick={goBack}>Go Back</button>
    </div>
  );
};

export default NotFound;
