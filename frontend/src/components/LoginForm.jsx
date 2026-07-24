// cypod-telemetry

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api.js';

import '../styles/login.css';

export default function LoginForm() {
    const navigate = useNavigate();

    const [ formData, setFormData ] = useState({
        username: '',
        password: ''
    });

    const [ error, setError ] = useState('');
    const [ loading, setLoading ] = useState(false);

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await loginUser(formData);
            localStorage.setItem('token', response.data.token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid username or password');
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="text-center">
            <form className="form-signin" onSubmit={handleSubmit}>
                <h1 className="h3 mb-3 font-weight-normal">Please sign in</h1>
                { error && <div className="alert alert-danger">{ error }</div> }
                <label htmlFor="username" className="sr-only">Username</label>
                <input
                    type="text"
                    id="username"
                    name="username"
                    className="form-control"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    autoFocus
                />
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    className="form-control"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                <button className="btn btn-lg btn-primary btn-block" type="submit" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign in'}
                </button>
            </form>
        </main>
    );
}