import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext, AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Setup from './pages/Setup';
import ApplicantsList from './pages/ApplicantsList';
import ApplicantCreate from './pages/ApplicantCreate';
import ApplicantDetail from './pages/ApplicantDetail';
import Layout from './components/Layout';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) return <div className="auth-container">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Layout>{children}</Layout>;
};

function AppRoutes() {
  const { user } = useContext(AuthContext);

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
      
      {/* Dashboard - All Roles */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      {/* Master Setup - Admin Only */}
      <Route path="/setup" element={
        <ProtectedRoute allowedRoles={['Admin']}>
          <Setup />
        </ProtectedRoute>
      } />
      
      {/* Applicants - Officer & Admin */}
      <Route path="/applicants" element={
        <ProtectedRoute allowedRoles={['Admission_Officer', 'Admin']}>
          <ApplicantsList />
        </ProtectedRoute>
      } />
      <Route path="/applicants/new" element={
        <ProtectedRoute allowedRoles={['Admission_Officer', 'Admin']}>
          <ApplicantCreate />
        </ProtectedRoute>
      } />
      <Route path="/applicants/:id" element={
        <ProtectedRoute allowedRoles={['Admission_Officer', 'Admin']}>
          <ApplicantDetail />
        </ProtectedRoute>
      } />
      
      {/* Default route */}
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
