import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Eye, Edit } from 'lucide-react';

const ApplicantsList = () => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApplicants = async () => {
    try {
      const res = await api.get('/applicants');
      setApplicants(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApplicants(); }, []);

  const getStatusBadge = (status, type) => {
    if (status === 'Pending') return <span className="badge badge-warning">Pending</span>;
    if (status === 'Verified' || status === 'Paid' || status === 'Confirmed') return <span className="badge badge-success">{status}</span>;
    if (status === 'Seat Locked') return <span className="badge badge-primary">Seat Locked</span>;
    return <span className="badge">{status}</span>;
  };

  return (
    <div className="container animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
        <div>
          <h1>Applicants Directory</h1>
          <p>Manage applications, seat allocation, and document verification.</p>
        </div>
        <Link to="/applicants/new" className="btn btn-primary">
          + New Applicant
        </Link>
      </div>

      <div className="glass-panel" style={{ padding: '0' }}>
        <div className="table-container">
          <table style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>Adm No. / Allotment</th>
                <th>Name</th>
                <th>Program Base</th>
                <th>Quota</th>
                <th>Docs</th>
                <th>Fee</th>
                <th>Admission</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>Loading applicants...</td></tr>
              ) : applicants.length === 0 ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>No applicants found.</td></tr>
              ) : (
                applicants.map(app => (
                  <tr key={app._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{app.admissionNumber || 'Not Generated'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Allotment: {app.allotmentNumber || 'N/A'}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{app.fullName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{app.email}</div>
                    </td>
                    <td>{app.program?.name} ({app.program?.courseType})</td>
                    <td>{app.quotaType}</td>
                    <td>{getStatusBadge(app.documentStatus)}</td>
                    <td>{getStatusBadge(app.feeStatus)}</td>
                    <td>{getStatusBadge(app.admissionStatus)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <Link to={`/applicants/${app._id}`} className="btn btn-outline" style={{ padding: '0.5rem' }}>
                        <Eye size={16} /> <span style={{ marginLeft: '4px' }}>Process</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ApplicantsList;
