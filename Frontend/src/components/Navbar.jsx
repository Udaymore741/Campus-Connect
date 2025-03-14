import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Menu, X, User } from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "./ThemeToggle";

// Mock authenticated user - in a real app, this would come from your auth context/state management
const mockAuthUser = {
  id: 1,
  name: "John Doe",
  avatar: "",
};

export default function Navbar() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(true); // For demo purposes
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // Detect when page is scrolled
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileMenu && !event.target.closest('.profile-menu')) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showProfileMenu]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
    // Implement search functionality
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <nav
      className={cn(
        "fixed w-full top-0 z-50 transition-all duration-300 px-6",
        isScrolled ? "py-3 nav-blur backdrop-blur-md bg-background/80 shadow-sm" : "py-5"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            CampusQuery
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/questions" className="text-foreground/80 hover:text-primary transition-colors">
            Questions
          </Link>
          <Link to="/categories" className="text-foreground/80 hover:text-primary transition-colors">
            Categories
          </Link>
          <Link to="/about" className="text-foreground/80 hover:text-primary transition-colors">
            About
          </Link>
        </div>

        {/* Search Form */}
        <form 
          onSubmit={handleSearch}
          className={cn(
            "hidden md:flex relative items-center transition-all duration-300",
            isScrolled ? "w-64" : "w-72"
          )}
        >
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-2 px-4 pr-10 rounded-full bg-secondary border-none focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button type="submit" className="absolute right-3">
            <Search className="w-4 h-4 text-muted-foreground" />
          </button>
        </form>

        {/* User Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <ThemeToggle />
          {isAuthenticated ? (
            <div className="relative profile-menu">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20 hover:border-primary transition-colors"
              >
                {mockAuthUser.avatar ? (
                  <img
                    src={mockAuthUser.avatar}
                    alt={mockAuthUser.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
              </button>
              
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 py-2 bg-card rounded-lg shadow-lg border border-border animate-fade-in">
                  <div className="px-4 py-2 border-b border-border">
                    <p className="font-medium truncate">{mockAuthUser.name}</p>
                  </div>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-foreground/80 hover:text-primary hover:bg-muted/50 transition-colors"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    View Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-muted/50 transition-colors"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link 
                to="/login" 
                className="px-4 py-2 text-primary hover:text-primary/80 transition-colors"
              >
                Log In
              </Link>
              <Link 
                to="/signup" 
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center space-x-3 md:hidden">
          <ThemeToggle />
          {isAuthenticated && (
            <Link to="/profile" className="w-8 h-8 rounded-full overflow-hidden border-2 border-primary/20">
              {mockAuthUser.avatar ? (
                <img
                  src={mockAuthUser.avatar}
                  alt={mockAuthUser.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </Link>
          )}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-md text-foreground"
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden py-4 px-4 mt-2 rounded-lg glass animate-fade-in">
          <form 
            onSubmit={handleSearch}
            className="relative mb-4"
          >
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2 px-4 pr-10 rounded-full bg-secondary border-none focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button type="submit" className="absolute right-3 top-2">
              <Search className="w-4 h-4 text-muted-foreground" />
            </button>
          </form>
          <div className="space-y-3">
            <Link to="/questions" className="block py-2 text-foreground/80 hover:text-primary">
              Questions
            </Link>
            <Link to="/categories" className="block py-2 text-foreground/80 hover:text-primary">
              Categories
            </Link>
            <Link to="/about" className="block py-2 text-foreground/80 hover:text-primary">
              About
            </Link>
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="w-full text-left py-2 text-destructive hover:text-destructive/80"
              >
                Log Out
              </button>
            ) : (
              <div className="pt-2 flex flex-col space-y-2">
                <Link 
                  to="/login" 
                  className="px-4 py-2 text-center text-primary hover:text-primary/80 border border-primary/20 rounded-md"
                >
                  Log In
                </Link>
                <Link 
                  to="/signup" 
                  className="px-4 py-2 text-center bg-primary hover:bg-primary/90 text-primary-foreground rounded-md"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
} 