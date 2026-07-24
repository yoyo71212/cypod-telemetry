// cypod-telemetry

import { useNavigate } from 'react-router-dom';

export default function Navbar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    }

    return (
        <nav className="navbar navbar-dark bg-dark px-3 mb-4">
            <span className="navbar-brand mb-0 h1">Cypod Telemetry</span>
            <button className="btn btn-outline-light" onClick={handleLogout}>Logout</button>
        </nav>
    );
}