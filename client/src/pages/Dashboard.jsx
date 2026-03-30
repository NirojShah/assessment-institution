import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Users, UserCheck, AlertCircle, FileText } from 'lucide-react';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard');
        setData(res.data);
      } catch (err) {
        console.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="container">Loading Dashboard...</div>;

  return (
    <div className="container animate-fade-in">
      <div style={{ paddingBottom: 'var(--space-xl)' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Dashboard Overview</h1>
        <p>Real-time admission metrics and quota status.</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-4 mb-xl">
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', color: 'var(--accent-primary)' }}>
            <Users size={32} />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Intake</p>
            <h2 style={{ margin: 0 }}>{data?.overview?.totalIntake || 0}</h2>
          </div>
        </div>
        
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: 'var(--success)' }}>
            <UserCheck size={32} />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Admitted</p>
            <h2 style={{ margin: 0 }}>{data?.overview?.totalAdmitted || 0}</h2>
          </div>
        </div>

        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', color: 'var(--danger)' }}>
            <AlertCircle size={32} />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Pending Fees</p>
            <h2 style={{ margin: 0 }}>{data?.actionRequired?.pendingFees || 0}</h2>
          </div>
        </div>

        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', color: 'var(--warning)' }}>
            <FileText size={32} />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Pending Docs</p>
            <h2 style={{ margin: 0 }}>{data?.actionRequired?.pendingDocuments || 0}</h2>
          </div>
        </div>
      </div>

      {/* Quota Stats */}
      <h2 style={{ marginTop: 'var(--space-xl)', marginBottom: 'var(--space-md)' }}>Quota Utilization</h2>
      <div className="grid grid-cols-3">
        {data?.quotaStats && Object.entries(data.quotaStats).map(([type, stats]) => (
          <div key={type} className="glass-panel">
            <h3 style={{ borderBottom: '1px solid var(--bg-tertiary)', paddingBottom: '8px', marginBottom: '16px' }}>
              {type} Quota
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Allocated:</span>
              <span style={{ fontWeight: 600 }}>{stats.allocated}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Filled:</span>
              <span style={{ fontWeight: 600, color: 'var(--success)' }}>{stats.filled}</span>
            </div>
            
            {/* Progress Bar */}
            <div style={{ height: '8px', background: 'var(--bg-tertiary)', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{ 
                height: '100%', 
                width: `${stats.allocated > 0 ? (stats.filled / stats.allocated) * 100 : 0}%`,
                background: 'var(--gradient-primary)',
                transition: 'width 1s ease-in-out'
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
