// Store.jsx – DESIGN-ALIGNED & API CORRECT
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
} from "react-bootstrap";
import { FaEye, FaSearch, FaStore, FaDownload } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

import PDFVendorPO from "../components/PDFVendorPO.jsx";
import { poVendor } from "../data/mockdata";

const API_BASE = "https://nlfs.in/erp/index.php/Api";

export default function Store() {
  const [searchTerm, setSearchTerm] = useState("");
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showPDFVendorPO, setShowPDFVendorPO] = useState(false);
  const [selectedVendorPOs, setSelectedVendorPOs] = useState([]);

  const location = useLocation();
  const viewContext = location.state?.viewContext;

  /* ───────────────── Fetch Work Orders (SAME AS DESIGN) ───────────────── */
  useEffect(() => {
    const fetchWorkOrders = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/list_work_order`);

        // ✅ IMPORTANT FIX: success is NUMBER, not string
        if (res.data?.success === 1) {
          setWorkOrders(res.data.data || []);
        } else {
          toast.error("Failed to fetch work orders");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error loading work orders");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkOrders();
  }, []);

  /* ───────────────── Search Filter (SAME AS DESIGN) ───────────────── */
  const filteredWorkOrders = useMemo(() => {
    if (!searchTerm) return workOrders;

    const term = searchTerm.toLowerCase();
    return workOrders.filter(
      (wo) =>
        wo.wo_no?.toLowerCase().includes(term) ||
        wo.quto_id?.toLowerCase().includes(term)
    );
  }, [searchTerm, workOrders]);

  /* ───────────────── Vendor PO PDF (SAME AS DESIGN) ───────────────── */
  const handleShowPDFVendorPO = (woNo) => {
    const matchedPOs = poVendor.filter(
      (po) => po.workOrderId === woNo
    );

    if (matchedPOs.length) {
      setSelectedVendorPOs(matchedPOs);
      setShowPDFVendorPO(true);
    } else {
      toast.error("No Vendor PO found for this Work Order");
    }
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
                    Store
                  </Card.Title>
                </Col>

                <Col className="d-flex justify-content-end">
                  <div className="position-relative">
                    <Form.Control
                      type="text"
                      placeholder="Search WO / Quotation..."
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
                <Table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>Sr. No.</th>
                      <th>Work Order No</th>
                      <th>Quotation No</th>
                      <th>Delivery Date</th>
                      <th>Account Approval</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredWorkOrders.map((wo, index) => (
                      <tr key={wo.work_id}>
                        <td>{index + 1}</td>
                        <td>{wo.wo_no}</td>
                        <td>{wo.quto_id}</td>
                        <td>{wo.exp_delivery_date}</td>
                        <td>{wo.acc_approval}</td>

                        <td>
                          <Button
                            as={Link}
                            to="/storenewvendor"
                            size="sm"
                            variant="success"
                            className="me-3"
                          >
                            Vendor PO
                          </Button>

                          <button
                            className="btn btn-sm btn-outline-dark text-danger me-3"
                            onClick={() => handleShowPDFVendorPO(wo.wo_no)}
                          >
                            <FaDownload size={14} />
                          </button>

                          <Button
                            as={Link}
                            to={`/storesubpage/${wo.work_id}`}
                            className="buttonEye me-3"
                            style={{ background: "#ed3131" }}
                          >
                            <FaStore />
                          </Button>

                          <Button
                            as={Link}
                            to={
                              viewContext === "store"
                                ? `/store/${wo.work_id}`
                                : `/storeworkorderform/${wo.work_id}`
                            }
                            state={{ viewContext: viewContext || "operations" }}
                            className="buttonEye"
                          >
                            <FaEye />
                          </Button>
                        </td>
                      </tr>
                    ))}

                    {!filteredWorkOrders.length && (
                      <tr>
                        <td colSpan="6" className="text-center">
                          No Work Orders found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
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
    </Container>
  );
}
