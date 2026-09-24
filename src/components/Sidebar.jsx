// src/components/Sidebar.jsx

import { useState } from "react";
import { Nav } from "react-bootstrap";
import { NavLink, useLocation } from "react-router-dom";
import "./../App.css";
import { MdKeyboardArrowRight, MdKeyboardArrowDown } from "react-icons/md";

function Sidebar({ collapsed, onClose }) {
  const location = useLocation();

  // Role-based access control restored
  const userRole = sessionStorage.getItem("userRole")?.toLowerCase();

  // Role access configuration restored
  const ROLE_ACCESS = {
    admin: [
      "dashboard",
      "master",
      "admin",
      "lead",
      "backoffice",
      "accounts",
      "material",
      "dispatch",
      "site",
      "hr",
      "reports",
      "notifications",
    ],

    sales: [
      "dashboard",
      "lead",
    ],

    "back office": [
      "dashboard",
      "backoffice",
    ],

    accounts: [
      "dashboard",
      "accounts",
    ],

    hr: [
      "dashboard",
      "hr",
    ],
  };

  // Access check helper function restored
  const hasAccess = (module) => {
    if (!userRole) return false;
    const allowedModules = ROLE_ACCESS[userRole] || [];
    return allowedModules.includes(module);
  };

  // Active state checks - keeping these as they're needed for UI state
  const isLeadGenActive =
    location.pathname.includes("/leadgeneration") ||
    location.pathname.includes("/view-leads") ||
    location.pathname.includes("/viewlead") ||
    location.pathname.includes("/newlead");

  const isSalespersonActive =
    location.pathname.includes("/sales") ||
    location.pathname.includes("/sales-details");

  const isAdminActive = location.pathname.includes("/admin-approval");
  const isRateApproveActive = location.pathname.includes("/rateapprove");
  const isMasterSubActive = location.pathname.includes("/master");

  const isWorkOrderActive =
    location.pathname.includes("/workorder") ||
    location.pathname.includes("/workorderform");

  const isQuotesBackOfficeActive = location.pathname.includes("/quotesbackoffice");
  const isPoVendorActive =
    location.pathname.includes("/povendor") ||
    location.pathname.includes("/annextureviewer") ||
    location.pathname.includes("/annextureform");

  const isBackOfficeActive = isWorkOrderActive || isPoVendorActive || isQuotesBackOfficeActive;

  const isAccountsPageActive = location.pathname === "/accounts";
  const isAccountsOrdersActive = location.pathname.startsWith("/workorderformaccounts/");
  const isAccountsActive = isAccountsPageActive || isAccountsOrdersActive;

  const isMaterialsPageActive = location.pathname === "/AllMaterials";
  const isDesignActive =
    location.pathname.includes("/designsubpage") ||
    location.pathname.includes("/designvendor") ||
    location.pathname.includes("/design") ||
    location.pathname.includes("/designworkorderform");

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

  const isDispatchActive =
    location.pathname.includes("/dispatch") ||
    location.pathname.includes("/dispatchform");

  const isSiteActive =
    location.pathname.includes("/sitemanagement") ||
    location.pathname.includes("/site-management");

  // Dropdown states - keeping these as they're needed for UI state
  const [openMaster, setOpenMaster] = useState(isMasterSubActive);
  const [openLeadGen, setOpenLeadGen] = useState(isLeadGenActive || isSalespersonActive);
  const [openAdmin, setOpenAdmin] = useState(isAdminActive || isRateApproveActive);
  const [openBackOffice, setOpenBackOffice] = useState(isBackOfficeActive);
  const [openAccount, setOpenAccount] = useState(isAccountsActive);
  const [openMaterial, setOpenMaterial] = useState(isMaterialManagementActive);
  const [openDispatch, setOpenDispatch] = useState(isDispatchActive);
  const [openSite, setOpenSite] = useState(isSiteActive);

  return (
    <div className={`sidebar d-flex flex-column p-3 ${collapsed ? "collapsed" : ""}`}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="w-100 d-flex justify-content-center align-items-center">
          <img src="/logo/NLFLogo.gif" alt="Logo" style={{ width: "100px" }} />
        </div>
        <button className="btn btn-sm btn-light d-md-none" onClick={onClose}>
          ✖
        </button>
      </div>

      <Nav className="flex-column">
        {/* Dashboard - Everyone can see */}
        {hasAccess("dashboard") && (
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
        )}

        {/* Master - Admin only */}
        {hasAccess("master") && (
          <>
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
                <NavLink to="/usertable" className="nav-link">User</NavLink>
                <NavLink to="/branchmaster" className="nav-link">Branch</NavLink>
                <NavLink to="/rolemaster" className="nav-link">Role</NavLink>
                <NavLink to="/materialmaster" className="nav-link">Material</NavLink>
                <NavLink to="/unitmaster" className="nav-link">Unit</NavLink>
                <NavLink to="/stagemaster" className="nav-link">Stage</NavLink>
                <NavLink to="/departmentmaster" className="nav-link">Department</NavLink>
                <NavLink to="/ratemaster" className="nav-link">Rate</NavLink>
                <NavLink to="/combinedmaster" className="nav-link">Product</NavLink>
                <NavLink to="/signature" className="nav-link">Signature</NavLink>
                <NavLink to="/vendormaster" className="nav-link">Vendors</NavLink>
              </div>
            )}
          </>
        )}

        {/* Admin - Admin only */}
        {hasAccess("admin") && (
          <NavLink
            to="/admin-approval"
            className={`nav-link icons ${isAdminActive ? "active" : ""}`}
            onClick={() => setOpenAdmin(!openAdmin)}
          >
            <div className="d-flex justify-content-between align-items-center w-100">
              <div className="d-flex align-items-center">
                <img
                  src="/icons/accountings.png"
                  alt=""
                  className="me-2"
                  style={{ width: "27px" }}
                />
                Admin
              </div>
            </div>
          </NavLink>
        )}

        {/* Lead Generation - Admin and Sales */}
        {hasAccess("lead") && (
          <>
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
                  {openLeadGen ? <MdKeyboardArrowDown /> : <MdKeyboardArrowRight />}
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
                <NavLink
                  to="/rateapprove"
                  className={`nav-link ${isRateApproveActive ? "active" : ""}`}
                >
                  <img src="/icons/budgetRed.png" alt="" className="me-2" />
                  Rate Approval
                </NavLink>
              </div>
            )}
          </>
        )}

        {/* Back Office - Admin and Back Office */}
        {hasAccess("backoffice") && (
          <>
            <NavLink
              to="/backoffice"
              className="nav-link icons"
              onClick={() => setOpenBackOffice(!openBackOffice)}
            >
              <div className="d-flex justify-content-between align-items-center w-100">
                <div className="d-flex align-items-center">
                  <img src="/icons/file.png" alt="" className="me-2" />
                  Back Office
                </div>
                <span className="arrow-icon">
                  {openBackOffice ? <MdKeyboardArrowDown /> : <MdKeyboardArrowRight />}
                </span>
              </div>
            </NavLink>

            {openBackOffice && (
              <div className="submenu ms-4">
                <NavLink
                  to="/clients"
                  className={`nav-link ${isQuotesBackOfficeActive ? "active" : ""}`}
                >
                  <img src="/icons/booking.png" alt="" className="me-2" />
                  Quotation
                </NavLink>

                <NavLink
                  to="/workorderpage"
                  className={`nav-link ${isWorkOrderActive ? "active" : ""}`}
                >
                  <img src="/icons/booking.png" alt="" className="me-2" />
                  Work Order
                </NavLink>

                <NavLink
                  to="/povendor"
                  className={`nav-link ${isPoVendorActive ? "active" : ""}`}
                >
                  <img src="/icons/supplier.png" alt="" className="me-2" />
                  PO Vendor
                </NavLink>
 <NavLink to="/annexurepage" className="nav-link">
                  <img src="/icons/supplier.png" alt="" /> Annexures
                </NavLink>
                <NavLink to="/combinedmaster" className="nav-link">
                  <img src="/icons/supplier.png" alt="" /> Product
                </NavLink>
                
              </div>
            )}
          </>
        )}

        {/* Accounts - Admin and Accounts */}
        {hasAccess("accounts") && (
          <>
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
                  {openAccount ? <MdKeyboardArrowDown /> : <MdKeyboardArrowRight />}
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
          </>
        )}

        {/* Material Management - Admin only */}
        {hasAccess("material") && (
          <>
            <NavLink
              to="/AllMaterials"
              className={`nav-link icons ${
                isMaterialsPageActive && !isDesignActive && !isStoreActive ? "active" : ""
              }`}
              onClick={() => setOpenMaterial(!openMaterial)}
            >
              <div className="d-flex justify-content-between align-items-center w-100">
                <div className="d-flex align-items-center">
                  <img src="/icons/boxes.png" alt="" className="me-2" /> Material Management
                </div>
                <span className="arrow-icon">
                  {openMaterial ? <MdKeyboardArrowDown /> : <MdKeyboardArrowRight />}
                </span>
              </div>
            </NavLink>
            {openMaterial && (
              <div className="submenu ms-4">
                <NavLink to="/design" className={`nav-link ${isDesignActive ? "active" : ""}`}>
                  <img src="/icons/design.png" alt="" className="me-2" /> Design
                </NavLink>
                <NavLink to="/store" className={`nav-link ${isStoreActive ? "active" : ""}`}>
                  <img src="/icons/store.png" alt="" className="me-2" style={{ width: "25px" }} />
                  Store
                </NavLink>
                <NavLink to="/plannings" className={`nav-link ${isPlanningActive ? "active" : ""}`}>
                  <img src="/icons/planning.png" alt="" className="me-2" style={{ width: "25px" }} />
                  Planning
                </NavLink>
              </div>
            )}
          </>
        )}

        {/* Dispatch - Admin only */}
        {hasAccess("dispatch") && (
          <NavLink
            to="/dispatch"
            className={`nav-link icons ${isDispatchActive ? "active" : ""}`}
            onClick={() => setOpenDispatch(!openDispatch)}
          >
            <div className="d-flex justify-content-between align-items-center w-100">
              <div className="d-flex align-items-center">
                <img src="/icons/budgetRed.png" alt="" className="me-2" style={{ width: "25px" }} />
                Dispatch
              </div>
            </div>
          </NavLink>
        )}

        {/* Site Management - Admin only */}
        {hasAccess("site") && (
          <NavLink
            to="/sitemanagement"
            className={`nav-link icons ${isSiteActive ? "active" : ""}`}
            onClick={() => setOpenSite(!openSite)}
          >
            <div className="d-flex justify-content-between align-items-center w-100">
              <div className="d-flex align-items-center">
                <img src="/icons/budgetRed.png" alt="" className="me-2" style={{ width: "25px" }} />
                Site Management
              </div>
            </div>
          </NavLink>
        )}

        {/* HR - Admin and HR */}
        {hasAccess("hr") && (
          <NavLink to="/hr" className="nav-link icons">
            <img src="/icons/hrRed.png" alt="" /> HR
          </NavLink>
        )}

        {/* Reports - Admin and HR */}
        {hasAccess("reports") && (
          <NavLink to="/reports" className="nav-link icons">
            <img src="/icons/repoRed.png" alt="" /> Reports
          </NavLink>
        )}

        {/* Notifications - Admin and HR */}
        {hasAccess("notifications") && (
          <NavLink to="/notifications" className="nav-link icons">
            <img src="/icons/notification.png" alt="" /> Notifications
          </NavLink>
        )}
      </Nav>
    </div>
  );
}

export default Sidebar;