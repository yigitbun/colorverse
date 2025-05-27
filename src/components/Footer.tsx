
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 font-mono">ColorVerse</h3>
            <p className="text-gray-600 font-mono text-sm">
              The universe of colors at your fingertips. Create, explore, and apply beautiful color palettes.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 font-mono">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/explore" className="text-gray-600 hover:text-gray-900 font-mono">
                  Browse Palettes
                </Link>
              </li>
              <li>
                <Link to="/community" className="text-gray-600 hover:text-gray-900 font-mono">
                  Community
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-600 hover:text-gray-900 font-mono">
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Tools */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 font-mono">Tools</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 font-mono">
                  Palette Generator
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 font-mono">
                  Color Picker
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 font-mono">
                  Export Tools
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 font-mono">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-gray-900 font-mono">
                  Contact
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 font-mono">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 font-mono">
                  API
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm font-mono">
            © 2025 ColorVerse. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <a href="#" className="text-gray-600 hover:text-gray-900 text-sm font-mono">
              Privacy
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 text-sm font-mono">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
