import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Index from "./pages/Index";
import Questions from "./pages/Questions";
import QuestionDetail from "./pages/QuestionDetail";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import CollegesList from "./pages/CollegesList";
import CollegePage from "./pages/CollegePage";
import NotFound from "./pages/NotFound";
import Activity from "./pages/Activity";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminColleges from "./pages/admin/Colleges";
import AdminUsers from "./pages/admin/Users";
import AdminReports from "./pages/admin/Reports";
import AdminLayout from "./components/layouts/AdminLayout";
import About from "./pages/About";
import { useLocation } from "react-router-dom";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isAuthRoute = location.pathname === "/login" || location.pathname === "/signup";

  return (
    <>
      {!isAdminRoute && !isAuthRoute && <Navbar />}
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="colleges" element={<AdminColleges />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="reports" element={<AdminReports />} />
        </Route>

        {/* Public Routes */}
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/signup" element={<Auth />} />
        <Route path="/questions" element={<Questions />} />
        <Route path="/question/:id" element={<QuestionDetail />} />
        <Route path="/colleges" element={<CollegesList />} />
        <Route path="/college/:id" element={<CollegePage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/activity" element={<Activity />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Router>
        <AppContent />
      </Router>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;