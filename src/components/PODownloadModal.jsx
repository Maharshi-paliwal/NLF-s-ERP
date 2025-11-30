// components/PODownloadModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Button, Spinner, Alert } from 'react-bootstrap';
import { FaDownload, FaTimes } from 'react-icons/fa';
import axios from 'axios';

const PODownloadModal = ({ show, onHide, quotationId }) => {
  const [poData, setPoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (show && quotationId) {
      fetchPOData();
    }
  }, [show, quotationId]);

  const fetchPOData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        'https://nlfs.in/erp/index.php/Nlf_Erp/get_po_by_quotation_id',
        { quotation_id: String(quotationId) },
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.data.status && response.data.data) {
        setPoData(response.data.data);
      } else {
        throw new Error(response.data.message || 'PO not found for this quotation');
      }
    } catch (error) {
      console.error('Error fetching PO:', error);
      setError(error.response?.data?.message || error.message || 'Failed to fetch PO data');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPO = () => {
    if (!poData) return;

    const poContent = generatePOHTML(poData);
    const blob = new Blob([poContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Client_PO_${poData.po_no || quotationId}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const generatePOHTML = (data) => {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Purchase Order - ${data.po_no || ''}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
    .header h1 { margin: 0; color: #ed3131; }
    .section { margin-bottom: 25px; }
    .section-title { font-weight: bold; font-size: 16px; margin-bottom: 10px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
    .info-row { display: flex; margin-bottom: 8px; }
    .info-label { font-weight: bold; width: 180px; }
    .info-value { flex: 1; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
    th { background-color: #f5f5f5; font-weight: bold; }
    .total-row { font-weight: bold; background-color: #f9f9f9; }
    .terms { margin-top: 30px; padding: 15px; background-color: #f9f9f9; border-left: 3px solid #ed3131; }
  </style>
</head>
<body>
  <div class="header">
    <h1>PURCHASE ORDER</h1>
    <p>PO Number: ${data.po_no || 'N/A'}</p>
    <p>Date: ${data.date || new Date().toLocaleDateString()}</p>
  </div>

  <div class="section">
    <div class="section-title">Client Information</div>
    <div class="info-row"><div class="info-label">Company:</div><div class="info-value">${data.company || 'N/A'}</div></div>
    <div class="info-row"><div class="info-label">Contact Person:</div><div class="info-value">${data.contact_person || 'N/A'}</div></div>
    <div class="info-row"><div class="info-label">Site Address:</div><div class="info-value">${data.site_address || 'N/A'}</div></div>
    <div class="info-row"><div class="info-label">Billing Address:</div><div class="info-value">${data.billing_address || 'N/A'}</div></div>
    <div class="info-row"><div class="info-label">GST Number:</div><div class="info-value">${data.gst_number || 'N/A'}</div></div>
  </div>

  <div class="section">
    <div class="section-title">Items</div>
    <table>
      <thead>
        <tr><th>Sr.</th><th>Material</th><th>Description</th><th>Unit</th><th>Qty</th><th>Rate</th><th>Amount</th></tr>
      </thead>
      <tbody>
        ${(data.items || []).map((item, idx) => `
          <tr>
            <td>${idx + 1}</td>
            <td>${item.material || ''}</td>
            <td>${item.description || ''}</td>
            <td>${item.unit || ''}</td>
            <td>${item.quantity || ''}</td>
            <td>${item.rate || ''}</td>
            <td>${item.amount || ''}</td>
          </tr>
        `).join('')}
        <tr class="total-row">
          <td colspan="6" style="text-align: right;">Total Amount:</td>
          <td>₹${data.total_amt || '0'}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Payment Details</div>
    <div class="info-row"><div class="info-label">Total Amount:</div><div class="info-value">₹${data.total_amt || '0'}</div></div>
    <div class="info-row"><div class="info-label">Advance Payment:</div><div class="info-value">₹${data.total_advance || '0'}</div></div>
    <div class="info-row"><div class="info-label">Balance Payment:</div><div class="info-value">₹${data.total_bal || '0'}</div></div>
    <div class="info-row"><div class="info-label">GST:</div><div class="info-value">${data.gst || '18%'}</div></div>
  </div>

  <div style="margin-top: 50px; text-align: center; color: #666;">
    <p>This is a computer-generated document.</p>
  </div>
</body>
</html>`;
  };

  const handleClose = () => {
    setPoData(null);
    setError(null);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Download Client Purchase Order</Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Loading PO data...</p>
          </div>
        ) : error ? (
          <Alert variant="danger">
            <Alert.Heading>Error</Alert.Heading>
            <p>{error}</p>
            <hr />
            <p className="mb-0">Please ensure a PO has been created for this quotation.</p>
          </Alert>
        ) : poData ? (
          <div>
            <Alert variant="success">
              <Alert.Heading>PO Ready for Download</Alert.Heading>
              <p className="mb-0">PO Number: <strong>{poData.po_no || 'N/A'}</strong></p>
              <p className="mb-0">Date: <strong>{poData.date || 'N/A'}</strong></p>
              <p className="mb-0">Total Amount: <strong>₹{poData.total_amt || '0'}</strong></p>
            </Alert>
            
            <div className="mt-3">
              <h6>PO Summary:</h6>
              <ul>
                <li>Company: {poData.company || 'N/A'}</li>
                <li>Contact: {poData.contact_person || 'N/A'}</li>
                <li>Items: {poData.items?.length || 0}</li>
              </ul>
            </div>
          </div>
        ) : null}
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          <FaTimes className="me-2" />
          Close
        </Button>
        {poData && (
          <Button variant="success" onClick={handleDownloadPO}>
            <FaDownload className="me-2" />
            Download Client PO
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default PODownloadModal;