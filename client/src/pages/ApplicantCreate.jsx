import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const ApplicantCreate = () => {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '', dob: '', gender: 'Male', category: 'GM',
    program: '', entryType: 'Regular', quotaType: 'KCET', qualifyingExamMarks: ''
  });

  useEffect(() => {
    const fetchPrograms = async () => {
      const res = await api.get('/programs');
      setPrograms(res.data);
      if (res.data.length > 0) setFormData(prev => ({ ...prev, program: res.data[0]._id }));
    };
    fetchPrograms();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const payload = { ...formData, qualifyingExamMarks: Number(formData.qualifyingExamMarks) };
      const res = await api.post('/applicants', payload);
      navigate(`/applicants/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create applicant');
      setLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in">
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '8px' }}>Register Applicant</h1>
        <p style={{ marginBottom: '2rem' }}>Minimal application form (under 15 fields).</p>

        <form onSubmit={handleSubmit} className="glass-panel">
          {error && <div style={{ color: 'var(--danger)', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '4px', marginBottom: '1rem' }}>{error}</div>}
          
          <h3 style={{ borderBottom: '1px solid var(--bg-tertiary)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>Basic Details</h3>
          <div className="grid grid-cols-2">
            <div className="form-group"><label className="form-label">Full Name</label><input required name="fullName" className="form-input" onChange={handleChange} /></div>
            <div className="form-group"><label className="form-label">Email</label><input required type="email" name="email" className="form-input" onChange={handleChange} /></div>
            <div className="form-group"><label className="form-label">Phone</label><input required name="phone" className="form-input" onChange={handleChange} /></div>
            <div className="form-group"><label className="form-label">Date of Birth</label><input required type="date" name="dob" className="form-input" onChange={handleChange} /></div>
            <div className="form-group"><label className="form-label">Gender</label>
              <select name="gender" className="form-select" onChange={handleChange}><option>Male</option><option>Female</option><option>Other</option></select>
            </div>
            <div className="form-group"><label className="form-label">Category</label>
              <select name="category" className="form-select" onChange={handleChange}><option>GM</option><option>SC</option><option>ST</option><option>OBC</option><option>Other</option></select>
            </div>
          </div>

          <h3 style={{ borderBottom: '1px solid var(--bg-tertiary)', paddingBottom: '0.5rem', margin: '2rem 0 1.5rem' }}>Academic & Program</h3>
          <div className="grid grid-cols-2">
            <div className="form-group"><label className="form-label">Select Program</label>
              <select required name="program" className="form-select" onChange={handleChange} value={formData.program}>
                {programs.map(p => <option key={p._id} value={p._id}>{p.name} ({p.courseType}) - Intake: {p.totalIntake}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Entry Type</label>
              <select name="entryType" className="form-select" onChange={handleChange}><option>Regular</option><option>Lateral</option></select>
            </div>
            <div className="form-group"><label className="form-label">Quota Target</label>
              <select name="quotaType" className="form-select" onChange={handleChange}><option>KCET</option><option>COMEDK</option><option>Management</option></select>
            </div>
            <div className="form-group"><label className="form-label">Qualifying Exam Marks (%)</label>
              <input required type="number" step="0.01" max="100" name="qualifyingExamMarks" className="form-input" onChange={handleChange} />
            </div>
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Processing...' : 'Register Applicant & Proceed to Admission'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicantCreate;
