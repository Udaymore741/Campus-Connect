import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Menu, X, User, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [profileImageError, setProfileImageError] = useState(false);
  
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
    /** @param {MouseEvent} event */
    const handleClickOutside = (event) => {
      const target = event.target;
      if (showProfileMenu && target instanceof Element && !target.closest('.profile-menu')) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showProfileMenu]);

  // Handle search
  /** @param {React.FormEvent} e */
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/questions?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
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
            CampusConnect
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {user ? (
            <>
              <Link to="/my-hub" className="text-foreground/80 hover:text-primary transition-colors">
                My Hub
              </Link>
              <Link to="/colleges" className="text-foreground/80 hover:text-primary transition-colors">
                Colleges
              </Link>
              <Link to="/about" className="text-foreground/80 hover:text-primary transition-colors">
                About
              </Link>
            </>
          ) : (
            <Link to="/auth" className="text-foreground/80 hover:text-primary transition-colors">
              Sign In
            </Link>
          )}
        </div>

        {/* Search Form */}
        {user && (
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
        )}

        {/* User Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <ThemeToggle />
          {user ? (
            <div className="relative profile-menu">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20 hover:border-primary transition-colors"
              >
                {user.profilePicture && !profileImageError ? (
                  <img
                    src={user.profilePicture}
                    alt={user.name}
                    className="w-full h-full object-cover"
                    onError={() => setProfileImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10">
                    <span className="text-lg font-medium text-primary">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </button>
              
              {showProfileMenu && (
                <div className="profile-menu absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-card border border-border">
                  <div className="py-1">
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <ShieldCheck className="w-4 h-4" />
                        Admin Dashboard
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/activity"
                      className="block px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      My Activity
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/auth"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center space-x-3 md:hidden">
          <ThemeToggle />
          {user ? (
            <>
              <Link to="/profile" className="w-8 h-8 rounded-full overflow-hidden border-2 border-primary/20">
                {user.profilePicture && !profileImageError ? (
                  <img
                    src={user.profilePicture}
                    alt={user.name}
                    className="w-full h-full object-cover"
                    onError={() => setProfileImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10">
                    <span className="text-sm font-medium text-primary">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </Link>
            </>
          ) : (
            <Link to="/auth" className="text-foreground/80 hover:text-primary transition-colors">
              Sign In
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
      <div className={cn(
        "fixed inset-0 bg-background/80 backdrop-blur-sm md:hidden transition-opacity duration-300",
        isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-background shadow-lg p-6">
          <button
            onClick={() => setIsMenuOpen(false)}
            className="absolute top-5 right-5"
          >
            <X className="h-6 w-6" />
          </button>
          
          <div className="mt-8 space-y-4">
            {user ? (
              <>
                <Link
                  to="/my-hub"
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-2 text-lg hover:text-primary transition-colors"
                >
                  My Hub
                </Link>
                <Link
                  to="/colleges"
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-2 text-lg hover:text-primary transition-colors"
                >
                  Colleges
                </Link>
                <Link
                  to="/about"
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-2 text-lg hover:text-primary transition-colors"
                >
                  About
                </Link>
                
                <div className="pt-4 mt-4 border-t border-border">
                  <form onSubmit={handleSearch} className="relative">
                    <input
                      type="text"
                      placeholder="Search questions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full py-2 px-4 pr-10 rounded-full bg-secondary border-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Search className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </form>
                </div>

                <div className="pt-4 mt-4 border-t border-border">
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="block py-2 text-lg hover:text-primary transition-colors"
                  >
                    My Profile
                  </Link>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}
                    className="block w-full text-left py-2 text-lg text-destructive hover:text-destructive/80 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/auth"
                onClick={() => setIsMenuOpen(false)}
                className="block py-2 text-lg hover:text-primary transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 