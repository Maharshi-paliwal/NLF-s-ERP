
// import React, { useState, useRef, useEffect } from "react";
// import axios from "axios";

// // --- Helper Functions ---

// const isApprovedValue = (val) => {
//   if (!val) return false;
//   const s = String(val).trim().toLowerCase();
//   return ["yes", "approved", "true", "1"].includes(s);
// };

// const getBase64ImageFromURL = (url) => {
//   return new Promise((resolve) => {
//     if (!url) return resolve(null);
    
//     if (url.startsWith('data:')) {
//       resolve(url);
//       return;
//     }

//     const img = new Image();
//     img.crossOrigin = "anonymous";

//     img.onload = () => {
//       try {
//         const canvas = document.createElement("canvas");
//         canvas.width = img.width;
//         canvas.height = img.height;
//         const ctx = canvas.getContext("2d");
//         ctx.drawImage(img, 0, 0);
//         resolve(canvas.toDataURL("image/jpeg"));
//       } catch (e) {
//         console.warn("Canvas tainted:", url);
//         resolve(null);
//       }
//     };
//     img.onerror = () => {
//       console.warn("Image failed to load:", url);
//       resolve(null);
//     };

//     img.src = url;
//   });
// };

// // --- Main Component ---

// const PoView = ({ show, onHide, poData, enableApproval, onPOApproved }) => {
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [fetchedData, setFetchedData] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [poApproved, setPoApproved] = useState(false);
//   const [isUpdatingPO, setIsUpdatingPO] = useState(false);
//   const [poApprovalSuccess, setPoApprovalSuccess] = useState(false);
//   const [signatureImage, setSignatureImage] = useState(null);
//   const [branchImageMap, setBranchImageMap] = useState({});
//   const [quotationData, setQuotationData] = useState(null);
  
//   const pdfContentRef = useRef();
//   const [visible, setVisible] = useState(!!show);
//   const [closing, setClosing] = useState(false);
//   const FADE_MS = 300;

//   useEffect(() => {
//     if (show) {
//       setVisible(true);
//       setClosing(false);
//     } else {
//       if (visible && !closing) {
//         setClosing(true);
//         const t = setTimeout(() => {
//           setVisible(false);
//           setClosing(false);
//         }, FADE_MS);
//         return () => clearTimeout(t);
//       }
//     }
//   }, [show, visible, closing]);

//   const closeWithFade = () => {
//     if (closing) return;
//     setClosing(true);
//     setTimeout(() => {
//       setVisible(false);
//       setClosing(false);
//       if (typeof onHide === "function") onHide();
//     }, FADE_MS);
//   };

//   const wait = (ms) => new Promise((res) => setTimeout(res, ms));

//   useEffect(() => {
//     if (!show) return;

//     const fetchBranches = async () => {
//       try {
//         const res = await fetch("https://nlfs.in/erp/index.php/Erp/branch_list", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({}),
//         });
//         const data = await res.json();
//         if (data.status && data.success === "1") {
//           const map = {};
//           (data.data || []).forEach((b) => {
//             if (b.branch_name && b.header_image) {
//               map[b.branch_name] = b.header_image;
//             }
//           });
//           setBranchImageMap(map);
//         }
//       } catch (e) {
//         console.error("Failed to load branch images", e);
//       }
//     };

//     const fetchQuotationData = async () => {
//       if (poData && poData.quote_id) {
//         try {
//           const response = await axios.post(
//             "https://nlfs.in/erp/index.php/Nlf_Erp/get_quotation_by_id",
//             { quote_id: poData.quote_id }
//           );
//           if (response.data && response.data.status) {
//             setQuotationData(response.data.data);
//           }
//         } catch (error) {
//           console.error("Error fetching quotation data:", error);
//         }
//       }
//     };

//     fetchBranches();
//     fetchQuotationData();
//   }, [show, poData]);

//   useEffect(() => {
//     if (poData) {
//       const approved = isApprovedValue(poData.po_approval);
//       setPoApproved(approved);
//       setPoApprovalSuccess(approved);
      
//       if (approved && !signatureImage) {
//          setSignatureImage("/extra/sign.jpg");
//       } else if (!approved) {
//          setSignatureImage(null);
//       }
//     }
//   }, [poData]);

//   const formatINR = (num) => Number(num || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });

//   const poNumber = poData?.po_no || poData?.poNumber || "N/A";
//   const poDateRaw = poData?.date || poData?.poDate;
//   const poDate = poDateRaw 
//     ? new Date(poDateRaw).toLocaleDateString("en-GB")
//     : "-";

//   const company = poData?.vender_name || poData?.vendor_name || poData?.company || "-";
  
//   const clientName = quotationData?.name || poData?.name || poData?.contact_person || "-";
//   const siteAddress = poData?.site_address || poData?.siteAddress || "-";
//   const projectName = poData?.projectName || poData?.project || "-";
  
//   const billingAddressRaw = poData?.billing_address || poData?.billingAddress || "";
//   const dispatchAddressRaw = poData?.dispatch_address || poData?.dispatchAddress || "";
//   const billingAddress = billingAddressRaw || siteAddress;
//   const dispatchAddress = dispatchAddressRaw || siteAddress;
  
//   const gstNumber = poData?.gst_number || poData?.gstNumber || "Not Provided";
//   const mobileNumber = poData?.mobile || poData?.contactNumber || "-";

//   const basicAmount = parseFloat(poData?.total_amt || poData?.totalAmount || 0);
//   const gstPercent = 18;
//   const gstAmount = parseFloat(poData?.gst_amount || (basicAmount * gstPercent) / 100);
//   const grandTotal = basicAmount + gstAmount;

//   const deliverySchedule = poData?.delivery_schedule || "-";
//   const liabilityPeriod = poData?.defect_liability_period || "-";
//   const installationScope = poData?.installation_scope || "-";
//   const liquidatedDamages = poData?.liquidated_damages || "-";

//   const itemsArray = Array.isArray(poData?.items)
//     ? poData.items.map((item) => ({
//         material: item.product || item.material || "ITEM",
//         description: item.desc || item.description || "",
//         unit: item.unit || "-",
//         qty: item.qty || item.quantity || "",
//         rate: item.rate || 0,
//         amount: item.amt || item.total || 0,
//         inst_qty: item.inst_qty || 0,
//         inst_rate: item.inst_rate || 0,
//         inst_amt: item.inst_amt || 0,
//         inst_unit: item.inst_unit || "-",
//         spec_image: item.spec_image || item.Spec_Image || item.image || item.img,
//       }))
//     : [];

//   const additionalDetails = Array.isArray(poData?.additionalDetails)
//     ? poData.additionalDetails
//     : [];

//   const resolveHeaderImage = (branchName) => {
//     const localBranchHeaders = {
//       "Kolkata": "/extra/Kolkata.jpeg",
//       "Delhi": "/extra/Delhi.jpeg",
//       "Indore": "/extra/Indore.jpeg",
//       "Nagpur": "/extra/Nagpur.jpeg",
//       "Mumbai": "/extra/Mumbai.jpeg",
//     };
//     if (localBranchHeaders[branchName]) return localBranchHeaders[branchName];
//     return localBranchHeaders["Mumbai"];
//   };

//   const officeBranch = poData?.branch || "Mumbai";
//   const headerImagePath = resolveHeaderImage(officeBranch);

//   const resolveProductImage = (img) => {
//     if (!img) return null;
//     if (typeof img !== "string") return null;
//     if (img.startsWith("data:")) return img;
//     if (/^https?:\/\//i.test(img)) return img;
//     return `https://nlfs.in/erp/${img.replace(/^\/+/, "")}`;
//   };

//   const handlePOApproval = async () => {
//     if (!poData?.po_id) return alert("Missing PO ID.");
//     if (poApproved) return;

//     setPoApproved(true);
//     setIsUpdatingPO(true);
//     await wait(900);
//     try {
//       const response = await fetch(
//         "https://nlfs.in/erp/index.php/Nlf_Erp/update_po_approval",
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ po_id: String(poData.po_id), po_approval: "yes" }),
//         }
//       );
//       const result = await response.json();
//       if (result.status === true || result.status === "true") {
//         setPoApprovalSuccess(true);
//         alert("Purchase Order approved successfully!");

//         if (onPOApproved && typeof onPOApproved === 'function') {
//           onPOApproved(poData.po_id);
//         }

//         setTimeout(closeWithFade, 400);
//       } else {
//         setPoApproved(false);
//         alert(result.message || "Failed to approve PO.");
//       }
//     } catch (err) {
//       console.error(err);
//       setPoApproved(false);
//       alert("Error approving PO.");
//     } finally {
//       setIsUpdatingPO(false);
//     }
//   };

//   const onPOCheckboxClick = (e) => {
//     e.preventDefault();
//     if (poApproved || isUpdatingPO) return;
//     const confirmed = window.confirm(
//       "Proceed with PO approval?\n\nOnce approved, this action cannot be reverted."
//     );
//     if (confirmed) handlePOApproval();
//   };

//   const generatePDF = async () => {
//     if (!poData) return alert("No PO data.");
//     setIsGenerating(true);
//     try {
//       const jsPDF = (await import("jspdf")).default;
//       const autoTable = (await import("jspdf-autotable")).default;
      
//       const pdf = new jsPDF("p", "mm", "a4");
//       const pageWidth = 210;
//       const pageHeight = 297;
//       const margin = 8;
//       const footerHeight = 16;
//       const headerHeight = 24;

//       const headerRawUrl = headerImagePath;
//       const footerRawUrl = "/extra/Footer.jpeg";

//       const [headerImgData, footerImgData, signatureImgData] = await Promise.all([
//         headerRawUrl ? getBase64ImageFromURL(headerRawUrl) : Promise.resolve(null),
//         getBase64ImageFromURL(footerRawUrl),
//         signatureImage && poApprovalSuccess ? getBase64ImageFromURL(signatureImage) : Promise.resolve(null),
//       ]);

//       const itemImages = await Promise.all(
//         itemsArray.map(async (item) => {
//           const url = resolveProductImage(item.spec_image);
//           if (!url) return null;
//           return await getBase64ImageFromURL(url);
//         })
//       );

//       const drawHeader = () => {
//         if (!headerImgData) return;
//         try {
//           pdf.addImage(headerImgData, "JPEG", margin, margin, pageWidth - 2 * margin, headerHeight);
//         } catch (e) { console.error("Header failed", e); }
//       };

//       const drawFooter = () => {
//         if (!footerImgData) return;
//         try {
//           const footerY = pageHeight - footerHeight - margin;
//           pdf.addImage(footerImgData, "JPEG", margin, footerY, pageWidth - 2 * margin, footerHeight);
//         } catch (e) { console.error("Footer failed", e); }
//       };

//       const drawSignature = (yPos) => {
//         if (!poApprovalSuccess || !signatureImgData) return;
//         try {
//           pdf.addImage(signatureImgData, "JPEG", margin + 10, yPos, 40, 12);
//           pdf.setFontSize(8);
//           pdf.text("Authorized Signature", margin + 10, yPos + 16);
//         } catch (e) { console.error("Signature failed", e); }
//       };

//       const drawBorder = (x, y, w, h) => {
//         pdf.setLineWidth(1);
//         pdf.rect(x, y, w, h);
//       };

//       let yPosition = margin + headerHeight + 6;

//       const checkNewPage = (requiredSpace) => {
//         if (yPosition + requiredSpace > pageHeight - footerHeight - margin) {
//           drawFooter();
//           pdf.addPage();
//           drawHeader();
//           yPosition = margin + headerHeight + 6;
//         }
//       };

//       drawHeader();
//       drawBorder(
//         margin, 
//         margin + headerHeight, 
//         pageWidth - 2 * margin, 
//         pageHeight - 2 * margin - headerHeight - footerHeight
//       );

//       yPosition += 4;
//       pdf.setFontSize(14);
//       pdf.setFont(undefined, "bold");
//       pdf.text("PURCHASE ORDER", pageWidth / 2, yPosition, { align: "center" });
//       yPosition += 10;

//       pdf.setLineWidth(1);
//       pdf.line(margin, yPosition, pageWidth - margin, yPosition);
//       yPosition += 4;
//       pdf.setFontSize(10);
//       pdf.setFont(undefined, "bold");
//       pdf.text(`PO No: ${poNumber}`, margin + 4, yPosition);
//       pdf.text(`Date: ${poDate}`, pageWidth - margin - 4, yPosition, { align: "right" });
//       yPosition += 3;
//       pdf.line(margin, yPosition, pageWidth - margin, yPosition);
//       yPosition += 6;

//       pdf.setFont(undefined, "normal");
//       pdf.text("To,", margin + 4, yPosition);
//       yPosition += 5;
//       pdf.setFont(undefined, "bold");
//       pdf.text(company, margin + 4, yPosition);
//       yPosition += 5;
//       pdf.setFont(undefined, "normal");
//       pdf.text(siteAddress, margin + 4, yPosition);
//       yPosition += 6;
//       pdf.setFont(undefined, "bold");
//       pdf.text(`Project: ${projectName}`, margin + 4, yPosition);
//       yPosition += 6;

//       pdf.setFont(undefined, "normal");
//       pdf.text("Dear Sir,", margin + 4, yPosition);
//       yPosition += 5;
//       const intro = "We are pleased to place an order on you as per details given below:";
//       const introLines = pdf.splitTextToSize(intro, pageWidth - 2 * margin - 8);
//       introLines.forEach((line) => {
//         checkNewPage(6);
//         pdf.text(line, margin + 4, yPosition);
//         yPosition += 5;
//       });
//       yPosition += 3;

//       const tableData = [];
//       const rowImageMap = {};

//       itemsArray.forEach((item, idx) => {
//         const rowIndex = tableData.length;
//         if (itemImages[idx]) rowImageMap[rowIndex] = itemImages[idx];

//         tableData.push([
//           String(idx + 1),
//           item.description,
//           item.unit,
//           item.qty,
//           formatINR(item.rate),
//           formatINR(item.amount),
//         ]);

//         if (item.inst_qty > 0 || item.inst_rate > 0) {
//           tableData.push([
//             "",
//             "Installation",
//             item.inst_unit,
//             item.inst_qty,
//             formatINR(item.inst_rate),
//             formatINR(item.inst_amt),
//           ]);
//         }
//       });
      
//       additionalDetails.forEach((item) => {
//          tableData.push([
//            "*", item.description, item.unit, item.quantity, formatINR(item.rate), formatINR(item.quantity * item.rate)
//          ]);
//       });

//       autoTable(pdf, {
//         startY: yPosition,
//         head: [["S.No", "Description", "Unit", "Qty", "Rate", "Amount"]],
//         body: tableData,
//         theme: "grid",
//         tableWidth: pageWidth - 2 * margin,
//         columnStyles: {
//           0: { halign: "center", cellWidth: 12, valign: "top" },
//           1: { cellWidth: 105, valign: "top" },
//           2: { halign: "center", cellWidth: 15, valign: "top" },
//           3: { halign: "center", cellWidth: 12, valign: "top" },
//           4: { halign: "right", cellWidth: 20, valign: "top" },
//           5: { halign: "right", cellWidth: 25, valign: "top" },
//         },
//         styles: {
//           fontSize: 8,
//           cellPadding: 2,
//           lineWidth: 1,
//           lineColor: [0, 0, 0],
//           textColor: [0, 0, 0],
//           valign: "top",
//         },
//         headStyles: {
//           fillColor: [0, 123, 255],
//           textColor: 255,
//           fontStyle: "bold",
//           fontSize: 9,
//           halign: "center",
//           lineWidth: 1,
//           lineColor: [0, 0, 0],
//         },
//         didDrawCell: (data) => {
//           if (data.section === "body" && data.column.index === 1 && rowImageMap[data.row.index]) {
//              const imgData = rowImageMap[data.row.index];
//              if(!imgData) return;
//              const cellX = data.cell.x;
//              const cellY = data.cell.y;
//              const cellW = data.cell.width;
//              const cellH = data.cell.height;
//              const imgW = Math.min(cellW - 4, 25);
//              const imgH = imgW * 0.75;
//              pdf.addImage(imgData, "JPEG", cellX + 2, cellY + cellH - imgH - 2, imgW, imgH);
//           }
//         },
//         didDrawPage: () => {
//           drawHeader();
//           drawFooter();
//           drawBorder(margin, margin + headerHeight, pageWidth - 2 * margin, pageHeight - 2*margin - headerHeight - footerHeight);
//         },
//         margin: { top: margin + headerHeight + 4, bottom: footerHeight + 8, left: margin, right: margin },
//       });

//       yPosition = pdf.lastAutoTable.finalY + 2;

//       checkNewPage(30);
//       const totalsX = pageWidth - margin - 80;
//       const totalsH = 8;
      
//       pdf.setFillColor(0, 123, 255);
//       pdf.rect(totalsX, yPosition, 80, totalsH, "F");
//       pdf.rect(totalsX, yPosition + totalsH, 80, totalsH, "F");
//       pdf.rect(totalsX, yPosition + totalsH * 2, 80, totalsH, "F");

//       pdf.setLineWidth(1);
//       pdf.rect(totalsX, yPosition, 80, totalsH);
//       pdf.rect(totalsX, yPosition + totalsH, 80, totalsH);
//       pdf.rect(totalsX, yPosition + totalsH * 2, 80, totalsH);

//       pdf.setFont(undefined, "bold");
//       pdf.setTextColor(255, 255, 255);
//       pdf.setFontSize(9);
      
//       pdf.text("Sub- Total", totalsX + 4, yPosition + 5.5);
//       pdf.text(`Rs ${formatINR(basicAmount)}`, totalsX + 76, yPosition + 5.5, { align: "right" });

//       pdf.text("GST @ 18%", totalsX + 4, yPosition + totalsH + 5.5);
//       pdf.text(`Rs ${formatINR(gstAmount)}`, totalsX + 76, yPosition + totalsH + 5.5, { align: "right" });

//       pdf.text("Grand Total", totalsX + 4, yPosition + totalsH * 2 + 5.5);
//       pdf.text(`Rs ${formatINR(grandTotal)}`, totalsX + 76, yPosition + totalsH * 2 + 5.5, { align: "right" });
      
//       pdf.setTextColor(0, 0, 0);
//       yPosition += totalsH * 3 + 2;
//       pdf.setLineWidth(1);
//       pdf.line(margin, yPosition, pageWidth - margin, yPosition);
//       yPosition += 6;

//       checkNewPage(40);
      
//       const addTerm = (text, isBold = false, isRed = false) => {
//         if (isBold) pdf.setFont(undefined, "bold");
//         else pdf.setFont(undefined, "normal");
        
//         if (isRed) pdf.setTextColor(210, 47, 47);
//         else pdf.setTextColor(0, 0, 0);

//         const wrapped = pdf.splitTextToSize(text, pageWidth - 2 * margin - 20);
//         wrapped.forEach(l => {
//           checkNewPage(6);
//           pdf.text(l, margin + 10, yPosition);
//           yPosition += 5;
//         });
//         yPosition += 2;
//       };

//       addTerm("Terms & Conditions:", true);
//       yPosition += 2;

//       const addressBlockHeight = 30;
//       drawBorder(margin, yPosition, pageWidth - 2 * margin, addressBlockHeight);
      
//       pdf.line(pageWidth / 2, yPosition, pageWidth / 2, yPosition + addressBlockHeight);

//       pdf.setFontSize(9);
//       pdf.setFont(undefined, "bold");
//       pdf.text("Billing Address / Correspondence Address:", margin + 4, yPosition + 6);
//       pdf.setFont(undefined, "normal");
//       const billingLines = pdf.splitTextToSize(billingAddress, (pageWidth / 2) - 15);
//       let by = yPosition + 12;
//       billingLines.forEach(l => { pdf.text(l, margin + 4, by); by += 4; });
//       pdf.text(`GST No: ${gstNumber}`, margin + 4, by + 2);

//       pdf.setFont(undefined, "bold");
//       pdf.text("Dispatch Address:", pageWidth / 2 + 4, yPosition + 6);
//       pdf.setFont(undefined, "normal");
//       const dispatchLines = pdf.splitTextToSize(dispatchAddress, (pageWidth / 2) - 15);
//       let dy = yPosition + 12;
//       dispatchLines.forEach(l => { pdf.text(l, pageWidth / 2 + 4, dy); dy += 4; });
//       pdf.text(`Contact Person: ${clientName}`, pageWidth / 2 + 4, dy + 2);
//       pdf.text(`Mob No: ${mobileNumber}`, pageWidth / 2 + 4, dy + 6);

//       yPosition += addressBlockHeight + 8;

//       addTerm(`Delivery Schedule: ${deliverySchedule}`);
//       addTerm(`Defect Liability Period: ${liabilityPeriod}`);
//       addTerm(`Installation Scope: ${installationScope}`);
//       addTerm(`Liquidated Damages: ${liquidatedDamages}`);

//       yPosition += 4;
//       checkNewPage(10);
//       pdf.setLineWidth(1);
//       pdf.line(margin, yPosition, pageWidth - margin, yPosition);
//       yPosition += 10;

//       drawSignature(yPosition);
//       drawFooter();

//       pdf.save(`PO_${poNumber}.pdf`);

//     } catch (error) {
//       console.error("PDF Generation Error:", error);
//       alert("Error generating PDF.");
//     } finally {
//       setIsGenerating(false);
//     }
//   };

//   const th = { border: "1px solid #000", padding: "6px", fontWeight: "bold" };
//   const td = { border: "1px solid #000", padding: "6px" };
//   const blueLeft = { border: "1px solid #000", padding: "4px 6px", background: "#007bff", color: "white", width: "70%", fontSize: "10px" };
//   const blueRight = { border: "1px solid #000", padding: "4px 6px", background: "#007bff", color: "white", textAlign: "right", fontSize: "10px" };

//   if (!visible) return null;

//   return (
//     <>
//       {/* Backdrop */}
//       <div
//         style={{
//           position: "fixed",
//           top: 0,
//           left: 0,
//           right: 0,
//           bottom: 0,
//           backgroundColor: "rgba(0,0,0,0.45)",
//           zIndex: 1040,
//           opacity: closing ? 0 : 1,
//           transition: `opacity ${FADE_MS}ms ease`,
//         }}
//         onClick={closeWithFade}
//       />
      
//       {/* Modal */}
//       <div
//         style={{
//           position: "fixed",
//           top: "50%",
//           left: "50%",
//           transform: closing
//             ? "translate(-50%, -50%) scale(0.99)"
//             : "translate(-50%, -50%) scale(1)",
//           backgroundColor: "white",
//           borderRadius: "6px",
//           boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
//           zIndex: 1050,
//           width: "92%",
//           maxWidth: "900px",
//           maxHeight: "92vh",
//           display: "flex",
//           flexDirection: "column",
//           opacity: closing ? 0 : 1,
//           transition: `opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease`,
//         }}
//       >
//         {/* Header */}
//         <div
//           style={{
//             padding: "12px 14px",
//             borderBottom: "1px solid #dee2e6",
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//           }}
//         >
//           <h5 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 600 }}>
//             Purchase Order Preview - {poNumber}
//           </h5>
//           <button
//             onClick={closeWithFade}
//             style={{
//               background: "none",
//               border: "none",
//               fontSize: "1.4rem",
//               cursor: "pointer",
//               padding: "0",
//               lineHeight: "1",
//             }}
//           >
//             ×
//           </button>
//         </div>
        
//         {/* Body - NO PADDING, overflow on inner content */}
//         <div
//           style={{
//             padding: "0",
//             overflowY: "auto",
//             flex: 1,
//           }}
//         >
//           {isLoading ? (
//             <div style={{ textAlign: "center", padding: "28px" }}>
//               <div
//                 style={{
//                   width: "36px",
//                   height: "36px",
//                   border: "4px solid #f3f3f3",
//                   borderTop: "4px solid #ed3131",
//                   borderRadius: "50%",
//                   animation: "spin 1s linear infinite",
//                   margin: "0 auto",
//                 }}
//               />
//               <p style={{ marginTop: "12px" }}>Loading data...</p>
//             </div>
//           ) : (
//             <div
//               ref={pdfContentRef}
//               style={{
//                 padding: "15px",
//                 backgroundColor: "white",
//                 fontFamily: "Arial, sans-serif",
//                 fontSize: "10.5px",
//                 width: "210mm",
//                 margin: "0 auto",
//                 border: "1px solid #ddd",
//               }}
//             >
//               {/* HEADER IMAGE */}
//               <div style={{ width: "100%", border: "1px solid #000", overflow: "hidden" }}>
//                 {headerImagePath ? (
//                   <img src={headerImagePath} alt="Header" style={{ width: "100%", height: "auto", display: "block" }} />
//                 ) : (
//                   <div style={{ padding: "12px", textAlign: "center", color: "#777" }}>No header image</div>
//                 )}
//               </div>

//               {/* TITLE */}
//               <h3 style={{ textAlign: "center", margin: "15px 0", fontWeight: "bold" }}>PURCHASE ORDER</h3>

//               {/* DETAILS BAR */}
//               <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
//                 <div><strong>{poNumber}</strong></div>
//                 <div><strong>Date:</strong> {poDate}</div>
//               </div>

//               {/* CLIENT INFO */}
//               <div style={{ lineHeight: "1.4", marginBottom: "15px" }}>
//                 <p style={{ margin: 0 }}><strong>To,</strong></p>
//                 <p style={{ margin: 0 }}>{company}</p>
//                 <p style={{ margin: 0, textTransform: "uppercase" }}>{siteAddress}</p>
//                 <p style={{ margin: 0 }}><strong>Project:</strong> {projectName}</p>
//               </div>

//               {/* INTRO */}
//               <p style={{ marginBottom: "15px" }}>
//                 <strong>Dear Sir,</strong><br />
//                 We are pleased to place an order on you as per details given below:
//               </p>

//               {/* ITEMS TABLE */}
//               <table style={{ width: "100%", borderCollapse: "collapse" }}>
//                 <thead>
//                   <tr style={{ backgroundColor: "#007bff", color: "white", textAlign: "center" }}>
//                     <th style={th}>Sr.No</th>
//                     <th style={th}>Description</th>
//                     <th style={th}>Unit</th>
//                     <th style={th}>Qty</th>
//                     <th style={th}>Rate</th>
//                     <th style={th}>Amount</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {itemsArray.map((item, idx) => (
//                     <React.Fragment key={idx}>
//                       <tr>
//                         <td style={td}>{idx + 1}</td>
//                         <td style={td}>
//                           <div style={{ fontWeight: "bold", textTransform: "uppercase", marginBottom: "2px" }}>
//                             {item.material}
//                           </div>
//                           <div>{item.description}</div>
//                         </td>
//                         <td style={td}>{item.unit}</td>
//                         <td style={td}>{item.qty}</td>
//                         <td style={td}>{formatINR(item.rate)}</td>
//                         <td style={td}>{formatINR(item.amount)}</td>
//                       </tr>
//                       {(item.inst_qty > 0 || item.inst_rate > 0) && (
//                         <tr>
//                           <td style={td}></td>
//                           <td style={{ ...td, fontStyle: "italic" }}>Installation</td>
//                           <td style={td}>{item.inst_unit}</td>
//                           <td style={td}>{item.inst_qty}</td>
//                           <td style={td}>{formatINR(item.inst_rate)}</td>
//                           <td style={td}>{formatINR(item.inst_amt)}</td>
//                         </tr>
//                       )}
//                     </React.Fragment>
//                   ))}
                  
//                   {additionalDetails.map((item, index) => (
//                     <tr key={`add-${index}`}>
//                       <td style={td}>*</td>
//                       <td style={td}><strong>{item.description}</strong></td>
//                       <td style={td}>{item.unit}</td>
//                       <td style={td}>{item.quantity}</td>
//                       <td style={td}>{formatINR(item.rate)}</td>
//                       <td style={td}>{formatINR(item.quantity * item.rate)}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>

//               {/* TOTALS (BLUE BOX) */}
//               <div style={{ float: "right", width: "45%", marginTop: "12px", marginBottom: "12px" }}>
//                 <table style={{ width: "100%", borderCollapse: "collapse" }}>
//                   <tbody>
//                     <tr>
//                       <td style={blueLeft}>Sub- Total</td>
//                       <td style={blueRight}>Rs {formatINR(basicAmount)}</td>
//                     </tr>
//                     <tr>
//                       <td style={blueLeft}>GST @ 18%</td>
//                       <td style={blueRight}>Rs {formatINR(gstAmount)}</td>
//                     </tr>
//                     <tr>
//                       <td style={blueLeft}><b>Grand Total</b></td>
//                       <td style={blueRight}><b>Rs {formatINR(grandTotal)}</b></td>
//                     </tr>
//                   </tbody>
//                 </table>
//               </div>
              
//               <div style={{ clear: "both" }}></div>

//               {/* BILLING / DISPATCH / TERMS */}
//               <div style={{ marginTop: "20px", marginBottom: "20px" }}>
                
//                 <h6>Terms & Conditions:</h6>

//                 <div style={{ border: "1px solid #000", marginBottom: "15px" }}>
//                   <div style={{ display: "flex" }}>
//                     <div style={{ width: "50%", padding: "8px", borderRight: "1px solid #000", boxSizing: "border-box" }}>
//                       <p style={{ margin: 0, fontWeight: "bold", textDecoration: "underline" }}>
//                         Billing Address / Correspondence Address :
//                       </p>
//                       <p style={{ margin: "5px 0 0 0", lineHeight: "1.4" }}>
//                         {billingAddress}
//                       </p>
//                       <p style={{ margin: "5px 0 0 0" }}><strong>GST No :</strong> {gstNumber}</p>
//                     </div>
//                     <div style={{ width: "50%", padding: "8px", boxSizing: "border-box" }}>
//                       <p style={{ margin: 0, fontWeight: "bold", textDecoration: "underline" }}>
//                         Dispatch address:
//                       </p>
//                       <p style={{ margin: "5px 0 0 0", lineHeight: "1.4" }}>
//                         {dispatchAddress}
//                       </p>
//                       <p style={{ margin: "5px 0 0 0" }}><strong>Contact Person :</strong> {clientName}</p>
//                       <p style={{ margin: "5px 0 0 0" }}><strong>Mob No.</strong> {mobileNumber}</p>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="nlf-terms-preview" style={{ fontSize: "11px", lineHeight: "1.6" }}>
//                   <div><strong>Delivery Schedule:</strong> {deliverySchedule}</div>
//                   <div><strong>Defect Liability Period:</strong> {liabilityPeriod}</div>
//                   <div><strong>Installation Scope:</strong> {installationScope}</div>
//                   <div><strong>Liquidated Damages:</strong> {liquidatedDamages}</div>
//                 </div>

//                 <div style={{ borderTop: "1px solid black", margin: "15px 0" }}></div>
                
//                 <div style={{ border: "1px solid #000", padding: "8px", display: "inline-block", minWidth: "200px" }}>
//                    <p style={{ margin: 0, fontWeight: "bold" }}>For NLF SOLUTIONS Pvt Ltd</p>
//                 </div>

//                 {poApprovalSuccess && signatureImage && (
//                   <div style={{ textAlign: "right", marginTop: "10px", float: "right" }}>
//                      <img src={signatureImage} alt="Signature" style={{ height: "40px", width: "auto" }} />
//                      <p style={{ fontSize: "10px", margin: "5px 0 0 0" }}>Authorized Signature</p>
//                   </div>
//                 )}
//               </div>

//               {/* FOOTER IMAGE */}
//               <div style={{ marginTop: "30px", width: "100%", borderTop: "2px solid #000" }}>
//                 <img src="/extra/Footer.jpeg" alt="Footer" style={{ width: "100%", height: "auto" }} />
//               </div>

//             </div>
//           )}
//         </div>

//         {/* Footer */}
//         <div
//           style={{
//             padding: "12px 14px",
//             borderTop: "1px solid #dee2e6",
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//             gap: 8,
//             flexWrap: "wrap",
//           }}
//         >
//           <div style={{ minWidth: 280 }}>
//             {enableApproval && !poApprovalSuccess ? (
//               <label style={{ display: "flex", alignItems: "center", cursor: "pointer", gap: 8 }}>
//                 <div className="custom-checkbox">
//                   <input type="checkbox" checked={poApproved} disabled={isUpdatingPO} onClick={onPOCheckboxClick} readOnly />
//                   <span></span>
//                 </div>
//                 {isUpdatingPO ? "Approving PO..." : "Approve Purchase Order"}
//               </label>
//             ) : enableApproval && poApprovalSuccess ? (
//               <div style={{ padding: 8, borderRadius: 6, background: "#e6f9ed", border: "1px solid #c7efd0", color: "#1b6a2b", fontWeight: 600, display: "inline-block" }}>
//                 Purchase Order approved successfully.
//               </div>
//             ) : null}
//           </div>

//           <div style={{ display: "flex", gap: "8px", marginLeft: "auto" }}>
//             <button
//               onClick={generatePDF} 
//               disabled={isGenerating || !poApprovalSuccess}
//               style={{ 
//                 padding: "8px 14px", 
//                 backgroundColor: poApprovalSuccess ? "#007bff" : "#ccc", 
//                 color: "white", 
//                 border: "none", 
//                 borderRadius: "4px", 
//                 cursor: isGenerating ? "not-allowed" : (poApprovalSuccess ? "pointer" : "not-allowed") 
//               }}
//             >
//               {isGenerating ? "Generating PDF..." : "Download PDF"}
//             </button>
//             <button
//               onClick={closeWithFade}
//               style={{
//                 padding: "8px 14px",
//                 backgroundColor: "#6c757d",
//                 color: "white",
//                 border: "none",
//                 borderRadius: "4px",
//                 cursor: "pointer",
//               }}
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       </div>

//       <style>{`
//         @keyframes spin {
//           0% { transform: rotate(0deg); }
//           100% { transform: rotate(360deg); }
//         }
//         .custom-checkbox {
//           position: relative;
//           display: inline-block;
//           width: 18px;
//           height: 18px;
//           margin-right: 8px;
//           border-radius: 4px;
//           background-color: #ffffff;
//           border: 1px solid #dcdcdc;
//           cursor: pointer;
//           transition: all 0.12s ease;
//           box-sizing: border-box;
//         }
//         .custom-checkbox span {
//           position: absolute;
//           inset: 0;
//           display: block;
//           border-radius: 4px;
//           pointer-events: none;
//           transition: background-color 120ms ease, border-color 120ms ease, box-shadow 120ms ease;
//           background: transparent;
//         }
//         .custom-checkbox input[type="checkbox"] {
//           position: absolute;
//           opacity: 0;
//           width: 100%;
//           height: 100%;
//           margin: 0;
//           left: 0;
//           top: 0;
//           cursor: pointer;
//         }
//         .custom-checkbox input[type="checkbox"] + span::after {
//           content: '';
//           position: absolute;
//           top: 50%;
//           left: 50%;
//           transform: translate(-50%, -50%);
//           font-weight: 700;
//           font-size: 12px;
//           color: transparent;
//           line-height: 1;
//         }
//         .custom-checkbox:hover {
//           border-color: #c0c0c0;
//           box-shadow: 0 0 0 2px rgba(0,0,0,0.02);
//         }
//         .custom-checkbox input[type="checkbox"]:checked + span {
//           background-color: #ed3131;
//           border-color: #ed3131;
//         }
//         .custom-checkbox input[type="checkbox"]:checked + span::after {
//           content: '✓';
//           color: #ffffff;
//           font-size: 12px;
//           position: absolute;
//           top: 50%;
//           left: 50%;
//           transform: translate(-50%, -50%);
//         }
//         .custom-checkbox input[type="checkbox"]:disabled + span {
//           opacity: 0.6;
//           filter: grayscale(0.2);
//         }
//         .custom-checkbox input[type="checkbox"]:disabled {
//           cursor: not-allowed;
//         }
//         .nlf-terms-preview { font-family: Arial, sans-serif; }
//         .nlf-terms-preview div { margin-bottom: 4px; }
//       `}</style>
//     </>
//   );
// };

// export default PoView;

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

// --- Helper Functions ---

const isApprovedValue = (val) => {
  if (!val) return false;
  const s = String(val).trim().toLowerCase();
  return ["yes", "approved", "true", "1"].includes(s);
};

// --- Main Component ---

const PoView = ({ show, onHide, poData, enableApproval, onPOApproved }) => {
  const [fetchedData, setFetchedData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [poApproved, setPoApproved] = useState(false);
  const [isUpdatingPO, setIsUpdatingPO] = useState(false);
  const [poApprovalSuccess, setPoApprovalSuccess] = useState(false);
  const [signatureImage, setSignatureImage] = useState(null);
  const [branchImageMap, setBranchImageMap] = useState({});
  const [quotationData, setQuotationData] = useState(null);
  
  const pdfContentRef = useRef();
  const [visible, setVisible] = useState(!!show);
  const [closing, setClosing] = useState(false);
  const FADE_MS = 300;

  useEffect(() => {
    if (show) {
      setVisible(true);
      setClosing(false);
    } else {
      if (visible && !closing) {
        setClosing(true);
        const t = setTimeout(() => {
          setVisible(false);
          setClosing(false);
        }, FADE_MS);
        return () => clearTimeout(t);
      }
    }
  }, [show, visible, closing]);

  const closeWithFade = () => {
    if (closing) return;
    setClosing(true);
    setTimeout(() => {
      setVisible(false);
      setClosing(false);
      if (typeof onHide === "function") onHide();
    }, FADE_MS);
  };

  const wait = (ms) => new Promise((res) => setTimeout(res, ms));

  useEffect(() => {
    if (!show) return;

    const fetchBranches = async () => {
      try {
        const res = await fetch("https://nlfs.in/erp/index.php/Erp/branch_list", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        const data = await res.json();
        if (data.status && data.success === "1") {
          const map = {};
          (data.data || []).forEach((b) => {
            if (b.branch_name && b.header_image) {
              map[b.branch_name] = b.header_image;
            }
          });
          setBranchImageMap(map);
        }
      } catch (e) {
        console.error("Failed to load branch images", e);
      }
    };

    const fetchQuotationData = async () => {
      if (poData && poData.quote_id) {
        try {
          const response = await axios.post(
            "https://nlfs.in/erp/index.php/Nlf_Erp/get_quotation_by_id",
            { quote_id: poData.quote_id }
          );
          if (response.data && response.data.status) {
            setQuotationData(response.data.data);
          }
        } catch (error) {
          console.error("Error fetching quotation data:", error);
        }
      }
    };

    fetchBranches();
    fetchQuotationData();
  }, [show, poData]);

  useEffect(() => {
    if (poData) {
      const approved = isApprovedValue(poData.po_approval);
      setPoApproved(approved);
      setPoApprovalSuccess(approved);
      
      if (approved && !signatureImage) {
         setSignatureImage("/extra/sign.jpg");
      } else if (!approved) {
         setSignatureImage(null);
      }
    }
  }, [poData]);

  const formatINR = (num) => Number(num || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });

  const poNumber = poData?.po_no || poData?.poNumber || "N/A";
  const poDateRaw = poData?.date || poData?.poDate;
  const poDate = poDateRaw 
    ? new Date(poDateRaw).toLocaleDateString("en-GB")
    : "-";

  const company = poData?.vender_name || poData?.vendor_name || poData?.company || "-";
  
  const clientName = quotationData?.name || poData?.name || poData?.contact_person || "-";
  const siteAddress = poData?.site_address || poData?.siteAddress || "-";
  const projectName = poData?.projectName || poData?.project || "-";
  
  const billingAddressRaw = poData?.billing_address || poData?.billingAddress || "";
  const dispatchAddressRaw = poData?.dispatch_address || poData?.dispatchAddress || "";
  const billingAddress = billingAddressRaw || siteAddress;
  const dispatchAddress = dispatchAddressRaw || siteAddress;
  
  const gstNumber = poData?.gst_number || poData?.gstNumber || "Not Provided";
  const mobileNumber = poData?.mobile || poData?.contactNumber || "-";

  const basicAmount = parseFloat(poData?.total_amt || poData?.totalAmount || 0);
  const gstPercent = 18;
  const gstAmount = parseFloat(poData?.gst_amount || (basicAmount * gstPercent) / 100);
  const grandTotal = basicAmount + gstAmount;

  const deliverySchedule = poData?.delivery_schedule || "-";
  const liabilityPeriod = poData?.defect_liability_period || "-";
  const installationScope = poData?.installation_scope || "-";
  const liquidatedDamages = poData?.liquidated_damages || "-";

  const itemsArray = Array.isArray(poData?.items)
    ? poData.items.map((item) => ({
        material: item.product || item.material || "ITEM",
        description: item.desc || item.description || "",
        unit: item.unit || "-",
        qty: item.qty || item.quantity || "",
        rate: item.rate || 0,
        amount: item.amt || item.total || 0,
        inst_qty: item.inst_qty || 0,
        inst_rate: item.inst_rate || 0,
        inst_amt: item.inst_amt || 0,
        inst_unit: item.inst_unit || "-",
        spec_image: item.spec_image || item.Spec_Image || item.image || item.img,
      }))
    : [];

  const additionalDetails = Array.isArray(poData?.additionalDetails)
    ? poData.additionalDetails
    : [];

  const resolveHeaderImage = (branchName) => {
    const localBranchHeaders = {
      "Kolkata": "/extra/Kolkata.jpeg",
      "Delhi": "/extra/Delhi.jpeg",
      "Indore": "/extra/Indore.jpeg",
      "Nagpur": "/extra/Nagpur.jpeg",
      "Mumbai": "/extra/Mumbai.jpeg",
    };
    if (localBranchHeaders[branchName]) return localBranchHeaders[branchName];
    return localBranchHeaders["Mumbai"];
  };

  const officeBranch = poData?.branch || "Mumbai";
  const headerImagePath = resolveHeaderImage(officeBranch);

  const handlePOApproval = async () => {
    if (!poData?.po_id) return alert("Missing PO ID.");
    if (poApproved) return;

    setPoApproved(true);
    setIsUpdatingPO(true);
    await wait(900);
    try {
      const response = await fetch(
        "https://nlfs.in/erp/index.php/Nlf_Erp/update_po_approval",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ po_id: String(poData.po_id), po_approval: "yes" }),
        }
      );
      const result = await response.json();
      if (result.status === true || result.status === "true") {
        setPoApprovalSuccess(true);
        alert("Purchase Order approved successfully!");

        if (onPOApproved && typeof onPOApproved === 'function') {
          onPOApproved(poData.po_id);
        }

        setTimeout(closeWithFade, 400);
      } else {
        setPoApproved(false);
        alert(result.message || "Failed to approve PO.");
      }
    } catch (err) {
      console.error(err);
      setPoApproved(false);
      alert("Error approving PO.");
    } finally {
      setIsUpdatingPO(false);
    }
  };

  const onPOCheckboxClick = (e) => {
    e.preventDefault();
    if (poApproved || isUpdatingPO) return;
    const confirmed = window.confirm(
      "Proceed with PO approval?\n\nOnce approved, this action cannot be reverted."
    );
    if (confirmed) handlePOApproval();
  };

  const th = { border: "1px solid #000", padding: "6px", fontWeight: "bold" };
  const td = { border: "1px solid #000", padding: "6px" };
  const blueLeft = { border: "1px solid #000", padding: "4px 6px", background: "#007bff", color: "white", width: "70%", fontSize: "10px" };
  const blueRight = { border: "1px solid #000", padding: "4px 6px", background: "#007bff", color: "white", textAlign: "right", fontSize: "10px" };

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.45)",
          zIndex: 1040,
          opacity: closing ? 0 : 1,
          transition: `opacity ${FADE_MS}ms ease`,
        }}
        onClick={closeWithFade}
      />
      
      {/* Modal */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: closing
            ? "translate(-50%, -50%) scale(0.99)"
            : "translate(-50%, -50%) scale(1)",
          backgroundColor: "white",
          borderRadius: "6px",
          boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
          zIndex: 1050,
          width: "92%",
          maxWidth: "900px",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          opacity: closing ? 0 : 1,
          transition: `opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease`,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "12px 14px",
            borderBottom: "1px solid #dee2e6",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h5 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 600 }}>
            Purchase Order Preview - {poNumber}
          </h5>
          <button
            onClick={closeWithFade}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.4rem",
              cursor: "pointer",
              padding: "0",
              lineHeight: "1",
            }}
          >
            ×
          </button>
        </div>
        
        {/* Body - NO PADDING, overflow on inner content */}
        <div
          style={{
            padding: "0",
            overflowY: "auto",
            flex: 1,
          }}
        >
          {isLoading ? (
            <div style={{ textAlign: "center", padding: "28px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  border: "4px solid #f3f3f3",
                  borderTop: "4px solid #ed3131",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto",
                }}
              />
              <p style={{ marginTop: "12px" }}>Loading data...</p>
            </div>
          ) : (
            <div
              ref={pdfContentRef}
              style={{
                padding: "15px",
                backgroundColor: "white",
                fontFamily: "Arial, sans-serif",
                fontSize: "10.5px",
                width: "210mm",
                margin: "0 auto",
                border: "1px solid #ddd",
              }}
            >
              {/* HEADER IMAGE */}
              <div style={{ width: "100%", border: "1px solid #000", overflow: "hidden" }}>
                {headerImagePath ? (
                  <img src={headerImagePath} alt="Header" style={{ width: "100%", height: "auto", display: "block" }} />
                ) : (
                  <div style={{ padding: "12px", textAlign: "center", color: "#777" }}>No header image</div>
                )}
              </div>

              {/* TITLE */}
              <h3 style={{ textAlign: "center", margin: "15px 0", fontWeight: "bold" }}>PURCHASE ORDER</h3>

              {/* DETAILS BAR */}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <div><strong>{poNumber}</strong></div>
                <div><strong>Date:</strong> {poDate}</div>
              </div>

              {/* CLIENT INFO */}
              <div style={{ lineHeight: "1.4", marginBottom: "15px" }}>
                <p style={{ margin: 0 }}><strong>To,</strong></p>
                <p style={{ margin: 0 }}>{company}</p>
                <p style={{ margin: 0, textTransform: "uppercase" }}>{siteAddress}</p>
                <p style={{ margin: 0 }}><strong>Project:</strong> {projectName}</p>
              </div>

              {/* INTRO */}
              <p style={{ marginBottom: "15px" }}>
                <strong>Dear Sir,</strong><br />
                We are pleased to place an order on you as per details given below:
              </p>

              {/* ITEMS TABLE */}
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#007bff", color: "white", textAlign: "center" }}>
                    <th style={th}>Sr.No</th>
                    <th style={th}>Description</th>
                    <th style={th}>Unit</th>
                    <th style={th}>Qty</th>
                    <th style={th}>Rate</th>
                    <th style={th}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {itemsArray.map((item, idx) => (
                    <React.Fragment key={idx}>
                      <tr>
                        <td style={td}>{idx + 1}</td>
                        <td style={td}>
                          <div style={{ fontWeight: "bold", textTransform: "uppercase", marginBottom: "2px" }}>
                            {item.material}
                          </div>
                          <div>{item.description}</div>
                        </td>
                        <td style={td}>{item.unit}</td>
                        <td style={td}>{item.qty}</td>
                        <td style={td}>{formatINR(item.rate)}</td>
                        <td style={td}>{formatINR(item.amount)}</td>
                      </tr>
                      {(item.inst_qty > 0 || item.inst_rate > 0) && (
                        <tr>
                          <td style={td}></td>
                          <td style={{ ...td, fontStyle: "italic" }}>Installation</td>
                          <td style={td}>{item.inst_unit}</td>
                          <td style={td}>{item.inst_qty}</td>
                          <td style={td}>{formatINR(item.inst_rate)}</td>
                          <td style={td}>{formatINR(item.inst_amt)}</td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                  
                  {additionalDetails.map((item, index) => (
                    <tr key={`add-${index}`}>
                      <td style={td}>*</td>
                      <td style={td}><strong>{item.description}</strong></td>
                      <td style={td}>{item.unit}</td>
                      <td style={td}>{item.quantity}</td>
                      <td style={td}>{formatINR(item.rate)}</td>
                      <td style={td}>{formatINR(item.quantity * item.rate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* TOTALS (BLUE BOX) */}
              <div style={{ float: "right", width: "45%", marginTop: "12px", marginBottom: "12px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    <tr>
                      <td style={blueLeft}>Sub- Total</td>
                      <td style={blueRight}>Rs {formatINR(basicAmount)}</td>
                    </tr>
                    <tr>
                      <td style={blueLeft}>GST @ 18%</td>
                      <td style={blueRight}>Rs {formatINR(gstAmount)}</td>
                    </tr>
                    <tr>
                      <td style={blueLeft}><b>Grand Total</b></td>
                      <td style={blueRight}><b>Rs {formatINR(grandTotal)}</b></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div style={{ clear: "both" }}></div>

              {/* BILLING / DISPATCH / TERMS */}
              <div style={{ marginTop: "20px", marginBottom: "20px" }}>
                
                <h6>Terms & Conditions:</h6>

                <div style={{ border: "1px solid #000", marginBottom: "15px" }}>
                  <div style={{ display: "flex" }}>
                    <div style={{ width: "50%", padding: "8px", borderRight: "1px solid #000", boxSizing: "border-box" }}>
                      <p style={{ margin: 0, fontWeight: "bold", textDecoration: "underline" }}>
                        Billing Address / Correspondence Address :
                      </p>
                      <p style={{ margin: "5px 0 0 0", lineHeight: "1.4" }}>
                        {billingAddress}
                      </p>
                      <p style={{ margin: "5px 0 0 0" }}><strong>GST No :</strong> {gstNumber}</p>
                    </div>
                    <div style={{ width: "50%", padding: "8px", boxSizing: "border-box" }}>
                      <p style={{ margin: 0, fontWeight: "bold", textDecoration: "underline" }}>
                        Dispatch address:
                      </p>
                      <p style={{ margin: "5px 0 0 0", lineHeight: "1.4" }}>
                        {dispatchAddress}
                      </p>
                      <p style={{ margin: "5px 0 0 0" }}><strong>Contact Person :</strong> {clientName}</p>
                      <p style={{ margin: "5px 0 0 0" }}><strong>Mob No.</strong> {mobileNumber}</p>
                    </div>
                  </div>
                </div>

                <div className="nlf-terms-preview" style={{ fontSize: "11px", lineHeight: "1.6" }}>
                  <div><strong>Delivery Schedule:</strong> {deliverySchedule}</div>
                  <div><strong>Defect Liability Period:</strong> {liabilityPeriod}</div>
                  <div><strong>Installation Scope:</strong> {installationScope}</div>
                  <div><strong>Liquidated Damages:</strong> {liquidatedDamages}</div>
                </div>

                <div style={{ borderTop: "1px solid black", margin: "15px 0" }}></div>
                
                <div style={{ border: "1px solid #000", padding: "8px", display: "inline-block", minWidth: "200px" }}>
                   <p style={{ margin: 0, fontWeight: "bold" }}>For NLF SOLUTIONS Pvt Ltd</p>
                </div>

                {poApprovalSuccess && signatureImage && (
                  <div style={{ textAlign: "right", marginTop: "10px", float: "right" }}>
                     <img src={signatureImage} alt="Signature" style={{ height: "40px", width: "auto" }} />
                     <p style={{ fontSize: "10px", margin: "5px 0 0 0" }}>Authorized Signature</p>
                  </div>
                )}
              </div>

              {/* FOOTER IMAGE */}
              <div style={{ marginTop: "30px", width: "100%", borderTop: "2px solid #000" }}>
                <img src="/extra/Footer.jpeg" alt="Footer" style={{ width: "100%", height: "auto" }} />
              </div>

            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "12px 14px",
            borderTop: "1px solid #dee2e6",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <div style={{ minWidth: 280 }}>
            {enableApproval && !poApprovalSuccess ? (
              <label style={{ display: "flex", alignItems: "center", cursor: "pointer", gap: 8 }}>
                <div className="custom-checkbox">
                  <input type="checkbox" checked={poApproved} disabled={isUpdatingPO} onClick={onPOCheckboxClick} readOnly />
                  <span></span>
                </div>
                {isUpdatingPO ? "Approving PO..." : "Approve Purchase Order"}
              </label>
            ) : enableApproval && poApprovalSuccess ? (
              <div style={{ padding: 8, borderRadius: 6, background: "#e6f9ed", border: "1px solid #c7efd0", color: "#1b6a2b", fontWeight: 600, display: "inline-block" }}>
                Purchase Order approved successfully.
              </div>
            ) : null}
          </div>

          <div style={{ display: "flex", gap: "8px", marginLeft: "auto" }}>
            <button
              onClick={closeWithFade}
              style={{
                padding: "8px 14px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .custom-checkbox {
          position: relative;
          display: inline-block;
          width: 18px;
          height: 18px;
          margin-right: 8px;
          border-radius: 4px;
          background-color: #ffffff;
          border: 1px solid #dcdcdc;
          cursor: pointer;
          transition: all 0.12s ease;
          box-sizing: border-box;
        }
        .custom-checkbox span {
          position: absolute;
          inset: 0;
          display: block;
          border-radius: 4px;
          pointer-events: none;
          transition: background-color 120ms ease, border-color 120ms ease, box-shadow 120ms ease;
          background: transparent;
        }
        .custom-checkbox input[type="checkbox"] {
          position: absolute;
          opacity: 0;
          width: 100%;
          height: 100%;
          margin: 0;
          left: 0;
          top: 0;
          cursor: pointer;
        }
        .custom-checkbox input[type="checkbox"] + span::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-weight: 700;
          font-size: 12px;
          color: transparent;
          line-height: 1;
        }
        .custom-checkbox:hover {
          border-color: #c0c0c0;
          box-shadow: 0 0 0 2px rgba(0,0,0,0.02);
        }
        .custom-checkbox input[type="checkbox"]:checked + span {
          background-color: #ed3131;
          border-color: #ed3131;
        }
        .custom-checkbox input[type="checkbox"]:checked + span::after {
          content: '✓';
          color: #ffffff;
          font-size: 12px;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        .custom-checkbox input[type="checkbox"]:disabled + span {
          opacity: 0.6;
          filter: grayscale(0.2);
        }
        .custom-checkbox input[type="checkbox"]:disabled {
          cursor: not-allowed;
        }
        .nlf-terms-preview { font-family: Arial, sans-serif; }
        .nlf-terms-preview div { margin-bottom: 4px; }
      `}</style>
    </>
  );
};

export default PoView;