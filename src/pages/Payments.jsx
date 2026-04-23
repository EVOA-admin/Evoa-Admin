import { useEffect, useState } from 'react';
import { adminApi } from '../services/adminApi';

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setError('');
        const data = await adminApi.getPayments();
        setPayments(data);
      } catch (err) {
        setError(err.message || 'Unable to load payments.');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Payment Monitoring</h1>
          <p className="page-subtitle">Review subscription and battleground transactions in one stream.</p>
        </div>
      </div>

      {error && <div className="alert alert-error"><span>⚠</span> {error}</div>}

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>User</th>
              <th>Type</th>
              <th>Plan</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Payment ID</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <tr key={index}>
                  <td colSpan="7"><div className="skeleton skeleton-row" /></td>
                </tr>
              ))
            ) : payments.length === 0 ? (
              <tr>
                <td colSpan="7" className="table-empty">No transactions found.</td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr key={`${payment.type}-${payment.id}`}>
                  <td>
                    <div className="table-primary">{payment.userName || 'Unknown user'}</div>
                    <div className="table-secondary">{payment.userEmail || '—'}</div>
                  </td>
                  <td><span className="chip chip-neutral">{payment.type}</span></td>
                  <td>{payment.planType}</td>
                  <td>{currency.format(payment.amount || 0)}</td>
                  <td><span className={`chip ${payment.status === 'success' || payment.status === 'active' ? 'chip-success' : payment.status === 'failed' ? 'chip-danger' : 'chip-warning'}`}>{payment.status}</span></td>
                  <td className="table-code">{payment.paymentId || payment.razorpayOrderId}</td>
                  <td>{new Date(payment.createdAt).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
