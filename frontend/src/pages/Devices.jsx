// cypod-telemetry

import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getDevices, registerDevice, getLatestDeviceTelemetry, getAlerts } from '../services/api.js';
import Navbar from '../components/Navbar.jsx';

const POLLING_INTERVAL = 5000;

export default function Devices() {
    const navigate = useNavigate();
    const [ devices, setDevices ] = useState([]);
    const [ latestByDevice, setLatestByDevice ] = useState({});
    const [ alerts, setAlerts ] = useState([]);
    const [ newDeviceId, setNewDeviceId ] = useState('');
    const [ newDeviceName, setNewDeviceName ] = useState('');
    const [ error, setError ] = useState('');

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            navigate('/');
        }
    }, [navigate]);

    const fetchDevices = useCallback(async () => {
        try {
            const response = await getDevices();
            setDevices(response.data.devices);
        } catch (err) {
            console.error('Error fetching devices:', err);
        }
    }, []);

    const fetchLatestForAll = useCallback(async (devicesList) => {
        const results = {};
        await Promise.all(devicesList.map(async (device) => {
            try {
                const response = await getLatestDeviceTelemetry(device.id);
                results[device.id] = response.data.telemetry;
            } catch (err) {
                results[device.id] = null;
            }
        }));
        setLatestByDevice(results);
    }, []);

    const fetchAlerts = useCallback(async () => {
        try {
            const response = await getAlerts();
            setAlerts(response.data.alerts);
        } catch (err) {
            console.error('Error fetching alerts:', err);
        }
    }, []);

    useEffect(() => {
        fetchDevices();
        fetchAlerts();
    }, [fetchDevices, fetchAlerts]);

    useEffect(() => {
        if (devices.length == 0) {
            return;
        }

        fetchLatestForAll(devices);
        const interval = setInterval(() => {
            fetchLatestForAll(devices);
            fetchAlerts();
        }, POLLING_INTERVAL);
    }, [devices, fetchLatestForAll, fetchAlerts]);

    const handleRegisterDevice = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await registerDevice({ id: newDeviceId, name: newDeviceName });
            setNewDeviceId('');
            setNewDeviceName('');
            fetchDevices();
        } catch (err) {
            setError(err.response?.data?.message || 'Error registering device');
        }
    }

    return (
        <div>
            <Navbar />
            <div className="container">
                {alerts.length > 0 && (
                    <div className="alert alert-warning">
                        <strong>{alerts.length} active alert{alerts.length > 1 ? 's' : ''}</strong>
                        <ul className="mb-0">
                            {alerts.map((a) => <li key={a.id}>[{a.device_id}] {a.message}</li>)}
                        </ul>
                    </div>
                )}

                <h2>Devices</h2>
                {error && <div className="alert alert-danger">{error}</div>}

                <form className="row g-2 mb-4" onSubmit={handleRegisterDevice}>
                    <div className="col-auto">
                        <input className="form-control" placeholder="Device ID (e.g. DEV-1006)"
                            value={newDeviceId} onChange={(e) => setNewDeviceId(e.target.value)} required />
                    </div>
                    <div className="col-auto">
                        <input className="form-control" placeholder="Device name"
                            value={newDeviceName} onChange={(e) => setNewDeviceName(e.target.value)} required />
                    </div>
                    <div className="col-auto">
                        <button className="btn btn-primary" type="submit">Register Device</button>
                    </div>
                </form>

                <table className="table table-striped">
                    <thead>
                        <tr><th>ID</th><th>Name</th><th>Battery</th><th>Temperature</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                        {devices.map((device) => {
                            const latest = latestByDevice[device.id];
                            return (
                                <tr key={device.id}>
                                    <td><Link to={`/devices/${device.id}`}>{device.id}</Link></td>
                                    <td>{device.name}</td>
                                    <td>{latest ? `${latest.battery}%` : '—'}</td>
                                    <td>{latest ? `${latest.temperature}°C` : '—'}</td>
                                    <td>{latest ? latest.status : 'No data yet'}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}