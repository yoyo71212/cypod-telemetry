import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login.jsx';
import Devices from './pages/Devices.jsx';
import DeviceDetails from './pages/DeviceDetails.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Devices />} />
        <Route path="/devices/:id" element={<DeviceDetails />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
