// export default AdminApproval;

import React, { useState, useEffect } from "react";
import {
  Card,
  Container,
  Row,
  Col,
  Button,
  Form,
  Pagination,
  Tabs,
  Tab,
  Badge,
  Modal,
} from "react-bootstrap";
import { FaDownload } from "react-icons/fa";
import PDFPreview from "../components/PDFpreview.jsx";
import axios from "axios";

/* 
=======================
OPTION B FORMATTER
=======================
✔ Only show quote_no from API
✔ If quote_no is empty → "-"
✔ Do NOT generate anything using quote_id
*/
const formatQuoteNumber = (quoteNo) => {
  return quoteNo && quoteNo.trim() !== "" ? quoteNo : "-";
};

// treat many variants of approved values as true
const isApprovedValue = (val) => {
  if (!val) return false;
  const s = String(val).trim().toLowerCase();
  return ["yes", "approved", "true", "1"].includes(s);
};

// Helper function to get round sort value
const getRoundSortValue = (roundId) => {
  if (!roundId || roundId === "Initial") return 0;
  const match = roundId.match(/^R(\d+)$/);
  return match ? parseInt(match[1]) : 0;
};

// Helper function to format display date
const formatDisplayDate = (dateStr) => {
  if (!dateStr) return "-";

  // Try simple yyyy-mm-dd
  const parts = dateStr.split("-");
  if (parts.length === 3 && parts[0].length === 4) {
    const [y, m, d] = parts;
    return `${String(d).padStart(2, "0")}-${String(m).padStart(2, "0")}-${y}`;
  }

  // Fallback: parse with Date
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yy = d.getFullYear();
    return `${dd}-${mm}-${yy}`;
  }

  // If parsing fails, just show original
  return dateStr;
};

const AdminApproval = () => {
  const [quotes, setQuotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("rate");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchQuotationList();
  }, []);

  const fetchQuotationList = async () => {
    try {
      const res = await fetch("https://nlfs.in/erp/index.php/Nlf_Erp/list_quotation  ");
      const data = await res.json();

      if (data.status === true || data.status === "true") {
        const cleanedData = (data.data || []).filter((q) => q.quote_id && q.name);

        // 🔻 Create an array of all quotation rounds similar to ClientLead.jsx
        const allQuotationRounds = [];

        cleanedData.forEach((quote) => {
          if (!quote || !quote.quote_id) return;

          const formattedQuoteNo = formatQuoteNumber(quote.quote_no);

          // Derive round identifier from revise field
          const roundIdentifier =
            quote.revise && quote.revise !== "Original"
              ? quote.revise // e.g. "R1", "R2"
              : "Initial";

          allQuotationRounds.push({
            key: `${quote.quote_id}-${roundIdentifier}`,
            quote_id: quote.quote_id,
            formattedQuoteNo: formattedQuoteNo,
            name: quote.name,
            email: quote.email || "",
            mobile: quote.mobile || "",
            total: quote.total || "0",
            city: quote.city || "",
            branch: quote.branch || "",
            product: quote.product || "",
            description: quote.desc || "",
            roundIdentifier, // Now meaningful
            date: quote.date || "", // raw API date
            revise: quote.revise || "Original",
            rate_approval: quote.rate_approval || "",
            admin_approval: quote.admin_approval || "",
          });
        });

        // 🔻 SORT: latest created/revised first (same logic as ClientLead.jsx)
        allQuotationRounds.sort((a, b) => {
          const dateA = a.date ? new Date(a.date) : new Date(0);
          const dateB = b.date ? new Date(b.date) : new Date(0);

          // 1) Newer date first
          if (dateB - dateA !== 0) return dateB - dateA;

          // 2) For same quote & same date, higher round (R2 > R1 > Initial)
          const sameQuote =
            String(a.formattedQuoteNo) === String(b.formattedQuoteNo) ||
            String(a.quote_id) === String(b.quote_id);

          if (sameQuote) {
            const rA = getRoundSortValue(a.roundIdentifier);
            const rB = getRoundSortValue(b.roundIdentifier);
            if (rB - rA !== 0) return rB - rA;
          }

          // 3) Fallback: higher quotationId first
          const idA = parseInt(a.quote_id, 10) || 0;
          const idB = parseInt(b.quote_id, 10) || 0;
          return idB - idA;
        });

        setQuotes(allQuotationRounds);
      } else {
        setQuotes([]);
      }
    } catch (error) {
      console.log("FETCH ERROR:", error);
      setQuotes([]);
    }
  };

  const handleShowModal = (action) => {
    setPendingAction(action);
    setShowConfirmModal(true);
  };

  const handleConfirmAction = () => {
    pendingAction?.execute();
    setShowConfirmModal(false);
    setPendingAction(null);
  };

  const handleCancelAction = () => {
    setShowConfirmModal(false);
    setPendingAction(null);
  };

  const handleShowPDFPreview = (item) => {
    setSelectedItem(item);
    setShowPDFPreview(true);
  };

  const handleClosePDFPreview = () => {
    setShowPDFPreview(false);
    setSelectedItem(null);
  };

  // ⭐ NEW: when rate is approved from PDFPreview, update this table
  const handleRateApprovedFromModal = (approvedQuoteId) => {
    setQuotes((prev) =>
      prev.map((q) =>
        String(q.quote_id) === String(approvedQuoteId)
          ? { ...q, rate_approval: "Yes" }
          : q
      )
    );
  };

  // ---------------- QUOTATION APPROVAL (no longer used in UI) ----------------
  const handleApproveQuotation = (quote_id) => {
    const quote = quotes.find((q) => q.quote_id === quote_id);
    const isRateApproved = isApprovedValue(quote?.rate_approval);

    if (!isRateApproved) {
      handleShowModal({
        message: "You must approve the Rate first!",
        isError: true,
        execute: () => {},
      });
      return;
    }

    const action = {
      message: "Are you sure you want to approve this Quotation?",
      execute: async () => {
        try {
          const res = await fetch(
            "https://nlfs.in/erp/index.php/Nlf_Erp/update_admin_approval",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                quote_id,
                admin_approval: "Yes",
              }),
            }
          );

          const result = await res.json();

          if (result.status === true || result.status === "true") {
            setQuotes((prev) =>
              prev.map((q) =>
                q.quote_id === quote_id
                  ? { ...q, admin_approval: "approved" }
                  : q
              )
            );

            alert("Quotation approved successfully!");
          } else {
            alert("Failed to approve quotation.");
          }
        } catch (err) {
          alert("Error: " + err.message);
        }
      },
    };

    handleShowModal(action);
  };

  const filteredQuotes = quotes.filter((q) => {
    const s = searchTerm.toLowerCase();
    return (
      (q.quote_id || "").toLowerCase().includes(s) ||
      (q.name || "").toLowerCase().includes(s) ||
      (q.date || "").toLowerCase().includes(s) ||
      (q.formattedQuoteNo || "").toLowerCase().includes(s) ||
      (q.roundIdentifier || "").toLowerCase().includes(s)
    );
  });

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentQuotes = filteredQuotes.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredQuotes.length / itemsPerPage);

  const paginate = (num) => setCurrentPage(num);

  return (
    <Container fluid>
      <Row>
        <Col md="12">
          <Card className="strpied-tabled-with-hover">
            <Tabs
              id="approval-tabs"
              activeKey={activeTab}
              onSelect={(k) => {
                setActiveTab(k);
                setSearchTerm("");
                setCurrentPage(1);
              }}
              className="mb-0 card-top-tabs"
            >
              <Tab eventKey="rate" title="Rate Approval" />
              {/* Quotation Approval tab removed */}
              <Tab eventKey="work_order" title="Work Order Approval" />
              <Tab eventKey="PO" title="PO Vendor Approval" />
            </Tabs>

            <Card.Header
              style={{
                backgroundColor: "#fff",
                marginBottom: "2rem",
                borderBottom: "none",
              }}
            >
              <Row className="align-items-center">
                <Col>
                  <Card.Title
                    style={{ marginTop: "2rem", fontWeight: "700" }}
                  >
                    Admin's Approval
                  </Card.Title>
                </Col>

                <Col className="d-flex justify-content-end align-items-center">
                  <Form.Control
                    type="text"
                    placeholder="Search by Name, Quote No, Round..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="custom-searchbar-input nav-search"
                    style={{ width: "20vw" }}
                  />
                </Col>
              </Row>
            </Card.Header>

            <Card.Body>
              {activeTab === "rate" && (
                <QuoteApprovalTable
                  quotes={currentQuotes}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  paginate={paginate}
                  onShowPDFPreview={handleShowPDFPreview}
                  approvalField="rate_approval"
                  approvalButtonLabel="Approve Rate"
                />
              )}

              {/* Quotation Approval table block removed completely */}
              {/* You can later add content for work_order / PO tabs here if needed */}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showConfirmModal} onHide={handleCancelAction} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {pendingAction?.isError ? "Error" : "Confirmation"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <p>{pendingAction?.message}</p>
        </Modal.Body>
        <Modal.Footer>
          {pendingAction?.isError ? (
            <Button variant="primary" onClick={handleCancelAction}>
              OK
            </Button>
          ) : (
            <>
              <Button variant="secondary" onClick={handleCancelAction}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleConfirmAction}>
                Yes, Proceed
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>

      {/* ⭐ Now PDFPreview is responsible for Rate Approval, same style as Admin Approval */}
      <PDFPreview
        show={showPDFPreview}
        onHide={handleClosePDFPreview}
        quoteId={selectedItem?.quote_id}
        quotationData={selectedItem}
        enableRateApproval={true}
        enableAdminApproval={false} // this page is ONLY for rate
        onRateApproved={handleRateApprovedFromModal}
      />
    </Container>
  );
};

const QuoteApprovalTable = ({
  quotes,
  currentPage,
  totalPages,
  paginate,
  onShowPDFPreview,
  approvalField = "admin_approval",
  approvalButtonLabel = "Approve",
}) => (
  <>
    <div className="table-responsive">
      <table className="table table-striped table-hover">
        <thead>
          <tr>
            <th>Sr. No.</th>
            <th>Quotation No</th>
            {/* <th>Round</th> */}
            <th>Client Name</th>
            <th>Date</th>
            <th>Amount (₹)</th>
            <th>{approvalButtonLabel}</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {quotes.length > 0 ? (
            quotes.map((item, index) => {
              const isApproved = isApprovedValue(item[approvalField]);

              return (
                <tr key={item.key}>
                  <td>{(currentPage - 1) * 10 + index + 1}</td>
                  <td>{item.formattedQuoteNo}</td>
                  {/* <td>
                    <Badge 
                      bg={item.roundIdentifier === "Initial" ? "primary" : "info"}
                      className="px-2 py-1"
                    >
                      {item.roundIdentifier}
                    </Badge>
                  </td> */}
                  <td>{item.name}</td>
                  <td>{formatDisplayDate(item.date)}</td>
                  <td>
                    ₹ {parseFloat(item.total || 0).toLocaleString("en-IN")}
                  </td>

                  {/* ✅ Click to open PDF & approve rate INSIDE the modal */}
                  <td className="text-center">
                    <Form.Check
                      type="checkbox"
                      checked={isApproved}
                      disabled={isApproved}
                      onChange={() => {
                        if (!isApproved) onShowPDFPreview(item);
                      }}
                    />
                  </td>

                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <Badge
                        className={`px-3 py-2 ${
                          isApproved
                            ? "bg-success text-light"
                            : "bg-warning text-dark"
                        }`}
                      >
                        {isApproved ? "Approved" : "Pending"}
                      </Badge>

                      {/* Download always available AFTER rate approval */}
                      {isApproved && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => onShowPDFPreview(item)}
                        >
                          <FaDownload />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="8" className="text-center p-4">
                finding quotations
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    {totalPages > 1 && (
      <div className="d-flex justify-content-center p-3">
        <Pagination>
          {Array.from({ length: totalPages }, (_, i) => (
            <Pagination.Item
              key={i + 1}
              active={i + 1 === currentPage}
              onClick={() => paginate(i + 1)}
            >
              {i + 1}
            </Pagination.Item>
          ))}
        </Pagination>
      </div>
    )}
  </>
);

export default AdminApproval;