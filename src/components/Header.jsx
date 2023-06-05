import React from "react";
import { Navbar, Container, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { useFirebaseApp, useSigninCheck } from "reactfire";
import "firebase/compat/auth";
import { getAuth } from "firebase/auth";

const Header = () => {
  const firebaseApp = useFirebaseApp();
  const { status, data: signInCheckResult } = useSigninCheck();

  if (status === "loading") {
    return <span>loading...</span>;
  }

  const handleSignOut = async () => {
    const auth = getAuth(firebaseApp);
    await auth.signOut();
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand>
          We Chat - <small>ask anyone</small>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav" className="justify-content-end">
          <Nav>
            {!signInCheckResult.signedIn ? (
              <>
                <Nav.Link as={Link} to="/register">
                  Register
                </Nav.Link>
                <Nav.Link as={Link} to="/login">
                  Login
                </Nav.Link>
              </>
            ) : (
              <>
                {signInCheckResult.user && (
                  <span className="navbar-text me-3">
                    {signInCheckResult.user.displayName}
                  </span>
                )}
                <Nav.Link as={Link} to="/login" onClick={handleSignOut}>
                  Logout
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
