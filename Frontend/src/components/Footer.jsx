import { Link } from "react-router-dom";
import { Github, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 border-t border-blue-100 dark:border-gray-700">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Campus Connect</h3>
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              Connecting students, faculty, and visitors in a seamless academic environment.
            </p>
            <Button variant="ghost" size="icon" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
              <Github className="h-5 w-5" />
            </Button>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-blue-800 dark:text-blue-200 hover:text-blue-600 dark:hover:text-blue-400 text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/questions" className="text-blue-800 dark:text-blue-200 hover:text-blue-600 dark:hover:text-blue-400 text-sm">
                  Questions
                </Link>
              </li>
              <li>
                <Link to="/colleges" className="text-blue-800 dark:text-blue-200 hover:text-blue-600 dark:hover:text-blue-400 text-sm">
                  Colleges
                </Link>
              </li>
              <li>
                <Link to="/my-hub" className="text-blue-800 dark:text-blue-200 hover:text-blue-600 dark:hover:text-blue-400 text-sm">
                  My Hub
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">About</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-blue-800 dark:text-blue-200 hover:text-blue-600 dark:hover:text-blue-400 text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/activity" className="text-blue-800 dark:text-blue-200 hover:text-blue-600 dark:hover:text-blue-400 text-sm">
                  Activity
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-blue-100 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              © {currentYear} Campus Connect. All rights reserved.
            </p>
            <motion.p 
              className="text-blue-800 dark:text-blue-200 text-sm flex items-center"
              whileHover={{ scale: 1.05 }}
            >
              Made with <Heart className="h-4 w-4 mx-1 text-red-500" /> by Campus Connect Team
            </motion.p>
          </div>
        </div>
      </div>
    </footer>
  );
} 