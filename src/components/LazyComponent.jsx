import React, { Suspense } from 'react';
const LazyComponent = ({ component: Component, fallback = null, ...props }) => {
  return (
    <Suspense fallback={fallback || <div className="loading-placeholder">Загрузка...</div>}>
      <Component {...props} />
    </Suspense>
  );
};
export default LazyComponent; 