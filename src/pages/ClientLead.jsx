


// src/pages/ClientLead.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom"; // Combined import
import {
  Card,
  Container,
  Row,
  Col,
  Button,
  Form,
  Pagination,
  Alert,
} from "react-bootstrap";
import { FaEye, FaEdit, FaDownload, FaUser } from "react-icons/fa";
import PDFPreview from "../components/PDFpreview.jsx";
import PDFClientPO from "../components/PDFClientPO.jsx";

// ======================
// Helper & Utility Functions
// ======================

const getRoundSortValue = (roundId) => {
  if (!roundId || roundId === "Initial") return 0;
  const match = roundId.match(/^R(\d+)$/);
  return match ? parseInt(match[1]) : 0;
};

const getDisplayStatus = (status, adminApproval) => {
  if (
    adminApproval &&
    ["yes", "approved", "1"].includes(adminApproval.toLowerCase())
  ) {
    return "accepted";
  }

  if (status) {
    const s = status.toLowerCase();
    if (s === "draft") return "draft";
    if (s === "revise") return "revise";
    if (s === "pending") return "pending";
    if (s === "accepted" || s === "approved") return "accepted";
    return s;
  }

  return "draft";
};

const formatQuoteNumber = (quoteNo) => {
  return quoteNo && quoteNo.trim() !== "" ? quoteNo : "-";
};

// ⭐ ADDED: same helper you use in AdminApproval.jsx
const isApprovedValue = (val) => {
  if (!val) return false;
  const s = String(val).trim().toLowerCase();
  return ["yes", "approved", "true", "1"].includes(s);
};

// ======================
// Main Component
// ======================

export default function ClientLead() {
  const location = useLocation(); // Get the current location object
  
  const [quotationRounds, setQuotationRounds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [selectedQuoteId, setSelectedQuoteId] = useState(null);

  // PO-specific state
  const [poList, setPoList] = useState([]);        // from list_po
  const [poLoading, setPoLoading] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);
  const [showPDFClientPO, setShowPDFClientPO] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const roundsPerPage = 10;

  const [fetchingQuoteNo, setFetchingQuoteNo] = useState(false);

  const navigate = useNavigate();

  // ======================
  // Fetch Next Quote No  (Create Quotation)
  // ======================
  const fetchNextQuoteNumber = async () => {
    try {
      setFetchingQuoteNo(true);
      const response = await fetch("https://nlfs.in/erp/index.php/Erp/get_next_quote_no");

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();
      if (result.status && result.success === "1") {
        return result.next_quote_no;
      } else {
        throw new Error(result.message || "Failed to fetch next quote number");
      }
    } catch (error) {
      console.error("Error fetching next quote number:", error);
      setError(error.message || "Failed to get next quote number");
      return null;
    } finally {
      setFetchingQuoteNo(false);
    }
  };

  const handleCreateNewQuotation = async () => {
    const nextQuoteNo = await fetchNextQuoteNumber();
    if (nextQuoteNo) {
      navigate(`/new-quotation?quoteNo=${encodeURIComponent(nextQuoteNo)}`);
    }
  };

  // ======================
  // QUOTATION PDF preview
  // ======================
  const handleShowPDFPreview = (quoteId) => {
    setSelectedQuoteId(quoteId);
    setShowPDFPreview(true);
  };

  const handleClosePDFPreview = () => {
    setShowPDFPreview(false);
    setSelectedQuoteId(null);
  };

  // ======================
  // CLIENT PO PDF preview / download
  // ======================
  const handleShowPDFClientPO = async (quotationId) => {
    // First, find the quotation to get the fullQuotationId
    const quotation = quotationRounds.find(q => String(q.quotationId) === String(quotationId));
    
    if (!quotation) {
      setError("Quotation not found");
      return;
    }
    
    // Now find PO using the fullQuotationId
    const poEntry = poList.find(
      (po) => String(po.quote_id) === String(quotation.fullQuotationId)
    );

    if (!poEntry) {
      // If PO not found, navigate to PO creation
      navigate(`/po/new/${quotationId}/initial`);
      return;
    }

    try {
      setPoLoading(true);
      setError(null);

      const response = await fetch(
        "https://nlfs.in/erp/index.php/Api/get_po_id",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ po_id: poEntry.po_id }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === "true" && result.success === "1" && result.data) {
        setSelectedPO(result.data);
        setShowPDFClientPO(true);
      } else {
        throw new Error(result.message || "Failed to fetch PO details");
      }
    } catch (err) {
      console.error("Error fetching PO details:", err);
      setError(err.message || "Failed to fetch PO details");
    } finally {
      setPoLoading(false);
    }
  };

  const handleClosePDFClientPO = () => {
    setShowPDFClientPO(false);
    setSelectedPO(null);
  };

  // Latest iteration helper (still available if needed)
  const isLatestIteration = (quotationId, roundIdentifier, allRounds) => {
    const rounds = allRounds.filter((r) => r.quotationId === quotationId);
    const latest = rounds.reduce((latest, cur) => {
      const lv = getRoundSortValue(latest?.roundIdentifier || "Initial");
      const cv = getRoundSortValue(cur.roundIdentifier);
      return cv > lv ? cur : latest;
    }, null);

    return latest?.roundIdentifier === roundIdentifier;
  };

  // ======================
  // FETCH QUOTATIONS
  // ======================
  useEffect(() => {
    const fetchQuotationRounds = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          "https://nlfs.in/erp/index.php/Nlf_Erp/list_quotation"
        );
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

        const result = await response.json();

        if (result.status && result.success === "1" && Array.isArray(result.data)) {
          const allQuotationRounds = [];

          result.data.forEach((quote) => {
            if (!quote || !quote.quote_id) return;

            const formattedQuoteNo = formatQuoteNumber(quote.quote_no);
            const displayStatus = getDisplayStatus(
              quote.status,
              quote.admin_approval
            );

            allQuotationRounds.push({
              key: `${quote.quote_id}-Initial`,
              quotationId: quote.quote_id,
              fullQuotationId: formattedQuoteNo,
              name: quote.name,
              email: quote.email || "",
              mobile: quote.mobile || "",
              amount: quote.total || "0",
              city: quote.city || "",
              branch: quote.branch || "",
              product: quote.product || "",
              description: quote.desc || "",
              roundIdentifier: "Initial",
              roundStatus: displayStatus,
              roundDate: quote.date || "",
              revise: quote.revise || "Original",
              // ⭐ ADDED: store approvals from API
              rateApproval: quote.rate_approval || "",
              adminApproval: quote.admin_approval || "",
            });
          });

          setQuotationRounds(allQuotationRounds);
        } else {
          throw new Error(result.message || "Failed to fetch quotations");
        }
      } catch (err) {
        console.error(err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchQuotationRounds();
  }, []);

  // ======================
  // FETCH PO LIST (real data)
  // ======================
  useEffect(() => {
    const fetchPoList = async () => {
      try {
        setPoLoading(true);
        setError(null);

        const response = await fetch(
          "https://nlfs.in/erp/index.php/Api/list_po",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ keyword: "" }),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.status === "true" && result.success === "1" && Array.isArray(result.data)) {
          setPoList(result.data);
        } else {
          throw new Error(result.message || "Failed to fetch PO list");
        }
      } catch (err) {
        console.error("Error fetching PO list:", err);
        setError(err.message || "Failed to fetch PO list");
      } finally {
        setPoLoading(false);
      }
    };

    fetchPoList();
  }, [location.key]); // This will re-fetch when the location key changes (navigation)

  // ======================
  // Pagination + Search
  // ======================
  const filteredRounds = quotationRounds.filter((r) => {
    const term = searchTerm.toLowerCase();
    const source = `${r.name} ${r.fullQuotationId} ${r.quotationId}`.toLowerCase();
    return source.includes(term);
  });

  const indexLast = currentPage * roundsPerPage;
  const indexFirst = indexLast - roundsPerPage;
  const currentRounds = filteredRounds.slice(indexFirst, indexLast);
  const totalPages = Math.ceil(filteredRounds.length / roundsPerPage);

  const paginate = (page) => setCurrentPage(page);

  // ============================
  // RENDER
  // ============================

  return (
    <Container fluid>
      <Row>
        <Col md="12">
          <Card className="strpied-tabled-with-hover">
            <Card.Header style={{ backgroundColor: "#fff", borderBottom: "none" }}>
              <Row className="align-items-center">
                <Col>
                  <Card.Title style={{ marginTop: "2rem", fontWeight: "700" }}>
                    Quotation Rounds
                  </Card.Title>
                </Col>

                <Col className="d-flex justify-content-end gap-2">
                  <Form.Control
                    type="text"
                    placeholder="Search by Name, Quote No, revise, Status..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="custom-searchbar-input nav-search"
                    style={{ width: "20vw" }}
                  />

                  <Button
                    onClick={handleCreateNewQuotation}
                    className="add-customer-btn btn btn-primary"
                    disabled={fetchingQuoteNo}
                  >
                    {fetchingQuoteNo ? "Loading..." : "+ Create Quotation"}
                  </Button>
                </Col>
              </Row>
            </Card.Header>

            {/* ERROR ALERT */}
            {error && (
              <Alert variant="danger" dismissible onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {/* TABLE */}
            <Card.Body className="table-full-width table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>Sr. no</th>
                    <th>Name</th>
                    <th>Quote No</th>
                    <th>revise</th>
                    <th>Round Date</th>
                    <th>Status</th>
                    <th style={{ minWidth: "140px" }}>PO Action</th>
                    <th style={{ minWidth: "230px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="text-center p-4">
                        Loading quotations...
                      </td>
                    </tr>
                  ) : currentRounds.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center p-4">
                        No quotations found.
                      </td>
                    </tr>
                  ) : (
                    currentRounds.map((round, index) => {
                      const showEdit = round.roundStatus === "draft";
                      const showView = round.roundStatus !== "draft";

                      // ⭐ NEW FLAGS from stored values
                      const isRateApproved = isApprovedValue(round.rateApproval);
                      const isAdminApproved = isApprovedValue(round.adminApproval);

                      // ✅ FIX: Check for PO using the fullQuotationId, not the numeric ID
                      const poForQuote = poList.find(
                        (po) => String(po.quote_id) === String(round.fullQuotationId) // KEY CHANGE HERE
                      );
                      const hasClientPO = !!poForQuote;

                      // === DEBUGGING LOGS (Updated for clarity) ===
                      console.log(`--- Checking Quote: ${round.fullQuotationId} (ID: ${round.quotationId}) ---`);
                      console.log(`Rate Approved?`, isRateApproved, "Admin Approved?", isAdminApproved);
                      console.log(`All available PO quote_ids:`, poList.map(po => po.quote_id));
                      console.log(`Found matching PO:`, poForQuote);
                      console.log(`Has Client PO?`, hasClientPO);
                      // === END DEBUGGING LOGS ===

                      return (
                        <tr key={round.key}>
                          <td>{indexFirst + index + 1}</td>
                          <td>{round.name}</td>
                          <td>{round.fullQuotationId}</td>
                          <td>{round.revise === "Original" ? "-" : round.revise}</td>
                          <td>{round.roundDate || "-"}</td>
                          <td>
                            <span
                              className={`badge ${
                                round.roundStatus === "accepted"
                                  ? "bg-success"
                                  : round.roundStatus === "revise"
                                  ? "bg-warning"
                                  : round.roundStatus === "pending"
                                  ? "bg-info"
                                  : "bg-secondary"
                              }`}
                            >
                              {round.roundStatus}
                            </span>
                          </td>

                          {/* ✅ PO Action: Convert to PO or show that PO is created */}
                          <td>
                            {round.roundStatus === "accepted" && !hasClientPO && (
                              <Button
                                size="sm"
                                variant="success"
                                onClick={() =>
                                  navigate(`/po/new/${round.quotationId}/initial`)
                                }
                              >
                                Convert to PO
                              </Button>
                            )}

                            {round.roundStatus === "accepted" && hasClientPO && (
                              <span className="badge bg-success">PO Created</span>
                            )}
                          </td>

                          {/* ACTIONS (Edit/View, Download Quote, Download PO) */}
                          <td className="d-flex gap-2">
                            {showEdit ? (
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() =>
                                  navigate(`/quotations/${round.quotationId}/edit`)
                                }
                              >
                                <FaEdit size={15} />
                              </button>
                            ) : (
                              <Link
                                to={`/quotations/${round.quotationId}/initial?view=true`}
                              >
                                <button
                                  className="buttonEye"
                                  style={{ color: "white" }}
                                >
                                  <FaEye size={15} />
                                </button>
                              </Link>
                            )}

                            {/* ⭐ STEP 1: show QUOTE PDF download when RATE is approved */}
                            {isRateApproved && (
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() =>
                                  handleShowPDFPreview(round.quotationId)
                                }
                                style={{ color: "red" }}
                              >
                                <FaDownload size={15} />
                              </button>
                            )}

                            {/* ✅ DOWNLOAD PO – only if PO exists AND quotation accepted */}
                            {round.roundStatus === "accepted" && hasClientPO && (
                              <button
                                className="btn btn-sm btn-dark text-white"
                                onClick={() =>
                                  handleShowPDFClientPO(round.quotationId)
                                }
                                title="Download Client PO"
                              >
                                <FaUser size={15} className="me-1" />
                                Download PO
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center p-3">
                  <Pagination>
                    <Pagination.First
                      onClick={() => paginate(1)}
                      disabled={currentPage === 1}
                    />
                    <Pagination.Prev
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                    />

                    {Array.from({ length: totalPages }, (_, i) => (
                      <Pagination.Item
                        key={i + 1}
                        active={currentPage === i + 1}
                        onClick={() => paginate(i + 1)}
                      >
                        {i + 1}
                      </Pagination.Item>
                    ))}

                    <Pagination.Next
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    />
                    <Pagination.Last
                      onClick={() => paginate(totalPages)}
                      disabled={currentPage === totalPages}
                    />
                  </Pagination>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* QUOTE PDF PREVIEW */}
      <PDFPreview
        show={showPDFPreview}
        onHide={handleClosePDFPreview}
        quoteId={selectedQuoteId}
      />

      {/* CLIENT PO PDF PREVIEW / DOWNLOAD */}
      <PDFClientPO
        show={showPDFClientPO}
        onHide={handleClosePDFClientPO}
        poData={selectedPO}
      />
    </Container>
  );
}
