import { useState, useEffect } from 'react';
import api from '../utils/api';

const Setup = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    institution: '', campus: '', department: '', name: '', 
    academicYear: '2026', courseType: 'UG', entryType: 'Regular',
    admissionMode: 'Government', totalIntake: 100
  });

  const [quotas, setQuotas] = useState({
    KCET: 40, COMEDK: 40, Management: 20
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchPrograms = async () => {
    try {
      const res = await api.get('/programs');
      setPrograms(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPrograms(); }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleQuotaChange = (e) => setQuotas({ ...quotas, [e.target.name]: parseInt(e.target.value) || 0 });

  const totalAllocated = Object.values(quotas).reduce((a, b) => a + b, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (totalAllocated !== parseInt(formData.totalIntake)) {
      setError(`Quotas (${totalAllocated}) must equal Total Intake (${formData.totalIntake})`);
      return;
    }

    try {
      const payload = {
        ...formData,
        quotas: Object.entries(quotas).map(([type, allocated]) => ({ type, allocated }))
      };
      await api.post('/programs', payload);
      setSuccess('Program created successfully!');
      fetchPrograms();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create program');
    }
  };

  return (
    <div className="container animate-fade-in">
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <h1>Master Setup</h1>
        <p>Configure institution programs and manage seating quotas.</p>
      </div>

      <div className="grid grid-cols-2">
        <div className="glass-panel">
          <h3>Create New Program</h3>
          <hr style={{ borderColor: 'var(--glass-border)', margin: '1rem 0' }} />
          
          {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '4px' }}>{error}</div>}
          {success && <div style={{ color: 'var(--success)', marginBottom: '1rem', background: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem', borderRadius: '4px' }}>{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
              <div className="form-group"><label className="form-label">Institution</label><input required name="institution" className="form-input" onChange={handleChange} /></div>
              <div className="form-group"><label className="form-label">Campus</label><input required name="campus" className="form-input" onChange={handleChange} /></div>
              <div className="form-group"><label className="form-label">Department</label><input required name="department" className="form-input" onChange={handleChange} /></div>
              <div className="form-group"><label className="form-label">Program Name</label><input required name="name" className="form-input" onChange={handleChange} placeholder="e.g. CSE" /></div>
              
              <div className="form-group"><label className="form-label">Course</label>
                <select name="courseType" className="form-select" onChange={handleChange}><option>UG</option><option>PG</option></select>
              </div>
              <div className="form-group"><label className="form-label">Entry</label>
                <select name="entryType" className="form-select" onChange={handleChange}><option>Regular</option><option>Lateral</option></select>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label className="form-label">Total Intake</label>
              <input type="number" required name="totalIntake" value={formData.totalIntake} className="form-input" onChange={handleChange} />
            </div>

            <h4 style={{ margin: '1.5rem 0 1rem' }}>Seat Allocation Quotas</h4>
            <div className="grid grid-cols-3" style={{ gap: '1rem' }}>
              {Object.keys(quotas).map((q) => (
                <div key={q} className="form-group">
                  <label className="form-label">{q}</label>
                  <input type="number" name={q} value={quotas[q]} className="form-input" onChange={handleQuotaChange} />
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: totalAllocated === parseInt(formData.totalIntake) ? 'var(--success)' : 'var(--danger)' }}>
                Total Allocated: {totalAllocated} / {formData.totalIntake}
              </span>
              <button type="submit" className="btn btn-primary" disabled={totalAllocated !== parseInt(formData.totalIntake)}>Save Program</button>
            </div>
          </form>
        </div>

        <div className="glass-panel" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
          <h3>Existing Programs</h3>
          {loading ? <p>Loading...</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              {programs.map(p => (
                <div key={p._id} style={{ background: 'rgba(15,23,42,0.6)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--bg-tertiary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                    <h4 style={{ margin: 0, color: 'var(--accent-primary)' }}>{p.institution} - {p.name}</h4>
                    <span className="badge badge-success">{p.courseType}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem' }}>Total Intake: {p.totalIntake} | Entry: {p.entryType}</p>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    {p.quotas.map(q => (
                      <span key={q._id} style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                        {q.type}: {q.allocated}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Setup;
