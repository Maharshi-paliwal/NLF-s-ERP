import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Table,
  Spinner,
  Modal,
  Pagination
} from "react-bootstrap";
import { FaEye, FaSearch, FaStore, FaDownload } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

import PDFVendorPO from "../components/PDFVendorPO.jsx";
import { poVendor } from "../data/mockdata";

const API_BASE = "https://nlfs.in/erp/index.php/Api";

export default function Design() {
  const [searchTerm, setSearchTerm] = useState("");
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Number of items per page

  const [showPDFVendorPO, setShowPDFVendorPO] = useState(false);
  const [selectedVendorPOs, setSelectedVendorPOs] = useState([]);
  const [showRemarksModal, setShowRemarksModal] = useState(false);
  const [activePO, setActivePO] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [designRemark, setDesignRemark] = useState("");

  // { [po_id]: { [product_name]: remark } }
  const [remarksStore, setRemarksStore] = useState({});

  const location = useLocation();
  const viewContext = location.state?.viewContext;

  // 🔹 Fetch Purchase Orders
  useEffect(() => {
    const fetchPurchaseOrders = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/list_po`);

        if (String(res.data?.success) === "1") {
          setPurchaseOrders(res.data.data || []);
        } else {
          toast.error("Failed to fetch purchase orders");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error loading purchase orders");
      } finally {
        setLoading(false);
      }
    };

    fetchPurchaseOrders();
  }, []);

  // 🔹 Compute total amount for display
  const enrichedPOs = useMemo(() => {
    return purchaseOrders.map((po) => {
      const totalAmt = po.items?.reduce((sum, item) => {
        const amt = parseFloat(item.total) || 0;
        return sum + amt;
      }, 0);
      return {
        ...po,
        computedTotal: totalAmt.toFixed(2),
      };
    });
  }, [purchaseOrders]);

  // 🔹 Search filter
  const filteredPOs = useMemo(() => {
    if (!searchTerm) return enrichedPOs;

    const term = searchTerm.toLowerCase();
    return enrichedPOs.filter(
      (po) =>
        po.po_no?.toLowerCase().includes(term) ||
        po.quote_id?.toLowerCase().includes(term)
    );
  }, [searchTerm, enrichedPOs]);

  // 🔹 Pagination logic
  const indexLast = currentPage * itemsPerPage;
  const indexFirst = indexLast - itemsPerPage;
  const currentPOs = filteredPOs.slice(indexFirst, indexLast);
  const totalPages = Math.ceil(filteredPOs.length / itemsPerPage);

  const paginate = (page) => setCurrentPage(page);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // 🔹 Vendor PO PDF handler (match by po_no)
  const handleShowPDFVendorPO = (poNo) => {
    const matchedPOs = poVendor.filter((po) => po.workOrderId === poNo); // assuming workOrderId maps to po_no in mock

    if (matchedPOs.length) {
      setSelectedVendorPOs(matchedPOs);
      setShowPDFVendorPO(true);
    } else {
      toast.error("No Vendor PO found for this Purchase Order");
    }
  };

  const openRemarksModal = (po) => {
    setActivePO(po);
    setSelectedProduct("");
    setDesignRemark("");
    setShowRemarksModal(true);
  };

  const saveRemark = () => {
    if (!selectedProduct || !designRemark.trim()) {
      toast.error("Select product and enter remark");
      return;
    }

    setRemarksStore((prev) => ({
      ...prev,
      [activePO.po_id]: {
        ...(prev[activePO.po_id] || {}),
        [selectedProduct]: designRemark,
      },
    }));

    toast.success("Design remark saved");
    setShowRemarksModal(false);
  };

  return (
    <Container fluid>
      <Row>
        <Col md="12">
          <Card className="strpied-tabled-with-hover">
            <Card.Header style={{ background: "#fff", borderBottom: "none" }}>
              <Row className="align-items-center">
                <Col>
                  <Card.Title style={{ marginTop: "2rem", fontWeight: 700 }}>
                    Design (Purchase Orders)
                  </Card.Title>
                </Col>

                <Col className="d-flex justify-content-end">
                  <div className="position-relative">
                    <Form.Control
                      type="text"
                      placeholder="Search PO / Quotation..."
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
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" />
                </div>
              ) : (
                <>
                  <Table className="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th>Sr. No.</th>
                        <th>Purchase Order No</th>
                        <th>Quotation No</th>
                        <th>Date</th>
                        <th>Total Amount</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {currentPOs.map((po, index) => (
                        <tr key={po.po_id}>
                          <td>{indexFirst + index + 1}</td>
                          <td>{po.po_no}</td>
                          <td>{po.quote_id}</td>
                          <td>{po.date}</td>
                          <td>₹{po.computedTotal}</td>
                          <td>
                            <Button
                              size="sm"
                              variant="danger"
                              className="me-3"
                              onClick={() => openRemarksModal(po)}
                            >
                              Remarks
                            </Button>

                            <Button
                              as={Link}
                              to={`/designsubpage/${po.po_id}`}
                              state={{ po_id: po.po_id }}
                              className="buttonEye"
                            >
                              <FaEye />
                            </Button>
                          </td>
                        </tr>
                      ))}

                      {!currentPOs.length && (
                        <tr>
                          <td colSpan="6" className="text-center">
                            No Purchase Orders found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>

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
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <PDFVendorPO
        show={showPDFVendorPO}
        onHide={() => {
          setShowPDFVendorPO(false);
          setSelectedVendorPOs([]);
        }}
        vendorPODataArray={selectedVendorPOs}
      />

      <Modal
        show={showRemarksModal}
        onHide={() => setShowRemarksModal(false)}
        centered
      >
        <Modal.Header closeButton className="add-customer-btn text-white">
          <Modal.Title>Design Remarks</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {activePO && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Purchase Order No</Form.Label>
                <Form.Control value={activePO.po_no} disabled />
              </Form.Group>

              <Form.Group>
                <Form.Label>Design Remarks</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Enter design remarks..."
                  value={designRemark}
                  onChange={(e) => setDesignRemark(e.target.value)}
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRemarksModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={saveRemark}>
            Save Remark
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}