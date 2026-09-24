

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
} from "react-bootstrap";
import { FaDownload, FaEye } from "react-icons/fa";
import PDFRatePreview from "../components/PDFratepreview";

/* 
=======================
OPTION B FORMATTER
=======================
*/
const formatQuoteNumber = (quoteNo) => {
  return quoteNo && quoteNo.trim() !== "" ? quoteNo : "-";
};

const isApprovedValue = (val) => {
  if (!val) return false;
  const s = String(val).trim().toLowerCase();
  return ["yes", "approved", "true", "1"].includes(s);
};

const getRoundSortValue = (roundId) => {
  if (!roundId || roundId === "Initial") return 0;
  const match = roundId.match(/^R(\d+)$/);
  return match ? parseInt(match[1]) : 0;
};

const formatDisplayDate = (dateStr) => {
  if (!dateStr) return "-";
  const parts = dateStr.split("-");
  if (parts.length === 3 && parts[0].length === 4) {
    const [y, m, d] = parts;
    return `${String(d).padStart(2, "0")}-${String(m).padStart(2, "0")}-${y}`;
  }
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yy = d.getFullYear();
    return `${dd}-${mm}-${yy}`;
  }
  return dateStr;
};

const RateApprove = () => {
  const [quotes, setQuotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  // State for the 3 status tabs
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'pending', 'approved'

  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchQuotationList();
  }, []);

  const fetchQuotationList = async () => {
    try {
      // Fetching data from the same endpoint
      const res = await fetch("https://nlfs.in/erp/index.php/Nlf_Erp/list_quotation");
      const data = await res.json();

      if (data.status === true || data.status === "true") {
        // Filter out quotes without basic info, but keep those with role for checking below
        const cleanedData = (data.data || []).filter((q) => q.quote_id && q.name);

        const allQuotationRounds = [];

        cleanedData.forEach((quote) => {
          // ✅ FIX: Skip quotes created by admin as they bypass rate approval
          if (quote.role === "admin") return; 

          if (!quote || !quote.quote_id) return;

          const formattedQuoteNo = formatQuoteNumber(quote.quote_no);

          const roundIdentifier =
            quote.revise && quote.revise !== "Original"
              ? quote.revise
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
            roundIdentifier,
            date: quote.date || "",
            revise: quote.revise || "Original",
            rate_approval: quote.rate_approval || "",
            admin_approval: quote.admin_approval || "",
          });
        });

        // Sorting logic: Latest date first, then higher round number
        allQuotationRounds.sort((a, b) => {
          const dateA = a.date ? new Date(a.date) : new Date(0);
          const dateB = b.date ? new Date(b.date) : new Date(0);

          if (dateB - dateA !== 0) return dateB - dateA;

          const sameQuote =
            String(a.formattedQuoteNo) === String(b.formattedQuoteNo) ||
            String(a.quote_id) === String(b.quote_id);

          if (sameQuote) {
            const rA = getRoundSortValue(a.roundIdentifier);
            const rB = getRoundSortValue(b.roundIdentifier);
            if (rB - rA !== 0) return rB - rA;
          }

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

  const handleShowPDFPreview = (item) => {
    setSelectedItem(item);
    setShowPDFPreview(true);
  };

  const handleClosePDFPreview = () => {
    setShowPDFPreview(false);
    setSelectedItem(null);
  };

  // Callback to update the table state when rate is approved inside the modal
  const handleRateApprovedFromModal = (approvedQuoteId) => {
    setQuotes((prev) =>
      prev.map((q) =>
        String(q.quote_id) === String(approvedQuoteId)
          ? { ...q, rate_approval: "Yes" }
          : q
      )
    );
  };

  // Combined Filtering Logic: Search Term + Status Tab
 const filteredQuotes = quotes
  .filter((q) => {
    const s = searchTerm.toLowerCase();
    return (
      (q.quote_id || "").toLowerCase().includes(s) ||
      (q.name || "").toLowerCase().includes(s) ||
      (q.date || "").toLowerCase().includes(s) ||
      (q.formattedQuoteNo || "").toLowerCase().includes(s) ||
      (q.roundIdentifier || "").toLowerCase().includes(s)
    );
  })
  // Apply Tab Filter
  .filter((q) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "approved") return isApprovedValue(q.rate_approval);
    if (statusFilter === "pending") return !isApprovedValue(q.rate_approval);
    return true;
  })
  .sort((a, b) => {
    // 1️⃣ Latest quotation first (quote_id DESC)
    const qA = parseInt(a.quote_id, 10) || 0;
    const qB = parseInt(b.quote_id, 10) || 0;
    if (qB !== qA) return qB - qA;

    // 2️⃣ Same quotation → higher revision first (R2 > R1 > Initial)
    const rA = getRoundSortValue(a.roundIdentifier);
    const rB = getRoundSortValue(b.roundIdentifier);
    return rB - rA;
  });


  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentQuotes = filteredQuotes.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredQuotes.length / itemsPerPage);

  const paginate = (num) => setCurrentPage(num);

  // Reset page when filters change
  const handleTabSelect = (k) => {
    setStatusFilter(k);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <Container fluid>
      <Row>
        <Col md="12">
          <Card className="strpied-tabled-with-hover">
            <Card.Header
              style={{
                backgroundColor: "#fff",
                marginBottom: "2rem",
                borderBottom: "none",
              }}
            >
              <Row className="align-items-center">
                <Col>
                  <Card.Title style={{ marginTop: "1rem", fontWeight: "700" }}>
                    Rate Approval
                  </Card.Title>
                </Col>

                <Col className="d-flex justify-content-end align-items-center">
                  <Form.Control
                    type="text"
                    placeholder="Search by Name, Quote No, Round..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="custom-searchbar-input nav-search"
                    style={{ width: "20vw" }}
                  />
                </Col>
              </Row>
            </Card.Header>

            <Card.Body>
              {/* Status Filter Tabs */}
              <Tabs
                id="rate-status-tabs"
                activeKey={statusFilter}
                onSelect={handleTabSelect}
                className="mb-4"
              >
                <Tab eventKey="all" title="All" />
                <Tab eventKey="pending" title="Pending" />
                <Tab eventKey="approved" title="Approved" />
              </Tabs>

              <RateApprovalTable
                quotes={currentQuotes}
                currentPage={currentPage}
                totalPages={totalPages}
                paginate={paginate}
                onShowPDFPreview={handleShowPDFPreview}
                approvalField="rate_approval"
                approvalButtonLabel="Approve Rate"
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* PDF Preview Modal for Approval */}
     <PDFRatePreview
  show={showPDFPreview}
  onHide={handleClosePDFPreview}
  quoteId={selectedItem?.quote_id}
  quotationData={selectedItem}
  enableRateApproval={true}
  enableAdminApproval={false}
  onRateApproved={handleRateApprovedFromModal}
/>

    </Container>
  );
};

// Sub-component for the Table
const RateApprovalTable = ({
  quotes,
  currentPage,
  totalPages,
  paginate,
  onShowPDFPreview,
  approvalField = "rate_approval",
  approvalButtonLabel = "Approve",
}) => (
  <>
    <div className="table-responsive">
      <table className="table table-striped table-hover">
        <thead>
          <tr>
            <th>Sr. No.</th>
            <th>Quotation No</th>
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
                  <td>
                    <div>
                      {item.formattedQuoteNo}  
                    </div>
                  </td>
                  <td>{item.name}</td>
                  <td>{formatDisplayDate(item.date)}</td>
                  <td>
                    ₹ {parseFloat(item.total || 0).toLocaleString("en-IN")}
                  </td>

                  {/* Action: Checkbox opens PDF */}
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

                  {/* Status Badge + Download Button */}
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

                      {isApproved && (
                        <Button
                         className="buttonEye"
                          size="sm"
                          onClick={() => onShowPDFPreview(item)}
                          title="Download PDF"
                        >
                          <FaEye />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="7" className="text-center p-4">
                Finding quotations 
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

export default RateApprove;