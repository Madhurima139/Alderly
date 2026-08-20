import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Landing from "@/pages/Landing";
import Services from "@/pages/Services";
import Plans from "@/pages/Plans";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Dashboard from "@/pages/Dashboard";
import BookService from "@/pages/BookService";

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  if (user === null) {
    return <div className="max-w-6xl mx-auto px-4 py-20 text-lg">Loading…</div>;
  }
  if (user === false) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return children;
};

const AppRoutes = () => (
  <>
    <Navbar />
    <main className="min-h-[60vh]">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/services" element={<Services />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/book/:slug" element={<BookService />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
    <Footer />
  </>
);

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
