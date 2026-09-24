import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

// --- Helper Functions ---
const isApprovedValue = (val) => {
  if (!val) return false;
  const s = String(val).trim().toLowerCase();
  return ["yes", "approved", "true", "1"].includes(s);
};

const getBase64ImageFromURL = (url) => {
  return new Promise((resolve) => {
    if (!url) return resolve(null);
    if (url.startsWith('data:')) {
      resolve(url);
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/jpeg"));
      } catch (e) {
        console.warn("Canvas tainted:", url);
        resolve(null);
      }
    };
    img.onerror = () => {
      console.warn("Image failed to load:", url);
      resolve(null);
    };
    img.src = url;
  });
};

// Add this function to parse HTML and preserve formatting
const parseHTMLToTextSegments = (htmlString) => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlString;
  const segments = [];
  const processNode = (node, inheritedStyle = 'normal') => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent.trim();
      if (text) {
        segments.push({
          text: text,
          style: inheritedStyle
        });
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const tagName = node.tagName.toLowerCase();
      let currentStyle = inheritedStyle;
      if (tagName === 'strong' || tagName === 'b') {
        currentStyle = 'bold';
      } else if (tagName === 'em' || tagName === 'i') {
        currentStyle = 'italic';
      }
      node.childNodes.forEach(child => processNode(child, currentStyle));
    }
  };
  tempDiv.childNodes.forEach(child => processNode(child));
  return segments;
};

const formatDateDDMMYYYY = (dateStr) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

const formatDescriptionForPreview = (desc) => {
  if (!desc) return "-";
  return desc
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .replace(/\n/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
};

const toNumber = (val) => {
  if (!val) return 0;
  return Number(String(val).replace(/,/g, ""));
};

// --- Main Component ---
const POPreviewModal = ({ show, onHide, poData, enableApproval, onPOApproved }) => {
  const [isGenerating, setIsGenerating] = useState(false);
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
  const pageNumberHeight = 5;

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
    ? formatDateDDMMYYYY(poDateRaw)
    : "-";
  const company = poData?.vender_name || poData?.vendor_name || poData?.company || "-";
  const clientName = quotationData?.name || poData?.name || poData?.contact_person || "-";
  const siteAddress = poData?.site_address || poData?.siteAddress || "-";
  const projectName = poData?.project_name || poData?.project || "-";

  // Corrected address assignment
  const billingAddressRaw = poData?.billing_address || poData?.billingAddress || "";
  const dispatchAddressRaw = poData?.dispatch_address || poData?.dispatchAddress || "";

  // Based on your description, it seems the fields are swapped in the data
  // So we'll swap them back for correct display
  const billingAddress = dispatchAddressRaw || siteAddress;
  const dispatchAddress = billingAddressRaw || siteAddress;

  const gstNumber = poData?.gst_number || poData?.gstNumber || "Not Provided";
  const mobileNumber = poData?.mobile || poData?.contactNumber || "-";
  const poType = poData?.po_type || "billing";

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

  // Calculate totals from items array (like quotation preview)
  const calculateTotals = () => {
    if (!itemsArray || itemsArray.length === 0) {
      return {
        basicAmount: parseFloat(poData?.total_amt || poData?.totalAmount || 0),
        gstAmount: parseFloat(poData?.gst_amount || 0),
        grandTotal: parseFloat(poData?.total_amt || poData?.totalAmount || 0) * 1.18,
      };
    }
    // Sum up all item amounts including installation
    const basicAmount = itemsArray.reduce((sum, item) => {
      const itemAmt = parseFloat(item.amount || 0);
      const instAmt = parseFloat(item.inst_amt || 0);
      return sum + itemAmt + instAmt;
    }, 0);

    // Add additional details if present
    const additionalAmt = additionalDetails.reduce((sum, item) => {
      return sum + (parseFloat(item.quantity || 0) * parseFloat(item.rate || 0));
    }, 0);

    const totalBasicAmount = basicAmount + additionalAmt;
    const gstAmount = totalBasicAmount * 0.18;
    const grandTotal = totalBasicAmount + gstAmount;
    return { basicAmount: totalBasicAmount, gstAmount, grandTotal };
  };

  const { basicAmount, gstAmount, grandTotal } = calculateTotals();

  const deliverySchedule = poData?.delivery_schedule || "-";
  const liabilityPeriod = poData?.defect_liability_period || "-";
  const installationScope = poData?.installation_scope || "-";
  const liquidatedDamages = poData?.liquidated_damages || "-";

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

  const resolveProductImage = (img) => {
    if (!img) return null;
    if (typeof img !== "string") return null;
    if (img.startsWith("data:")) return img;
    if (/^https?:\/\//i.test(img)) return img;
    return `https://nlfs.in/erp/${img.replace(/^\/+/, "")}`;
  };

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
      "Proceed with PO approval?\nOnce approved, this action cannot be reverted."
    );
    if (confirmed) handlePOApproval();
  };

  // New function to get signature data for PDF
  const getSignatureDataForPDF = async () => {
    // Use signatureImage if PO is approved
    if (signatureImage && poApprovalSuccess) {
      return await getBase64ImageFromURL(signatureImage);
    }
    return null;
  };

  const sanitizeFilePart = (val) => {
    if (!val) return "NA";
    return String(val)
      .replace(/[\/\\?%*:|"<>]/g, "") // remove invalid filename chars
      .replace(/\s+/g, " ")           // normalize spaces
      .trim();
  };

  // Function to render terms for preview (similar to PDFPreview)
  const renderTermsForPreview = () => {
    // Get terms from quotation data if available, otherwise use PO terms
    let termsHtml = (quotationData?.terms || poData?.terms || "<div>No terms specified</div>")
      .replace(/₹/g, "Rs ");

    // Clean up the HTML while preserving formatting tags
    let processedHtml = termsHtml
      .replace(/<div[^>]*>/gi, '<p>')
      .replace(/<\/div>/gi, '</p>')
      .replace(/<p>\s*<\/p>/gi, '') // Remove empty paragraphs
      .trim();

    // Create a temporary div to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = processedHtml;

    // Get all paragraph-level elements
    const elements = Array.from(tempDiv.children);
    const beforeLine = [];
    const afterLine = [];
    let termIndex = 1;
    let hopeSentenceFound = false;

    elements.forEach((element, idx) => {
      const textContent = element.textContent.trim();
      if (!textContent) return;

      // Check for special sentences
      const isNLFSentence = /For NLF Solutions Pvt Ltd/i.test(textContent);
      if (isNLFSentence) return;

      const isHopeSentence = /Hope you will find our offer most competitive and in order/i.test(textContent);
      const isRed = /MS\/Aluminium|MS Aluminium|MS\/Aluminium substructure/i.test(textContent);

      // Get the inner HTML and clean it up
      let innerHTML = element.innerHTML
        .replace(/^\d+[\.\)]\s*/, '') // Remove existing numbering
        .replace(/^•\s*/, '') // Remove bullets
        .trim();

      if (isHopeSentence) {
        afterLine.push(
          <div
            key={`hope-line-${idx}`}
            style={{
              fontWeight: "bold",
              margin: "10px 0 8px 0",
              fontSize: "10.5px",
              lineHeight: "1.6",
            }}
            dangerouslySetInnerHTML={{ __html: innerHTML }}
          />
        );
        hopeSentenceFound = true;
        return;
      }

      // Parse HTML segments to preserve formatting
      const segments = parseHTMLToTextSegments(innerHTML);

      // Render text with formatting
      const formattedText = segments.map((segment, segIdx) => {
        if (segment.style === 'bold') {
          return <strong key={segIdx}>{segment.text}</strong>;
        } else if (segment.style === 'italic') {
          return <em key={segIdx}>{segment.text}</em>;
        } else {
          return segment.text;
        }
      });

      // Style for regular terms
      const styleProps = {
        marginBottom: 0,
        color: isRed ? "red" : "black",
        fontWeight: isRed ? "bold" : "normal",
        fontSize: "10.5px",
        lineHeight: "1.6",
      };

      beforeLine.push(
        <div key={`term-${idx}`} style={styleProps}>
          <span style={{ marginRight: "6px", fontWeight: 500 }}>
            {termIndex}.
          </span>
          {formattedText}
        </div>
      );
      termIndex++;
    });

    // Add fallback hope sentence if not found
    if (!hopeSentenceFound) {
      afterLine.push(
        <div
          key="hope-line-fallback"
          style={{
            marginTop: "10px",
            fontSize: "10.5px",
            fontWeight: "bold",
            lineHeight: "1.6",
          }}
        >
          Hope you will find our offer most competitive and in order.
        </div>
      );
    }

    // Add signature if applicable
    if (poApprovalSuccess && signatureImage) {
      afterLine.push(
        <div
          key="signature-block-container"
          style={{
            width: "100%",
            borderTop: "1px solid black",
            borderBottom: "1px solid black",
            marginTop: "5px",
            marginBottom: "5px",
            padding: "3px 0"
          }}
        >
          <img
            src={signatureImage}
            alt="Authorized Signature"
            style={{ height: "35px", width: "auto", marginBottom: "2px" }}
          />
          <div style={{ fontWeight: "bold", fontSize: "10.5px", lineHeight: "1.2" }}>
            For NLF Solutions Pvt Ltd
          </div>
        </div>
      );
    }

    return { beforeLine, afterLine, hasSeparator: false };
  };

  const { beforeLine, afterLine, hasSeparator } = renderTermsForPreview();

  const generatePDF = async () => {
    if (!poData) return alert("No PO data.");
    setIsGenerating(true);
    try {
      const jsPDF = (await import("jspdf")).default;
      const autoTable = (await import("jspdf-autotable")).default;
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 4;
      const headerHeight = 24;
      const footerHeight = 16;
      const FOOTER_BOTTOM_MARGIN = 0;
      const headerRawUrl = headerImagePath;
      const footerRawUrl = "/extra/Footer.jpeg";

      // Get signature data with proper priority handling
      const signatureImgData = await getSignatureDataForPDF();

      // Pre-fetch Base64 data for header and footer
      const [headerImgData, footerImgData] = await Promise.all([
        headerRawUrl ? getBase64ImageFromURL(headerRawUrl) : Promise.resolve(null),
        getBase64ImageFromURL(footerRawUrl),
      ]);

      const AUTO_TABLE_BOTTOM_GAP = 2;

      const addPageNumbers = () => {
        const pageCount = pdf.getNumberOfPages();
        pdf.setFontSize(9);
        pdf.setTextColor(0, 0, 0);
        for (let i = 1; i <= pageCount; i++) {
          pdf.setPage(i);
          const text = `Page ${i} of ${pageCount}`;
          const y = pageHeight - footerHeight - FOOTER_BOTTOM_MARGIN - 1;
          pdf.text(text, pageWidth / 2, y, {
            align: "center",
          });
        }
      };

      const drawHeader = () => {
        const imgToUse = headerImgData || headerRawUrl;
        if (!imgToUse) return;
        try {
          pdf.addImage(
            imgToUse,
            "JPEG",
            0,
            0,
            pageWidth,
            headerHeight
          );
        } catch (e) {
          console.error("Header image load failed", e);
        }
      };

      const drawHeaderBottomLine = () => {
        pdf.setLineWidth(0.6);
        pdf.setDrawColor(0, 0, 0);
        pdf.line(
          0,
          headerHeight,
          pageWidth,
          headerHeight
        );
      };

      const drawFooter = () => {
        if (!footerImgData) return;
        try {
          pdf.addImage(
            footerImgData,
            "JPEG",
            0,
            pageHeight - footerHeight - FOOTER_BOTTOM_MARGIN,
            pageWidth,
            footerHeight
          );
        } catch (e) {
          console.error("Footer image load failed", e);
        }
      };

      const drawBorder = (x, y, width, height) => {
        pdf.setLineWidth(0.5);
        pdf.rect(x, y, width, height);
      };

      let yPosition = margin + headerHeight + 1.5;

      const checkNewPage = (requiredSpace) => {
        const PAGE_SAFETY_GAP = 1;
        const bottomLimit =
          pageHeight -
          footerHeight -
          FOOTER_BOTTOM_MARGIN -
          pageNumberHeight -
          PAGE_SAFETY_GAP;
        if (yPosition + requiredSpace > bottomLimit) {
          drawFooter();
          pdf.addPage();
          drawHeader();
          drawBorder(
            margin,
            headerHeight,
            pageWidth - 2 * margin,
            pageHeight - headerHeight - footerHeight
          );
          yPosition = margin + headerHeight + 6;
        }
      };

      drawHeader();
      drawBorder(
        margin,
        headerHeight,
        pageWidth - 2 * margin,
        pageHeight - headerHeight - footerHeight
      );

      // PO title — compact height
      yPosition += 1;
      pdf.setFontSize(14);
      pdf.setFont(undefined, "bold");
      pdf.setTextColor(0, 0, 0);
      pdf.text("PURCHASE ORDER", pageWidth / 2, yPosition, { align: "center" });
      yPosition += 1.5;
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      // Bold line under title
      pdf.setLineWidth(0.1);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 4;

      // PO no / date on same line
      pdf.setFontSize(10);
      pdf.setFont(undefined, "bold");
      pdf.text(
        `PO No: ${poNumber}`,
        margin + 4,
        yPosition
      );
      pdf.text(
        `Date: ${poDate}`,
        pageWidth - margin - 4,
        yPosition,
        { align: "right" }
      );
      yPosition += 1;
      // Bold line under PO info
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 3.2;

      // Recipient info
      pdf.setFont(undefined, "normal");
      pdf.setFontSize(10);
      pdf.text("To,", margin + 4, yPosition);
      yPosition += 4;
      pdf.setFont(undefined, "bold");
      pdf.text(company, margin + 4, yPosition);
      yPosition += 4;
      pdf.setFont(undefined, "normal");
      pdf.text(siteAddress, margin + 4, yPosition);
      yPosition += 4;
      pdf.setFont(undefined, "bold");
      pdf.text(`Project: ${projectName}`, margin + 4, yPosition);
      yPosition += 6;

      // intro
      pdf.text("Dear Sir,", margin + 4, yPosition);
      yPosition += 4;
      const intro = `We are pleased to place an order on you as per details given below:`;
      const introLines = pdf.splitTextToSize(intro, pageWidth - 2 * margin - 8);
      introLines.forEach((line) => {
        checkNewPage(6);
        pdf.text(line, margin + 4, yPosition);
        yPosition += 4;
      });
      yPosition += 0.5;

      // PRELOAD SPEC IMAGES
      const itemImages = await Promise.all(
        itemsArray.map(async (item) => {
          const specImage = item.spec_image;
          const imgUrl = resolveProductImage(specImage);
          if (!imgUrl) return null;
          return await getBase64ImageFromURL(imgUrl);
        })
      );

      // items table - 7 columns matching the reference
      const tableData = [];
      const rowImageMap = {};
      itemsArray.forEach((item, idx) => {
        const rowIndex = tableData.length;
        if (itemImages[idx]) {
          rowImageMap[rowIndex] = itemImages[idx];
        }
        // Main item row with 6 columns: S.No, Description, Unit, Qty, Rate, Amount
       tableData.push([
  String(idx + 1),
  formatDescriptionForPreview(item.description),
  item.unit || "-",
  item.qty || "-",
  parseFloat(item.rate || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
  }),
  parseFloat(item.amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
  }),
]);

        // Installation row if applicable and rate > 0
        if (item.inst_rate > 0) {
          tableData.push([
            "*",
            "installation",
            item.inst_unit || "-",
            item.inst_qty || "-",
            parseFloat(item.inst_rate || 0).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
            }),
            parseFloat(item.inst_amt || 0).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
            }),
          ]);
        }
      });

      // Add additional details to the table
      additionalDetails.forEach((item) => {
        tableData.push([
          "*",
          item.description,
          item.unit,
          item.quantity,
          formatINR(item.rate),
          formatINR(item.quantity * item.rate)
        ]);
      });

      const COL = {
        unit: 15,
        qty: 12,
        rate: 15,
        amount: 20,
      };

      autoTable(pdf, {
        startY: yPosition,
        head: [["S.No", "Description", "Unit", "Qty", "Rate", "Amount"]],
        body: tableData,
        theme: "grid",
        tableWidth: pageWidth - 2 * margin,
        columnStyles: {
          0: { halign: "center", cellWidth: 12 },
          1: { cellWidth: 128 },
          2: { halign: "center", cellWidth: 15 },
          3: { halign: "center", cellWidth: 12 },
          4: { halign: "center", cellWidth: 15 },
          5: { halign: "center", cellWidth: 20 },
        },
        styles: {
          fontSize: 8,
          cellPadding: 2,
          overflow: "linebreak",
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          valign: "top",
          textColor: [0, 0, 0],
        },
        headStyles: {
          fillColor: [0, 123, 255],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 9,
          halign: "center",
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
        },
        didParseCell: (data) => {
          // Set minimum height for rows with descriptions
          if (data.section === "body" && data.column.index === 1 && tableData[data.row.index]) {
            const descText = tableData[data.row.index][1];
            if (descText && descText.length > 100) {
              data.cell.styles.minCellHeight = 20;
            }
          }
          // Installation row styling
          if (data.section === "body" && data.column.index === 1 && tableData[data.row.index]) {
            const itemDesc = tableData[data.row.index][1];
            if (itemDesc === "installation") {
              data.cell.styles.fontStyle = "italic";
            }
          }
        },
        didDrawCell: (data) => {
          if (
            data.section === "body" &&
            data.column.index === 1 &&
            rowImageMap[data.row.index]
          ) {
            if (!data.row.imagePosition) {
              data.row.imagePosition = {
                y: data.cell.y,
                height: data.cell.height,
                page: pdf.getCurrentPageInfo().pageNumber
              };
            }
          }
        },
        didDrawPage: (data) => {
          drawHeader();
          drawHeaderBottomLine();
          drawFooter();
          const currentPage = pdf.getCurrentPageInfo().pageNumber;
          data.table.body.forEach((row, rowIndex) => {
            if (row.imagePosition && row.imagePosition.page === currentPage && rowImageMap[rowIndex]) {
              const imgData = rowImageMap[rowIndex];
              if (!imgData) return;
              const cellY = row.imagePosition.y;
              const cellHeight = row.imagePosition.height;
              const tableEndX = pageWidth - margin;
              const imgWidth = 45;
              const imgHeight = imgWidth * 0.75;
              const imgX = tableEndX - imgWidth - 5;
              const imgY = cellY + (cellHeight - imgHeight) / 2;
              pdf.addImage(imgData, "JPEG", imgX, imgY, imgWidth, imgHeight);
            }
          });
          drawBorder(
            margin,
            headerHeight,
            pageWidth - 2 * margin,
            pageHeight - headerHeight - footerHeight
          );
        },
        margin: {
          top: margin + headerHeight + 4,
          bottom: footerHeight + FOOTER_BOTTOM_MARGIN + pageNumberHeight - AUTO_TABLE_BOTTOM_GAP,
          left: margin,
          right: margin,
        }
      });

      yPosition = pdf.lastAutoTable.finalY;

      // totals section with blue background
      const totalsWidth =
        COL.unit + COL.qty + COL.rate + COL.amount;
      const totalsX =
        pageWidth -
        margin -
        totalsWidth;
      const leftBoxWidth = COL.unit + COL.qty;
      const rightBoxWidth = COL.rate + COL.amount;
      const totalsHeight = 8;

      pdf.setFillColor(0, 123, 255);
      pdf.rect(totalsX, yPosition, leftBoxWidth, totalsHeight, "F");
      pdf.rect(totalsX + leftBoxWidth, yPosition, rightBoxWidth, totalsHeight, "F");
      pdf.rect(totalsX, yPosition + totalsHeight, leftBoxWidth, totalsHeight, "F");
      pdf.rect(totalsX + leftBoxWidth, yPosition + totalsHeight, rightBoxWidth, totalsHeight, "F");
      pdf.rect(totalsX, yPosition + totalsHeight * 2, leftBoxWidth, totalsHeight, "F");
      pdf.rect(totalsX + leftBoxWidth, yPosition + totalsHeight * 2, rightBoxWidth, totalsHeight, "F");

      pdf.setLineWidth(0.1);
      pdf.rect(totalsX, yPosition, totalsWidth, totalsHeight * 3);
      pdf.line(
        totalsX + leftBoxWidth,
        yPosition,
        totalsX + leftBoxWidth,
        yPosition + totalsHeight * 3
      );
      pdf.line(
        totalsX,
        yPosition + totalsHeight,
        totalsX + totalsWidth,
        yPosition + totalsHeight
      );
      pdf.line(
        totalsX,
        yPosition + totalsHeight * 2,
        totalsX + totalsWidth,
        yPosition + totalsHeight * 2
      );

      pdf.setFont(undefined, "bold");
      pdf.setFontSize(9);
      pdf.setTextColor(255, 255, 255);
      pdf.text("Sub- Total", totalsX + 4, yPosition + 5.5);
      pdf.text(
        `Rs ${basicAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
        totalsX + totalsWidth - 4,
        yPosition + 5.5,
        { align: "right" }
      );
      pdf.text("GST @ 18%", totalsX + 4, yPosition + totalsHeight + 5.5);
      pdf.text(
        `Rs ${gstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
        totalsX + totalsWidth - 4,
        yPosition + totalsHeight + 5.5,
        { align: "right" }
      );
      pdf.text("Grand Total", totalsX + 4, yPosition + totalsHeight * 2 + 5.5);
      pdf.text(
        `Rs ${grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
        totalsX + totalsWidth - 4,
        yPosition + totalsHeight * 2 + 5.5,
        { align: "right" }
      );
      pdf.setTextColor(0, 0, 0);
      yPosition += totalsHeight * 3;
      pdf.setLineWidth(0.1);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 5;

      // Terms & Conditions heading
      pdf.setFontSize(11);
      pdf.setFont(undefined, "bold");
      pdf.text("Terms & Conditions:", margin + 6, yPosition);
      const termHeadingWidth = pdf.getTextWidth("Terms & Conditions:");
      pdf.line(
        margin + 6,
        yPosition + 1.5,
        margin + 6 + termHeadingWidth,
        yPosition + 1.5
      );
      yPosition += 5;
      pdf.setFontSize(9);
      pdf.setFont(undefined, "normal");

      // Fixed columns for numbering alignment
      const NUMBER_COL_X = margin + 10;
      const TEXT_COL_X = margin + 16;

      // Get terms from quotation data if available, otherwise use PO terms
      let termsHtml = (quotationData?.terms || poData?.terms || "<div>No terms specified</div>")
        .replace(/₹/g, "Rs ");

      // Parse HTML into paragraph elements
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = termsHtml
        .replace(/<div[^>]*>/gi, '<p>')
        .replace(/<\/div>/gi, '</p>')
        .replace(/<p>\s*<\/p>/gi, '');

      const termElements = Array.from(tempDiv.children);
      let termIndex = 1;
      let hopeSentenceFound = false;

      termElements.forEach((element) => {
        const textContent = element.textContent.trim();
        if (!textContent) return;
        const isNLFSentence = /For NLF Solutions Pvt Ltd/i.test(textContent);
        if (isNLFSentence) return;
        const isHopeSentence = /Hope you will find our offer most competitive and in order/i.test(textContent);
        const isRed = /MS\/Aluminium|MS Aluminium|MS\/Aluminium substructure/i.test(textContent);

        // Clean up the HTML
        let cleanHTML = element.innerHTML
          .replace(/^\d+[\.\)]\s*/, '') // Remove existing numbering
          .replace(/^•\s*/, '') // Remove bullets
          .trim();

        if (isHopeSentence) {
          cleanHTML = cleanHTML
            .replace(/^•\s*/, '')
            .replace(/^\d+\.\s*/, '');
          pdf.setTextColor(0, 0, 0);
          pdf.setFont(undefined, "bold");
          // Draw number for Hope sentence
          pdf.text(`${termIndex}.`, NUMBER_COL_X, yPosition, { align: "right" });
          termIndex++;
          // Parse HTML segments
          const segments = parseHTMLToTextSegments(`<p>${cleanHTML}</p>`);
          const textStartX = TEXT_COL_X;
          const maxWidth = pageWidth - textStartX - margin;
          // Render each segment with its style
          let currentX = TEXT_COL_X;
          const lineStartX = TEXT_COL_X;
          segments.forEach((segment) => {
            // Determine font style
            const fontStyle = isRed ? 'bold' : (segment.style === 'bold' ? 'bold' : segment.style === 'italic' ? 'italic' : 'normal');
            pdf.setFont(undefined, fontStyle);
            // Split text into words
            const words = segment.text.split(' ');
            words.forEach((word, wordIndex) => {
              const wordWithSpace = word + ' ';
              const wordWidth = pdf.getTextWidth(wordWithSpace);
              // Check if we need a new line
              if (currentX + wordWidth > pageWidth - margin && currentX > lineStartX) {
                yPosition += 2.6;
                checkNewPage(6);
                currentX = lineStartX;
              }
              // Special handling for point 8 to prevent overlapping
              if (segment.text.includes("Mode of Measurement") && wordIndex > 0 && currentX > lineStartX + 50) {
                yPosition += 2.6;
                checkNewPage(6);
                currentX = lineStartX;
              }
              pdf.text(word, currentX, yPosition);
              currentX += wordWidth;
            });
          });
          yPosition += 2.5;
          hopeSentenceFound = true;
          return;
        }

        // Regular terms with formatting
        if (isRed) {
          pdf.setTextColor(210, 47, 47);
        } else {
          pdf.setTextColor(0, 0, 0);
        }
        // Draw the number
        pdf.setFont(undefined, isRed ? 'bold' : 'normal');
        pdf.text(`${termIndex}.`, NUMBER_COL_X, yPosition, { align: "right" });
        termIndex++;
        // Parse HTML segments
        const segments = parseHTMLToTextSegments(`<p>${cleanHTML}</p>`);
        const maxWidth = pageWidth - TEXT_COL_X - margin;
        // Render text with formatting
        let currentX = TEXT_COL_X;
        const lineStartX = TEXT_COL_X;
        segments.forEach((segment) => {
          // Determine font style: if red term, force bold, otherwise use segment style
          const fontStyle = isRed ? 'bold' : (segment.style === 'bold' ? 'bold' : segment.style === 'italic' ? 'italic' : 'normal');
          pdf.setFont(undefined, fontStyle);
          const words = segment.text.split(' ');
          words.forEach((word) => {
            const wordWithSpace = word + ' ';
            const wordWidth = pdf.getTextWidth(wordWithSpace);
            // Check if we need a new line
            if (currentX + wordWidth > pageWidth - margin && currentX > lineStartX) {
              yPosition += 2.6;
              checkNewPage(6);
              currentX = lineStartX;
            }
            pdf.text(word, currentX, yPosition);
            currentX += wordWidth;
          });
        });
        yPosition += 3.1;
      });

      // Add fallback hope sentence if not found
      if (!hopeSentenceFound) {
        const closingSentence = "Hope you will find our offer most competitive and in order.";
        checkNewPage(10);
        pdf.setFont(undefined, "bold");
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        const closingLines = pdf.splitTextToSize(
          closingSentence,
          pageWidth - 2 * margin - 8
        );
        closingLines.forEach((line) => {
          pdf.text(line, margin + 4, yPosition);
          yPosition += 3.5;
        });
        yPosition += 2;
      }

      // Add address block
      checkNewPage(40);
      const addressBlockHeight = 25;
      drawBorder(margin, yPosition, pageWidth - 2 * margin, addressBlockHeight);
      pdf.line(pageWidth / 2, yPosition, pageWidth / 2, yPosition + addressBlockHeight);
      pdf.setFontSize(9);
      pdf.setFont(undefined, "bold");
      pdf.text("Billing Address / Correspondence Address:", margin + 4, yPosition + 6);
      pdf.setFont(undefined, "normal");
      const billingLines = pdf.splitTextToSize(billingAddress, (pageWidth / 2) - 15);
      let by = yPosition + 12;
      billingLines.forEach(l => { pdf.text(l, margin + 4, by); by += 4; });
      pdf.text(`GST No: ${gstNumber}`, margin + 4, by + 2);
      pdf.setFont(undefined, "bold");
      pdf.text(
        poType === "ex_factory" ? "X-Factory Address:" : "Dispatch Address:",
        pageWidth / 2 + 4,
        yPosition + 6
      );
      pdf.setFont(undefined, "normal");
      const dispatchLines = pdf.splitTextToSize(dispatchAddress, (pageWidth / 2) - 15);
      let dy = yPosition + 12;
      dispatchLines.forEach(l => { pdf.text(l, pageWidth / 2 + 4, dy); dy += 4; });
      pdf.text(`Contact Person: ${clientName}`, pageWidth / 2 + 4, dy + 2);
      pdf.text(`Mob No: ${mobileNumber}`, pageWidth / 2 + 4, dy + 6);
      yPosition += addressBlockHeight + 2;

      // Add signature if approved
      if (signatureImgData) {
        const SIGNATURE_BLOCK_HEIGHT = 15;
        const PAGE_BOTTOM_LIMIT =
          pageHeight -
          footerHeight -
          FOOTER_BOTTOM_MARGIN -
          4;
        if (yPosition + SIGNATURE_BLOCK_HEIGHT > PAGE_BOTTOM_LIMIT) {
          drawFooter();
          pdf.addPage();
          drawHeader();
          drawBorder(
            margin,
            headerHeight,
            pageWidth - 2 * margin,
            pageHeight - headerHeight - footerHeight
          );
          yPosition = margin + headerHeight + 6;
        }
        pdf.setLineWidth(0.5);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 3;
        pdf.addImage(signatureImgData, "JPEG", margin + 5, yPosition, 34, 9);
        yPosition += 10;
        pdf.setFontSize(10);
        pdf.setFont(undefined, "bold");
        pdf.text("For NLF Solutions Pvt Ltd", margin + 5, yPosition);
        yPosition += 3;
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      }

      pdf.setTextColor(0, 0, 0);
      pdf.setFont(undefined, "normal");
      drawFooter();
      addPageNumbers();

      const fileName = `PO_${poNumber}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("PDF Generation Error:", error);
      alert("Error generating PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  const th = { border: "1px solid #000", fontWeight: "bold" };
  const td = { border: "1px solid #000", padding: "6px" };
  const blueLeft = { border: "1px solid #000", padding: "4px 6px", background: "#007bff", color: "white", width: "61%", fontSize: "10px" };
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
              <h3 style={{ textAlign: "center", margin: "0", fontWeight: "bold" }}>PURCHASE ORDER</h3>
              {/* DETAILS BAR */}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <div><strong>PO No:</strong> {poNumber}</div>
                <div><strong>Date:</strong> {poDate}</div>
              </div>
              {/* CLIENT INFO */}
              <div style={{ lineHeight: "1.4", marginBottom: "15px" }}>
                <p style={{ margin: 0 }}><strong>To,</strong></p>
                <p style={{ margin: 0 }}>{company}</p>
                <p style={{ margin: 0 }}>{siteAddress}</p>
                <p style={{ margin: 0 }}><strong>Project:</strong> {projectName}</p>
              </div>
              {/* INTRO */}
              <p style={{ marginBottom: "15px" }}>
                <strong>Dear Sir,</strong><br />
                <strong>
                  We are pleased to place an order on you as per details given below:
                </strong>
              </p>
              {/* ITEMS TABLE */}
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#007bff", color: "white", textAlign: "center" }}>
                    <th style={{ ...th, verticalAlign: "top" }}>S.No</th>
                    <th style={{ ...th, verticalAlign: "top" }}>Description</th>
                    <th style={{ ...th, verticalAlign: "top" }}>Unit</th>
                    <th style={{ ...th, verticalAlign: "top" }}>Qty</th>
                    <th style={{ ...th, verticalAlign: "top" }}>Rate</th>
                    <th style={{ ...th, verticalAlign: "top" }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {itemsArray.map((item, idx) => (
                    <React.Fragment key={idx}>
                      <tr>
                        <td style={{ ...td, verticalAlign: "top" }}>{idx + 1}</td>
                        <td style={{ ...td, verticalAlign: "top" }}>
                          {item.description}
                        </td>
                        <td style={{ ...td, verticalAlign: "top" }}>{item.unit}</td>
                        <td style={{ ...td, verticalAlign: "top" }}>{item.qty}</td>
                        <td style={{ ...td, verticalAlign: "top" }}>{formatINR(item.rate)}</td>
                        <td style={{ ...td, verticalAlign: "top" }}>{formatINR(item.amount)}</td>
                      </tr>
                      {(() => {
                        const instQty = parseFloat(item.inst_qty || 0);
                        const instRate = parseFloat(item.inst_rate || 0);
                        const instAmt = parseFloat(item.inst_amt || 0);
                        if (instQty <= 0 || instRate <= 0 || instAmt <= 0) {
                          return null;
                        }
                        return (
                          <tr>
                            <td
                              style={{
                                ...td,
                                textAlign: "center",
                                fontWeight: "bold",
                              }}
                            >
                              *
                            </td>
                            <td style={td}>installation</td>
                            <td style={td}>{item.inst_unit || "-"}</td>
                            <td style={{ ...td, verticalAlign: "top" }}>{instQty}</td>
                            <td style={{ ...td, verticalAlign: "top" }}>
                              {instRate.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                              })}
                            </td>
                            <td style={{ ...td, verticalAlign: "top" }}>
                              {instAmt.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                              })}
                            </td>
                          </tr>
                        );
                      })()}
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
              <div style={{ float: "right", width: "35%", marginBottom: "12px" }}>
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
              <div>
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
                        {poType === "ex_factory" ? "X-Factory Address:" : "Dispatch Address:"}
                      </p>
                      <p style={{ margin: "5px 0 0 0", lineHeight: "1.4" }}>
                        {dispatchAddress}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Terms and Conditions - Using the same approach as PDFPreview */}
                <div
                  className="nlf-terms-preview"
                  style={{
                    lineHeight: "1.6",
                    whiteSpace: "pre-wrap",
                    fontSize: "10.5px",
                  }}
                >
                  {beforeLine}
                  {afterLine}
                </div>
              </div>
              {/* FOOTER IMAGE */}
              <div style={{ width: "100%", borderTop: "2px solid #000" }}>
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
              onClick={generatePDF}
              disabled={isGenerating || !poApprovalSuccess}
              style={{
                padding: "8px 14px",
                backgroundColor: poApprovalSuccess ? "#007bff" : "#ccc",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: isGenerating ? "not-allowed" : (poApprovalSuccess ? "pointer" : "not-allowed")
              }}
            >
              {isGenerating ? "Generating PDF..." : "Download PDF"}
            </button>
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
        .nlf-terms-preview div { margin-bottom: 6px; }
        .nlf-terms-preview strong { font-weight: 700; }
      `}</style>
    </>
  );
};

export default POPreviewModal;