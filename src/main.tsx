import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { PlanProvider } from './state/PlanContext';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <PlanProvider>
      <App />
    </PlanProvider>
  </React.StrictMode>
);
