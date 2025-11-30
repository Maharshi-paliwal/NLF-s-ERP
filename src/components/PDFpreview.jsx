import React, { useState, useRef, useEffect } from 'react';
import { Modal, Button, Spinner, Form } from 'react-bootstrap';

// Helper function to check approval values
const isApprovedValue = (val) => {
  if (!val) return false;
  const s = String(val).trim().toLowerCase();
  return ["yes", "approved", "true", "1"].includes(s);
};

const PDFPreview = ({ show, onHide, quotationData, quoteId }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [fetchedData, setFetchedData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [adminApproved, setAdminApproved] = useState(false);
  const [isUpdatingAdmin, setIsUpdatingAdmin] = useState(false);

  const pdfContentRef = useRef();

  // Fetch quotation data if quoteId is provided
  useEffect(() => {
    if (show && quoteId && !quotationData) {
      const fetchQuotationData = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(
            'https://nlfs.in/erp/index.php/Nlf_Erp/get_quotation_by_id',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ quote_id: String(quoteId) })
            }
          );

          const data = await response.json();
          const isSuccess = data.status === true || data.status === "true";
          
          if (isSuccess && data.data) {
            setFetchedData(data.data);
          }
        } catch (error) {
          console.error('Error fetching quotation data:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchQuotationData();
    }
  }, [show, quoteId, quotationData]);

  // Use either passed quotationData or fetched data
  const activeQuotationData = quotationData || fetchedData;

  // Check approvals
  const isRateApproved = isApprovedValue(activeQuotationData?.rate_approval);

  // Sync local adminApproved state with data
  useEffect(() => {
    if (activeQuotationData) {
      setAdminApproved(isApprovedValue(activeQuotationData.admin_approval));
    }
  }, [activeQuotationData]);

  // Handle admin approval
  const handleAdminApproval = async () => {
    if (!activeQuotationData) return;
    if (adminApproved) return;

    if (!isRateApproved) {
      alert("Rate must be approved before approving the quotation.");
      return;
    }

    const quoteIdForApi =
      activeQuotationData.quote_id ||
      activeQuotationData.quotationId ||
      quoteId;

    if (!quoteIdForApi) {
      alert("Missing quote ID, cannot approve quotation.");
      return;
    }

    const confirm = window.confirm(
      "Are you sure you want to approve this quotation?"
    );
    if (!confirm) return;

    try {
      setIsUpdatingAdmin(true);
      const response = await fetch(
        "https://nlfs.in/erp/index.php/Nlf_Erp/update_admin_approval",
        {
          method: 'POST',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quote_id: String(quoteIdForApi),
            admin_approval: "Yes",
          })
        }
      );

      const result = await response.json();
      const success = result.status === true || result.status === "true";

      if (success) {
        setAdminApproved(true);
        if (fetchedData) {
          setFetchedData((prev) =>
            prev ? { ...prev, admin_approval: "Yes" } : prev
          );
        }
        alert("Quotation approved successfully!");
      } else {
        alert(result.message || "Failed to approve quotation.");
      }
    } catch (err) {
      console.error("Error approving quotation:", err);
      alert("Error approving quotation: " + (err.message || "Unknown error"));
    } finally {
      setIsUpdatingAdmin(false);
    }
  };

  // Generate PDF function
  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      // Import dynamically to avoid issues
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;

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

      const fileName = `Quotation_${
        activeQuotationData?.quote_id ||
        activeQuotationData?.quotationId ||
        'Unknown'
      }.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Get current round data
  const getCurrentRoundData = () => {
    if (!activeQuotationData) return null;
    
    if (activeQuotationData.rounds && activeQuotationData.rounds.length > 0) {
      if (activeQuotationData.currentRound) {
        const specificRound = activeQuotationData.rounds.find(
          (r) => r.round === activeQuotationData.currentRound
        );
        if (specificRound) return specificRound;
      }
      const sortedRounds = [...activeQuotationData.rounds].sort(
        (a, b) =>
          parseInt(b.round?.substring(1) || 0) -
          parseInt(a.round?.substring(1) || 0)
      );
      return sortedRounds[0];
    }
    return null;
  };

  const currentRound = getCurrentRoundData();

  if (!activeQuotationData && !isLoading) return null;

  // Get office branch
  const officeBranch =
    activeQuotationData?.branch ||
    activeQuotationData?.officeBranch ||
    'Mumbai';

  const getHeaderImagePath = (branch) => {
    const branchMap = {
      Kolkata: '/extra/Kolkata.jpeg',
      Delhi: '/extra/Delhi.jpeg',
      Indore: '/extra/Indore.jpeg',
      Nagpur: '/extra/Nagpur.jpeg',
      Mumbai: '/extra/Mumbai.jpeg',
    };
    return branchMap[branch] || branchMap['Mumbai'];
  };

  const headerImagePath = getHeaderImagePath(officeBranch);

  // ADD BEFORE return (INSIDE COMPONENT)
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
        <Modal.Title>
          Quotation Preview -{' '}
          {activeQuotationData?.quote_id ||
            activeQuotationData?.quotationId ||
            'Loading...'}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body style={{ maxHeight: '80vh', overflowY: 'auto' }}>
        {isLoading ? (
          <div className="text-center p-5">
            <Spinner animation="border" role="status" style={{ color: "#ed3131" }}>
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-3">Loading quotation data...</p>
          </div>
        ) : !activeQuotationData ? (
          <div className="text-center p-5">
            <p>No quotation data available.</p>
          </div>
        ) : (
          <>
            {/* PDF Content */}
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
  {/* === HEADER IMAGE === */}
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

  {/* === QUOTATION TITLE === */}
  <h3 style={{ textAlign: "center", margin: "15px 0", fontWeight: "bold" }}>
    QUOTATION
  </h3>

  {/* === QUOTE NO / DATE === */}
  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
    <div>
      <strong>NLF-25-26-Q-4-R1</strong>
    </div>
    <div>
      <strong>Date:</strong> {activeQuotationData?.date || "-"}
    </div>
  </div>

  {/* === CLIENT DETAILS (left aligned like screenshot) === */}
  <div style={{ lineHeight: "1.4", marginBottom: "15px" }}>
    <p style={{ margin: 0 }}><strong>To,</strong></p>
    <p style={{ margin: 0 }}>{activeQuotationData?.name || "-"}</p>
    <p style={{ margin: 0 }}>{activeQuotationData?.city || "-"}</p>

    <p style={{ marginTop: "10px" }}>
      <strong>Kind Attention:</strong> Sales Team
    </p>
    <p>
      <strong>Subject:</strong> Quotation for{" "}
      {activeQuotationData?.product || "-"}
    </p>
  </div>

  {/* === DEAR SIR TEXT === */}
  <p style={{ marginBottom: "15px" }}>
    Dear Sir, <br />
    As per our discussion we are quoting our lowest possible rate as follow:
  </p>

  {/* ==================== ITEMS TABLE FORMAT LIKE YOUR IMAGE ==================== */}
  {activeQuotationData?.items && activeQuotationData.items.length > 0 && (
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
        {activeQuotationData.items.map((item, idx) => (
          <tr key={idx}>
            <td style={td}>{idx + 1}</td>
            <td style={td}>{item.name}</td>
            <td style={td}>{item.unit || "-"}</td>
            <td style={td}>{item.quantity}</td>
            <td style={td}>{item.rate}</td>
            <td style={td}>{item.amount}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )}

  {/* === AMOUNT BLUE BOX === */}
  <div style={{ float: "right", width: "45%", marginTop: "12px" }}>
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <tbody>
        <tr>
          <td style={blueLeft}>Basic Amount</td>
          <td style={blueRight}>₹{activeQuotationData?.basic || "0"}</td>
        </tr>
        <tr>
          <td style={blueLeft}>GST @ 18%</td>
          <td style={blueRight}>₹{activeQuotationData?.gst || "0"}</td>
        </tr>
        <tr>
          <td style={blueLeft}><b>Grand Total</b></td>
          <td style={blueRight}><b>₹{activeQuotationData?.total || "0"}</b></td>
        </tr>
      </tbody>
    </table>
  </div>

  <div style={{ clear: "both", marginTop: "50px" }}>
    <h4>Commercial Terms:</h4>
    <p style={{ lineHeight: "1.4" }}>
      GST → {activeQuotationData?.gst_no || "27AACBCCDEEFFGG"} <br />
      Supply Terms: 95% of payment within 20 days after delivery… <br />
      Installation Terms: 90% within 21 days of completion… <br /><br />
      <em>* GST 18% as actual – Payment 50% advance with formal work order.</em>
    </p>
  </div>

  {/* === FOOTER IMAGE INSIDE PDF === */}
  <div style={{ marginTop: "25px", width: "100%", borderTop: "2px solid #000" }}>
    <img src="/extra/Footer.jpeg" style={{ width: "100%", height: "auto" }} />
  </div>
</div>

            
           </>
        )}
      </Modal.Body>

      <Modal.Footer className="justify-content-end">
        {!adminApproved ? (
          <Form.Check
            type="checkbox"
            id="admin-approval-checkbox-footer"
            label={
              !isRateApproved
                ? "Rate not approved – cannot approve quotation"
                : isUpdatingAdmin
                ? "Approving quotation..."
                : "Approve Quotation (Admin)"
            }
            checked={adminApproved}
            disabled={!isRateApproved || isUpdatingAdmin}
            onChange={handleAdminApproval}
          />
        ) : (
          <Button
            variant="primary"
            onClick={generatePDF}
            disabled={isGenerating}
          >
            {isGenerating ? "Generating..." : "Download PDF"}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default PDFPreview;