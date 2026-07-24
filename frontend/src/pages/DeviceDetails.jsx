// cypod-telemetry

import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getLatestDeviceTelemetry, getDeviceHistory } from '../services/api.js';
import Navbar from '../components/Navbar.jsx';

export default function DeviceDetails() {
    const { id } = useParams();
    const [ latestTelemetry, setLatestTelemetry ] = useState(null);
    const [ history, setHistory ] = useState([]);
    const [ error, setError ] = useState('');

    const fetchData = useCallback(async () => {
        try {
            const latestResponse = await getLatestDeviceTelemetry(id);
            setLatestTelemetry(latestResponse.data.telemetry);
        } catch (err) {
            setError('Error fetching device data');
        }
        try {
            const historyResponse = await getDeviceHistory(id);
            setHistory(historyResponse.data.history);
        } catch (err) {
            setError('Error fetching device history');
        }
    }, [id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <div>
            <Navbar />
            <div className="container">
                <Link to="/dashboard">&larr; Back to devices</Link>
                <h2>{id}</h2>
                {error && <div className="alert alert-danger">{error}</div>}

                <h4>Latest Reading</h4>
                {latestTelemetry ? (
                    <ul className="list-group mb-4">
                        <li className="list-group-item">Battery: {latestTelemetry.battery}%</li>
                        <li className="list-group-item">Temperature: {latestTelemetry.temperature}°C</li>
                        <li className="list-group-item">Status: {latestTelemetry.status}</li>
                        <li className="list-group-item">Location: {latestTelemetry.lat ?? '—'}, {latestTelemetry.lng ?? '—'}</li>
                        <li className="list-group-item">Recorded at: {new Date(latestTelemetry.created_at).toLocaleString()}</li>
                    </ul>
                ) : <p>No telemetry recorded yet.</p>}

                <h4>Recent History</h4>
                <ul className="list-group">
                    {history.map((reading) => (
                        <li className="list-group-item" key={reading.id}>
                            {new Date(reading.created_at).toLocaleString()} — Battery: {reading.battery}%, Temp: {reading.temperature}°C, Status: {reading.status}
                            {reading.is_backfilled && <span className="badge bg-secondary ms-2">backfilled</span>}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}