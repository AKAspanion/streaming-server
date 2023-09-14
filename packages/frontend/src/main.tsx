import React from 'react';
import ReactDOM from 'react-dom/client';
import { setup } from './config/setup.ts';
import Spinner from './components/atoms/spinner/Spinner.tsx';

import './index.css';

// eslint-disable-next-line react-refresh/only-export-components
const App = React.lazy(() => import('./App.tsx'));

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div className="w-full h-full flex items-center justify-center">
      <Spinner />
    </div>
  </React.StrictMode>,
);

setup(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <React.Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center">
            <Spinner />
          </div>
        }
      >
        <App />
      </React.Suspense>
    </React.StrictMode>,
  );
});
