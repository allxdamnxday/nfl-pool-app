import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
// Import other components as needed

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            {/* Add other routes as needed */}
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;