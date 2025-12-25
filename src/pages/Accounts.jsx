// src/pages/Accounts.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Table,
  Badge,
  Button,
  Pagination,
} from "react-bootstrap";
import { FaSearch, FaDownload, FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // 👈 Import useNavigate
import toast from "react-hot-toast";
import axios from "axios";
import PDFWorkorder from "../components/PDFworkorder.jsx";
// 👈 ViewWorkOrder import is no longer needed here

const API_BASE = "https://nlfs.in/erp/index.php/Api";

// same helper you used in AdminApproval
const isApprovedValue = (val) => {
  if (!val) return false;
  const s = String(val).trim().toLowerCase();
  return ["yes", "approved", "true", "1"].includes(s);
};

export default function Accounts() {
  const navigate = useNavigate(); // 👈 Initialize navigate
  const [searchTerm, setSearchTerm] = useState("");
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // State for PDF preview modal
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);

  // 👈 State for ViewWorkOrder modal is removed
  // const [showViewWorkOrder, setShowViewWorkOrder] = useState(false);
  // const [selectedWorkOrderId, setSelectedWorkOrderId] = useState(null);

  // ---- Fetch from list_work_order API ----
  useEffect(() => {
    const fetchWorkOrders = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/list_work_order`);
        if (res.data?.success) {
          setWorkOrders(res.data.data || []);
        } else {
          toast.error(res.data?.message || "Failed to fetch work orders");
        }
      } catch (err) {
        console.error("Error fetching work orders:", err);
        toast.error("Error fetching work orders");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkOrders();
  }, []);

  // reset to page 1 whenever search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // ---- Approve account (checkbox click) ----
  const handleAccountApproval = async (workId) => {
    try {
      setUpdatingId(workId);
      const payload = {
        work_id: String(workId),
        acc_approval: "Approved",
      };
      const res = await axios.post(
        "https://nlfs.in/erp/index.php/Nlf_Erp/update_account_approval",
        payload
      );
      if (res.data?.status === true || res.data?.status === "true") {
        toast.success(
          res.data?.message || "Account approval updated successfully"
        );
        setWorkOrders((prev) =>
          prev.map((wo) =>
            String(wo.work_id) === String(workId)
              ? { ...wo, acc_approval: "Approved" }
              : wo
          )
        );
      } else {
        toast.error(res.data?.message || "Failed to update account approval");
      }
    } catch (err) {
      console.error("Error updating account approval:", err);
      toast.error("Error updating account approval");
    } finally {
      setUpdatingId(null);
    }
  };

  // ---- Show PDF preview ----
  const handleShowPDFPreview = (workOrder) => {
    setSelectedWorkOrder(workOrder);
    setShowPDFPreview(true);
  };

  // ---- Close PDF preview ----
  const handleClosePDFPreview = () => {
    setShowPDFPreview(false);
    setSelectedWorkOrder(null);
  };

  // 👈 Functions for ViewWorkOrder modal are removed
  // const handleShowViewWorkOrder = (workOrderId) => { ... };
  // const handleCloseViewWorkOrder = () => { ... };

  // ---- Update account approval from PDF preview ----
  const handleAccountApprovedFromModal = (approvedWorkOrderId) => {
    setWorkOrders((prev) =>
      prev.map((wo) =>
        String(wo.work_id) === String(approvedWorkOrderId)
          ? { ...wo, acc_approval: "Approved" }
          : wo
      )
    );
  };

  // ---- Search + sort (latest first) ----
  const filteredWorkOrders = useMemo(() => {
    let data = [...workOrders].sort(
      (a, b) => Number(b.work_id) - Number(a.work_id)
    );
    if (!searchTerm) return data;
    const q = searchTerm.toLowerCase();
    return data.filter(
      (wo) =>
        (wo.wo_no || "").toLowerCase().includes(q) ||
        (wo.quo_id || "").toLowerCase().includes(q) ||
        (wo.po_no || "").toLowerCase().includes(q) ||
        (wo.general_design || "").toLowerCase().includes(q) ||
        (wo.color_scheme || "").toLowerCase().includes(q)
    );
  }, [searchTerm, workOrders]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredWorkOrders.length / itemsPerPage)
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedWorkOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredWorkOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredWorkOrders, currentPage]);

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
                    Accounts
                  </Card.Title>
                </Col>
                <Col className="d-flex justify-content-end align-items-center gap-2">
                  <div className="position-relative">
                    <Form.Control
                      type="text"
                      placeholder="Search W.O., Quotation, Design..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ width: "20vw", paddingRight: "35px" }}
                    />
                    <FaSearch
                      className="position-absolute"
                      style={{
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#999",
                      }}
                    />
                  </div>
                </Col>
              </Row>
            </Card.Header>
            <Card.Body className="table-full-width table-responsive">
              <Table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>Sr. No.</th>
                    <th>Work Order No</th>
                    <th>Payment Term</th>
                    <th>Advance Amt</th>
                    <th>Balance Amt</th>
                    <th>Account Approval</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan="7" className="text-center">
                        Loading work orders...
                      </td>
                    </tr>
                  )}
                  {!loading &&
                    paginatedWorkOrders.map((workOrder, index) => {
                      const approved = isApprovedValue(workOrder.acc_approval);
                      const srNo =
                        (currentPage - 1) * itemsPerPage + (index + 1);
                      return (
                        <tr key={workOrder.work_id}>
                          <td>{srNo}</td>
                          <td>{workOrder.wo_no}</td>
                          <td>{workOrder.payment_term}</td>
                          <td>{workOrder.advance_amt}</td>
                          <td>{workOrder.bal_amt}</td>
                          <td className="text-center">
                            <Form.Check
                              type="checkbox"
                              checked={approved}
                              disabled={
                                approved ||
                                updatingId === workOrder.work_id
                              }
                              onChange={() => {
                                if (!approved) {
                                  handleShowPDFPreview(workOrder);
                                }
                              }}
                            />
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <Badge
                                className={`px-3 py-2 ${
                                  approved
                                    ? "bg-success text-light"
                                    : "bg-warning text-dark"
                                }`}
                              >
                                {approved ? "Approved" : "Pending"}
                              </Badge>
                              {/* 👇 UPDATED View Button */}
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() =>
                                  navigate(`/workorder/view/${workOrder.work_id}`)
                                }
                                title="View Work Order"
                              >
                                <FaEye />
                              </Button>
                              {/* Download button remains the same */}
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() =>
                                  handleShowPDFPreview(workOrder)
                                }
                                title="Download Work Order"
                              >
                                <FaDownload />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  {!loading && filteredWorkOrders.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center">
                        No Work Orders found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
              {/* Pagination controls */}
              {filteredWorkOrders.length > itemsPerPage && (
                <Row className="mt-3">
                  <Col className="d-flex justify-content-center">
                    <Pagination>
                      <Pagination.First
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(1)}
                      />
                      <Pagination.Prev
                        disabled={currentPage === 1}
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                      />
                      {Array.from({ length: totalPages }, (_, i) => (
                        <Pagination.Item
                          key={i + 1}
                          active={i + 1 === currentPage}
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </Pagination.Item>
                      ))}
                      <Pagination.Next
                        disabled={currentPage === totalPages}
                        onClick={() =>
                          setCurrentPage((p) =>
                            Math.min(totalPages, p + 1)
                          )
                        }
                      />
                      <Pagination.Last
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(totalPages)}
                      />
                    </Pagination>
                  </Col>
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      {/* PDF Preview Modal */}
      <PDFWorkorder
        show={showPDFPreview}
        onHide={handleClosePDFPreview}
        workOrderId={selectedWorkOrder?.work_id}
        workOrderData={selectedWorkOrder}
        enableAccountApproval={true}
        onAccountApproved={handleAccountApprovedFromModal}
      />
      {/* 👈 ViewWorkOrder Modal is removed */}
    </Container>
  );
}