import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import DashboardSuperAdmin from './pages/DashboardSuperAdmin';
import DashboardAdminPays from './pages/DashboardAdminPays';
import DashboardEmploye from './pages/DashboardEmploye';
import CountriesManagement from './pages/CountriesManagement';
import AlertsPage from './pages/AlertsPage';
import MeasuresPage from './pages/MeasuresPage';
import UsersManagement from './pages/UsersManagement';
import RolesPermissions from './pages/RolesPermissions';
import Audit from './pages/Audit';
import SystemSettings from './pages/SystemSettings';
import ConnectionHistory from './pages/ConnectionHistory';
import Warehouses from './pages/Warehouses';
import Sensors from './pages/Sensors';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<Navigate to="/dashboard/super-admin" />} /> */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard/super-admin" element={<DashboardSuperAdmin />} />
        <Route path="/admin/dashboard" element={<DashboardAdminPays />} />
        <Route path="/employee/dashboard" element={<DashboardEmploye />} />
        <Route path="/pays" element={<CountriesManagement />} />
        <Route path="/alertes" element={<AlertsPage />} />
        <Route path="/mesures" element={<MeasuresPage />} />
        <Route path="/users" element={<UsersManagement />} />
        <Route path="/roles" element={<RolesPermissions />} />
        <Route path="/audit" element={<Audit />} />
        <Route path="/settings" element={<SystemSettings />} />
        <Route path="/connexionhistory" element={<ConnectionHistory />} />
        <Route path="/warehouses" element={<Warehouses />} />
        <Route path="/sensors" element={<Sensors/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;