// import { useState } from "react";
// import { Container, Form, Button, Alert, Card, InputGroup } from "react-bootstrap";
// import axios from "axios";

// const LoginForm = ({ onLoginSuccess }) => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     try {
//       if (!email || !password) {
//         setError("Please fill in both fields");
//         setLoading(false);
//         return;
//       }

//       const response = await axios.post(
//         "https://nlfs.in/erp/index.php/Api/login",
//         { email, password }
//       );

//       const res = response.data;
//       console.log("LOGIN RESPONSE:", res);

//       if (!res || res.status !== "true" || res.success !== 1 || !res.data) {
//         setError(res.message || "Invalid credentials");
//         setLoading(false);
//         return;
//       }

//       const user = res.data;

//       // Store user data in session storage
//       sessionStorage.setItem("isLoggedIn", "true");
//       sessionStorage.setItem("userEmail", email);
//       sessionStorage.setItem("userName", user?.name || email.split("@")[0]);
//       sessionStorage.setItem("userId", user?.id || "");
      
//       // Store user role - check multiple possible field names
//       const userRole =
//         user?.roll ||   // ✅ backend field
//         user?.role ||
//         user?.user_role ||
//         user?.user_type ||
//         user?.designation ||
//         "";

//       sessionStorage.setItem("userRole", userRole);

//       sessionStorage.setItem("userRole", userRole);

//       console.log("✅ Session stored successfully!");
//       console.log("User ID:", user?.id);
//       console.log("User Role:", userRole);
//       console.log("Full user data:", user);

//       onLoginSuccess();

//     } catch (err) {
//       console.error("Login error:", err);
//       setError(err.response?.data?.message || "Login failed. Please try again.");
//       setLoading(false);
//     }
//   };

//   // Toggle Password Visibility
//   const togglePasswordVisibility = () => {
//     setShowPassword(!showPassword);
//   };

//   return (
//     <div className="login-container">
//       <Container className="d-flex justify-content-center align-items-center vh-100">
//         <Card className="login-card shadow-lg" style={{ width: "400px" }}>
//           <Card.Body className="p-5">
//             <div className="text-center mb-4">
//               <img src="/NLF.gif" width="300px" className="pb-3" alt="Logo" />
//               <h5 className="fw-bold mb-2">ERP System</h5>
//               <p className="text-muted">Please login to continue</p>
//             </div>

//             {error && (
//               <Alert variant="danger" dismissible onClose={() => setError("")}>
//                 {error}
//               </Alert>
//             )}

//             <Form onSubmit={handleLogin}>
//               {/* Email */}
//               <Form.Group className="mb-3">
//                 <Form.Label className="fw-500">Email Address</Form.Label>
//                 <Form.Control
//                   type="email"
//                   placeholder="Enter your email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   disabled={loading}
//                   required
//                 />
//               </Form.Group>

//               {/* Password with Eye Icon */}
//               <Form.Group className="mb-3">
//                 <Form.Label className="fw-500">Password</Form.Label>
//                 <InputGroup>
//                   <Form.Control
//                     type={showPassword ? "text" : "password"}
//                     placeholder="Enter your password"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     disabled={loading}
//                     required
//                   />
//                   <InputGroup.Text 
//                     onClick={togglePasswordVisibility} 
//                     style={{ cursor: "pointer" }}
//                     title={showPassword ? "Hide Password" : "Show Password"}
//                   >
//                     {/* Eye Icon SVG (Show) */}
//                     {!showPassword ? (
//                       <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
//                         <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z" />
//                         <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z" />
//                       </svg>
//                     ) : (
//                       /* Eye Slash Icon SVG (Hide) */
//                       <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
//                         <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z" />
//                         <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z" />
//                         <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z" />
//                       </svg>
//                     )}
//                   </InputGroup.Text>
//                 </InputGroup>
//               </Form.Group>

//               <Button
//                 className="add-customer-btn w-100 py-2"
//                 type="submit"
//                 disabled={loading}
//               >
//                 {loading ? "Logging in..." : "Login"}
//               </Button>
//             </Form>
//           </Card.Body>
//         </Card>
//       </Container>
//     </div>
//   );
// };

// export default LoginForm;


import { useState } from "react";
import { Container, Form, Button, Alert, Card, InputGroup } from "react-bootstrap";
import axios from "axios";

const LoginForm = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!email || !password) {
        setError("Please fill in both fields");
        setLoading(false);
        return;
      }

      const response = await axios.post(
        "https://nlfs.in/erp/index.php/Api/login",
        { email, password }
      );

      const res = response.data;
      console.log("LOGIN RESPONSE:", res);

      if (!res || res.status !== "true" || res.success !== 1 || !res.data) {
        setError(res.message || "Invalid credentials");
        setLoading(false);
        return;
      }

      const user = res.data;

      // Store user data in session storage
      sessionStorage.setItem("isLoggedIn", "true");
      sessionStorage.setItem("userEmail", email);
      sessionStorage.setItem("userName", user?.name || email.split("@")[0]);
      // Changed from userId to emp_id
      sessionStorage.setItem("emp_id", user?.emp_id || user?.id || "");
      
      // Store user role - check multiple possible field names
      const userRole =
        user?.roll ||   // ✅ backend field
        user?.role ||
        user?.user_role ||
        user?.user_type ||
        user?.designation ||
        "";

      sessionStorage.setItem("userRole", userRole);

      console.log("✅ Session stored successfully!");
      // Updated console log to show emp_id instead of userId
      console.log("Employee ID:", user?.emp_id || user?.id);
      console.log("User Role:", userRole);
      console.log("Full user data:", user);

      onLoginSuccess();

    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Login failed. Please try again.");
      setLoading(false);
    }
  };

  // Toggle Password Visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <Container className="d-flex justify-content-center align-items-center vh-100">
        <Card className="login-card shadow-lg" style={{ width: "400px" }}>
          <Card.Body className="p-5">
            <div className="text-center mb-4">
              <img src="/NLF.gif" width="300px" className="pb-3" alt="Logo" />
              <h5 className="fw-bold mb-2">ERP System</h5>
              <p className="text-muted">Please login to continue</p>
            </div>

            {error && (
              <Alert variant="danger" dismissible onClose={() => setError("")}>
                {error}
              </Alert>
            )}

            <Form onSubmit={handleLogin}>
              {/* Email */}
              <Form.Group className="mb-3">
                <Form.Label className="fw-500">Email Address</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </Form.Group>

              {/* Password with Eye Icon */}
              <Form.Group className="mb-3">
                <Form.Label className="fw-500">Password</Form.Label>
                <InputGroup>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                  <InputGroup.Text 
                    onClick={togglePasswordVisibility} 
                    style={{ cursor: "pointer" }}
                    title={showPassword ? "Hide Password" : "Show Password"}
                  >
                  
                  </InputGroup.Text>
                </InputGroup>
              </Form.Group>

              <Button
                className="add-customer-btn w-100 py-2"
                type="submit"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default LoginForm;