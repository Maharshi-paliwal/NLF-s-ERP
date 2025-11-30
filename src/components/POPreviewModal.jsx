// import React, { useRef } from "react";
// import { Modal, Button, Table, Row, Col } from "react-bootstrap";
// import html2canvas from "html2canvas";
// import jsPDF from "jspdf";
// import { FaDownload } from "react-icons/fa";

// const POPreviewModal = ({ show, onHide, poData }) => {
//     const componentRef = useRef();

//     const handleDownload = async () => {
//         const element = componentRef.current;
//         if (!element) return;

//         try {
//             const canvas = await html2canvas(element, {
//                 scale: 2,
//                 useCORS: true,
//                 logging: false,
//                 windowWidth: element.scrollWidth,
//                 windowHeight: element.scrollHeight
//             });

//             const imgData = canvas.toDataURL("image/png");
//             const pdf = new jsPDF("p", "mm", "a4");
//             const pdfWidth = pdf.internal.pageSize.getWidth();
//             const pdfHeight = pdf.internal.pageSize.getHeight();
//             const imgWidth = canvas.width;
//             const imgHeight = canvas.height;
//             const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

//             const imgX = (pdfWidth - imgWidth * ratio) / 2;
//             const imgY = 10; // Top margin

//             pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, (imgHeight * pdfWidth) / imgWidth);
//             pdf.save(`PO_${poData.poNumber || "Draft"}.pdf`);
//         } catch (error) {
//             console.error("Error generating PDF:", error);
//         }
//     };

//     // Helper to format currency
//     const formatCurrency = (amount) => {
//         if (!amount) return "0.00";
//         return parseFloat(amount).toLocaleString('en-IN', {
//             minimumFractionDigits: 2,
//             maximumFractionDigits: 2
//         });
//     };

//     // Calculate totals
//     const subTotal = poData.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
//     const gstAmount = (subTotal * (parseFloat(poData.gstPercentage) || 18)) / 100;
//     const grandTotal = subTotal + gstAmount;

//     return (
//         <Modal show={show} onHide={onHide} size="xl" centered>
//             <Modal.Header closeButton>
//                 <Modal.Title>Purchase Order Preview</Modal.Title>
//             </Modal.Header>
//             <Modal.Body style={{ backgroundColor: "#f5f5f5" }}>
//                 {/* Printable Area */}
//                 <div
//                     ref={componentRef}
//                     style={{
//                         backgroundColor: "white",
//                         padding: "20px",
//                         width: "100%",
//                         maxWidth: "210mm", // A4 width
//                         margin: "0 auto",
//                         minHeight: "297mm", // A4 height
//                         fontSize: "12px",
//                         fontFamily: "Arial, sans-serif",
//                         border: "1px solid #ddd"
//                     }}
//                 >
//                     {/* Header */}
//                     <div className="text-center mb-2" style={{ border: "1px solid #000", padding: "5px", fontWeight: "bold", backgroundColor: "#e0e0e0" }}>
//                         PURCHASE ORDER
//                     </div>

//                     {/* PO Details Header */}
//                     <div style={{ border: "1px solid #000", borderTop: "none", padding: "5px" }}>
//                         <div className="d-flex justify-content-between">
//                             <div><strong>PO {poData.poNumber}</strong></div>
//                             <div><strong>Date: {poData.poDate ? new Date(poData.poDate).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB')}</strong></div>
//                         </div>
//                     </div>

//                     {/* To Address */}
//                     <div style={{ border: "1px solid #000", borderTop: "none", padding: "10px", minHeight: "100px" }}>
//                         <div><strong>To,</strong></div>
//                         <div style={{ fontWeight: "bold" }}>{poData.companyName || poData.clientName}</div>
//                         <div style={{ whiteSpace: "pre-wrap" }}>{poData.siteAddress}</div>
//                         <br />
//                         <div>Dear Sir,</div>
//                         <div>We are pleased to place an order on you.</div>
//                     </div>

//                     {/* Items Table */}
//                     <Table bordered size="sm" style={{ borderColor: "#000", marginBottom: 0 }}>
//                         <thead style={{ backgroundColor: "#00bfff", color: "white", textAlign: "center" }}>
//                             <tr>
//                                 <th style={{ width: "5%" }}>Sr. No.</th>
//                                 <th style={{ width: "55%" }}>Particulars</th>
//                                 <th style={{ width: "10%" }}>Unit</th>
//                                 <th style={{ width: "10%" }}>Qty</th>
//                                 <th style={{ width: "10%" }}>Rate</th>
//                                 <th style={{ width: "10%" }}>Amount</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {poData.items.map((item, index) => (
//                                 <tr key={index}>
//                                     <td className="text-center">{index + 1}</td>
//                                     <td>
//                                         <div style={{ fontWeight: "bold" }}>{item.description}</div>
//                                         {/* If there are specifications or extra details, they can go here */}
//                                         {item.material && <div><small>Material: {item.material}</small></div>}
//                                     </td>
//                                     <td className="text-center">{item.unit}</td>
//                                     <td className="text-center">{item.quantity}</td>
//                                     <td className="text-end">{formatCurrency(item.rate)}</td>
//                                     <td className="text-end">{formatCurrency(item.amount)}</td>
//                                 </tr>
//                             ))}
//                             {/* Fill empty rows if needed to look like the image, but dynamic is better */}
//                         </tbody>
//                         <tfoot>
//                             <tr>
//                                 <td colSpan="4" style={{ border: "none" }}></td>
//                                 <td style={{ backgroundColor: "#00bfff", color: "white", fontWeight: "bold" }}>Sub Total</td>
//                                 <td className="text-end" style={{ backgroundColor: "#00bfff", color: "white", fontWeight: "bold" }}>
//                                     {formatCurrency(subTotal)}
//                                 </td>
//                             </tr>
//                             <tr>
//                                 <td colSpan="4" style={{ border: "none" }}></td>
//                                 <td style={{ backgroundColor: "#00bfff", color: "white", fontWeight: "bold" }}>GST {poData.gstPercentage}%</td>
//                                 <td className="text-end" style={{ backgroundColor: "#00bfff", color: "white", fontWeight: "bold" }}>
//                                     {formatCurrency(gstAmount)}
//                                 </td>
//                             </tr>
//                             <tr>
//                                 <td colSpan="4" style={{ border: "none" }}></td>
//                                 <td style={{ backgroundColor: "#00bfff", color: "white", fontWeight: "bold" }}>Grand Total</td>
//                                 <td className="text-end" style={{ backgroundColor: "#00bfff", color: "white", fontWeight: "bold" }}>
//                                     {formatCurrency(grandTotal)}
//                                 </td>
//                             </tr>
//                         </tfoot>
//                     </Table>

//                     {/* Footer Addresses */}
//                     <div style={{ border: "1px solid #000", borderTop: "none" }}>
//                         <Row className="m-0">
//                             <Col md={6} style={{ borderRight: "1px solid #000", padding: "10px" }}>
//                                 <u><strong>Billing Address/ Correspondence Address :</strong></u>
//                                 <div style={{ fontWeight: "bold", marginTop: "5px" }}>NLF Solutions Pvt Ltd</div>
//                                 <div style={{ whiteSpace: "pre-wrap" }}>
//                                     {poData.billingAddress || "Plot No.6, New corporation Colony,\nNorth Ambhajhari Road, Nagpur-440010.\nGST No. 27AAJCN5910E1ZJ"}
//                                 </div>
//                             </Col>
//                             <Col md={6} style={{ padding: "10px" }}>
//                                 <u><strong>Dispatch address:</strong></u>
//                                 <div style={{ whiteSpace: "pre-wrap" }}>
//                                     {poData.termsAndConditions?.deliverySchedule?.deliveryNotes || "As per site instructions"}
//                                 </div>
//                                 {poData.contactPerson && (
//                                     <div className="mt-2">Contact Person : {poData.contactPerson} {poData.contactPersonMobile ? `(${poData.contactPersonMobile})` : ""}</div>
//                                 )}
//                             </Col>
//                         </Row>
//                     </div>

//                     {/* Signature */}
//                     <div style={{ border: "1px solid #000", borderTop: "none", padding: "10px", minHeight: "80px", display: "flex", alignItems: "flex-end" }}>
//                         <strong>For NLF Solutions Pvt Ltd</strong>
//                     </div>

//                 </div>
//             </Modal.Body>
//             <Modal.Footer>
//                 <Button variant="primary" onClick={handleDownload}>
//                     <FaDownload className="me-2" /> Download PDF
//                 </Button>
//                 <Button variant="secondary" onClick={onHide}>Close</Button>
//             </Modal.Footer>
//         </Modal>
//     );
// };

// export default POPreviewModal;


// POPreviewModal.jsx
import React, { useRef, useState, useEffect } from "react";
import { Modal, Button, Table, Row, Col, Spinner } from "react-bootstrap";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { FaDownload } from "react-icons/fa";
import axios from "axios";

const POPreviewModal = ({ show, onHide, poData }) => {
    const componentRef = useRef();
    const [branchList, setBranchList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch branch list when component mounts
    useEffect(() => {
        const fetchBranchList = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get("https://nlfs.in/erp/index.php/Erp/branch_list");
                if (response.data.status === "true" && response.data.success === "1" && Array.isArray(response.data.data)) {
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

    const handleDownload = async () => {
        const element = componentRef.current;
        if (!element) return;

        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                windowWidth: element.scrollWidth,
                windowHeight: element.scrollHeight
            });

            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 10; // Top margin

            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, (imgHeight * pdfWidth) / imgWidth);
            pdf.save(`PO_${poData.poNumber || "Draft"}.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
        }
    };

    // Helper to format currency
    const formatCurrency = (amount) => {
        if (!amount) return "0.00";
        return parseFloat(amount).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    // Calculate totals
    const subTotal = poData.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    const gstAmount = (subTotal * (parseFloat(poData.gstPercentage) || 18)) / 100;
    const grandTotal = subTotal + gstAmount;

    // Get office branch from poData
    const officeBranch = poData.branch || 'Kolkata';

    // Map office branch to header image path
    const getHeaderImagePath = (branch) => {
        const branchMap = {
            'Kolkata': '/extra/pdfpreviewKolkata.jpeg',
            'Delhi': '/extra/pdfpreviewDelhi.jpeg',
            'Indore': '/extra/pdfpreviewIndore.jpeg',
            'Nagpur': '/extra/pdfpreviewNagpur.jpeg',
            'Mumbai': '/extra/pdfpreviewMumbai.jpeg',
            'Hyderabad': '/extra/pdfpreviewHyderabad.jpeg',
            'Chennai': '/extra/pdfpreviewChennai.jpeg',
            'Bangalore': '/extra/pdfpreviewBangalore.jpeg',
            'Pune': '/extra/pdfpreviewPune.jpeg',
            'Ahmedabad': '/extra/pdfpreviewAhmedabad.jpeg',
        };
        return branchMap[branch] || branchMap['Kolkata'];
    };

    const headerImagePath = getHeaderImagePath(officeBranch);

    if (isLoading) {
        return (
            <Modal show={show} onHide={onHide} size="lg" centered>
                <Modal.Body className="text-center p-5">
                    <Spinner animation="border" role="status" />
                    <p className="mt-3">Loading branch data...</p>
                </Modal.Body>
            </Modal>
        );
    }

    return (
        <Modal show={show} onHide={onHide} size="xl" centered>
            <Modal.Header closeButton>
                <Modal.Title>Purchase Order Preview</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ backgroundColor: "#f5f5f5" }}>
                {/* Printable Area */}
                <div
                    ref={componentRef}
                    style={{
                        backgroundColor: "white",
                        padding: "20px",
                        width: "100%",
                        maxWidth: "210mm", // A4 width
                        margin: "0 auto",
                        minHeight: "297mm", // A4 height
                        fontSize: "12px",
                        fontFamily: "Arial, sans-serif",
                        border: "1px solid #ddd"
                    }}
                >
                    {/* ===== DYNAMIC HEADER IMAGE ===== */}
                    <div
                        style={{
                            width: '100%',
                            textAlign: 'center',
                            marginBottom: '10px',
                            border: '2px solid #000',
                            overflow: 'hidden'
                        }}
                    >
                        <img
                            src={headerImagePath}
                            alt={`Header for ${officeBranch}`}
                            style={{
                                width: '100%',
                                height: 'auto',
                                display: 'block'
                            }}
                        />
                    </div>

                    {/* Header */}
                    <div className="text-center mb-2" style={{ border: "1px solid #000", padding: "5px", fontWeight: "bold", backgroundColor: "#e0e0e0" }}>
                        PURCHASE ORDER
                    </div>

                    {/* PO Details Header */}
                    <div style={{ border: "1px solid #000", borderTop: "none", padding: "5px" }}>
                        <div className="d-flex justify-content-between">
                            <div><strong>PO {poData.poNumber}</strong></div>
                            <div><strong>Date: {poData.poDate ? new Date(poData.poDate).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB')}</strong></div>
                        </div>
                    </div>

                    {/* To Address */}
                    <div style={{ border: "1px solid #000", borderTop: "none", padding: "10px", minHeight: "100px" }}>
                        <div><strong>To,</strong></div>
                        <div style={{ fontWeight: "bold" }}>{poData.companyName || poData.clientName}</div>
                        <div style={{ whiteSpace: "pre-wrap" }}>{poData.siteAddress}</div>
                        <br />
                        <div>Dear Sir,</div>
                        <div>We are pleased to place an order on you.</div>
                    </div>

                    {/* Items Table */}
                    <Table bordered size="sm" style={{ borderColor: "#000", marginBottom: 0 }}>
                        <thead style={{ backgroundColor: "#00bfff", color: "white", textAlign: "center" }}>
                            <tr>
                                <th style={{ width: "5%" }}>Sr. No.</th>
                                <th style={{ width: "55%" }}>Particulars</th>
                                <th style={{ width: "10%" }}>Unit</th>
                                <th style={{ width: "10%" }}>Qty</th>
                                <th style={{ width: "10%" }}>Rate</th>
                                <th style={{ width: "10%" }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {poData.items.map((item, index) => (
                                <tr key={index}>
                                    <td className="text-center">{index + 1}</td>
                                    <td>
                                        <div style={{ fontWeight: "bold" }}>{item.description}</div>
                                        {/* If there are specifications or extra details, they can go here */}
                                        {item.material && <div><small>Material: {item.material}</small></div>}
                                    </td>
                                    <td className="text-center">{item.unit}</td>
                                    <td className="text-center">{item.quantity}</td>
                                    <td className="text-end">{formatCurrency(item.rate)}</td>
                                    <td className="text-end">{formatCurrency(item.amount)}</td>
                                </tr>
                            ))}
                            {/* Fill empty rows if needed to look like image, but dynamic is better */}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan="4" style={{ border: "none" }}></td>
                                <td style={{ backgroundColor: "#00bfff", color: "white", fontWeight: "bold" }}>Sub Total</td>
                                <td className="text-end" style={{ backgroundColor: "#00bfff", color: "white", fontWeight: "bold" }}>
                                    {formatCurrency(subTotal)}
                                </td>
                            </tr>
                            <tr>
                                <td colSpan="4" style={{ border: "none" }}></td>
                                <td style={{ backgroundColor: "#00bfff", color: "white", fontWeight: "bold" }}>GST {poData.gstPercentage}%</td>
                                <td className="text-end" style={{ backgroundColor: "#00bfff", color: "white", fontWeight: "bold" }}>
                                    {formatCurrency(gstAmount)}
                                </td>
                            </tr>
                            <tr>
                                <td colSpan="4" style={{ border: "none" }}></td>
                                <td style={{ backgroundColor: "#00bfff", color: "white", fontWeight: "bold" }}>Grand Total</td>
                                <td className="text-end" style={{ backgroundColor: "#00bfff", color: "white", fontWeight: "bold" }}>
                                    {formatCurrency(grandTotal)}
                                </td>
                            </tr>
                        </tfoot>
                    </Table>

                    {/* Footer Addresses */}
                    <div style={{ border: "1px solid #000", borderTop: "none" }}>
                        <Row className="m-0">
                            <Col md={6} style={{ borderRight: "1px solid #000", padding: "10px" }}>
                                <u><strong>Billing Address/ Correspondence Address :</strong></u>
                                <div style={{ fontWeight: "bold", marginTop: "5px" }}>NLF Solutions Pvt Ltd</div>
                                <div style={{ whiteSpace: "pre-wrap" }}>
                                    {poData.billingAddress || "Plot No.6, New corporation Colony,\nNorth Ambhajhari Road, Nagpur-440010.\nGST No. 27AAJCN5910E1ZJ"}
                                </div>
                            </Col>
                            <Col md={6} style={{ padding: "10px" }}>
                                <u><strong>Dispatch address:</strong></u>
                                <div style={{ whiteSpace: "pre-wrap" }}>
                                    {poData.termsAndConditions?.deliverySchedule?.deliveryNotes || "As per site instructions"}
                                </div>
                                {poData.contactPerson && (
                                    <div className="mt-2">Contact Person : {poData.contactPerson} {poData.contactPersonMobile ? `(${poData.contactPersonMobile})` : ""}</div>
                                )}
                            </Col>
                        </Row>
                    </div>

                    {/* Signature */}
                    <div style={{ border: "1px solid #000", borderTop: "none", padding: "10px", minHeight: "80px", display: "flex", alignItems: "flex-end" }}>
                        <strong>For NLF Solutions Pvt Ltd</strong>
                    </div>

                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={handleDownload}>
                    <FaDownload className="me-2" /> Download PDF
                </Button>
                <Button variant="secondary" onClick={onHide}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default POPreviewModal;