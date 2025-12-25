// src/components/Sidebar.jsx

import { useState } from "react";
import { Nav } from "react-bootstrap";
import { NavLink, useLocation } from "react-router-dom";
import "./../App.css";
import { MdKeyboardArrowRight, MdKeyboardArrowDown } from "react-icons/md";

function Sidebar({ collapsed, onClose }) {
  const location = useLocation();

  // --- SEPARATE Active States for Lead Generation and Salesperson ---
  const isLeadGenActive =
    location.pathname.includes("/leadgeneration") ||
    location.pathname.includes("/view-leads") ||
    location.pathname.includes("/viewlead") ||
    location.pathname.includes("/newlead");

  const isSalespersonActive =
    location.pathname.includes("/sales") ||
    location.pathname.includes("/sales-details");

  // --- Quotations Active States ---
  const isQuotationsActive =
    location.pathname.includes("/clients") ||
    location.pathname.includes("/quotation") ||
    location.pathname.includes("/new-quotation") ||
    location.pathname.includes("/po/new/:quotationId/:roundId") ||
    location.pathname.includes("/quotation-history");

  // --- Other Sections: Improved Logic ---
  const isMasterSubActive = location.pathname.includes("/master");

  // --- Back Office Active States ---
  const isWorkOrderActive =
  location.pathname.includes("/workorder") ||
  location.pathname.includes("/workorderform");

const isQuotesBackOfficeActive = 
  location.pathname.includes("/quotesbackoffice");

const isPoVendorActive = location.pathname.includes("/povendor") ||
location.pathname.includes("/annextureviewer") ||
location.pathname.includes("/annextureform");

const isBackOfficeActive = isWorkOrderActive || isPoVendorActive || isQuotesBackOfficeActive;
  // --- Accounts Active States ---
//   const isAccountsPageActive = location.pathname.includes ("/accounts")||
//   location.pathname.includes("/workorderformaccounts/:workOrderId");
// ;
//   const isAccountsOrdersActive =
//     location.pathname.includes("/workorderformaccounts/:workOrderId");

const isAccountsPageActive = location.pathname === "/accounts";

const isAccountsOrdersActive = location.pathname.startsWith("/workorderformaccounts/");

  const isAccountsActive = isAccountsPageActive || isAccountsOrdersActive;

  // --- Materials Active States ---
  const isMaterialsPageActive = location.pathname === "/AllMaterials";

  const isDesignActive =
    location.pathname.includes("/designsubpage") ||
    location.pathname.includes("/designvendor") ||
    location.pathname.includes("/design") ||
    location.pathname.includes("/designworkorderform") ;

  const isStoreActive =
    location.pathname.includes("/store") ||
    location.pathname.includes("/storevendor");

  const isPlanningActive =
    location.pathname.includes("/planvendor") ||
    location.pathname.includes("/planworkorderform") ||
    location.pathname.includes("/plannings");

  const isRequisitionActive =
    location.pathname.includes("/requisiton") ||
    location.pathname.includes("/requirenewvendor");

  const isMaterialManagementActive =
    isMaterialsPageActive ||
    isDesignActive ||
    isStoreActive ||
    isPlanningActive ||
    isRequisitionActive;

  const isDispatchActive=location.pathname.includes("/dispatch") ||
  location.pathname.includes("/dispatchform");

  // Support both base route `/sitemanagement` and detail route `/site-management/*`
  const isSiteActive =
    location.pathname.includes("/sitemanagement") ||
    location.pathname.includes("/site-management");
  // --- Initialize State (Dropdown should be open if any submenu is active) ---
  const [openMaster, setOpenMaster] = useState(isMasterSubActive);
  const [openLeadGen, setOpenLeadGen] = useState(
    isLeadGenActive || isSalespersonActive
  );
  const [openQuotations, setOpenQuotations] = useState(isQuotationsActive);
  const [openBackOffice, setOpenBackOffice] = useState(isBackOfficeActive);
  const [openAccount, setOpenAccount] = useState(isAccountsActive);
  const [openMaterial, setOpenMaterial] = useState(isMaterialManagementActive);
  const [openDispatch, setOpenDispatch] = useState(isDispatchActive);
  const [openSite, setOpenSite] = useState(isSiteActive);


  return (
    <div
      className={`sidebar d-flex flex-column p-3 ${
        collapsed ? "collapsed" : ""
      }`}
    >
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="w-100 d-flex justify-content-center align-items-center">
          <img src="/logo/NLFLogo.gif" alt="Logo" style={{ width: "100px" }} />
        </div>
        <button className="btn btn-sm btn-light d-md-none" onClick={onClose}>
          ✖
        </button>
      </div>

      <Nav className="flex-column">
        {/* Dashboard */}
        <NavLink
          to="/dashboard"
          className="nav-link icons text-white text-l mb-3 nav-dashboard"
          style={{
            backgroundColor: "black",
            borderRadius: "0.5rem",
            padding: "0.5rem",
            fontWeight: "600",
          }}
        >
          <img src="/icons/dashboard1.png" alt="" /> Dashboard
        </NavLink>

        {/* Master */}
        <NavLink
          to="/masterview"
          className={`nav-link icons ${isMasterSubActive ? "active" : ""}`}
          onClick={() => setOpenMaster(!openMaster)}
        >
          <div className="d-flex justify-content-between align-items-center w-100">
            <div className="d-flex align-items-center">
              <img src="/icons/scrumRed.png" alt="" className="me-2" /> Master
            </div>
            <span className="arrow-icon">
              {openMaster ? <MdKeyboardArrowDown /> : <MdKeyboardArrowRight />}
            </span>
          </div>
        </NavLink>
        {openMaster && (
          <div className="submenu ms-4">
            <NavLink to="/usertable" className="nav-link">
              {/* <img src="/icons/leadership.png" alt="" className="me-2" /> User */} User
            </NavLink>
              <NavLink to="/branchmaster" className="nav-link">
             Branch 
            </NavLink>  
            <NavLink to="/rolemaster" className="nav-link">
               Role 
            </NavLink>
             <NavLink to="/materialmaster" className="nav-link">
               Material
            </NavLink>
              <NavLink to="/unitmaster" className="nav-link">
               Unit
            </NavLink>
            <NavLink to="/stagemaster" className="nav-link">
               Stage
            </NavLink>
             <NavLink to="/departmentmaster" className="nav-link">
               Department
            </NavLink>

            {/* <NavLink to="/brandmaster" className="nav-link">
               Brand
            </NavLink> 
              <NavLink to="/productmaster" className="nav-link">
               Product
            </NavLink>  
            <NavLink to="/subproductmaster" className="nav-link">
               Sub-Product
            </NavLink> */}
             <NavLink to="/ratemaster" className="nav-link">
               Rate
            </NavLink>
             <NavLink to="/combinedmaster" className="nav-link">
                Product
            </NavLink>
             <NavLink to="/signature" className="nav-link">
                Signature
            </NavLink>
              <NavLink to="/vendormaster" className="nav-link">
                Vendors
            </NavLink>
            
          </div>
        )}

        {/* Admin Approval */}
        <NavLink to="/admin-approval" className="nav-link icons">
          <img src="/icons/approve.png" alt="" style={{ width: "25px" }} /> Admin
        </NavLink>

        {/* Lead Generation */}
        <NavLink
          to="/leadgeneration"
          className={`nav-link icons ${isLeadGenActive ? "active" : ""}`}
          onClick={() => setOpenLeadGen(!openLeadGen)}
        >
          <div className="d-flex justify-content-between align-items-center w-100">
            <div className="d-flex align-items-center">
              <img
                src="/icons/accountings.png"
                alt=""
                className="me-2"
                style={{ width: "27px" }}
              />
              Lead Generation
            </div>
            <span className="arrow-icon">
              {openLeadGen ? (
                <MdKeyboardArrowDown />
              ) : (
                <MdKeyboardArrowRight />
              )}
            </span>
          </div>
        </NavLink>
        {openLeadGen && (
          <div className="submenu ms-4">
            <NavLink
              to="/salesdashboard"
              className={`nav-link ${isSalespersonActive ? "active" : ""}`}
            >
              <img src="/icons/budgetRed.png" alt="" className="me-2" />
              Salesperson
            </NavLink>
          </div>
        )}

        {/* Quotations */}
        <NavLink
          to="/clients"
          className={`nav-link icons ${isQuotationsActive ? "active" : ""}`}
          onClick={() => setOpenQuotations(!openQuotations)}
        >
          <div className="d-flex justify-content-between align-items-center w-100">
            <div className="d-flex align-items-center">
              <img
                src="/icons/budgetRed.png"
                alt=""
                className="me-2"
                style={{ width: "25px" }}
              />
              Quotations
            </div>
           
          </div>
        </NavLink>
        
        {/* Back Office */}
        <NavLink
          to="/backoffice"
          className="nav-link icons"
          onClick={() => setOpenBackOffice(!openBackOffice)}
        >
          <div className="d-flex justify-content-between align-items-center w-100">
            <div className="d-flex align-items-center">
              <img src="/icons/file.png" alt="" className="me-2" /> Back Office
            </div>
            <span className="arrow-icon">
              {openBackOffice ? (
                <MdKeyboardArrowDown />
              ) : (
                <MdKeyboardArrowRight />
              )}
            </span>
          </div>
        </NavLink>
       {openBackOffice && (
  <div className="submenu ms-4">
    <NavLink
      to="/quotesbackoffice"
      className={`nav-link ${isQuotesBackOfficeActive ? "active" : ""}`}
    >
      <img
        src="/icons/booking.png"
        alt=""
        className="me-2"
        style={{ width: "22px" }}
      />
      Quotation
    </NavLink>
    <NavLink
      to="/workorderpage"
      className={`nav-link ${isWorkOrderActive ? "active" : ""}`}
    >
      <img
        src="/icons/booking.png"
        alt=""
        className="me-2"
        style={{ width: "22px" }}
      />
      Work Order
    </NavLink>
    <NavLink
      to="/povendor"
      className={`nav-link ${isPoVendorActive ? "active" : ""}`}
    >
      <img
        src="/icons/supplier.png"
        alt=""
        className="me-2"
        style={{ width: "25px" }}
      />
      PO Vendor
    </NavLink>
  </div>
)}

        {/* Accounts */}
      <NavLink
  to="/accounts"
  className={`nav-link icons ${isAccountsActive ? "active" : ""}`}
  onClick={() => setOpenAccount(!openAccount)}
>
          <div className="d-flex justify-content-between align-items-center w-100">
            <div className="d-flex align-items-center">
              <img
                src="/icons/accountings.png"
                alt=""
                className="me-2"
                style={{ width: "27px" }}
              />
              Accounts
            </div>
            <span className="arrow-icon">
              {openAccount ? (
                <MdKeyboardArrowDown />
              ) : (
                <MdKeyboardArrowRight />
              )}
            </span>
          </div>
        </NavLink>
        {openAccount && (
          <div className="submenu ms-4">
            <NavLink to="/billing" className="nav-link">
              <img src="/icons/budgetRed.png" alt="" className="me-2" /> Billing
            </NavLink>
          </div>
        )}

        {/* Material Management */}
        <NavLink
          to="/AllMaterials"
          className={`nav-link icons ${
            isMaterialsPageActive && !isDesignActive && !isStoreActive
              ? "active"
              : ""
          }`}
          onClick={() => setOpenMaterial(!openMaterial)}
        >
          <div className="d-flex justify-content-between align-items-center w-100">
            <div className="d-flex align-items-center">
              <img src="/icons/boxes.png" alt="" className="me-2" /> Material
              Management
            </div>
            <span className="arrow-icon">
              {openMaterial ? (
                <MdKeyboardArrowDown />
              ) : (
                <MdKeyboardArrowRight />
              )}
            </span>
          </div>
        </NavLink>
        {openMaterial && (
          <div className="submenu ms-4">
            <NavLink
              to="/design"
              className={`nav-link ${isDesignActive ? "active" : ""}`}
            >
              <img src="/icons/design.png" alt="" className="me-2" /> Design
            </NavLink>
            <NavLink
              to="/store"
              className={`nav-link ${isStoreActive ? "active" : ""}`}
            >
              <img
                src="/icons/store.png"
                alt=""
                className="me-2"
                style={{ width: "25px" }}
              />
              Store
            </NavLink>
            <NavLink
              to="/plannings"
              className={`nav-link ${isPlanningActive ? "active" : ""}`}
            >
              <img
                src="/icons/planning.png"
                alt=""
                className="me-2"
                style={{ width: "25px" }}
              />
              Planning
            </NavLink>
            {/* <NavLink
              to="/requisiton"
              className={`nav-link ${isRequisitionActive ? "active" : ""}`}
            >
              <img
                src="/icons/check-list.png"
                alt=""
                className="me-2"
                style={{ width: "30px" }}
              />
              Requisition
            </NavLink> */}
          </div>
        )}

        {/* Remaining Links */}
        {/* <NavLink to="/dispatch" className="nav-link icons">
          <img src="/icons/delivery-truck.png" alt="" /> Dispatch
        </NavLink> */}

          <NavLink
          to="/dispatch"
          className={`nav-link icons ${isDispatchActive ? "active" : ""}`}
          onClick={() => setOpenDispatch(!openDispatch)}
        >
          <div className="d-flex justify-content-between align-items-center w-100">
            <div className="d-flex align-items-center">
              <img
                src="/icons/budgetRed.png"
                alt=""
                className="me-2"
                style={{ width: "25px" }}
              />
              Dispatch
            </div>
           
          </div>
        </NavLink>

        {/* <NavLink to="/sitemanagement" className="nav-link icons">
          <img src="/icons/locationRed.png" alt="" /> Site Management
        </NavLink> */}

         <NavLink
          to="/sitemanagement"
          className={`nav-link icons ${isSiteActive ? "active" : ""}`}
          onClick={() => setOpenSite(!openSite)}
        >
          <div className="d-flex justify-content-between align-items-center w-100">
            <div className="d-flex align-items-center">
              <img
                src="/icons/budgetRed.png"
                alt=""
                className="me-2"
                style={{ width: "25px" }}
              />
              Site Management
            </div>
            
          </div>
        </NavLink>


        <NavLink to="/hr" className="nav-link icons">
          <img src="/icons/hrRed.png" alt="" /> HR
        </NavLink>
        <NavLink to="/reports" className="nav-link icons">
          <img src="/icons/repoRed.png" alt="" /> Reports
        </NavLink>
        <NavLink to="/notifications" className="nav-link icons">
          <img src="/icons/notification.png" alt="" /> Notifications
        </NavLink>
      </Nav>
    </div>
  );
}

export default Sidebar;