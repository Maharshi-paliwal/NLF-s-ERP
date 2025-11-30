import React, { useState, useRef, useEffect } from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import axios from 'axios';

const PDFClientPO = ({ show, onHide, poData }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [branchList, setBranchList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const pdfContentRef = useRef();

  // Fetch branch list when component mounts
  useEffect(() => {
    const fetchBranchList = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get("https://nlfs.in/erp/index.php/Erp/branch_list");
        if (response.data.status === "true" && response.data.success === "1" && Array.isArray(response.data.data)) {
          setBranchList(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching branch list:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBranchList();
  }, []);

  if (!poData) return null;

  // === Step 1: Resolve officeBranch from poData.branch ===
  // Using the same approach as PDFPreview
  const officeBranch = poData.branch || poData.officeBranch || 'Mumbai';

  // === Step 2: Header image mapping (matching PDFPreview) ===
  const getHeaderImagePath = (branch) => {
    const branchMap = {
      Kolkata: '/extra/Kolkata.jpeg',
      Delhi: '/extra/Delhi.jpeg',
      Indore: '/extra/Indore.jpeg',
      Nagpur: '/extra/Nagpur.jpeg',
      Mumbai: '/extra/Mumbai.jpeg',
      // Add any additional branches if needed
    };
    return branchMap[branch] || branchMap['Mumbai'];
  };

  const headerImagePath = getHeaderImagePath(officeBranch);

  // === Step 3: Generate PDF ===
  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const element = pdfContentRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `PO_${poData.poNumber || poData.poId}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PO PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // === Helper: Format currency ===
  const formatINR = (num) => {
    return Number(num || 0).toLocaleString('en-IN');
  };

  // Calculate totals
  const subTotal = poData.items?.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0) || 0;
  const gstAmount = (subTotal * (parseFloat(poData.gstPercentage) || 18)) / 100;
  const grandTotal = subTotal + gstAmount;

  // Table styling (matching PDFPreview)
  const th = { border: "1px solid #000", padding: "6px", fontWeight: "bold" };
  const td = { border: "1px solid #000", padding: "6px" };
  const blueLeft = {
    border: "1px solid #000",
    padding: "6px",
    background: "#007bff",
    color: "white",
    width: "70%",
  };
  const blueRight = {
    border: "1px solid #000",
    padding: "6px",
    background: "#007bff",
    color: "white",
    textAlign: "right",
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Purchase Order Preview - {poData.poNumber || poData.poId}</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: '80vh', overflowY: 'auto' }}>
        {isLoading ? (
          <div className="text-center p-5">
            <Spinner animation="border" role="status" style={{ color: "#ed3131" }}>
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-3">Loading branch data...</p>
          </div>
        ) : (
          <div
            ref={pdfContentRef}
            style={{
              padding: "15px",
              backgroundColor: "white",
              fontFamily: "Arial, sans-serif",
              fontSize: "10.5px",
              width: "210mm",          // Perfect A4 width
              margin: "0 auto",
              border: "1px solid #ddd",
            }}
          >
            {/* === HEADER IMAGE (Dynamic based on branch) === */}
            <div
              style={{
                width: "100%",
                border: "1px solid #000",
                overflow: "hidden",
              }}
            >
              <img
                src={headerImagePath}
                alt={`Header for ${officeBranch}`}
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </div>

            {/* === PO TITLE === */}
            <h3 style={{ textAlign: "center", margin: "15px 0", fontWeight: "bold" }}>
              PURCHASE ORDER
            </h3>

            {/* === PO NO / DATE === */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <div>
                <strong>{poData.poNumber || poData.poId}</strong>
              </div>
              <div>
                <strong>Date:</strong> {poData.poDate ? new Date(poData.poDate).toLocaleDateString('en-IN') : 'N/A'}
              </div>
            </div>

            {/* === CLIENT DETAILS === */}
            <div style={{ lineHeight: "1.4", marginBottom: "15px" }}>
              <p style={{ margin: 0 }}><strong>To,</strong></p>
              <p style={{ margin: 0 }}>{poData.companyName || poData.clientName || '-'}</p>
              <p style={{ margin: 0 }}>{poData.siteAddress || '-'}</p>
              <p style={{ margin: 0 }}>GST: {poData.gstNumber || 'Not Provided'}</p>

              <p style={{ marginTop: "10px" }}>
                <strong>Subject:</strong> Purchase Order for {poData.projectName || 'Office Furniture'}
              </p>
            </div>

            {/* === DEAR SIR TEXT === */}
            <p style={{ marginBottom: "15px" }}>
              Dear Sir/Madam, <br />
              We are pleased to issue this Purchase Order as per agreed terms:
            </p>

            {/* === ITEMS TABLE === */}
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#007bff", color: "white", textAlign: "center" }}>
                  <th style={th}>S.No</th>
                  <th style={th}>Description of Item</th>
                  <th style={th}>Unit</th>
                  <th style={th}>Qty</th>
                  <th style={th}>Rate</th>
                  <th style={th}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {poData.items?.map((item, idx) => (
                  <tr key={idx}>
                    <td style={td}>{idx + 1}</td>
                    <td style={td}>
                      <div style={{ fontWeight: "bold", textTransform: "uppercase", marginBottom: "2px" }}>
                        {item.material || 'ITEM'}
                      </div>
                      <div>{item.description}</div>
                    </td>
                    <td style={td}>{item.unit || "-"}</td>
                    <td style={td}>{formatINR(item.quantity)}</td>
                    <td style={td}>{formatINR(item.rate)}</td>
                    <td style={td}>{formatINR(item.total || item.quantity * item.rate)}</td>
                  </tr>
                ))}
                {/* Additional service items */}
                {poData.additionalDetails?.map((item, index) => (
                  <tr key={`add-${index}`}>
                    <td style={td}>*</td>
                    <td style={td}>
                      <strong>{item.description}</strong>
                    </td>
                    <td style={td}>{item.unit}</td>
                    <td style={td}>{formatINR(item.quantity)}</td>
                    <td style={td}>{formatINR(item.rate)}</td>
                    <td style={td}>{formatINR(item.total || item.quantity * item.rate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* === AMOUNT BLUE BOX === */}
            <div style={{ float: "right", width: "45%", marginTop: "12px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  <tr>
                    <td style={blueLeft}>Basic Amount</td>
                    <td style={blueRight}>₹{formatINR(subTotal)}</td>
                  </tr>
                  <tr>
                    <td style={blueLeft}>GST @ {poData.gstPercentage || 18}%</td>
                    <td style={blueRight}>₹{formatINR(gstAmount)}</td>
                  </tr>
                  <tr>
                    <td style={blueLeft}><b>Grand Total</b></td>
                    <td style={blueRight}><b>₹{formatINR(grandTotal)}</b></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ clear: "both", marginTop: "50px" }}>
              <h4>Terms & Conditions:</h4>
              <p style={{ lineHeight: "1.4" }}>
                Payment Terms: {poData.termsAndConditions?.paymentTerms?.description ||
                  `${poData.advancePaymentPercentage || 0}% advance, ${poData.balancePaymentPercentage || 0}% on delivery`}
                <br />
                Expected Delivery: {poData.expectedDeliveryDate ? new Date(poData.expectedDeliveryDate).toLocaleDateString('en-IN') : 'TBD'}
                <br />
                Location: {poData.siteAddress}
              </p>
            </div>

            {/* === FOOTER IMAGE INSIDE PDF === */}
            <div style={{ marginTop: "25px", width: "100%", borderTop: "2px solid #000" }}>
              <img src="/extra/Footer.jpeg" style={{ width: "100%", height: "auto" }} />
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="primary" onClick={generatePDF} disabled={isGenerating}>
          {isGenerating ? 'Generating...' : 'Download PDF'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PDFClientPO;