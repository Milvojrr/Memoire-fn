import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ClientDashboard from "./pages/ClientDashboard";
import AgentDashboard from "./pages/AgentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import DisplayBoard from "./pages/DisplayBoard";
import MyTickets from "./pages/MyTickets";
import NotFound from "./pages/NotFound";
import Statistics from "./pages/Statistics";

function App() {
  return (
    <BrowserRouter>
      <div className="d-flex flex-column min-vh-100">
        <Navbar />
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/client" element={<ClientDashboard />} />
            <Route path="/my-tickets" element={<MyTickets />} />
            <Route path="/agent" element={<AgentDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/stats" element={<Statistics />} />
            <Route path="/display" element={<DisplayBoard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;