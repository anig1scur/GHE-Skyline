import React from 'react';
import { HashRouter } from 'react-router-dom';
import { createRoot } from 'react-dom/client';

import App from '@/App';
import '@/assets/style.scss';

const container = document.getElementById('root');
const root = createRoot(container!);
const app = (
  <HashRouter>
    <App />
  </HashRouter>
);
root.render(app);
