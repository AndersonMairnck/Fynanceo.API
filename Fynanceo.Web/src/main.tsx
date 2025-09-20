import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.js'
import './index.css'
//import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary'


//ReactDOM.createRoot(document.getElementById('root')).render(
//    <React.StrictMode>
//        <ErrorBoundary>
//            <App />
//            </ErrorBoundary>
//    </React.StrictMode>
//);
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(<App />);