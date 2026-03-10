import React, { useEffect, useState } from 'react';
import { giveServiceService } from '../../services/giveService';
import '../Users/users-page.css';

const GiveServiceList = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;
        setLoading(true);

        const fetchRequests = async () => {
            try {
                const payload = await giveServiceService.getAllRequests();
                if (active) {
                    setData(payload.data || []);
                    setLoading(false);
                }
            } catch (err) {
                if (active) {
                    setError(err?.message || 'Failed to fetch requests');
                    setLoading(false);
                }
            }
        };

        fetchRequests();
        return () => { active = false; };
    }, []);

    return (
        <div className="users-page">
            <div className="page-header">
                <h1 className="page-title">Service Requests</h1>
                <p className="page-subtitle">View requests from users asking to give a service.</p>
            </div>

            <div className="table-container" style={{ marginTop: '20px' }}>
                {loading ? (
                    <div className="loading-state">Loading requests...</div>
                ) : error ? (
                    <div className="error-state">{error}</div>
                ) : (
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Mobile Number</th>
                                <th>Profession</th>
                                <th>Status</th>
                                <th>Requested On</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="empty-state">No requests found.</td>
                                </tr>
                            ) : (
                                data.map((req) => (
                                    <tr key={req._id}>
                                        <td><strong>{req.name}</strong></td>
                                        <td>{req.mobileNumber}</td>
                                        <td>{req.profession}</td>
                                        <td>
                                            <span className={`status-badge status-${req.status.toLowerCase()}`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td>{new Date(req.createdAt).toLocaleString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default GiveServiceList;
