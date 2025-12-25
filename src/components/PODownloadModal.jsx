import React, { useState, useRef, useEffect } from "react";
import { Modal, Button, Spinner } from "react-bootstrap";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import axios from "axios";

const POPreviewModal = ({ show, onHide, poData }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [branchList, setBranchList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const pdfContentRef = useRef();

  // Fetch branch list when component mounts
  useEffect(() => {
    const fetchBranchList = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          "https://nlfs.in/erp/index.php/Erp/branch_list"
        );
        if (
          response.data.status === "true" &&
          response.data.success === "1" &&
          Array.isArray(response.data.data)
        ) {
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

  // ======== NORMALISED FIELDS FROM API + FORM ========
  // IDs / numbers / dates
  const poNumber = poData.po_no || poData.poNumber || poData.poId || "N/A";
  const poDateRaw = poData.date || poData.poDate || null;
  const poDate = poDateRaw
    ? new Date(poDateRaw).toLocaleDateString("en-IN")
    : "N/A";

  // Client & company info
  const company = poData.company || poData.companyName || "-";
  const clientName = poData.contact_person || poData.clientName || poData.contactPerson || "-";
  const siteAddress = poData.site_address || poData.siteAddress || "-";
  const billingAddress = poData.billing_address || poData.billingAddress || "-";
  const gstNumber = poData.gst_number || poData.gstNumber || "Not Provided";
  const panNumber = poData.pan_number || poData.panNumber || "-";

  // Project / subject
  const projectName = poData.projectName || poData.project || "Office Furniture";

  // Amounts / GST
  const basicAmount =
    parseFloat(poData.total_amt) ||
    parseFloat(poData.totalAmount) ||
    parseFloat(poData.total_amt) ||
    0;

  // gstPercentage can come as "18%" (API) or 18 (form)
  const gstPercent =
    parseFloat(
      String(poData.gst || poData.gstPercentage || "18").replace("%", "")
    ) || 18;

  const gstAmountExplicit = parseFloat(poData.gstAmount || 0);
  const gstAmount =
    gstAmountExplicit || (basicAmount * gstPercent) / 100;

  const grandTotalExplicit = parseFloat(poData.totalInvoiceAmount || 0);
  const grandTotal = grandTotalExplicit || basicAmount + gstAmount;

  const advanceAmount =
    parseFloat(poData.total_advance) ||
    parseFloat(poData.advancePaymentAmount) ||
    parseFloat(poData.total_advance) ||
    0;
  const balanceAmount =
    parseFloat(poData.total_bal) ||
    parseFloat(poData.balancePaymentAmount) ||
    parseFloat(poData.total_bal) ||
    0;

  // Terms-related
  const deliverySchedule =
    poData.delivery_schedule ||
    poData.termsAndConditions?.deliverySchedule?.deliveryNotes ||
    "-";

  const liquidatedDamages =
    poData.liquidated_damages ||
    poData.termsAndConditions?.liquidatedDamages?.description ||
    "-";

  const defectLiabilityPeriod =
    poData.defect_liability_period ||
    poData.termsAndConditions?.defectLiabilityPeriod?.duration ||
    "-";

  const installationScope =
    poData.installation_scope ||
    poData.termsAndConditions?.installationAndCommissioning?.installationScope ||
    "-";

  // ======== BRANCH / HEADER IMAGE ========

  const officeBranch =
    poData.branch || poData.officeBranch || "Mumbai";

  const getHeaderImagePath = (branch) => {
    const branchMap = {
      Kolkata: "/extra/Kolkata.jpeg",
      Delhi: "/extra/Delhi.jpeg",
      Indore: "/extra/Indore.jpeg",
      Nagpur: "/extra/Nagpur.jpeg",
      Mumbai: "/extra/Mumbai.jpeg",
    };
    return branchMap[branch] || branchMap["Mumbai"];
  };

  const headerImagePath = getHeaderImagePath(officeBranch);

  // ======== PDF GENERATION ========

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const element = pdfContentRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `PO_${poNumber}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("Error generating PO PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // ======== HELPERS ========

  const formatINR = (num) =>
    Number(num || 0).toLocaleString("en-IN");

  // Make sure itemsArray is always an array
  const itemsArray = Array.isArray(poData.items) ? poData.items.map(item => ({
    material: item.product || item.material || "ITEM",
    description: item.desc || item.description || "",
    unit: item.unit || "-",
    quantity: item.qty || item.quantity || "",
    rate: item.rate || "",
    amount: item.amt || item.amount || "",
    // Add installation details if needed
    inst_unit: item.inst_unit || item.unit || "",
    inst_qty: item.inst_qty || item.qty || "",
    inst_rate: item.inst_rate || item.rate || "",
    inst_amt: item.inst_amt || item.amt || "",
    total: item.total || item.amt || ""
  })) : [];

  // Make sure additionalDetails is always an array
  const additionalDetails = Array.isArray(poData.additionalDetails) ? poData.additionalDetails : [];

  // Calculate totals safely
  const itemsTotal = itemsArray.reduce((sum, item) => {
    const amount = parseFloat(item.amount) || 0;
    return sum + amount;
  }, 0);

  const additionalTotal = additionalDetails.reduce((sum, item) => {
    const total = parseFloat(item.total) || 0;
    return sum + total;
  }, 0);

  const th = {
    border: "1px solid #000",
    padding: "6px",
    fontWeight: "bold",
  };
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
          Purchase Order Preview - {poNumber}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: "80vh", overflowY: "auto" }}>
        {isLoading ? (
          <div className="text-center p-5">
            <Spinner
              animation="border"
              role="status"
              style={{ color: "#ed3131" }}
            >
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
              width: "210mm", // A4 width
              margin: "0 auto",
              border: "1px solid #ddd",
            }}
          >
            {/* HEADER IMAGE */}
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

            {/* TITLE */}
            <h3
              style={{
                textAlign: "center",
                margin: "15px 0",
                fontWeight: "bold",
              }}
            >
              PURCHASE ORDER
            </h3>

            {/* PO NO / DATE */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <div>
                <strong>{poNumber}</strong>
              </div>
              <div>
                <strong>Date:</strong> {poDate}
              </div>
            </div>

            {/* CLIENT DETAILS */}
            <div
              style={{ lineHeight: "1.4", marginBottom: "15px" }}
            >
              <p style={{ margin: 0 }}>
                <strong>To,</strong>
              </p>
              <p style={{ margin: 0 }}>{company}</p>
              <p style={{ margin: 0 }}>{siteAddress}</p>
              <p style={{ margin: 0 }}>
                GST: {gstNumber} | PAN: {panNumber}
              </p>

              <p style={{ marginTop: "10px" }}>
                <strong>Kind Attention:</strong> {clientName}
              </p>
              <p style={{ marginTop: "5px" }}>
                <strong>Subject:</strong> Purchase Order for{" "}
                {projectName}
              </p>
            </div>

            {/* DEAR SIR TEXT */}
            <p style={{ marginBottom: "15px" }}>
              Dear Sir/Madam, <br />
              We are pleased to issue this Purchase Order as per
              agreed terms:
            </p>

            {/* ITEMS TABLE */}
            <table
              style={{ width: "100%", borderCollapse: "collapse" }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: "#007bff",
                    color: "white",
                    textAlign: "center",
                  }}
                >
                  <th style={th}>S.No</th>
                  <th style={th}>Description of Item</th>
                  <th style={th}>Unit</th>
                  <th style={th}>Qty</th>
                  <th style={th}>Rate</th>
                  <th style={th}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {itemsArray.map((item, idx) => {
                  const qty = item.quantity ?? "";
                  const rate = item.rate ?? "";
                  const amount = item.amount ?? "";

                  return (
                    <tr key={idx}>
                      <td style={td}>{idx + 1}</td>
                      <td style={td}>
                        <div
                          style={{
                            fontWeight: "bold",
                            textTransform: "uppercase",
                            marginBottom: "2px",
                          }}
                        >
                          {item.material}
                        </div>
                        <div>{item.description}</div>
                      </td>
                      <td style={td}>{item.unit}</td>
                      <td style={td}>{formatINR(qty)}</td>
                      <td style={td}>{formatINR(rate)}</td>
                      <td style={td}>{formatINR(amount)}</td>
                    </tr>
                  );
                })}

                {additionalDetails.map((item, index) => {
                  const qty = item.quantity ?? "";
                  const rate = item.rate ?? "";
                  const amount =
                    item.total ?? qty * rate;

                  return (
                    <tr key={`add-${index}`}>
                      <td style={td}>*</td>
                      <td style={td}>
                        <strong>{item.description}</strong>
                      </td>
                      <td style={td}>{item.unit}</td>
                      <td style={td}>{formatINR(qty)}</td>
                      <td style={td}>{formatINR(rate)}</td>
                      <td style={td}>{formatINR(amount)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* AMOUNT BLUE BOX */}
            <div
              style={{
                float: "right",
                width: "45%",
                marginTop: "12px",
              }}
            >
              <table
                style={{ width: "100%", borderCollapse: "collapse" }}
              >
                <tbody>
                  <tr>
                    <td style={blueLeft}>Basic Amount</td>
                    <td style={blueRight}>
                      ₹{formatINR(basicAmount)}
                    </td>
                  </tr>
                  <tr>
                    <td style={blueLeft}>
                      GST @ {gstPercent}%
                    </td>
                    <td style={blueRight}>
                      ₹{formatINR(gstAmount)}
                    </td>
                  </tr>
                  <tr>
                    <td style={blueLeft}>
                      <b>Grand Total</b>
                    </td>
                    <td style={blueRight}>
                      <b>₹{formatINR(grandTotal)}</b>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ clear: "both", marginTop: "50px" }}>
              <h4>Terms &amp; Conditions:</h4>
              <p style={{ lineHeight: "1.4" }}>
                <strong>Delivery Schedule:</strong>{" "}
                {deliverySchedule}
                <br />
                <strong>Defect Liability Period:</strong>{" "}
                {defectLiabilityPeriod}
                <br />
                <strong>Installation Scope:</strong>{" "}
                {installationScope}
                <br />
                <strong>Liquidated Damages:</strong>{" "}
                {liquidatedDamages}
                <br />
                <strong>Advance Amount:</strong> ₹
                {formatINR(advanceAmount)} &nbsp; | &nbsp;
                <strong>Balance Amount:</strong> ₹
                {formatINR(balanceAmount)}
                <br />
                <strong>Billing Address:</strong> {billingAddress}
              </p>
            </div>

            {/* FOOTER IMAGE */}
            <div
              style={{
                marginTop: "25px",
                width: "100%",
                borderTop: "2px solid #000",
              }}
            >
              <img
                src="/extra/Footer.jpeg"
                style={{ width: "100%", height: "auto" }}
              />
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button
          variant="primary"
          onClick={generatePDF}
          disabled={isGenerating}
        >
          {isGenerating ? "Generating..." : "Download PDF"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default POPreviewModal;