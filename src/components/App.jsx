import { getFirestore } from "firebase/firestore";
import {
  FirestoreProvider,
  useFirebaseApp,
  AuthProvider,
  DatabaseProvider,
} from "reactfire";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";

import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import Header from "./Header";
import LoginPage from "./Login";
import RegisterPage from "./Register";
import Chat from "./ChatDetails/Chat";

function App() {
  const app = useFirebaseApp();
  const firestoreInstance = getFirestore(app);
  const database = getDatabase(app);
  const auth = getAuth(app);

  return (
    <>
      <FirestoreProvider sdk={firestoreInstance}>
        <AuthProvider sdk={auth}>
          <DatabaseProvider sdk={database}>
            <Router>
              <Header />
              <Routes>
                <Route exact path="/login" element={<LoginPage />} />
                <Route exact path="/register" element={<RegisterPage />} />
                <Route exact path="/chat" element={<Chat />} />
                {/* Additional routes */}
                <Route path="*" element={<Navigate to="/login" />} />
              </Routes>
            </Router>
          </DatabaseProvider>
        </AuthProvider>
      </FirestoreProvider>
    </>
  );
}

export default App;
