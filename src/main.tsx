import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client'

// Perfect Scrollbar
import 'react-perfect-scrollbar/dist/css/styles.css';

// Tailwind css
import './tailwind.css';

// i18n (needs to be bundled)
import './i18n';

// Router
import { RouterProvider } from 'react-router-dom';
import router from './router/index';

// Redux
import { Provider } from 'react-redux';
import store from './store';
import { io } from 'socket.io-client';
import { API_CONFIG } from './Api/apiConfig';
import setupInterceptors from './Api/axios-interceptors';


const socket = io(API_CONFIG.socketUrl);

socket.on('connect', () => {
  console.log('Connected to WebSocket server');
});

socket.on('newIssue', (data) => {
  console.log('New issue ae reported:', data);
  // Handle the new issue update here, e.g., update state or trigger a notification
});



import ErrorBoundary from './errorBoundry';

setupInterceptors();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <Suspense>
            <Provider store={store}>
                <ErrorBoundary>
                <RouterProvider router={router} />
                </ErrorBoundary>

            </Provider>
        </Suspense>
    </React.StrictMode>
);

