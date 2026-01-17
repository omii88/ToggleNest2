import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import WorkSpace from "./pages/WorkSpace";
import Sprints from "./pages/Sprints";
import Boards from "./pages/Boards";
import Analytics from "./pages/Analytics";
import TeamPage from "./pages/TeamPage";

function App() {
  const location = useLocation();

  // Hide Navbar and Footer on login/signup pages
  const hideNavbarFooterRoutes = ["/login", "/signup"];
  const shouldShowNavbarFooter = !hideNavbarFooterRoutes.includes(location.pathname);

  return (
    <>
      {shouldShowNavbarFooter && <Navbar />}

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/workspace" element={<WorkSpace />} />
          <Route path="/sprints" element={<Sprints />} />
          <Route path="/boards" element={<Boards />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/teampage" element={<TeamPage />} />
        </Routes>
      </main>

      {shouldShowNavbarFooter && <Footer />}
    </>
  );
}

export default App;
