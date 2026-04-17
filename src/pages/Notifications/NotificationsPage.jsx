import React, { useEffect, useMemo, useState } from 'react';
import { BellRing, Megaphone, Send, Trash2, UserRound } from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import './notifications-page.css';

const NotificationsPage = () => {
  const [mode, setMode] = useState('broadcast');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [userQuery, setUserQuery] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = await notificationService.getAllNotifications();
      setNotifications(Array.isArray(payload?.data) ? payload.data : []);
    } catch (err) {
      setError(err.message || 'Failed to load notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    if (mode !== 'direct') {
      setUserResults([]);
      return undefined;
    }

    const timeoutId = window.setTimeout(async () => {
      setLoadingUsers(true);
      try {
        const payload = await notificationService.searchUsers(userQuery.trim());
        setUserResults(Array.isArray(payload?.data) ? payload.data : []);
      } catch (err) {
        setUserResults([]);
      } finally {
        setLoadingUsers(false);
      }
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [mode, userQuery]);

  const selectedTargetLabel = useMemo(() => {
    if (mode === 'broadcast') {
      return 'All registered users';
    }

    if (!selectedUser) {
      return 'Choose one user';
    }

    const name = selectedUser.userName || selectedUser.email || 'Selected user';
    return `${name}${selectedUser.email ? ` (${selectedUser.email})` : ''}`;
  }, [mode, selectedUser]);

  const handleSend = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!title.trim() || !body.trim()) {
      setError('Title and message are required.');
      return;
    }

    if (mode === 'direct' && !selectedUser?._id) {
      setError('Select a user for direct delivery.');
      return;
    }

    setSending(true);
    try {
      const payload =
        mode === 'broadcast'
          ? {
              target: 'all',
              title: title.trim(),
              body: body.trim(),
              type: 'admin',
            }
          : {
              target: 'selected',
              userIds: [selectedUser._id],
              title: title.trim(),
              body: body.trim(),
              type: 'admin',
            };

      const response = await notificationService.sendNotification(payload);
      setSuccessMessage(response?.message || 'Notification sent successfully.');
      setTitle('');
      setBody('');
      if (mode === 'direct') {
        setSelectedUser(null);
      }
      await loadNotifications();
    } catch (err) {
      setError(err.message || 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications((current) =>
        current.filter((notification) => notification._id !== notificationId)
      );
    } catch (err) {
      setError(err.message || 'Failed to delete notification');
    }
  };

  return (
    <div className="notifications-admin-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">
            Send push notifications to all users or a single user, and review recent deliveries.
          </p>
        </div>
      </div>

      <div className="notifications-admin-grid">
        <section className="notification-compose-card">
          <div className="compose-card-header">
            <div>
              <p className="compose-eyebrow">Notification Composer</p>
              <h2>Send a push notification</h2>
            </div>
            <BellRing size={22} />
          </div>

          <div className="delivery-mode-toggle" role="tablist" aria-label="Notification target mode">
            <button
              type="button"
              className={mode === 'broadcast' ? 'active' : ''}
              onClick={() => setMode('broadcast')}
            >
              <Megaphone size={16} />
              Broadcast
            </button>
            <button
              type="button"
              className={mode === 'direct' ? 'active' : ''}
              onClick={() => setMode('direct')}
            >
              <UserRound size={16} />
              Single User
            </button>
          </div>

          <form className="notification-compose-form" onSubmit={handleSend}>
            <label className="field-label">
              Title
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Appointment update"
                maxLength={120}
              />
            </label>

            <label className="field-label">
              Message
              <textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="Write the notification that should appear on the user device."
                maxLength={500}
                rows={5}
              />
            </label>

            {mode === 'direct' && (
              <div className="user-picker-card">
                <label className="field-label">
                  Find user
                  <input
                    type="text"
                    value={userQuery}
                    onChange={(event) => setUserQuery(event.target.value)}
                    placeholder="Search by name or email"
                  />
                </label>

                <div className="selected-target">
                  <span className="target-label">Target</span>
                  <strong>{selectedTargetLabel}</strong>
                </div>

                <div className="user-results-list">
                  {loadingUsers ? (
                    <div className="user-result-empty">Searching users...</div>
                  ) : userResults.length === 0 ? (
                    <div className="user-result-empty">No users found.</div>
                  ) : (
                    userResults.map((user) => (
                      <button
                        type="button"
                        key={user._id}
                        className={`user-result-item ${
                          selectedUser?._id === user._id ? 'selected' : ''
                        }`}
                        onClick={() => setSelectedUser(user)}
                      >
                        <span className="user-name">{user.userName || 'Unnamed user'}</span>
                        <span className="user-meta">
                          {user.email || 'No email'} · {user.role || 'user'}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {error && <div className="notification-feedback error">{error}</div>}
            {successMessage && (
              <div className="notification-feedback success">{successMessage}</div>
            )}

            <button type="submit" className="send-notification-btn" disabled={sending}>
              <Send size={16} />
              {sending ? 'Sending...' : 'Send notification'}
            </button>
          </form>
        </section>

        <section className="notification-history-card">
          <div className="history-card-header">
            <div>
              <p className="compose-eyebrow">Recent Activity</p>
              <h2>Notification history</h2>
            </div>
            <button type="button" className="history-refresh-btn" onClick={loadNotifications}>
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="history-empty">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="history-empty">No notifications have been sent yet.</div>
          ) : (
            <div className="history-list">
              {notifications.map((notification) => (
                <article className="history-item" key={notification._id}>
                  <div className="history-item-top">
                    <div>
                      <h3>{notification.title || 'Notification'}</h3>
                      <p>{notification.body || 'No message body'}</p>
                    </div>
                    <button
                      type="button"
                      className="history-delete-btn"
                      onClick={() => handleDelete(notification._id)}
                      aria-label="Delete notification"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="history-meta-row">
                    <span>
                      Recipient: {notification.user?.userName || notification.user?.email || 'Unknown user'}
                    </span>
                    <span>Type: {notification.type || 'general'}</span>
                    <span>
                      {notification.createdAt
                        ? new Date(notification.createdAt).toLocaleString('en-IN')
                        : 'Unknown time'}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default NotificationsPage;
