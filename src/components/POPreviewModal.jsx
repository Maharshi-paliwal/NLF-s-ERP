import React, { useState, useRef, useEffect } from "react";
import { Modal, Button, Spinner } from "react-bootstrap";
import axios from "axios";

const POPreviewModal = ({ show, onHide, poData }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [branchList, setBranchList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const pdfContentRef = useRef();
  const [branchImageMap, setBranchImageMap] = useState({});
  const [quotationData, setQuotationData] = useState(null);

  // Fetch branch list when component mounts
  useEffect(() => {
    if (!show) return;

    const fetchBranches = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(
          "https://nlfs.in/erp/index.php/Erp/branch_list",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
          }
        );

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
      } catch (err) {
        console.error("Failed to load branch headers", err);
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch quotation data if quote_id is available
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

  if (!poData) return null;

  // ========= NORMALISED FIELDS FROM API + FORM =========
  // IDs / numbers / dates
  const poNumber = poData.po_no || poData.poNumber || poData.poId || "N/A";
  const poDateRaw = poData.date || poData.poDate || null;
  const poDate = poDateRaw
    ? new Date(poDateRaw).toLocaleDateString("en-IN")
    : "N/A";

  // Client & company info
  const company = poData.company || poData.companyName || "-";

  // FIXED: Use name from quotation data if available
  // FIXED: Use name from quotation data if available
  // Use name from quotation data if available, otherwise fall back to poData fields
  const clientName =
    (quotationData?.name && quotationData.name.trim() !== "") ? quotationData.name : // Prioritize non-empty name from quotation
      (poData.name && poData.name.trim() !== "") ? poData.name : // Then check for non-empty name in poData
        (poData.contact_person && poData.contact_person.trim() !== "") ? poData.contact_person :
          (poData.clientName && poData.clientName.trim() !== "") ? poData.clientName :
            (poData.contactPerson && poData.contactPerson.trim() !== "") ? poData.contactPerson :
              (poData.project && poData.project.trim() !== "") ? poData.project :
                "-"; // Final fallback

  const siteAddress = poData.site_address || poData.siteAddress || "-";
  const billingAddress =
    poData.billing_address || poData.billingAddress || siteAddress; // Use site address as fallback
  const gstNumber = poData.gst_number || poData.gstNumber || "Not Provided";
  const panNumber = poData.pan_number || poData.panNumber || "-";

  // Project / subject
  const projectName = poData.projectName || poData.project || "Office Furniture";

  // Amounts / GST – support both API and form keys
  const basicAmount =
    parseFloat(poData.total_amt) || parseFloat(poData.totalAmount) || 0;

  const gstPercent =
    parseFloat(
      String(poData.gst || poData.gstPercentage || "18").replace("%", "")
    ) || 18;

  const gstAmountExplicit = parseFloat(poData.gstAmount || 0);
  const gstAmount = gstAmountExplicit || (basicAmount * gstPercent) / 100;

  const grandTotalExplicit = parseFloat(poData.totalInvoiceAmount || 0);
  const grandTotal = grandTotalExplicit || basicAmount + gstAmount;

  const advanceAmount =
    parseFloat(poData.total_advance) ||
    parseFloat(poData.advancePaymentAmount) ||
    0;

  const balanceAmount =
    parseFloat(poData.total_bal) ||
    parseFloat(poData.balancePaymentAmount) ||
    0;

  // Terms-related (API or form)
  const deliverySchedule =
    poData.delivery_schedule ||
    poData.termsAndConditions?.deliverySchedule?.deliveryNotes ||
    "-";

  const liquidatedDamages =
    poData.liquidated_damages ||
    poData.termsAndConditions?.liquidatedDamages?.description ||
    "-";

  const defectLiabilityPeriod =
    poData.defect_liability_period ||
    poData.termsAndConditions?.defectLiabilityPeriod?.duration ||
    "-";

  const installationScope =
    poData.installation_scope ||
    poData.termsAndConditions?.installationAndCommissioning?.installationScope ||
    "-";

  // Dispatch address from Excel image
  const dispatchAddress = poData.dispatch_address || poData.dispatchAddress || siteAddress;

  // ======== BRANCH / HEADER IMAGE ========
  const officeBranch = poData.branch || poData.officeBranch || "Mumbai";

  // Use local images to ensure PDF generation works without CORS issues
  const localBranchHeaders = {
    'Kolkata': '/extra/Kolkata.jpeg',
    'Delhi': '/extra/Delhi.jpeg',
    'Indore': '/extra/Indore.jpeg',
    'Nagpur': '/extra/Nagpur.jpeg',
    'Mumbai': '/extra/Mumbai.jpeg',
  };

  const resolveHeaderImage = (branchName) => {
    // Prefer local image if available (fixes PDF CORS issues)
    if (localBranchHeaders[branchName]) {
      return localBranchHeaders[branchName];
    }

    // Fallback to Mumbai if branch not found in local map
    // (Or use API logic if strictly required, but local is safer for PDF)
    return localBranchHeaders['Mumbai'] || '/extra/Mumbai.jpeg';

    /* API Logic (Disabled for PDF reliability):
    if (!branchName) return null;
    const img = branchImageMap[branchName];
    if (!img) return null;
    if (/^https?:\/\//i.test(img)) return img;
    return `https://nlfs.in/erp/${img.replace(/^\/+/, "")}`;
    */
  };

  const headerImagePath = resolveHeaderImage(officeBranch);

  const resolveProductImage = (img) => {
    if (!img) return null;
    if (typeof img !== "string") return null;
    if (/^https?:\/\//i.test(img)) return img;
    return `https://nlfs.in/erp/${img.replace(/^\/+/, "")}`;
  };

  // ======== HELPERS ========
  const formatINR = (num) => Number(num || 0).toLocaleString("en-IN");

  // Make sure itemsArray is always an array and normalize keys
  const itemsArray = Array.isArray(poData.items)
    ? poData.items.map((item) => ({
      material: item.product || item.material || "ITEM",
      description: item.desc || item.description || "",
      unit: item.unit || "-",
      quantity: item.qty || item.quantity || "",
      rate: item.rate || "",
      inst_amt: item.inst_amt || item.amt || "",
      total: item.total || item.amt || "",
      spec_image:
        item.spec_image ||
        item.Spec_Image ||
        item.SPEC_IMAGE ||
        item.spec_img ||
        item.image ||
        item.Item_Image ||
        item.product_image ||
        item.img ||
        item.specification_image ||
        item.specification?.image ||
        item.specification?.spec_image ||
        item.product_details?.image ||
        item.product_details?.spec_image,
    }))
    : [];

  const additionalDetails = Array.isArray(poData.additionalDetails)
    ? poData.additionalDetails
    : [];

  const th = {
    border: "1px solid #000",
    padding: "6px",
    fontWeight: "bold",
  };
  const td = { border: "1px solid #000", padding: "6px" };
  const blueLeft = {
    border: "1px solid #000",
    padding: "6px",
    background: "#007bff",
    color: "white",
    width: "70%",
  };
  const blueRight = {
    border: "1px solid #000",
    padding: "6px",
    background: "#007bff",
    color: "white",
    textAlign: "right",
  };

  // Helper function to get base64 image from URL
  // const getBase64ImageFromURL = (url) => {
  //   return new Promise((resolve, reject) => {
  //     const img = new Image();
  //     img.setAttribute("crossOrigin", "anonymous");
  //     img.onload = () => {
  //       const canvas = document.createElement("canvas");
  //       canvas.width = img.width;
  //       canvas.height = img.height;
  //       const ctx = canvas.getContext("2d");
  //       ctx.drawImage(img, 0, 0);
  //       try {
  //         const dataURL = canvas.toDataURL("image/jpeg");
  //         resolve(dataURL);
  //       } catch (e) {
  //         console.warn("Canvas tainted, cannot export base64 for URL:", url);
  //         resolve(null);
  //       }
  //     };
  //     img.onerror = (error) => {
  //       console.warn("Image load failed for URL:", url);
  //       resolve(null);
  //     };
  //     img.src = url;
  //   });
  // };

  const getBase64ImageFromURL = (url) =>
    new Promise((resolve) => {
      if (!url) return resolve(null);

      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          canvas.getContext("2d").drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/jpeg"));
        } catch (e) {
          console.warn("Canvas tainted:", url);
          resolve(null); // ✅ DO NOT FAIL PDF
        }
      };
      img.onerror = () => {
        console.warn("Image failed to load:", url);
        resolve(null); // ✅ DO NOT FAIL PDF
      };

      img.src = url;
    });


  // ======== PDF GENERATION ========
  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      // Import jsPDF and autoTable dynamically
      const jsPDF = (await import("jspdf")).default;
      const autoTable = (await import("jspdf-autotable")).default;

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10;

      // Get header and footer images
      const headerRawUrl = headerImagePath;
      const footerRawUrl = "/extra/Footer.jpeg";

      // Use proxy for PDF generation to avoid CORS/Canvas tainting
      let headerUrlForPdf = headerRawUrl;

      // if (headerRawUrl && headerRawUrl.startsWith("https://nlfs.in/erp")) {
      //   headerUrlForPdf = headerRawUrl.replace(
      //     "https://nlfs.in/erp",
      //     "/erp-image-proxy"
      //   );
      // }

      // Pre-fetch Base64 data
      const [headerImgData, footerImgData] = await Promise.all([
        headerUrlForPdf
          ? getBase64ImageFromURL(headerUrlForPdf)
          : Promise.resolve(null),
        getBase64ImageFromURL(footerRawUrl),
      ]);

      // Pre-fetch item images
      const itemImages = await Promise.all(
        itemsArray.map(async (item) => {
          const imgUrl = resolveProductImage(item.spec_image);
          if (!imgUrl) return null;

          // Proxy URL for PDF generation
          let urlForPdf = imgUrl;
          if (imgUrl.startsWith("https://nlfs.in/erp")) {
            urlForPdf = imgUrl.replace(
              "https://nlfs.in/erp",
              "/erp-image-proxy"
            );
          }
          return getBase64ImageFromURL(urlForPdf);
        })
      );

      const headerHeight = 24;
      const footerHeight = 16;

      // Functions to draw header and footer
      const drawHeader = () => {
        if (!headerImgData) return;
        try {
          pdf.addImage(
            headerImgData,
            "JPEG",
            margin,
            margin,
            pageWidth - 2 * margin,
            headerHeight
          );
        } catch (e) {
          console.error("Header image load failed", e);
        }
      };

      const drawFooter = () => {
        if (!footerImgData) return;
        try {
          const footerY = pageHeight - footerHeight - margin;
          pdf.addImage(
            footerImgData,
            "JPEG",
            margin,
            footerY,
            pageWidth - 2 * margin,
            footerHeight
          );
        } catch (e) {
          console.error("Error loading footer:", e);
        }
      };

      const drawBorder = (x, y, width, height) => {
        pdf.setLineWidth(0.4);
        pdf.rect(x, y, width, height);
      };

      // Start with header
      drawHeader();

      let yPosition = margin + headerHeight + 6;

      // Function to check if we need a new page
      const checkNewPage = (requiredSpace) => {
        if (yPosition + requiredSpace > pageHeight - footerHeight - margin) {
          drawFooter();
          pdf.addPage();
          drawHeader();
          yPosition = margin + headerHeight + 6;
        }
      };

      // Draw main border around document
      drawBorder(
        margin,
        margin + headerHeight,
        pageWidth - 2 * margin,
        pageHeight - 2 * margin - headerHeight - footerHeight
      );

      // Title
      yPosition += 2;
      pdf.setFontSize(14);
      pdf.setFont(undefined, "bold");
      pdf.text("PURCHASE ORDER", pageWidth / 2, yPosition, { align: "center" });
      yPosition += 1;

      // Border under title
      pdf.setLineWidth(0.4);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 4;

      // PO number and date
      pdf.setFontSize(10);
      pdf.setFont(undefined, "bold");
      pdf.text(`PO No: ${poNumber}`, margin + 2, yPosition);
      pdf.text(`Date: ${poDate}`, pageWidth - margin - 4, yPosition, { align: "right" });
      yPosition += 4;

      // Border under PO info
      pdf.setLineWidth(0.4);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 6;

      // To section
      pdf.setFont(undefined, "normal");
      pdf.setFontSize(10);
      pdf.text("To,", margin + 4, yPosition);
      yPosition += 6;
      pdf.text(company, margin + 4, yPosition);
      yPosition += 6;
      pdf.text(siteAddress, margin + 4, yPosition);
      yPosition += 6;

      // Dear Sir text
      pdf.text("Dear Sir,", margin + 4, yPosition);
      yPosition += 6;
      const intro = "We are pleased to place an order on you as per details given below:";
      const introLines = pdf.splitTextToSize(intro, pageWidth - 2 * margin - 8);
      introLines.forEach((line) => {
        checkNewPage(6);
        pdf.text(line, margin + 4, yPosition);
        yPosition += 5.5;
      });
      yPosition += 6;

      // Border under intro
      pdf.setLineWidth(0.4);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;

      // Prepare table data
      const tableData = [];
      const rowImageMap = {}; // rowIndex -> base64Data

      itemsArray.forEach((item, idx) => {
        // Main item
        const rowIndex = tableData.length;
        if (itemImages[idx]) {
          rowImageMap[rowIndex] = itemImages[idx];
        }

        tableData.push([
          String(idx + 1),
          `${item.material}\n${item.description}`,
          item.unit,
          item.quantity,
          formatINR(item.rate),
          "", // Placeholder for Image
          formatINR(item.amount),
        ]);

        // Installation row if applicable
        if (parseFloat(item.inst_qty) > 0 || parseFloat(item.inst_rate) > 0) {
          tableData.push([
            "",
            "Installation",
            item.inst_unit,
            item.inst_qty,
            formatINR(item.inst_rate),
            "", // No image for installation
            formatINR(item.inst_amt),
          ]);
        }
      });

      additionalDetails.forEach((item) => {
        const qty = item.quantity ?? "";
        const rate = item.rate ?? "";
        const amount = item.total ?? qty * rate;

        tableData.push([
          "*",
          item.description,
          item.unit,
          qty,
          formatINR(rate),
          "", // No image for additional details
          formatINR(amount),
        ]);
      });

      // Create the table
      autoTable(pdf, {
        startY: yPosition,
        head: [
          ["Sr.No", "Description", "Unit", "Qty", "Rate", "Image", "Amount"],
        ],
        body: tableData,
        theme: "grid",
        tableWidth: pageWidth - 2 * margin,
        columnStyles: {
          0: { halign: "center", cellWidth: 10 }, // Sr.No
          1: { cellWidth: "auto" }, // Description (BIG)
          2: { halign: "center", cellWidth: 12 }, // Unit
          3: { halign: "right", cellWidth: 12 }, // Qty
          4: { halign: "right", cellWidth: 18 }, // Rate
          5: { halign: "center", cellWidth: 20 }, // Image
          6: { halign: "right", cellWidth: 22 }, // Amount
        },
        styles: {
          fontSize: 8,
          cellPadding: 1.5,
          overflow: "linebreak",
          lineWidth: 0.4,
          lineColor: [0, 0, 0],
          valign: "middle", // ensure text is vertically centered
          minCellHeight: 15, // ensure enough height for image
        },
        headStyles: {
          fillColor: [0, 86, 179],
          textColor: 255,
          fontStyle: "bold",
          fontSize: 9,
          halign: "center",
          valign: "middle",
          lineWidth: 0.4,
        },
        didDrawCell: (data) => {
          if (data.section === "body" && data.column.index === 5) {
            const imgData = rowImageMap[data.row.index];
            if (imgData) {
              try {
                const padding = 2;
                const boxWidth = data.cell.width - 2 * padding;
                const boxHeight = data.cell.height - 2 * padding;
                const imgSize = Math.min(boxWidth, boxHeight);

                pdf.addImage(
                  imgData,
                  "JPEG",
                  data.cell.x + (data.cell.width - imgSize) / 2,
                  data.cell.y + (data.cell.height - imgSize) / 2,
                  imgSize,
                  imgSize
                );
              } catch (e) {
                console.error("Error drawing row image", e);
              }
            }
          }
        },
        didDrawPage: () => {
          drawHeader();
          drawFooter();
        },
        margin: {
          top: margin + headerHeight + 4,
          bottom: footerHeight + 8,
          left: margin,
          right: margin,
        },
      });

      yPosition = pdf.lastAutoTable.finalY + 8;

      // Border under table
      pdf.setLineWidth(0.4);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;

      // Totals section
      checkNewPage(40);
      const totalsX = pageWidth - margin - 80;

      pdf.setFillColor(0, 86, 179);
      pdf.rect(totalsX, yPosition, 80, 8, "F");
      pdf.rect(totalsX, yPosition + 8, 80, 8, "F");
      pdf.rect(totalsX, yPosition + 16, 80, 8, "F");

      pdf.setLineWidth(0.4);
      pdf.rect(totalsX, yPosition, 80, 8);
      pdf.rect(totalsX, yPosition + 8, 80, 8);
      pdf.rect(totalsX, yPosition + 16, 80, 8);

      pdf.setFont(undefined, "bold");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(9);
      pdf.text("Sub- Total", totalsX + 4, yPosition + 6);
      pdf.text(`₹${formatINR(basicAmount)}`, totalsX + 76, yPosition + 6, { align: "right" });

      pdf.text("GST- 18%", totalsX + 4, yPosition + 14);
      pdf.text(`₹${formatINR(gstAmount)}`, totalsX + 76, yPosition + 14, { align: "right" });

      pdf.text("Grand Total", totalsX + 4, yPosition + 22);
      pdf.text(`₹${formatINR(grandTotal)}`, totalsX + 76, yPosition + 22, { align: "right" });

      pdf.setTextColor(0, 0, 0);
      yPosition += 30;

      // Border under totals
      pdf.setLineWidth(0.4);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 6;

      // Billing and dispatch addresses - Using the original layout with borders
      checkNewPage(60);

      // Draw the bordered container for addresses
      drawBorder(margin, yPosition, pageWidth - 2 * margin, 50);

      // Draw the vertical divider
      pdf.line(pageWidth / 2, yPosition, pageWidth / 2, yPosition + 50);

      // Billing Address (Left Side)
      pdf.setFont(undefined, "bold");
      pdf.text("Billing Address/ Correspondence Address :", margin + 4, yPosition + 8);

      pdf.setFont(undefined, "normal");
      const billingLines = pdf.splitTextToSize(billingAddress, (pageWidth / 2) - 20);
      let billingY = yPosition + 16;
      billingLines.forEach((line) => {
        pdf.text(line, margin + 4, billingY);
        billingY += 5;
      });
      pdf.text(`GST No : ${gstNumber}`, margin + 4, billingY + 5);

      // Dispatch Address (Right Side)
      pdf.setFont(undefined, "bold");
      pdf.text("Dispatch address:", pageWidth / 2 + 4, yPosition + 8);

      pdf.setFont(undefined, "normal");
      const dispatchLines = pdf.splitTextToSize(
        dispatchAddress || siteAddress,
        (pageWidth / 2) - 20
      );
      let dispatchY = yPosition + 16;
      dispatchLines.forEach((line) => {
        pdf.text(line, pageWidth / 2 + 4, dispatchY);
        dispatchY += 5;
      });
      pdf.text(`Contact Person : ${clientName}`, pageWidth / 2 + 4, dispatchY + 5);
      pdf.text(`Mob No. ${poData.mobile || poData.contactNumber || "-"}`, pageWidth / 2 + 4, dispatchY + 10);

      yPosition += 60;

      // For section - bordered
      checkNewPage(20);
      drawBorder(margin, yPosition, pageWidth - 2 * margin, 16);
      pdf.setFont(undefined, "bold");
      pdf.text("For NLF SOLUTIONS Pvt Ltd", margin + 4, yPosition + 10);

      yPosition += 20;

      // Border under for section
      pdf.setLineWidth(0.4);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);

      drawFooter();

      const fileName = `PO_${poNumber}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("Error generating PO PDF:", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Purchase Order Preview - {poNumber}</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: "80vh", overflowY: "auto" }}>
        {isLoading ? (
          <div className="text-center p-5">
            <Spinner
              animation="border"
              role="status"
              style={{ color: "#ed3131" }}
            >
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-3">Loading data...</p>
          </div>
        ) : (
          <div
            ref={pdfContentRef}
            style={{
              padding: "15px",
              backgroundColor: "white",
              fontFamily: "Arial, sans-serif",
              fontSize: "10.5px",
              width: "210mm", // A4 width
              margin: "0 auto",
              border: "1px solid #ddd",
            }}
          >
            {/* HEADER IMAGE */}
            <div
              style={{
                width: "100%",
                border: "1px solid #000",
                overflow: "hidden",
              }}
            >
              {headerImagePath ? (
                <img
                  src={headerImagePath}
                  alt={`Header for ${officeBranch}`}
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
              ) : (
                <div
                  style={{
                    padding: "12px",
                    textAlign: "center",
                    fontSize: "12px",
                    color: "#777",
                  }}
                >
                  No header image for selected branch
                </div>
              )}
            </div>

            {/* TITLE */}
            <h3
              style={{
                textAlign: "center",
                margin: "15px 0",
                fontWeight: "bold",
              }}
            >
              PURCHASE ORDER
            </h3>

            {/* PO NO / DATE */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <div>
                <strong>{poNumber}</strong>
              </div>
              <div>
                <strong>Date:</strong> {poDate}
              </div>
            </div>

            {/* TO SECTION */}
            <div style={{ lineHeight: "1.4", marginBottom: "8px" }}>
              <p style={{ margin: 0 }}>
                <strong>To,</strong>
              </p>
              <p style={{ margin: 0 }}>{company}</p>
              <p style={{ margin: 0, textTransform: "uppercase" }}>{siteAddress}</p>
            </div>

            {/* DEAR SIR TEXT */}
            <p style={{ marginBottom: "10px", marginTop: "8px" }}>
              Dear Sir, <br />
              We are pleased to place an order on you as per details given below:
            </p>

            {/* ITEMS TABLE */}
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    backgroundColor: "#007bff",
                    color: "white",
                    textAlign: "center",
                  }}
                >
                  <th style={th}>Sr.No</th>
                  <th style={th}>Description of work</th>
                  <th style={th}>Unit</th>
                  <th style={th}>Qty</th>
                  <th style={th}>Rate</th>
                  <th style={th}>Image</th>
                  <th style={th}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {itemsArray.map((item, idx) => {
                  const qty = item.quantity ?? "";
                  const rate = item.rate ?? "";
                  const amount = item.amount ?? "";

                  return (
                    <tr key={idx}>
                      <td style={td}>{idx + 1}</td>
                      <td style={td}>
                        <div
                          style={{
                            fontWeight: "bold",
                            textTransform: "uppercase",
                            marginBottom: "2px",
                          }}
                        >
                          {item.material}
                        </div>
                        <div>{item.description}</div>
                      </td>
                      <td style={td}>{item.unit}</td>
                      <td style={td}>{formatINR(qty)}</td>
                      <td style={td}>{formatINR(rate)}</td>
                      <td style={td}>
                        {item.spec_image ? (
                          <img
                            src={resolveProductImage(item.spec_image)}
                            alt="Product"
                            style={{
                              width: "50px",
                              height: "50px",
                              objectFit: "contain",
                              display: "block",
                              margin: "0 auto",
                            }}
                          />
                        ) : (
                          "-"
                        )}
                      </td>
                      <td style={td}>{formatINR(amount)}</td>
                    </tr>
                  );
                })}

                {additionalDetails.map((item, index) => {
                  const qty = item.quantity ?? "";
                  const rate = item.rate ?? "";
                  const amount = item.total ?? qty * rate;

                  return (
                    <tr key={`add-${index}`}>
                      <td style={td}>*</td>
                      <td style={td}>
                        <strong>{item.description}</strong>
                      </td>
                      <td style={td}>{item.unit}</td>
                      <td style={td}>{formatINR(qty)}</td>
                      <td style={td}>{formatINR(rate)}</td>
                      <td style={td}>-</td>
                      <td style={td}>{formatINR(amount)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* AMOUNT BLUE BOX */}
            <div
              style={{
                float: "right",
                width: "45%",
                marginTop: "12px",
                marginBottom: "12px",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  <tr>
                    <td style={blueLeft}>Sub- Total</td>
                    <td style={blueRight}>₹{formatINR(basicAmount)}</td>
                  </tr>
                  <tr>
                    <td style={blueLeft}>GST- 18%</td>
                    <td style={blueRight}>₹{formatINR(gstAmount)}</td>
                  </tr>
                  <tr>
                    <td style={blueLeft}>
                      <b>Grand Total</b>
                    </td>
                    <td style={blueRight}>
                      <b>₹{formatINR(grandTotal)}</b>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ clear: "both", marginTop: "25px", marginBottom: "25px" }}>
              {/* BILLING ADDRESS AND DISPATCH ADDRESS IN SINGLE BORDERED DIV */}
              <div style={{ border: "1px solid #000", marginBottom: "15px" }}>
                <div style={{ display: "flex" }}>
                  {/* LEFT: Billing Address */}
                  <div style={{ width: "50%", padding: "8px", borderRight: "1px solid #000" }}>
                    <p style={{ margin: 0, fontWeight: "bold", textDecoration: "underline" }}>
                      Billing Address/ Correspondence Address :
                    </p>
                    <p style={{ margin: "5px 0 0 0", lineHeight: "1.4" }}>
                      {billingAddress}
                    </p>
                    <p style={{ margin: "5px 0 0 0" }}>
                      <strong>GST No :</strong> {gstNumber}
                    </p>
                  </div>

                  {/* RIGHT: Dispatch Address */}
                  <div style={{ width: "50%", padding: "8px" }}>
                    <p style={{ margin: 0, fontWeight: "bold", textDecoration: "underline" }}>
                      Dispatch address:
                    </p>
                    <p style={{ margin: "5px 0 0 0", lineHeight: "1.4" }}>
                      {dispatchAddress || siteAddress}
                    </p>
                    <p style={{ margin: "5px 0 0 0" }}>
                      <strong>Contact Person :</strong> {clientName}
                    </p>
                    <p style={{ margin: "5px 0 0 0" }}>
                      <strong>Mob No.</strong> {poData.mobile || poData.contactNumber || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* FOR SECTION - SEPARATE BORDERED DIV */}
              <div style={{ border: "1px solid #000", padding: "8px" }}>
                <p style={{ margin: 0, fontWeight: "bold" }}>
                  <strong>For NLF SOLUTIONS Pvt Ltd</strong>
                </p>
              </div>
            </div>

            {/* FOOTER IMAGE */}
            <div
              style={{
                marginTop: "25px",
                width: "100%",
                borderTop: "2px solid #000",
              }}
            >
              <img
                src="/extra/Footer.jpeg"
                alt="Footer"
                style={{ width: "100%", height: "auto" }}
              />
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
          {isGenerating ? "Generating..." : "Download PDF"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default POPreviewModal;