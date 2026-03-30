import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { CheckCircle, FileCheck, IndianRupee, Lock } from 'lucide-react';

const ApplicantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [applicant, setApplicant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [allotmentNumber, setAllotmentNumber] = useState('');
  const [quotaType, setQuotaType] = useState('KCET');

  const fetchApplicant = async () => {
    try {
      const res = await api.get(`/applicants/${id}`);
      setApplicant(res.data);
      if (res.data.quotaType) setQuotaType(res.data.quotaType);
    } catch (err) {
      setError('Failed to load applicant details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApplicant(); }, [id]);

  const handleAllocate = async () => {
    try {
      setError('');
      await api.put(`/applicants/${id}/allocate`, { quotaType, allotmentNumber });
      fetchApplicant();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to allocate seat. Quota may be full.');
    }
  };

  const handleVerifyDocs = async () => {
    try {
      setError('');
      await api.put(`/applicants/${id}/verify-documents`, { status: 'Verified' });
      fetchApplicant();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify documents.');
    }
  };

  const handleFeePaid = async () => {
    try {
      setError('');
      await api.put(`/applicants/${id}/confirm-fee`);
      fetchApplicant();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to confirm fee.');
    }
  };

  if (loading) return <div className="container">Loading...</div>;
  if (!applicant) return <div className="container">Applicant not found.</div>;

  const isLocked = applicant.admissionStatus !== 'Pending';
  const isDocVerified = applicant.documentStatus === 'Verified';
  const isFeePaid = applicant.feeStatus === 'Paid';
  const isConfirmed = applicant.admissionStatus === 'Confirmed';

  return (
    <div className="container animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {applicant.fullName}
            {isConfirmed && <CheckCircle color="var(--success)" size={32} />}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {applicant.email} • {applicant.phone} • Applied for {applicant.program?.name} ({applicant.program?.courseType})
          </p>
        </div>
      </div>

      {error && <div style={{ color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{error}</div>}

      <div className="grid grid-cols-2">
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <h3>Admission Workflow</h3>
          
          {/* Step 1: Allocation */}
          <div style={{ borderLeft: '2px solid var(--accent-primary)', paddingLeft: '1.5rem', position: 'relative' }}>
            <div style={{ position: 'absolute', left: '-15px', top: '0', background: isLocked ? 'var(--success)' : 'var(--accent-primary)', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>1</div>
            <h4 style={{ margin: 0 }}>Seat Allocation</h4>
            <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>Assign quota and lock the seat.</p>
            
            {!isLocked ? (
              <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Quota</label>
                  <select className="form-select" value={quotaType} onChange={(e) => setQuotaType(e.target.value)}>
                    <option>KCET</option><option>COMEDK</option><option>Management</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Allotment No (Govt)</label>
                  <input className="form-input" placeholder="e.g. KCET-102930" value={allotmentNumber} onChange={(e) => setAllotmentNumber(e.target.value)} />
                </div>
                <button className="btn btn-primary" onClick={handleAllocate} style={{ gridColumn: 'span 2' }}>Check Availability & Lock Seat</button>
              </div>
            ) : (
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', padding: '1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Lock color="var(--success)" />
                <div><strong style={{ color: 'var(--success)' }}>Seat Locked</strong><br/><span style={{ fontSize: '0.85rem' }}>Quota: {applicant.quotaType}</span></div>
              </div>
            )}
          </div>

          {/* Step 2: Documents */}
          <div style={{ borderLeft: isLocked ? '2px solid var(--accent-primary)' : '2px solid var(--bg-tertiary)', paddingLeft: '1.5rem', position: 'relative' }}>
            <div style={{ position: 'absolute', left: '-15px', top: '0', background: isDocVerified ? 'var(--success)' : (isLocked ? 'var(--accent-primary)' : 'var(--bg-tertiary)'), color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>2</div>
            <h4 style={{ margin: 0, color: isLocked ? 'inherit' : 'var(--text-secondary)' }}>Document Verification</h4>
            <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>Verify applicant submitted documents.</p>
            
            {isLocked && !isDocVerified && (
              <button className="btn btn-outline" onClick={handleVerifyDocs}><FileCheck size={18} style={{ marginRight: '8px' }}/> Mark Documents Verified</button>
            )}
            {isDocVerified && <div style={{ color: 'var(--success)', fontWeight: 500 }}><FileCheck size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px'}}/> Documents Verified</div>}
          </div>

          {/* Step 3: Fee */}
          <div style={{ borderLeft: isDocVerified ? '2px solid var(--accent-primary)' : '2px solid var(--bg-tertiary)', paddingLeft: '1.5rem', position: 'relative' }}>
            <div style={{ position: 'absolute', left: '-15px', top: '0', background: isConfirmed ? 'var(--success)' : (isDocVerified ? 'var(--accent-primary)' : 'var(--bg-tertiary)'), color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>3</div>
            <h4 style={{ margin: 0, color: isDocVerified ? 'inherit' : 'var(--text-secondary)' }}>Fee Payment & Admission</h4>
            <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>Collect fee to generate unique admission number.</p>
            
            {isDocVerified && !isFeePaid && (
              <button className="btn btn-primary" style={{ background: 'var(--success)' }} onClick={handleFeePaid}><IndianRupee size={18} style={{ marginRight: '8px' }}/> Confirm Fee Paid</button>
            )}
            {isFeePaid && (
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--accent-primary)', textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Official Admission Number</p>
                <h2 style={{ margin: '8px 0 0 0', color: 'var(--accent-primary)' }}>{applicant.admissionNumber}</h2>
              </div>
            )}
          </div>
        </div>
        
        <div className="glass-panel" style={{ height: 'fit-content' }}>
          <h3 style={{ borderBottom: '1px solid var(--bg-tertiary)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Applicant Summary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Status</span><span className={`badge ${isConfirmed ? 'badge-success' : 'badge-warning'}`}>{applicant.admissionStatus}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Program</span><span>{applicant.program?.name}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Category</span><span>{applicant.category}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Qualifying Marks</span><span>{applicant.qualifyingExamMarks}%</span></div>
            <hr style={{ borderColor: 'var(--bg-tertiary)', margin: '0.5rem 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Quota Allocated</span><span>{applicant.quotaType || 'Pending'}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Documents</span><span><span className={`badge ${isDocVerified ? 'badge-success' : 'badge-warning'}`}>{applicant.documentStatus}</span></span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Fee Status</span><span><span className={`badge ${isFeePaid ? 'badge-success' : 'badge-warning'}`}>{applicant.feeStatus}</span></span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicantDetail;
