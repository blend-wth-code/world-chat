import React, { useState } from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loginError, setLoginError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    // Reset errors
    setEmailError("");
    setPasswordError("");
    setLoginError("");

    let isValid = true;

    // Validate email
    if (!email) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!isValidEmail(email)) {
      setEmailError("Invalid email");
      isValid = false;
    }

    // Validate password
    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (password.length < 6) {
      //   setPasswordError("Password must be atleast 6 chars");
      //   isValid = false;
    }

    if (isValid) {
      try {
        const auth = getAuth();
        await signInWithEmailAndPassword(auth, email, password);

        // Handle successful login
        console.log("Logged in successfully");
        window.location.href = "/chat";
      } catch (error) {
        // Handle login error
        setLoginError("Login failed. Please check your credentials.");
        console.error("Login error:", error);
      }
    }
  };

  const isValidEmail = (email) => {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <Container className="d-flex justify-content-center align-items-center vh-75">
      <Form className="p-5 w-50 rounded-2">
        <h2 className="display-5 text-center">Login</h2>
        {/* Added login header */}
        <Form.Group controlId="formEmail" className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            isInvalid={!!emailError}
          />
          <Form.Control.Feedback type="invalid">
            {emailError}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group controlId="formPassword" className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            isInvalid={!!passwordError}
          />
          <Form.Control.Feedback type="invalid">
            {passwordError}
          </Form.Control.Feedback>
        </Form.Group>
        <Button
          type="submit"
          onClick={handleLogin}
          className="btn custom-btn me-3"
        >
          Login
        </Button>
        {loginError && (
          <Alert className="mt-2" variant="danger">
            {loginError}
          </Alert>
        )}
      </Form>
    </Container>
  );
};

export default LoginPage;
