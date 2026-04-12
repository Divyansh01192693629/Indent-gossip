import React, { useEffect, useState } from "react";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Feed from "./components/Feed";
import ResetPassword from "./components/ResetPassword";
import Landing from "./components/Landing";
import { supabase } from "./supabaseClient";
import { ThemeProvider } from "./context/ThemeContext";

function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState("landing"); // landing, login, signup, feed

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUser(data.user);
        setCurrentPage("feed");
      }
    };

    getUser();
  }, []);

  if (window.location.hash.includes("type=recovery")) {
    return (
      <ThemeProvider>
        <ResetPassword />
      </ThemeProvider>
    );
  }

  if (user && currentPage === "feed") {
    return (
      <ThemeProvider>
        <Feed user={user} setUser={setUser} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      {currentPage === "landing" && (
        <Landing setCurrentPage={setCurrentPage} />
      )}
      {currentPage === "login" && (
        <Login
          setUser={setUser}
          setCurrentPage={setCurrentPage}
        />
      )}
      {currentPage === "signup" && (
        <Signup
          setUser={setUser}
          setCurrentPage={setCurrentPage}
        />
      )}
    </ThemeProvider>
  );
}

export default App;
