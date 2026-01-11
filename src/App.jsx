import { useState } from "react";
import Login from "./Components/Login";
import Dashboard from "./Components/Dashboard";
import { getUser } from "./services/authService";

function App() {
  // Inicializar loggedIn comprobando si hay usuario en session/local storage
  const [loggedIn, setLoggedIn] = useState(() => Boolean(getUser()));

  return (
    <>
      {loggedIn ? <Dashboard onLogout={() => setLoggedIn(false)} /> : <Login onLoginSuccess={() => setLoggedIn(true)} />}
    </>
  );
}

export default App;
