import React, { useState, useRef, useEffect } from 'react';
import { Modal, Button, Row, Col, Spinner } from 'react-bootstrap';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import axios from 'axios';

const PDFPreview = ({ show, onHide, quotationData, quoteId }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [fetchedData, setFetchedData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const pdfContentRef = useRef();

    // Fetch quotation data if quoteId is provided
    useEffect(() => {
        if (show && quoteId && !quotationData) {
            const fetchQuotationData = async () => {
                setIsLoading(true);
                try {
                    const response = await axios.post(
                        'https://nlfs.in/erp/index.php/Nlf_Erp/get_quotation_by_id',
                        { quote_id: String(quoteId) },
                        { headers: { 'Content-Type': 'application/json' } }
                    );

                    const isSuccess = response.data.status === true || response.data.status === "true";
                    if (isSuccess && response.data.data) {
                        setFetchedData(response.data.data);
                    }
                } catch (error) {
                    console.error('Error fetching quotation data:', error);
                } finally {
                    setIsLoading(false);
                }
            };

            fetchQuotationData();
        }
    }, [show, quoteId, quotationData]);

    // Use either passed quotationData or fetched data
    const activeQuotationData = quotationData || fetchedData;

    const generatePDF = async () => {
        setIsGenerating(true);
        try {
            const element = pdfContentRef.current;
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                allowTaint: true
            });
            
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210;
            const pageHeight = 295;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            const fileName = `Quotation_${activeQuotationData?.quote_id || activeQuotationData?.quotationId || 'Unknown'}_${activeQuotationData?.currentRound?.round || 'Latest'}.pdf`;
            pdf.save(fileName);
        } catch (error) {
            console.error('Error generating PDF:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    // Get the current round data or find the latest round
    const getCurrentRoundData = () => {
        if (!activeQuotationData) return null;
        
        if (activeQuotationData.rounds && activeQuotationData.rounds.length > 0) {
            if (activeQuotationData.currentRound) {
                const specificRound = activeQuotationData.rounds.find(r => r.round === activeQuotationData.currentRound);
                if (specificRound) return specificRound;
            }
            const sortedRounds = [...activeQuotationData.rounds].sort(
                (a, b) => parseInt(b.round?.substring(1) || 0) - parseInt(a.round?.substring(1) || 0)
            );
            return sortedRounds[0];
        }
        
        return null;
    };

    const currentRound = getCurrentRoundData();
    
    if (!activeQuotationData && !isLoading) return null;

    // ===== GET OFFICE BRANCH FROM QUOTATION DATA =====
    // Priority: activeQuotationData.branch -> activeQuotationData.officeBranch -> default to 'Mumbai'
    const officeBranch = activeQuotationData?.branch || activeQuotationData?.officeBranch || 'Mumbai';

    console.log('DEBUG - Quotation Data:', activeQuotationData); 
    console.log('DEBUG - Office Branch:', officeBranch); 
    console.log('DEBUG - Current Round:', currentRound); 

    // Map office branch to header image path (using actual file names)
    const getHeaderImagePath = (branch) => {
        const branchMap = {
            'Kolkata': '/extra/Kolkata.jpeg',
            'Delhi': '/extra/Delhi.jpeg',
            'Indore': '/extra/Indore.jpeg',
            'Nagpur': '/extra/Nagpur.jpeg',
            'Mumbai': '/extra/Mumbai.jpeg',
        };
        
        // Return matching branch or fallback to Mumbai
        return branchMap[branch] || branchMap['Mumbai'];
    };

    const headerImagePath = getHeaderImagePath(officeBranch);

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Quotation Preview - {activeQuotationData?.quote_id || activeQuotationData?.quotationId || 'Loading...'}</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                {isLoading ? (
                    <div className="text-center p-5">
                        <Spinner animation="border" role="status" style={{ color: "#ed3131" }}>
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                        <p className="mt-3">Loading quotation data...</p>
                    </div>
                ) : !activeQuotationData ? (
                    <div className="text-center p-5">
                        <p>No quotation data available.</p>
                    </div>
                ) : (
                <div 
                    ref={pdfContentRef} 
                    style={{ 
                        padding: '0', 
                        backgroundColor: 'white', 
                        fontFamily: 'Arial, sans-serif', 
                        fontSize: '11px',
                        width: '210mm',
                        margin: '0 auto'
                    }}
                >
                    {/* ===== DYNAMIC HEADER IMAGE (Changes based on officeBranch) ===== */}
                    <div style={{
                        width: '100%',
                        textAlign: 'center',
                        marginBottom: '10px',
                        border: '2px solid #000',
                        overflow: 'hidden'
                    }}>
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

                    {/* ===== MAIN QUOTATION CONTENT ===== */}
                    <div style={{ border: '2px solid #000', margin: '10px' }}>
                        {/* Header */}
                        <div style={{ textAlign: 'center', padding: '8px', borderBottom: '1px solid #000' }}>
                            <h1 style={{ margin: '0', fontSize: '16px', fontWeight: 'bold' }}>QUOTATION</h1>
                        </div>
                        
                        {/* Quote number and date row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', borderBottom: '1px solid #000', fontSize: '11px' }}>
                            <span style={{ fontWeight: 'bold' }}>
                                {activeQuotationData.quote_no || activeQuotationData.quote_id || activeQuotationData.quotationId}
                            </span>
                            <span>Date - {activeQuotationData.date || currentRound?.date || new Date().toLocaleDateString('en-IN')}</span>
                        </div>

                        {/* Customer details section */}
                        <div style={{ padding: '6px 10px', borderBottom: '1px solid #000', fontSize: '11px' }}>
                            <div style={{ marginBottom: '3px' }}>
                                <strong>To,</strong>
                            </div>
                            <div style={{ marginBottom: '2px', fontWeight: 'bold' }}>
                                {activeQuotationData.name || activeQuotationData.customer?.name || 'Customer Name'}
                            </div>
                            <div style={{ marginBottom: '2px' }}>
                                {activeQuotationData.city || activeQuotationData.customer?.city || 'City'}
                            </div>
                        </div>

                        {/* Kind Attention and Subject */}
                        <div style={{ padding: '6px 10px', borderBottom: '1px solid #000', fontSize: '11px' }}>
                            <div style={{ marginBottom: '3px' }}>
                                <strong>Kind Attention: {activeQuotationData.salespersonName || 'Sales Team'}</strong>
                            </div>
                            <div style={{ marginBottom: '3px' }}>
                                <strong>Subject:- Quotation for {activeQuotationData.project || currentRound?.details || 'Professional Services'}</strong>
                            </div>
                        </div>

                        {/* Greeting and intro */}
                        <div style={{ padding: '6px 10px', borderBottom: '1px solid #000', fontSize: '11px' }}>
                            <div style={{ marginBottom: '3px' }}>
                                <strong>Dear Sir,</strong>
                            </div>
                            <div style={{ marginBottom: '3px' }}>
                                As per our discussion we are quoting our lowest possible rate as follow:
                            </div>
                        </div>

                        {/* Items Table */}
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#4A90E2', color: 'white' }}>
                                    <th style={{ padding: '6px', border: '1px solid #000', textAlign: 'center', width: '8%', fontWeight: 'bold' }}>S.No</th>
                                    <th style={{ padding: '6px', border: '1px solid #000', textAlign: 'center', width: '50%', fontWeight: 'bold' }}>Description of Item</th>
                                    <th style={{ padding: '6px', border: '1px solid #000', textAlign: 'center', width: '8%', fontWeight: 'bold' }}>Unit</th>
                                    <th style={{ padding: '6px', border: '1px solid #000', textAlign: 'center', width: '10%', fontWeight: 'bold' }}>Qty</th>
                                    <th style={{ padding: '6px', border: '1px solid #000', textAlign: 'center', width: '12%', fontWeight: 'bold' }}>Rate</th>
                                    <th style={{ padding: '6px', border: '1px solid #000', textAlign: 'center', width: '12%', fontWeight: 'bold' }}>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(activeQuotationData.items?.length > 0 || currentRound?.items?.length > 0) ? (
                                    (activeQuotationData.items || currentRound.items).map((item, index) => (
                                        <tr key={index}>
                                            <td style={{ padding: '8px', border: '1px solid #000', textAlign: 'center', verticalAlign: 'top' }}>
                                                {index + 1}
                                            </td>
                                            <td style={{ padding: '8px', border: '1px solid #000', verticalAlign: 'top', fontSize: '9px', lineHeight: '1.3' }}>
                                                <div style={{ fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '3px' }}>
                                                    {(item.product || item.material) ? `${(item.product || item.material).toUpperCase()} FOR PROJECT:` : 'PROFESSIONAL SERVICE:'}
                                                </div>
                                                <div>
                                                    {item.desc || item.description}
                                                </div>
                                            </td>
                                            <td style={{ padding: '8px', border: '1px solid #000', textAlign: 'center', verticalAlign: 'top' }}>
                                                {item.unit}
                                            </td>
                                            <td style={{ padding: '8px', border: '1px solid #000', textAlign: 'center', verticalAlign: 'top' }}>
                                                {(parseFloat(item.qty || item.quantity) || 0).toLocaleString('en-IN')}
                                            </td>
                                            <td style={{ padding: '8px', border: '1px solid #000', textAlign: 'right', verticalAlign: 'top' }}>
                                                {(parseFloat(item.rate) || 0).toLocaleString('en-IN')}
                                            </td>
                                            <td style={{ padding: '8px', border: '1px solid #000', textAlign: 'right', verticalAlign: 'top' }}>
                                                {(parseFloat(item.amt || item.amount) || ((parseFloat(item.qty || item.quantity) || 0) * (parseFloat(item.rate) || 0))).toLocaleString('en-IN')}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td style={{ padding: '8px', border: '1px solid #000', textAlign: 'center', verticalAlign: 'top' }}>1</td>
                                        <td style={{ padding: '8px', border: '1px solid #000', verticalAlign: 'top', fontSize: '9px', lineHeight: '1.3' }}>
                                            <div style={{ fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '3px' }}>
                                                PROFESSIONAL SERVICE FOR PROJECT:
                                            </div>
                                            <div>
                                                {currentRound?.details || activeQuotationData.project || `Complete professional service solution for ${activeQuotationData.quote_id || activeQuotationData.quotationId}. All work to be completed as per specifications and requirements with quality materials and professional installation.`}
                                            </div>
                                        </td>
                                        <td style={{ padding: '8px', border: '1px solid #000', textAlign: 'center', verticalAlign: 'top' }}>Job</td>
                                        <td style={{ padding: '8px', border: '1px solid #000', textAlign: 'center', verticalAlign: 'top' }}>1</td>
                                        <td style={{ padding: '8px', border: '1px solid #000', textAlign: 'right', verticalAlign: 'top' }}>
                                            {(currentRound?.amount || activeQuotationData.total || activeQuotationData.amount || 0).toLocaleString('en-IN')}
                                        </td>
                                        <td style={{ padding: '8px', border: '1px solid #000', textAlign: 'right', verticalAlign: 'top' }}>
                                            {(currentRound?.amount || activeQuotationData.total || activeQuotationData.amount || 0).toLocaleString('en-IN')}
                                        </td>
                                    </tr>
                                )}
                                
                                {/* Additional Details */}
                                {currentRound?.additionalDetails?.map((item, index) => (
                                    <tr key={`add-${index}`}>
                                        <td style={{ padding: '8px', border: '1px solid #000', textAlign: 'center', verticalAlign: 'top' }}>
                                            *
                                        </td>
                                        <td style={{ padding: '8px', border: '1px solid #000', verticalAlign: 'top', fontSize: '9px' }}>
                                            <div style={{ fontWeight: 'bold' }}>
                                                {item.description}
                                            </div>
                                        </td>
                                        <td style={{ padding: '8px', border: '1px solid #000', textAlign: 'center', verticalAlign: 'top' }}>
                                            {item.unit}
                                        </td>
                                        <td style={{ padding: '8px', border: '1px solid #000', textAlign: 'center', verticalAlign: 'top' }}>
                                            {item.quantity}
                                        </td>
                                        <td style={{ padding: '8px', border: '1px solid #000', textAlign: 'right', verticalAlign: 'top' }}>
                                            {item.rate.toLocaleString('en-IN')}
                                        </td>
                                        <td style={{ padding: '8px', border: '1px solid #000', textAlign: 'right', verticalAlign: 'top' }}>
                                            {(item.quantity * item.rate).toLocaleString('en-IN')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Totals Section */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <div style={{ width: '200px' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                                    <tbody>
                                        <tr style={{ backgroundColor: '#4A90E2', color: 'white' }}>
                                            <td style={{ padding: '6px', border: '1px solid #000', fontWeight: 'bold', textAlign: 'center' }}>Basic Amount</td>
                                            <td style={{ padding: '6px', border: '1px solid #000', textAlign: 'right', fontWeight: 'bold' }}>
                                                {(() => {
                                                    const total = parseFloat(currentRound?.amount || activeQuotationData.total || activeQuotationData.amount || 0);
                                                    const basicAmount = Math.round(total / 1.18);
                                                    return basicAmount.toLocaleString('en-IN');
                                                })()}
                                            </td>
                                        </tr>
                                        <tr style={{ backgroundColor: '#4A90E2', color: 'white' }}>
                                            <td style={{ padding: '6px', border: '1px solid #000', fontWeight: 'bold', textAlign: 'center' }}>GST @ 18%</td>
                                            <td style={{ padding: '6px', border: '1px solid #000', textAlign: 'right', fontWeight: 'bold' }}>
                                                {(() => {
                                                    const total = parseFloat(currentRound?.amount || activeQuotationData.total || activeQuotationData.amount || 0);
                                                    const basicAmount = Math.round(total / 1.18);
                                                    const gst = total - basicAmount;
                                                    return gst.toLocaleString('en-IN');
                                                })()}
                                            </td>
                                        </tr>
                                        <tr style={{ backgroundColor: '#4A90E2', color: 'white' }}>
                                            <td style={{ padding: '6px', border: '1px solid #000', fontWeight: 'bold', textAlign: 'center' }}>Grand Total</td>
                                            <td style={{ padding: '6px', border: '1px solid #000', textAlign: 'right', fontWeight: 'bold' }}>
                                                {(parseFloat(currentRound?.amount || activeQuotationData.total || activeQuotationData.amount || 0)).toLocaleString('en-IN')}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Commercial Terms */}
                        <div style={{ padding: '8px 10px', borderTop: '1px solid #000', fontSize: '10px' }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Commercial Terms:</div>
                            <div style={{ marginBottom: '2px' }}>
                                <strong>GST :-</strong> {currentRound?.commercialTerms?.gst || '27AABCCDDEEFFG'}
                            </div>
                            <div style={{ marginBottom: '2px' }}>
                                <strong>Supply Terms:</strong> {currentRound?.commercialTerms?.supplyTerms || '95% of the payment will be made within 20 days from the date of delivery, and 5% on a pro-data basis after the completion of work.'}
                            </div>
                            <div style={{ marginBottom: '2px' }}>
                                <strong>Installation Terms:</strong> {currentRound?.commercialTerms?.installationTerms || '90% within 21 days after installation on a pro-data basis, 5% upon certification from the client, and 5%'}
                            </div>
                        </div>

                        {/* Terms and Conditions */}
                        <div style={{ padding: '8px 10px', borderTop: '1px solid #000', fontSize: '9px', lineHeight: '1.3' }}>
                            {activeQuotationData.terms ? (
                                <div dangerouslySetInnerHTML={{ __html: activeQuotationData.terms }} />
                            ) : (
                                <>
                                    <div style={{ color: 'red', fontWeight: 'bold', marginBottom: '2px' }}>
                                        • The above rates does not include any MS/Aluminium substructure required.
                                    </div>
                                    <div style={{ marginBottom: '2px' }}>
                                        • Safe storage for the material to be provided by you at site with a locked room.
                                    </div>
                                    <div style={{ marginBottom: '2px' }}>
                                        • Providing & Fixing of Scaffolding should be at your end.
                                    </div>
                                    <div style={{ marginBottom: '2px' }}>
                                        • If there is any requirement for locking clips due to higher wing load, the same will be charged extra at the rate of Rs. 200 per clip.
                                    </div>
                                    <div style={{ marginBottom: '2px' }}>
                                        • Mode of Measurement: Measurements shall be wall to wall.
                                    </div>
                                    <div style={{ marginBottom: '2px' }}>
                                        • Local transportation, loading & unloading of material from one area to another area on site at your end
                                    </div>
                                    <div style={{ marginBottom: '2px' }}>
                                        • Suitable accommodation for site engineer & hutment for labour to be provided by the client along with lodging & boarding.
                                    </div>
                                    <div style={{ marginBottom: '2px', fontWeight: 'bold' }}>
                                        • Validity of Quotation: 30 days.
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Footer inside main border */}
                        <div style={{ padding: '6px 10px', borderTop: '1px solid #000', fontSize: '10px', textAlign: 'center' }}>
                            <div>Hope you will find our offer most competitive and in order.</div>
                        </div>
                    </div>

                    {/* ===== FOOTER: Consistent across all quotes ===== */}
                    <div style={{
                        padding: '8px 15px',
                        fontSize: '9px',
                        textAlign: 'center',
                        marginTop: '10px',
                    }}>
                        <img src="/extra/Footer.jpeg" style={{width:"775px", height:"75px"}} alt="Footer Banner" />
                    </div>
                </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Close
                </Button>
                <Button 
                    variant="primary" 
                    onClick={generatePDF}
                    disabled={isGenerating}
                >
                    {isGenerating ? 'Generating...' : 'Download PDF'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default PDFAdmin;