import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/UploadPage';
import PatientsList from './pages/PatientsList';
import PatientForm from './pages/PatientForm';
import { AppProvider } from './lib/AppContext';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/upload" replace />} />
            <Route path="upload" element={<UploadPage />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="patients" element={<PatientsList />} />
            <Route path="patients/new" element={<PatientForm />} />
            <Route path="patients/:id" element={<PatientForm />} />
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
