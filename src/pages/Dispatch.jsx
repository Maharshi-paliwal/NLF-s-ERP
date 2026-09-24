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
  Alert,
  Badge,
  Pagination,
} from "react-bootstrap";
import {
  FaEye,
  FaSearch,
  FaPlus,
  FaFilePdf
} from "react-icons/fa";
import { Link } from "react-router-dom";

const Dispatch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [deliveryMemos, setDeliveryMemos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch delivery memos from API
  useEffect(() => {
    const fetchDeliveryMemos = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://nlfs.in/erp/index.php/Nlf_Erp/list_dm');
        const data = await response.json();
        
        if (data.success) {
          setDeliveryMemos(data.data);
        } else {
          setError('Failed to fetch delivery memos');
        }
      } catch (err) {
        setError('Error fetching delivery memos: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveryMemos();
  }, []);

  // Filter delivery memos based on search term
  const filteredDeliveryMemos = useMemo(() => {
    if (!searchTerm) return deliveryMemos;
    const term = searchTerm.toLowerCase();
    return deliveryMemos.filter((memo) =>
      (memo.delivery_challan_no && memo.delivery_challan_no.toLowerCase().includes(term)) ||
      (memo.destination && memo.destination.toLowerCase().includes(term)) ||
      (memo.vehicle_no && memo.vehicle_no.toLowerCase().includes(term)) ||
      (memo.lr_no && memo.lr_no.toLowerCase().includes(term)) ||
      (memo.mode_dispatch && memo.mode_dispatch.toLowerCase().includes(term))
    );
  }, [searchTerm, deliveryMemos]);

  // Reset to first page when search term changes
  useEffect(() => setCurrentPage(1), [searchTerm]);

  // Pagination logic
  const totalPages = Math.ceil(filteredDeliveryMemos.length / itemsPerPage);
  const indexLast = currentPage * itemsPerPage;
  const indexFirst = indexLast - itemsPerPage;
  const currentData = filteredDeliveryMemos.slice(indexFirst, indexLast);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <Container fluid>
      <Row>
        <Col md="12">
          <Card className="strpied-tabled-with-hover">
            <Card.Header style={{ backgroundColor: "#fff", borderBottom: "none" }}>
              <Row className="align-items-center">
                <Col>
                  <Card.Title style={{ marginTop: "2rem", fontWeight: "700" }}>
                    Delivery Memos
                  </Card.Title>
                </Col>
                <Col className="d-flex justify-content-end align-items-center gap-2">
                  <div className="position-relative">
                    <Form.Control
                      type="text"
                      placeholder="Search by Challan No, Vehicle No, Destination..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ width: "25vw", paddingRight: "35px" }}
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
                  <Button
                    as={Link}
                    to="/dispatchform"
                    className="btn btn-primary add-customer-btn"
                    style={{ width: "10vw" }}
                  >
                    <FaPlus size={14} className="me-1" /> Add Delivery Memo
                  </Button>
                </Col>
              </Row>
            </Card.Header>

            <Card.Body className="table-full-width table-responsive">
              {loading ? (
                <div className="text-center my-5">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </div>
              ) : error ? (
                <Alert variant="danger">{error}</Alert>
              ) : (
                <>
                  {/* Stats Summary */}
                  <Row className="mb-3">
                    <Col>
                      <div className="d-flex gap-3">
                        <Badge bg="primary" className="px-3 py-2">
                          Total: {filteredDeliveryMemos.length}
                        </Badge>
                        <Badge bg="info" className="px-3 py-2">
                          Showing: {indexFirst + 1}-{Math.min(indexLast, filteredDeliveryMemos.length)}
                        </Badge>
                      </div>
                    </Col>
                  </Row>

                  <Table className="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th>Sr. No.</th>
                        <th>Challan No.</th>
                        <th>Date</th>
                        <th>Mode of Dispatch</th>
                        <th>Vehicle No.</th>
                        <th>Destination</th>
                        <th>LR No.</th>
                        <th>Items</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentData.length > 0 ? (
                        currentData.map((memo, index) => (
                          <tr key={memo.dm_id}>
                            <td>{indexFirst + index + 1}</td>
                            <td>{memo.delivery_challan_no}</td>
                            <td>{formatDate(memo.date)}</td>
                            <td>
                              <span className={`badge ${memo.mode_dispatch.toLowerCase() === 'by road' ? 'bg-info' : 'bg-secondary'}`}>
                                {memo.mode_dispatch}
                              </span>
                            </td>
                            <td>{memo.vehicle_no}</td>
                            <td>{memo.destination}</td>
                            <td>{memo.lr_no}</td>
                            <td>
                              {memo.items && memo.items.length > 0 ? (
                                <div>
                                  {memo.items.length} item(s)
                                  <div className="small text-muted">
                                    {memo.items[0].description_of_goods}
                                    {memo.items.length > 1 ? "..." : ""}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-muted">No items</span>
                              )}
                            </td>
                            <td>
                              <div className="d-flex gap-2">
                                <Link to={`/dispatchform/view/${memo.dm_id}`} state={{ mode: 'view' }}>
                                  <Button variant="outline-primary" size="sm" title="View Details">
                                    <FaEye />
                                  </Button>
                                </Link>
                                {memo.packing_list_url && (
                                  <Button 
                                    as="a" 
                                    href={memo.packing_list_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    variant="outline-danger" 
                                    size="sm"
                                    title="View Packing List"
                                  >
                                    <FaFilePdf />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="9" className="text-center py-4">
                            <div className="text-muted">
                              {searchTerm ? 'No matching delivery memos found.' : 'No delivery memos available.'}
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="d-flex justify-content-center p-3">
                      <Pagination>
                        <Pagination.First
                          onClick={() => setCurrentPage(1)}
                          disabled={currentPage === 1}
                        />
                        <Pagination.Prev
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                        />
                        {Array.from({ length: totalPages }, (_, i) => (
                          <Pagination.Item
                            key={i + 1}
                            active={currentPage === i + 1}
                            onClick={() => setCurrentPage(i + 1)}
                          >
                            {i + 1}
                          </Pagination.Item>
                        ))}
                        <Pagination.Next
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        />
                        <Pagination.Last
                          onClick={() => setCurrentPage(totalPages)}
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
    </Container>
  );
};

export default Dispatch;