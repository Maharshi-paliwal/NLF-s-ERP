// src/pages/ClientLead.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
import POPreviewModal from "../components/POPreviewModal";

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

// Same helper as AdminApproval.jsx
const isApprovedValue = (val) => {
  if (!val) return false;
  const s = String(val).trim().toLowerCase();
  return ["yes", "approved", "true", "1"].includes(s);
};

// display date as dd-mm-yyyy
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

// ======================
// Main Component
// ======================

export default function ClientLead() {
  const location = useLocation();
  const navigate = useNavigate();

  const [quotationRounds, setQuotationRounds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [selectedQuoteId, setSelectedQuoteId] = useState(null);

  // PO-specific state
  const [poList, setPoList] = useState([]);
  const [poLoading, setPoLoading] = useState(false);

  // Work Order list
  const [workOrderList, setWorkOrderList] = useState([]);
  const [workOrderLoading, setWorkOrderLoading] = useState(false);

  const [selectedPO, setSelectedPO] = useState(null);
  const [showPDFClientPO, setShowPDFClientPO] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const roundsPerPage = 10;

  const [fetchingQuoteNo, setFetchingQuoteNo] = useState(false);

  // ======================
  // Fetch Next Quote No  (Create Quotation)
  // ======================
  const fetchNextQuoteNumber = async () => {
    try {
      setFetchingQuoteNo(true);
      const response = await fetch(
        "https://nlfs.in/erp/index.php/Erp/get_next_quote_no"
      );

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

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

  // Called from PDFPreview after admin approves
  const handleAdminApprovedFromModal = (approvedQuoteId) => {
    setQuotationRounds((prev) =>
      prev.map((round) => {
        if (String(round.quotationId) === String(approvedQuoteId)) {
          return {
            ...round,
            adminApproval: "Yes",
            roundStatus: "accepted",
          };
        }
        return round;
      })
    );
  };

  // ======================
  // CLIENT PO PDF preview / download
  // ======================
  const handleShowPDFClientPO = async (quotationId) => {
    const quotation = quotationRounds.find(
      (q) => String(q.quotationId) === String(quotationId)
    );

    if (!quotation) {
      setError("Quotation not found");
      return;
    }

    const poEntry = poList.find((po) => {
      const candidateQuoteId = String(
        po.quote_id || po.quoteId || po.quote_no || ""
      );
      const fullQ = String(
        quotation.fullQuotationId || quotation.quote_no || ""
      );
      const numericQ = String(quotation.quotationId || "");
      return (
        candidateQuoteId === fullQ ||
        candidateQuoteId === numericQ ||
        candidateQuoteId.includes(numericQ) ||
        fullQ.includes(candidateQuoteId)
      );
    });

    if (!poEntry) {
      navigate(`/po/new/${quotationId}/initial`);
      return;
    }

    try {
      setPoLoading(true);
      setError(null);

      const quotationResponse = await fetch(
        "https://nlfs.in/erp/index.php/Nlf_Erp/get_quotation_by_id",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quote_id: String(quotationId) }),
        }
      );

      if (!quotationResponse.ok) {
        throw new Error(
          `Failed to fetch quotation: ${quotationResponse.status}`
        );
      }

      const quotationResult = await quotationResponse.json();

      if (!quotationResult.status || !quotationResult.data) {
        throw new Error("Failed to fetch quotation details");
      }

      const quotationData = quotationResult.data;

      const poResponse = await fetch(
        "https://nlfs.in/erp/index.php/Api/get_po_id",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            po_id: poEntry.po_id || poEntry.poId || poEntry.id,
          }),
        }
      );

      if (!poResponse.ok) {
        throw new Error(`HTTP error! status: ${poResponse.status}`);
      }

      const poResult = await poResponse.json();

      if (
        poResult.status !== "true" ||
        poResult.success !== "1" ||
        !poResult.data
      ) {
        throw new Error(poResult.message || "Failed to fetch PO details");
      }

      const apiData = poResult.data;

      const savedPo = {
        po_id: apiData.po_id || poEntry.po_id || "",
        po_no: apiData.po_no || poEntry.po_no || "",
        quote_id:
          apiData.quote_id ||
          quotationData.quote_no ||
          quotation.fullQuotationId ||
          "",
        date:
          apiData.date ||
          apiData.po_date ||
          new Date().toISOString().split("T")[0],
        company:
          apiData.company ||
          apiData.companyName ||
          quotationData.company ||
          "",
        site_address:
          apiData.site_address ||
          apiData.siteAddress ||
          quotationData.site_address ||
          "",
        billing_address:
          apiData.billing_address ||
          apiData.billingAddress ||
          quotationData.billing_address ||
          "",
        gst_number:
          apiData.gst_number ||
          apiData.gst ||
          quotationData.gst_number ||
          "",
        pan_number:
          apiData.pan_number ||
          apiData.panNumber ||
          quotationData.pan_number ||
          "",
        contact_person:
          apiData.contact_person ||
          apiData.contactPerson ||
          quotationData.contact_person ||
          "",
        branch:
          apiData.branch || apiData.branch_name || quotationData.branch || "",
        delivery_schedule: apiData.delivery_schedule || "",
        liquidated_damages: apiData.liquidated_damages || "",
        defect_liability_period: apiData.defect_liability_period || "",
        installation_scope: apiData.installation_scope || "",
        total_amt:
          apiData.total_amt || apiData.totalAmount || quotationData.total || "",
        total_advance: apiData.total_advance || apiData.advanceAmount || "",
        total_bal: apiData.total_bal || apiData.balanceAmount || "",
        gst: apiData.gst || "18%",
        items: (() => {
          let sourceItems =
            apiData.items ||
            apiData.item_list ||
            apiData.po_items ||
            quotationData.items ||
            [];

          return sourceItems.map((item) => {
            const qty = String(item.qty || item.quantity || "");
            const rate = String(item.rate || item.price || "");
            const amt = String(
              item.amt ||
              item.amount ||
              (parseFloat(qty) || 0) * (parseFloat(rate) || 0)
            );

            const inst_unit =
              item.inst_unit || item.install_unit || item.unit || "";
            const inst_qty = String(item.inst_qty || item.install_qty || qty);
            const inst_rate = String(
              item.inst_rate || item.install_rate || rate
            );
            const inst_amt = String(item.inst_amt || item.install_amt || amt);
            const total = String(item.total || item.totalAmount || amt);

            return {
              brand: item.brand || "",
              product: item.product || item.material || item.item_name || "",
              sub_product: item.sub_product || item.subProduct || "",
              desc: item.desc || item.description || "",
              unit: item.unit || item.uom || "",
              qty,
              rate,
              amt,
              inst_unit,
              inst_qty,
              inst_rate,
              inst_amt,
              total,
              spec_image: item.spec_image || item.spec_img || item.image || "",
            };
          });
        })(),
      };

      setSelectedPO(savedPo);
      setShowPDFClientPO(true);
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

            const roundIdentifier =
              quote.revise && quote.revise !== "Original"
                ? quote.revise
                : "Initial";

            allQuotationRounds.push({
              key: `${quote.quote_id}-${roundIdentifier}`,
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
              roundIdentifier,
              roundStatus: displayStatus,
              roundDate: quote.date || "",
              revise: quote.revise || "Original",
              rateApproval: quote.rate_approval || "",
              adminApproval: quote.admin_approval || "",
            });
          });

          allQuotationRounds.sort((a, b) => {
            const dateA = a.roundDate ? new Date(a.roundDate) : new Date(0);
            const dateB = b.roundDate ? new Date(b.roundDate) : new Date(0);

            if (dateB - dateA !== 0) return dateB - dateA;

            const sameQuote =
              String(a.fullQuotationId) === String(b.fullQuotationId) ||
              String(a.quotationId) === String(b.quotationId);

            if (sameQuote) {
              const rA = getRoundSortValue(a.roundIdentifier);
              const rB = getRoundSortValue(b.roundIdentifier);
              if (rB - rA !== 0) return rB - rA;
            }

            const idA = parseInt(a.quotationId, 10) || 0;
            const idB = parseInt(b.quotationId, 10) || 0;
            return idB - idA;
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
  }, [location.key]);

  // ======================
  // FETCH PO LIST (real data)
  // ======================
  useEffect(() => {
    const fetchPoList = async () => {
      try {
        setPoLoading(true);

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

        const message = String(result.message || "").toLowerCase();

        if (
          result.status === "true" &&
          result.success === "1" &&
          Array.isArray(result.data)
        ) {
          setPoList(result.data);
        } else if (
          message.includes("no records found") ||
          (Array.isArray(result.data) && result.data.length === 0)
        ) {
          setPoList([]);
        } else {
          throw new Error(result.message || "Failed to fetch PO list");
        }
      } catch (err) {
        console.error("Error fetching PO list:", err);
        if (!String(err.message).toLowerCase().includes("no records found")) {
          setError(err.message || "Failed to fetch PO list");
        }
      } finally {
        setPoLoading(false);
      }
    };

    fetchPoList();
  }, [location.key]);

  // ======================
  // FETCH WORK ORDER LIST
  // ======================
  useEffect(() => {
    const fetchWorkOrderList = async () => {
      try {
        setWorkOrderLoading(true);
        setError(null);

        const response = await fetch(
          "https://nlfs.in/erp/index.php/Api/list_work_order",
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

        if (
          (result.status === "true" || result.status === true) &&
          Array.isArray(result.data)
        ) {
          setWorkOrderList(result.data);
        } else {
          setWorkOrderList([]);
        }
      } catch (err) {
        console.error("Error fetching Work Order list:", err);
      } finally {
        setWorkOrderLoading(false);
      }
    };

    fetchWorkOrderList();
  }, [location.key]);

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
            <Card.Header
              style={{ backgroundColor: "#fff", borderBottom: "none" }}
            >
              <Row className="align-items-center">
                <Col>
                  <Card.Title
                    style={{ marginTop: "2rem", fontWeight: "700" }}
                  >
                    Quotation Rounds
                  </Card.Title>
                </Col>

                <Col className="d-flex justify-content-end gap-2">
                  <Form.Control
                    type="text"
                    placeholder="Search by Name, Quote No..."
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

            {error && (
              <Alert
                variant="danger"
                dismissible
                onClose={() => setError(null)}
              >
                {error}
              </Alert>
            )}

            <Card.Body className="table-full-width table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>Sr. no</th>
                    <th>Name</th>
                    <th>Quote No</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th style={{ minWidth: "220px" }}>WO / PO Action</th>
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
                        finding quotations.
                      </td>
                    </tr>
                  ) : (
                    currentRounds.map((round, index) => {
                      const showEdit = round.roundStatus === "draft";

                      const isRateApproved = isApprovedValue(
                        round.rateApproval
                      );
                      const isAdminApproved = isApprovedValue(
                        round.adminApproval
                      );

                      const poForQuote = poList.find(
                        (po) =>
                          String(po.quote_id) === String(round.fullQuotationId)
                      );
                      const hasClientPO = !!poForQuote;

                      // Work Orders linked to this quotation
                      // Work Orders linked to this quotation (STRICT match)
                      const workOrdersForQuote = workOrderList.filter((wo) => {
                        const woQuote = String(
                          wo.quto_id ||
                          wo.quote_id ||
                          wo.quotation_id ||
                          ""
                        ).trim();

                        const quoteNumId = String(round.quotationId || "").trim();
                        const quoteFull = String(round.fullQuotationId || "").trim();

                        // Only count when WO is clearly for THIS quotation:
                        // - exact match on quote_no (NLF-25-26-Q-01)
                        // - or exact match on numeric quote_id, if saved that way
                        return woQuote === quoteFull || woQuote === quoteNumId;
                      });


                      const hasAnyWorkOrder = workOrdersForQuote.length > 0;

                      // ✅ Only count as APPROVED when account approval is approved
                      const hasAccountsApprovedWorkOrder =
                        workOrdersForQuote.some((wo) =>
                          isApprovedValue(wo.acc_approval)
                        );

                      return (
                        <tr key={round.key}>
                          <td>{indexFirst + index + 1}</td>
                          <td>{round.name}</td>
                          <td>{round.fullQuotationId}</td>
                          <td>{formatDisplayDate(round.roundDate)}</td>
                          <td>
                            <span
                              className={`badge ${round.roundStatus === "accepted"
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

                          {/* WO / PO Action Column */}
                          <td>
                            {/* STEP 1: Admin approved quote, NO WO yet -> Create Work Order */}
                            {isAdminApproved &&
                              !hasAnyWorkOrder &&
                              !hasClientPO && (
                                <Link
                                  to={`/workorder/new/${round.quotationId}`}
                                >
                                  <Button size="sm" variant="warning">
                                    Create Work Order
                                  </Button>
                                </Link>
                              )}

                            {/* STEP 2: WO exists but Accounts has NOT approved yet */}
                            {isAdminApproved &&
                              hasAnyWorkOrder &&
                              !hasAccountsApprovedWorkOrder &&
                              !hasClientPO && (
                                <span
                                  className="px-2 py-1 rounded-2"
                                  style={{
                                    backgroundColor: "#ffc107",
                                    fontSize: "14px",
                                  }}
                                >
                                  WO Created (Pending Accounts Approval)
                                </span>
                              )}

                            {/* STEP 3: WO exists AND Accounts approved -> show badge + Convert to PO */}
                            {isAdminApproved &&
                              hasAccountsApprovedWorkOrder &&
                              !hasClientPO && (
                                <div className="d-flex align-items-center gap-2">
                                  <span
                                    className="px-2 py-1 rounded-2"
                                    style={{
                                      backgroundColor: "#28a745",
                                      color: "#fff",
                                      fontSize: "14px",
                                    }}
                                  >
                                    Approved Work Order
                                  </span>


                                  <Button
                                    size="sm"
                                    variant="success"
                                    onClick={() => {
                                      console.log("Navigating to PO form with quotationId:", round.quotationId);
                                      navigate(`/po/new/${round.quotationId}`);
                                    }}
                                  >
                                    Convert to PO
                                  </Button>
                                </div>
                              )}

                            {/* STEP 4: PO already exists */}
                            {hasClientPO && (
                              <span
                                style={{
                                  backgroundColor: "#0d63fd",
                                  color: "white",
                                  fontSize: "14px",
                                }}
                                className="px-2 py-1 rounded-2"
                              >
                                PO Created
                              </span>
                            )}
                          </td>

                          {/* Actions Column */}
                          <td className="d-flex gap-2">
                            {showEdit ? (
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() =>
                                  navigate(
                                    `/quotations/${round.quotationId}/edit`
                                  )
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

                            {isRateApproved && (
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() =>
                                  handleShowPDFPreview(round.quotationId)
                                }

                              >
                                <FaDownload />
                              </button>
                            )}

                            {round.roundStatus === "accepted" &&
                              hasClientPO && (
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

      {/* QUOTE PDF PREVIEW (Admin approval mode, unchanged) */}
      <PDFPreview
        show={showPDFPreview}
        onHide={handleClosePDFPreview}
        quoteId={selectedQuoteId}
        onAdminApproved={handleAdminApprovedFromModal}
      />

      {/* CLIENT PO PDF PREVIEW / DOWNLOAD */}
      <POPreviewModal
        show={showPDFClientPO}
        onHide={handleClosePDFClientPO}
        poData={selectedPO}
      />
    </Container>
  );
}
