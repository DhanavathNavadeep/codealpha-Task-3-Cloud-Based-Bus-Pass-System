import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../services/api';
import { Bus, Calendar, FileText, CreditCard, CheckCircle, AlertCircle, Upload, ShieldCheck, ArrowRight } from 'lucide-react';

const ApplyPass = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [routes, setRoutes] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState('');
  const [passType, setPassType] = useState('Monthly');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [documentFile, setDocumentFile] = useState(null);

  const [fareData, setFareData] = useState(null);
  const [loadingFare, setLoadingFare] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Payment Modal Simulation state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [createdPass, setCreatedPass] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [simulateFail, setSimulateFail] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const res = await API.get('/routes');
        setRoutes(res.data.routes || []);
        if (res.data.routes.length > 0) {
          setSelectedRouteId(res.data.routes[0].id);
        }
      } catch (err) {
        setError('Failed to fetch routes.');
      }
    };
    fetchRoutes();
  }, []);

  // Update fare whenever route or passType changes
  useEffect(() => {
    if (!selectedRouteId) return;

    const calculate = async () => {
      setLoadingFare(true);
      try {
        const res = await API.post('/passes/calculate-fare', {
          route_id: selectedRouteId,
          pass_type: passType
        });
        setFareData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingFare(false);
      }
    };
    calculate();
  }, [selectedRouteId, passType]);

  const selectedRouteObj = routes.find(r => str(r.id) === str(selectedRouteId)) || (routes.length > 0 ? routes[0] : null);

  function str(val) {
    return String(val);
  }

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedRouteId) {
      setError('Please select a valid bus route.');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('route_id', selectedRouteId);
      formData.append('pass_type', passType);
      formData.append('start_date', startDate);
      if (documentFile) {
        formData.append('document', documentFile);
      }

      const res = await API.post('/passes/apply', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setCreatedPass(res.data.bus_pass);
      setShowPaymentModal(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentProcess = async () => {
    if (!createdPass) return;

    setProcessingPayment(true);
    setError('');

    try {
      await API.post('/payments/process', {
        pass_id: createdPass.id,
        payment_method: paymentMethod,
        simulate_failure: simulateFail
      });

      setShowPaymentModal(false);
      navigate('/my-passes');
    } catch (err) {
      setError(err.response?.data?.error || 'Payment failed.');
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '2rem' }}>
        <h2>Apply for Digital Bus Pass</h2>
        <p style={{ color: 'var(--text-muted)' }}>
          Select your route, duration, and upload verification ID to generate your instant digital QR pass.
        </p>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {/* Form Card */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <form onSubmit={handleApplySubmit}>
            {/* Route Selector */}
            <div className="form-group">
              <label>Select Bus Route</label>
              <select
                className="form-control"
                value={selectedRouteId}
                onChange={(e) => setSelectedRouteId(e.target.value)}
                required
              >
                {routes.map((r) => (
                  <option key={r.id} value={r.id}>
                    [{r.route_code}] {r.route_name} ({r.source} ➔ {r.destination})
                  </option>
                ))}
              </select>
            </div>

            {/* Route Stops Preview */}
            {selectedRouteObj && (
              <div style={{ background: 'var(--primary-50)', padding: '0.85rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                <strong style={{ color: 'var(--primary-700)', display: 'block', marginBottom: '0.2rem' }}>Route Stops:</strong>
                <span style={{ color: 'var(--text-muted)' }}>
                  {selectedRouteObj.stops && selectedRouteObj.stops.length > 0 ? selectedRouteObj.stops.join(' ➔ ') : 'Direct Non-stop service'}
                </span>
              </div>
            )}

            {/* Pass Type Selector */}
            <div className="form-group">
              <label>Pass Duration</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem' }}>
                {['Monthly', 'Quarterly', 'Half-Yearly', 'Annual'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setPassType(type)}
                    style={{
                      padding: '0.65rem',
                      borderRadius: '8px',
                      border: passType === type ? '2px solid var(--primary-500)' : '1px solid var(--border-color)',
                      background: passType === type ? 'var(--primary-50)' : 'var(--bg-surface)',
                      color: passType === type ? 'var(--primary-700)' : 'var(--text-main)',
                      fontWeight: '600',
                      fontSize: '0.88rem',
                      cursor: 'pointer'
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Start Date */}
            <div className="form-group">
              <label>Pass Start Date</label>
              <input
                type="date"
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            {/* Upload Verification Document */}
            <div className="form-group">
              <label>Upload ID / Photo Proof (Optional)</label>
              <div style={{ border: '2px dashed var(--border-color)', padding: '1.25rem', borderRadius: '10px', textAlign: 'center', background: 'var(--bg-surface)' }}>
                <Upload size={24} color="var(--primary-500)" style={{ marginBottom: '0.4rem' }} />
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setDocumentFile(e.target.files[0])}
                  style={{ display: 'block', width: '100%', fontSize: '0.85rem', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.4rem' }}>
                  Supported formats: JPG, PNG, PDF (Max 16MB)
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', marginTop: '1rem' }}
              disabled={submitting}
            >
              {submitting ? 'Creating Pass Application...' : 'Proceed to Online Payment'} <ArrowRight size={18} />
            </button>
          </form>
        </div>

        {/* Fare Summary Side Card */}
        <div>
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard size={20} color="var(--accent-green)" /> Fare Summary
            </h3>

            {loadingFare ? (
              <p>Calculating fare...</p>
            ) : fareData ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                  <span>Base Monthly Fare</span>
                  <span>₹{fareData.base_price}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                  <span>Duration ({fareData.pass_type})</span>
                  <span>x{fareData.multiplier}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0 0 0', marginTop: '0.5rem' }}>
                  <strong style={{ fontSize: '1.1rem' }}>Total Payable Fare</strong>
                  <strong style={{ fontSize: '1.5rem', color: 'var(--accent-green)' }}>
                    ₹{fareData.total_fare}
                  </strong>
                </div>

                <div style={{ background: 'var(--accent-green-bg)', color: 'var(--accent-green)', padding: '0.75rem', borderRadius: '8px', marginTop: '1.5rem', fontSize: '0.82rem', textAlign: 'center', fontWeight: '600' }}>
                  Includes Instant QR Pass Generation & Standard Transit Insurance
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Online Payment Simulation Modal */}
      {showPaymentModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '2rem', background: 'var(--bg-surface)' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Secure Payment Gateway</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              Complete simulation payment for Bus Pass <strong>#{createdPass?.pass_number}</strong>
            </p>

            <div style={{ background: 'var(--primary-50)', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Amount to Pay</span>
              <h2 style={{ fontSize: '2rem', color: 'var(--primary-600)' }}>₹{createdPass?.total_fare}</h2>
            </div>

            <div className="form-group">
              <label>Select Payment Method</label>
              <select className="form-control" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="UPI">UPI / GooglePay / PhonePe</option>
                <option value="Credit/Debit Card">Credit / Debit Card</option>
                <option value="Net Banking">Net Banking</option>
              </select>
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                id="failCheckbox"
                checked={simulateFail}
                onChange={(e) => setSimulateFail(e.target.checked)}
              />
              <label htmlFor="failCheckbox" style={{ marginBottom: 0, fontSize: '0.85rem', color: '#dc2626' }}>
                Simulate Payment Failure (Testing mode)
              </label>
            </div>

            <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="btn btn-outline"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePaymentProcess}
                className="btn btn-success"
                style={{ flex: 1 }}
                disabled={processingPayment}
              >
                {processingPayment ? 'Processing...' : 'Pay Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplyPass;
