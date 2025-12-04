import React, { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle, XCircle, Clock, Filter } from 'lucide-react';
import { apiRequest } from '../../utils/api';
import './SupportPage.css';

const SupportPage = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, open, resolved
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [response, setResponse] = useState('');

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const res = await apiRequest('/api/admin/support/tickets');
            if (res && res.data) {
                setTickets(res.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const handleStatusUpdate = async (ticketId, newStatus) => {
        try {
            await apiRequest(`/api/admin/support/tickets/${ticketId}/status`, {
                method: 'PATCH',
                body: { status: newStatus, adminResponse: response },
            });
            fetchTickets(); // Refresh list
            setSelectedTicket(null);
            setResponse('');
        } catch (err) {
            console.error('Failed to update ticket', err);
        }
    };

    const filteredTickets = tickets.filter(t => {
        if (filter === 'all') return true;
        return t.status === filter;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'status-open';
            case 'resolved': return 'status-resolved';
            case 'closed': return 'status-closed';
            default: return 'status-default';
        }
    };

    return (
        <div className="support-container">
            <div className="page-header">
                <h1>Support Tickets</h1>
                <div className="filter-controls">
                    <button
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All
                    </button>
                    <button
                        className={`filter-btn ${filter === 'open' ? 'active' : ''}`}
                        onClick={() => setFilter('open')}
                    >
                        Open
                    </button>
                    <button
                        className={`filter-btn ${filter === 'resolved' ? 'active' : ''}`}
                        onClick={() => setFilter('resolved')}
                    >
                        Resolved
                    </button>
                </div>
            </div>

            <div className="support-layout">
                <div className="ticket-list">
                    {loading ? <p>Loading tickets...</p> : filteredTickets.map(ticket => (
                        <div
                            key={ticket._id}
                            className={`ticket-card ${selectedTicket?._id === ticket._id ? 'selected' : ''}`}
                            onClick={() => setSelectedTicket(ticket)}
                        >
                            <div className="ticket-header">
                                <span className={`status-badge ${getStatusColor(ticket.status)}`}>
                                    {ticket.status}
                                </span>
                                <span className="ticket-date">
                                    {new Date(ticket.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <h4 className="ticket-subject">{ticket.subject}</h4>
                            <p className="ticket-preview">{ticket.message.substring(0, 60)}...</p>
                            <div className="ticket-user">
                                <div className="user-avatar">{ticket.user?.userName?.charAt(0) || 'U'}</div>
                                <span>{ticket.user?.userName || 'Unknown User'}</span>
                            </div>
                        </div>
                    ))}
                    {!loading && filteredTickets.length === 0 && (
                        <div className="empty-state">No tickets found.</div>
                    )}
                </div>

                <div className="ticket-detail">
                    {selectedTicket ? (
                        <div className="detail-content">
                            <div className="detail-header">
                                <h2>{selectedTicket.subject}</h2>
                                <span className={`status-badge large ${getStatusColor(selectedTicket.status)}`}>
                                    {selectedTicket.status}
                                </span>
                            </div>

                            <div className="message-thread">
                                <div className="message-bubble user-message">
                                    <div className="message-meta">
                                        <strong>{selectedTicket.user?.userName}</strong>
                                        <span>{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                                    </div>
                                    <p>{selectedTicket.message}</p>
                                </div>

                                {selectedTicket.adminResponse && (
                                    <div className="message-bubble admin-message">
                                        <div className="message-meta">
                                            <strong>Admin Response</strong>
                                            <span>{selectedTicket.resolvedAt ? new Date(selectedTicket.resolvedAt).toLocaleString() : ''}</span>
                                        </div>
                                        <p>{selectedTicket.adminResponse}</p>
                                    </div>
                                )}
                            </div>

                            {selectedTicket.status === 'open' && (
                                <div className="response-area">
                                    <h3>Reply & Resolve</h3>
                                    <textarea
                                        placeholder="Type your response here..."
                                        value={response}
                                        onChange={(e) => setResponse(e.target.value)}
                                        rows={4}
                                    />
                                    <div className="action-buttons">
                                        <button
                                            className="btn-resolve"
                                            onClick={() => handleStatusUpdate(selectedTicket._id, 'resolved')}
                                            disabled={!response.trim()}
                                        >
                                            <CheckCircle size={16} /> Send & Resolve
                                        </button>
                                        <button
                                            className="btn-close"
                                            onClick={() => handleStatusUpdate(selectedTicket._id, 'closed')}
                                        >
                                            <XCircle size={16} /> Close without Reply
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="empty-detail">
                            <MessageSquare size={48} className="text-gray-300" />
                            <p>Select a ticket to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SupportPage;
