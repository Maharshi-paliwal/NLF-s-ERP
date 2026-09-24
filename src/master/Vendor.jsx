// src/VendorMaster.jsx
import React, { useState, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Table,
  Pagination,
} from "react-bootstrap";
import { FaPlus, FaSearch, FaTrash } from "react-icons/fa";
import toast from "react-hot-toast";

const VendorMaster = () => {
  /* ---------------- STATE ---------------- */
  const [vendorSearch, setVendorSearch] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [address, setAddress] = useState("");
  const [contact, setContact] = useState("");

  const [vendors, setVendors] = useState([]);

  /* ---------------- PAGINATION ---------------- */
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  /* ---------------- SEARCH ---------------- */
  const filteredVendors = useMemo(() => {
    if (!vendorSearch) return vendors;
    const s = vendorSearch.toLowerCase();

    return vendors.filter(
      (v) =>
        v.name.toLowerCase().includes(s) ||
        v.address.toLowerCase().includes(s) ||
        v.contact.toLowerCase().includes(s)
    );
  }, [vendorSearch, vendors]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVendors = filteredVendors.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredVendors.length / itemsPerPage);

  const handlePageChange = (page) => setCurrentPage(page);

  /* ---------------- ADD VENDOR ---------------- */
  const handleAddVendor = (e) => {
    e.preventDefault();

    if (!vendorName.trim()) return toast.error("Enter vendor name");
    if (!address.trim()) return toast.error("Enter address");
    if (!contact.trim()) return toast.error("Enter contact details");

    const newVendor = {
      id: Date.now(),
      name: vendorName.trim(),
      address: address.trim(),
      contact: contact.trim(),
    };

    setVendors((prev) => [newVendor, ...prev]);

    setVendorName("");
    setAddress("");
    setContact("");
    setCurrentPage(1);

    toast.success("Vendor added");
  };

  /* ---------------- DELETE VENDOR ---------------- */
  const deleteVendor = (id) => {
    if (!window.confirm("Are you sure?")) return;

    setVendors((prev) => prev.filter((v) => v.id !== id));
    toast.success("Vendor deleted");
  };

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
                    style={{ marginTop: "2rem", fontWeight: 700 }}
                  >
                    Vendor Master
                  </Card.Title>
                </Col>

                {/* Search */}
                <Col className="d-flex justify-content-end">
                  <div className="position-relative">
                    <Form.Control
                      placeholder="Search vendor..."
                      value={vendorSearch}
                      onChange={(e) => {
                        setVendorSearch(e.target.value);
                        setCurrentPage(1);
                      }}
                      style={{ width: "20vw", paddingRight: "35px" }}
                    />
                    <FaSearch
                      className="position-absolute"
                      style={{
                        right: 10,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#999",
                      }}
                    />
                  </div>
                </Col>
              </Row>
            </Card.Header>

            <Card.Body>
              {/* Add Vendor */}
              <Form onSubmit={handleAddVendor} className="mb-3 d-flex gap-2">
                <Form.Control
                  placeholder="Vendor Name"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                />
                <Form.Control
                  placeholder="Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
                <Form.Control
                  placeholder="Contact Details"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                />
                <Button type="submit" className="add-customer-btn">
                  <FaPlus size={14} className="me-1" /> Add Vendor
                </Button>
              </Form>

              {/* Vendor Table */}
              <div className="table-full-width table-responsive">
                <Table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>Sr. No.</th>
                      <th>Vendor Name</th>
                      <th>Address</th>
                      <th>Contact</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentVendors.length > 0 ? (
                      currentVendors.map((v, index) => (
                        <tr key={v.id}>
                          <td>{indexOfFirstItem + index + 1}</td>
                          <td>{v.name}</td>
                          <td>{v.address}</td>
                          <td>{v.contact}</td>
                          <td>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => deleteVendor(v.id)}
                            >
                              <FaTrash />
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center">
                          No vendors found.
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
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                      />
                      <Pagination.Prev
                        onClick={() =>
                          handlePageChange(currentPage - 1)
                        }
                        disabled={currentPage === 1}
                      />
                      {Array.from({ length: totalPages }, (_, i) => (
                        <Pagination.Item
                          key={i + 1}
                          active={i + 1 === currentPage}
                          onClick={() => handlePageChange(i + 1)}
                        >
                          {i + 1}
                        </Pagination.Item>
                      ))}
                      <Pagination.Next
                        onClick={() =>
                          handlePageChange(currentPage + 1)
                        }
                        disabled={currentPage === totalPages}
                      />
                      <Pagination.Last
                        onClick={() =>
                          handlePageChange(totalPages)
                        }
                        disabled={currentPage === totalPages}
                      />
                    </Pagination>Vendor Address
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default VendorMaster;
