// // src/components/Topbar.jsx
// import { Navbar, Nav, NavDropdown } from "react-bootstrap";
// import "./../App.css";

// function Topbar({ onToggleSidebar }) {
//   return (
//     <Navbar className="topbar d-flex justify-content-between align-items-center px-3">
//       {/* Sidebar Toggle (mobile only) */}
//       <button
//         className="btn btn-outline-secondary d-md-none me-2"
//         onClick={onToggleSidebar}
//       >
//         ☰
//       </button>

//       {/* Logo */}
//       <Navbar.Brand href="#">
//         <img src="/logo/NLF1.jpeg" style={{ height: "2rem" }} alt="Logo" />
//       </Navbar.Brand>

//       {/* Right Side Menus */}
//       <Nav className="ms-auto d-flex flex-row align-items-center">
//         {/* Notifications Dropdown */}
//         <NavDropdown
//           title={
//             <span>
//               🔔 <span className="badge bg-danger">3</span>
//             </span>
//           }
//           id="nav-dropdown-notifications"
//           align="end"
//         >
//           <NavDropdown.Item href="#">New user registered</NavDropdown.Item>
//           <NavDropdown.Item href="#">Server overloaded</NavDropdown.Item>
//           <NavDropdown.Item href="#">Payment received</NavDropdown.Item>
//         </NavDropdown>

//         {/* Messages Dropdown */}
//         <NavDropdown
//           title={
//             <span>
//               💬 <span className="badge bg-primary">5</span>
//             </span>
//           }
//           id="nav-dropdown-messages"
//           align="end"
//         >
//           <NavDropdown.Item href="#">John: Meeting at 3?</NavDropdown.Item>
//           <NavDropdown.Item href="#">Support: Ticket updated</NavDropdown.Item>
//           <NavDropdown.Item href="#">Anna: Send report</NavDropdown.Item>
//         </NavDropdown>

//         {/* Profile Dropdown */}
//         <NavDropdown title="👤 Profile" id="nav-dropdown-profile" align="end">
//           <NavDropdown.Item href="#">My Account</NavDropdown.Item>
//           <NavDropdown.Item href="#">Settings</NavDropdown.Item>
//           <NavDropdown.Divider />
//           <NavDropdown.Item href="#">Logout</NavDropdown.Item>
//         </NavDropdown>
//       </Nav>
//     </Navbar>
//   );
// }

// export default Topbar;


import { Navbar, Nav, NavDropdown } from "react-bootstrap";
import "./../App.css";

function Topbar({ onToggleSidebar }) {

  const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";
  const userName = sessionStorage.getItem("userName") || "Profile";

  const handleLogout = () => {
    sessionStorage.clear();
    window.location.href = "/"; // redirect to login page
  };

  return (
    <Navbar className="topbar d-flex justify-content-between align-items-center px-3">
      {/* Sidebar Toggle (mobile only) */}
      <button
        className="btn btn-outline-secondary d-md-none me-2"
        onClick={onToggleSidebar}
      >
        ☰
      </button>

      {/* Logo */}
      <Navbar.Brand href="#">
        <img src="/logo/NLF1.jpeg" style={{ height: "2rem" }} alt="Logo" />
      </Navbar.Brand>

      {/* Right Side Menus */}
      <Nav className="ms-auto d-flex flex-row align-items-center">

        {/* Notifications Dropdown */}
        <NavDropdown
          title={
            <span>
              🔔 <span className="badge bg-danger">3</span>
            </span>
          }
          id="nav-dropdown-notifications"
          align="end"
        >
          <NavDropdown.Item href="#">New user registered</NavDropdown.Item>
          <NavDropdown.Item href="#">Server overloaded</NavDropdown.Item>
          <NavDropdown.Item href="#">Payment received</NavDropdown.Item>
        </NavDropdown>

        {/* Messages Dropdown */}
        <NavDropdown
          title={
            <span>
              💬 <span className="badge bg-primary">5</span>
            </span>
          }
          id="nav-dropdown-messages"
          align="end"
        >
          <NavDropdown.Item href="#">John: Meeting at 3?</NavDropdown.Item>
          <NavDropdown.Item href="#">Support: Ticket updated</NavDropdown.Item>
          <NavDropdown.Item href="#">Anna: Send report</NavDropdown.Item>
        </NavDropdown>

        {/* Profile / Logout */}
        <NavDropdown
          title={`👤 ${userName}`}
          id="nav-dropdown-profile"
          align="end"
        >
          {!isLoggedIn ? (
            <>
              <NavDropdown.Item href="#">My Account</NavDropdown.Item>
              <NavDropdown.Item href="#">Settings</NavDropdown.Item>
            </>
          ) : null}

          {isLoggedIn && (
            <>
              <NavDropdown.Item onClick={handleLogout}>
                🔓 Logout
              </NavDropdown.Item>
            </>
          )}
        </NavDropdown>
      </Nav>
    </Navbar>
  );
}

export default Topbar;
