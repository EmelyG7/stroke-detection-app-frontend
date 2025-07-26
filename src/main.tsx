import React from 'react';
import ReactDOM from 'react-dom/client';
import {HashRouter} from 'react-router-dom';
import App from './App.tsx';
import './index.css';

// Set viewport meta tag programmatically for better mobile experience
document.querySelector('meta[name="viewport"]')?.setAttribute(
    'content',
    'width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover'
);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        {/*<BrowserRouter basename="/stroke">*/}
        {/*    <App />*/}
        {/*</BrowserRouter>*/}
        <HashRouter>
            <App/>
        </HashRouter>
    </React.StrictMode>
);