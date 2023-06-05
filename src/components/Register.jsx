import React, { useState } from "react";
import { useFirebaseApp } from "reactfire";
import { Container, Form, Button, Alert } from "react-bootstrap";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    error: "",
  });

  const auth = getAuth(useFirebaseApp());
  const firestore = getFirestore(useFirebaseApp());

  const handleRegister = async (e) => {
    e.preventDefault();

    // Reset error
    setFormData((prevState) => ({ ...prevState, error: "" }));

    const { firstName, lastName, email, password, confirmPassword } = formData;
    let isValid = true;
    const errors = {};

    // Validate first name
    if (!firstName || firstName.length < 2) {
      errors.firstName = "First name must be at least 2 characters";
      isValid = false;
    }

    // Validate last name
    if (!lastName || lastName.length < 2) {
      errors.lastName = "Last name must be at least 2 characters";
      isValid = false;
    }

    // Validate email
    if (!email) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!isValidEmail(email)) {
      errors.email = "Invalid email";
      isValid = false;
    }

    // Validate password
    if (!password) {
      errors.password = "Password is required";
      isValid = false;
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    // Validate confirm password
    if (!confirmPassword) {
      errors.confirmPassword = "Confirm password is required";
      isValid = false;
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    if (isValid) {
      try {
        const { user } = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        // Set the user's display name
        await updateProfile(user, {
          displayName: firstName,
        });

        // Create entry in Firebase Firestore
        const usersCollection = collection(firestore, "users");
        const userData = {
          firstName,
          lastName,
          email,
          lastLogin: null,
        };
        await addDoc(usersCollection, userData);

        // Handle successful registration
        setFormData((prevState) => ({
          ...prevState,
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
          error: "",
        }));
        window.location.href = "/chat";
      } catch (error) {
        // Handle registration error
        setFormData((prevState) => ({
          ...prevState,
          error: "Registration failed. Please try again.",
        }));
        console.error("Registration error:", error);
      }
    } else {
      setFormData((prevState) => ({ ...prevState, errors }));
    }
  };

  const isValidEmail = (email) => {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const { firstName, lastName, email, password, confirmPassword, error } =
    formData;

  return (
    <Container className="d-flex justify-content-center align-items-center vh-min-75">
      <Form className="p-5 w-50 rounded-2">
        <h2 className="display-5 text-center">Register</h2>
        <Form.Group controlId="formFirstName" className="mb-3">
          <Form.Label>First Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter first name"
            value={firstName}
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
            isInvalid={!!formData.errors?.firstName}
          />
          <Form.Control.Feedback type="invalid">
            {formData.errors?.firstName}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group controlId="formLastName" className="mb-3">
          <Form.Label>Last Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter last name"
            value={lastName}
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
            isInvalid={!!formData.errors?.lastName}
          />
          <Form.Control.Feedback type="invalid">
            {formData.errors?.lastName}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group controlId="formEmail" className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            isInvalid={!!formData.errors?.email}
          />
          <Form.Control.Feedback type="invalid">
            {formData.errors?.email}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group controlId="formPassword" className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            isInvalid={!!formData.errors?.password}
          />
          <Form.Control.Feedback type="invalid">
            {formData.errors?.password}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group controlId="formConfirmPassword" className="mb-3">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) =>
              setFormData({ ...formData, confirmPassword: e.target.value })
            }
            isInvalid={!!formData.errors?.confirmPassword}
          />
          <Form.Control.Feedback type="invalid">
            {formData.errors?.confirmPassword}
          </Form.Control.Feedback>
        </Form.Group>
        <div className="d-flex justify-content-center">
          <Button
            className="btn custom-btn mb-1"
            type="submit"
            onClick={handleRegister}
          >
            Register
          </Button>
        </div>
        {error && <Alert variant="danger">{error}</Alert>}
      </Form>
    </Container>
  );
};

export default RegisterPage;
