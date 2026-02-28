import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Archive,
    Calendar,
    Clock,
    Users,
    CheckCircle,
    XCircle,
    MapPin,
    Building2,
    Trash2,
    Search,
    Filter,
    ChevronDown,
    ChevronUp,
    AlertTriangle,
    RefreshCw
} from 'lucide-react';
import Sidebar from '../shared/Sidebar';
import '../../styles/admin.css';
import '../../styles/global.css';

const EventHistory = ({ onNavigate, goBack, currentPage }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterReason, setFilterReason] = useState('all');
    const [expandedId, setExpandedId] = useState(null);
    const [deletingId, setDeletingId] = useState('');

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/event-history', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setHistory(response.data || []);
        } catch (error) {
            console.error('Error fetching event history:', error);
            setHistory([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const handlePermanentDelete = async (id) => {
        const shouldDelete = window.confirm(
            'Permanently delete this history record? This action cannot be undone.'
        );
        if (!shouldDelete) return;

        setDeletingId(id);
        try {
            await axios.delete(`http://localhost:5000/api/event-history/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            await fetchHistory();
        } catch (error) {
            console.error('Error deleting history record:', error);
            alert(error.response?.data?.message || 'Failed to delete history record.');
        } finally {
            setDeletingId('');
        }
    };

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    // Filtering logic
    const filteredHistory = history.filter((record) => {
        const matchesSearch =
            record.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.organizationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.organizationType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.location?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter =
            filterReason === 'all' || record.deletionReason === filterReason;

        return matchesSearch && matchesFilter;
    });

    const getReasonBadge = (reason) => {
        switch (reason) {
            case 'manual':
                return { label: 'Manually Deleted', className: 'badge badge-red', icon: <Trash2 size={12} /> };
            case 'expired':
                return { label: 'Expired', className: 'badge badge-yellow', icon: <Clock size={12} /> };
            case 'completed':
                return { label: 'Completed', className: 'badge badge-green', icon: <CheckCircle size={12} /> };
            default:
                return { label: reason || 'Unknown', className: 'badge', icon: null };
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        try {
            return new Date(dateStr).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return dateStr;
        }
    };

    const formatDateTime = (dateStr) => {
        if (!dateStr) return '-';
        try {
            return new Date(dateStr).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateStr;
        }
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return '-';
        try {
            const [hours, minutes] = timeStr.split(':');
            const h = parseInt(hours, 10);
            const ampm = h >= 12 ? 'PM' : 'AM';
            const h12 = h % 12 || 12;
            return `${h12}:${minutes} ${ampm}`;
        } catch {
            return timeStr;
        }
    };

    // Summary stats
    const totalArchived = history.length;
    const manuallyDeleted = history.filter(r => r.deletionReason === 'manual').length;
    const autoExpired = history.filter(r => r.deletionReason === 'expired').length;
    const totalUsersServed = history.reduce((sum, r) => sum + (r.usersCompleted || 0), 0);

    return (
        <div className="admin-layout">
            <Sidebar currentPage={currentPage} onNavigate={onNavigate} goBack={goBack} />
            <main className="admin-main">
                <div className="admin-header">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h1>Event History</h1>
                        <button
                            className="btn-secondary"
                            onClick={fetchHistory}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <RefreshCw size={16} /> Refresh
                        </button>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="summary-cards" style={{ marginBottom: '1.5rem' }}>
                    <div className="summary-card">
                        <div className="summary-card-header">
                            <span className="summary-card-title">Total Archived</span>
                            <div
                                className="summary-card-icon"
                                style={{ backgroundColor: '#8B5CF620', color: '#8B5CF6' }}
                            >
                                <Archive size={20} />
                            </div>
                        </div>
                        <div className="summary-card-value">{totalArchived}</div>
                        <div className="summary-card-change">All time</div>
                    </div>

                    <div className="summary-card">
                        <div className="summary-card-header">
                            <span className="summary-card-title">Manually Deleted</span>
                            <div
                                className="summary-card-icon"
                                style={{ backgroundColor: 'var(--color-red-bg)', color: 'var(--color-red)' }}
                            >
                                <Trash2 size={20} />
                            </div>
                        </div>
                        <div className="summary-card-value">{manuallyDeleted}</div>
                        <div className="summary-card-change">Admin removals</div>
                    </div>

                    <div className="summary-card">
                        <div className="summary-card-header">
                            <span className="summary-card-title">Auto-Expired</span>
                            <div
                                className="summary-card-icon"
                                style={{ backgroundColor: 'var(--color-yellow-bg)', color: 'var(--color-yellow)' }}
                            >
                                <AlertTriangle size={20} />
                            </div>
                        </div>
                        <div className="summary-card-value">{autoExpired}</div>
                        <div className="summary-card-change">Past end date</div>
                    </div>

                    <div className="summary-card">
                        <div className="summary-card-header">
                            <span className="summary-card-title">Total Users Served</span>
                            <div
                                className="summary-card-icon"
                                style={{ backgroundColor: 'var(--color-green-bg)', color: 'var(--color-green)' }}
                            >
                                <CheckCircle size={20} />
                            </div>
                        </div>
                        <div className="summary-card-value">{totalUsersServed}</div>
                        <div className="summary-card-change">Completed across all events</div>
                    </div>
                </div>

                {/* Search & Filter Bar */}
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    marginBottom: '1.5rem',
                    flexWrap: 'wrap'
                }}>
                    <div style={{
                        flex: '1',
                        minWidth: '250px',
                        position: 'relative'
                    }}>
                        <Search
                            size={18}
                            style={{
                                position: 'absolute',
                                left: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--color-gray-400)'
                            }}
                        />
                        <input
                            type="text"
                            placeholder="Search events by title, organization, or location..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                paddingLeft: '40px',
                                width: '100%'
                            }}
                        />
                    </div>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <Filter size={18} style={{ color: 'var(--color-gray-500)' }} />
                        <select
                            value={filterReason}
                            onChange={(e) => setFilterReason(e.target.value)}
                            style={{ minWidth: '180px' }}
                        >
                            <option value="all">All Reasons</option>
                            <option value="manual">Manually Deleted</option>
                            <option value="expired">Auto-Expired</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                </div>

                {/* History List */}
                <div className="events-list">
                    <div className="events-list-header">
                        <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Archived Events</h2>
                        <span className="badge badge-green" style={{ background: '#8B5CF620', color: '#8B5CF6', borderColor: '#8B5CF6' }}>
                            {filteredHistory.length} {filteredHistory.length === 1 ? 'Record' : 'Records'}
                        </span>
                    </div>

                    {loading ? (
                        <div style={{
                            padding: '3rem',
                            textAlign: 'center',
                            color: 'var(--color-gray-500)'
                        }}>
                            <RefreshCw
                                size={32}
                                style={{
                                    animation: 'spin 1s linear infinite',
                                    marginBottom: '1rem'
                                }}
                            />
                            <p>Loading event history...</p>
                            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                        </div>
                    ) : filteredHistory.length === 0 ? (
                        <div style={{
                            padding: '3rem',
                            textAlign: 'center',
                            color: 'var(--color-gray-500)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '1rem'
                        }}>
                            <Archive size={48} style={{ opacity: 0.3 }} />
                            <div>
                                <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                                    {searchTerm || filterReason !== 'all' ? 'No matching events found' : 'No event history yet'}
                                </p>
                                <p style={{ fontSize: '0.875rem', margin: 0 }}>
                                    {searchTerm || filterReason !== 'all'
                                        ? 'Try adjusting your search or filter criteria.'
                                        : 'Deleted and expired events will appear here automatically.'}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {filteredHistory.map((record) => {
                                const reason = getReasonBadge(record.deletionReason);
                                const isExpanded = expandedId === (record._id || record.id);

                                return (
                                    <div
                                        key={record._id || record.id}
                                        style={{
                                            border: '1px solid var(--color-gray-200)',
                                            borderRadius: '12px',
                                            overflow: 'hidden',
                                            transition: 'all 0.2s ease',
                                            boxShadow: isExpanded ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                                            background: 'var(--color-white)'
                                        }}
                                    >
                                        {/* Card Header - always visible */}
                                        <div
                                            style={{
                                                padding: '1.25rem',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                gap: '1rem',
                                                transition: 'background-color 0.15s ease'
                                            }}
                                            onClick={() => toggleExpand(record._id || record.id)}
                                            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-gray-50)'; }}
                                            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0 }}>
                                                <div style={{
                                                    width: '44px',
                                                    height: '44px',
                                                    borderRadius: '10px',
                                                    background: record.deletionReason === 'manual'
                                                        ? 'linear-gradient(135deg, #FEE2E2, #FECACA)'
                                                        : record.deletionReason === 'expired'
                                                            ? 'linear-gradient(135deg, #FEF3C7, #FDE68A)'
                                                            : 'linear-gradient(135deg, #D1FAE5, #A7F3D0)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0
                                                }}>
                                                    <Calendar size={20} style={{
                                                        color: record.deletionReason === 'manual'
                                                            ? '#DC2626'
                                                            : record.deletionReason === 'expired'
                                                                ? '#D97706'
                                                                : '#059669'
                                                    }} />
                                                </div>

                                                <div style={{ minWidth: 0 }}>
                                                    <div style={{
                                                        fontWeight: 700,
                                                        fontSize: '1rem',
                                                        color: 'var(--color-gray-900)',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis'
                                                    }}>
                                                        {record.title}
                                                    </div>
                                                    <div style={{
                                                        fontSize: '0.85rem',
                                                        color: 'var(--color-gray-500)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.75rem',
                                                        marginTop: '0.15rem',
                                                        flexWrap: 'wrap'
                                                    }}>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                            <Building2 size={13} /> {record.organizationName}
                                                        </span>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                            <MapPin size={13} /> {record.location}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                                                {/* Quick stats */}
                                                <div style={{
                                                    display: 'flex',
                                                    gap: '1rem',
                                                    fontSize: '0.8rem',
                                                    color: 'var(--color-gray-500)'
                                                }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} title="Users Joined">
                                                        <Users size={14} /> {record.usersJoined || 0}
                                                    </span>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} title="Users Completed">
                                                        <CheckCircle size={14} color="#059669" /> {record.usersCompleted || 0}
                                                    </span>
                                                </div>

                                                <span className={reason.className} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem' }}>
                                                    {reason.icon} {reason.label}
                                                </span>

                                                {isExpanded ? <ChevronUp size={18} style={{ color: 'var(--color-gray-400)' }} /> : <ChevronDown size={18} style={{ color: 'var(--color-gray-400)' }} />}
                                            </div>
                                        </div>

                                        {/* Expanded details */}
                                        {isExpanded && (
                                            <div style={{
                                                borderTop: '1px solid var(--color-gray-200)',
                                                padding: '1.25rem',
                                                animation: 'fadeIn 0.2s ease'
                                            }}>
                                                <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }`}</style>

                                                <div style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                                    gap: '1.25rem',
                                                    marginBottom: '1.25rem'
                                                }}>
                                                    {/* Event Details */}
                                                    <div style={{
                                                        padding: '1rem',
                                                        backgroundColor: 'var(--color-gray-50)',
                                                        borderRadius: '10px'
                                                    }}>
                                                        <h4 style={{
                                                            fontSize: '0.8rem',
                                                            fontWeight: 700,
                                                            color: 'var(--color-gray-400)',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.05em',
                                                            marginBottom: '0.75rem'
                                                        }}>Event Details</h4>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                <span style={{ color: 'var(--color-gray-500)' }}>Organization</span>
                                                                <span style={{ fontWeight: 600, color: 'var(--color-gray-800)' }}>{record.organizationName}</span>
                                                            </div>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                <span style={{ color: 'var(--color-gray-500)' }}>Type</span>
                                                                <span style={{ fontWeight: 600, color: 'var(--color-gray-800)' }}>{record.organizationType}</span>
                                                            </div>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                <span style={{ color: 'var(--color-gray-500)' }}>Location</span>
                                                                <span style={{ fontWeight: 600, color: 'var(--color-gray-800)' }}>{record.location}</span>
                                                            </div>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                <span style={{ color: 'var(--color-gray-500)' }}>Total Tokens</span>
                                                                <span style={{ fontWeight: 600, color: 'var(--color-gray-800)' }}>{record.totalTokens}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Date & Time */}
                                                    <div style={{
                                                        padding: '1rem',
                                                        backgroundColor: 'var(--color-gray-50)',
                                                        borderRadius: '10px'
                                                    }}>
                                                        <h4 style={{
                                                            fontSize: '0.8rem',
                                                            fontWeight: 700,
                                                            color: 'var(--color-gray-400)',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.05em',
                                                            marginBottom: '0.75rem'
                                                        }}>Schedule</h4>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                <span style={{ color: 'var(--color-gray-500)' }}>Start Date</span>
                                                                <span style={{ fontWeight: 600, color: 'var(--color-gray-800)' }}>{formatDate(record.startDate)}</span>
                                                            </div>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                <span style={{ color: 'var(--color-gray-500)' }}>End Date</span>
                                                                <span style={{ fontWeight: 600, color: 'var(--color-gray-800)' }}>{formatDate(record.endDate)}</span>
                                                            </div>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                <span style={{ color: 'var(--color-gray-500)' }}>Time</span>
                                                                <span style={{ fontWeight: 600, color: 'var(--color-gray-800)' }}>{formatTime(record.time)}</span>
                                                            </div>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                <span style={{ color: 'var(--color-gray-500)' }}>Deleted At</span>
                                                                <span style={{ fontWeight: 600, color: 'var(--color-gray-800)' }}>{formatDateTime(record.deletedAt)}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* User Stats */}
                                                    <div style={{
                                                        padding: '1rem',
                                                        backgroundColor: 'var(--color-gray-50)',
                                                        borderRadius: '10px'
                                                    }}>
                                                        <h4 style={{
                                                            fontSize: '0.8rem',
                                                            fontWeight: 700,
                                                            color: 'var(--color-gray-400)',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.05em',
                                                            marginBottom: '0.75rem'
                                                        }}>User Statistics</h4>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <span style={{ color: 'var(--color-gray-500)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                                                    <Users size={14} /> Joined
                                                                </span>
                                                                <span style={{
                                                                    fontWeight: 700,
                                                                    fontSize: '1rem',
                                                                    color: 'var(--color-primary)'
                                                                }}>{record.usersJoined || 0}</span>
                                                            </div>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <span style={{ color: 'var(--color-gray-500)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                                                    <CheckCircle size={14} /> Completed
                                                                </span>
                                                                <span style={{
                                                                    fontWeight: 700,
                                                                    fontSize: '1rem',
                                                                    color: 'var(--color-green)'
                                                                }}>{record.usersCompleted || 0}</span>
                                                            </div>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <span style={{ color: 'var(--color-gray-500)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                                                    <Clock size={14} /> Serving
                                                                </span>
                                                                <span style={{
                                                                    fontWeight: 700,
                                                                    fontSize: '1rem',
                                                                    color: 'var(--color-yellow)'
                                                                }}>{record.usersServing || 0}</span>
                                                            </div>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <span style={{ color: 'var(--color-gray-500)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                                                    <XCircle size={14} /> Cancelled
                                                                </span>
                                                                <span style={{
                                                                    fontWeight: 700,
                                                                    fontSize: '1rem',
                                                                    color: 'var(--color-red)'
                                                                }}>{record.usersCancelled || 0}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Services & Footer */}
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    flexWrap: 'wrap',
                                                    gap: '1rem'
                                                }}>
                                                    <div>
                                                        {record.serviceTypes && record.serviceTypes.length > 0 && (
                                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                                                {record.serviceTypes.map((service, idx) => (
                                                                    <span
                                                                        key={idx}
                                                                        style={{
                                                                            padding: '0.2rem 0.6rem',
                                                                            borderRadius: '6px',
                                                                            fontSize: '0.75rem',
                                                                            fontWeight: 600,
                                                                            backgroundColor: 'var(--color-primary-bg)',
                                                                            color: 'var(--color-primary)',
                                                                            border: '1px solid var(--color-primary-lighter)'
                                                                        }}
                                                                    >
                                                                        {service}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <button
                                                        type="button"
                                                        className="btn-secondary"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handlePermanentDelete(record._id || record.id);
                                                        }}
                                                        disabled={deletingId === (record._id || record.id)}
                                                        style={{
                                                            color: '#DC2626',
                                                            borderColor: '#FCA5A5',
                                                            fontSize: '0.85rem',
                                                            padding: '0.4rem 1rem',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.35rem'
                                                        }}
                                                    >
                                                        <Trash2 size={14} />
                                                        {deletingId === (record._id || record.id) ? 'Deleting...' : 'Permanently Delete'}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default EventHistory;
