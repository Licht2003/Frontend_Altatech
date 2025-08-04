import React, { useState } from 'react';

export default function Payment() {
  const [method, setMethod] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!method) {
      alert('Please select a payment method.');
      return;
    }
    alert(`Proceeding with payment via ${method}`);
    // Dito yung payment logic
  };

  return (
    <div className="form-container" style={{ maxWidth: 400 }}>
      <h2>Payment Method</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            <input
              type="radio"
              name="payment"
              value="GCash"
              checked={method === 'GCash'}
              onChange={() => setMethod('GCash')}
            />{' '}
            GCash
          </label>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            <input
              type="radio"
              name="payment"
              value="PayMaya"
              checked={method === 'PayMaya'}
              onChange={() => setMethod('PayMaya')}
            />{' '}
            PayMaya
          </label>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            <input
              type="radio"
              name="payment"
              value="Bank"
              checked={method === 'Bank'}
              onChange={() => setMethod('Bank')}
            />{' '}
            Bank
          </label>
        </div>
        <button type="submit">Proceed to Pay</button>
      </form>
    </div>
  );
}
