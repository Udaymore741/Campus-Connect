import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "@/components/Footer";
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
import UserManagementPage from "./pages/admin/Users";
import AdminReports from "./pages/admin/Reports";
import ContentFilter from "./pages/admin/ContentFilter";
import AddAdmin from "./pages/admin/AddAdmin";
import AdminLayout from "./components/layouts/AdminLayout";
import About from "./pages/About";
import MyHub from "./pages/MyHub";
import ForgotPassword from "./components/Auth/ForgotPassword.jsx";
import ResetPassword from "./components/Auth/ResetPassword.jsx";
import { AuthProvider } from "@/contexts/AuthContext";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isAuthRoute = location.pathname === "/auth" || 
                     location.pathname === "/forgot-password" || 
                     location.pathname.startsWith("/reset-password");

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            {/* Auth Routes */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="colleges" element={<AdminColleges />} />
              <Route path="users" element={<UserManagementPage />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="content-filter" element={<ContentFilter />} />
              <Route path="add-admin" element={<AddAdmin />} />
            </Route>

            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/questions" element={<Questions />} />
            <Route path="/question/:id" element={<QuestionDetail />} />
            <Route path="/colleges" element={<CollegesList />} />
            <Route path="/college/:id" element={<CollegePage />} />
            <Route path="/my-hub" element={<MyHub />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/activity" element={<Activity />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <Toaster position="top-right" />
      </div>
    </AuthProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;