import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Twitter, Linkedin, Github, ExternalLink, Shield } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Contact Information */}
      <div className="container-max section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Lab Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Dr. Doe's Laboratory</h3>
            <p className="text-gray-300 mb-4 text-sm leading-relaxed">
              Advancing scientific knowledge through innovative research and collaboration.
              Committed to excellence in discovery and education.
            </p>
            <div className="flex space-x-4">
              <a href="https://twitter.com" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="https://github.com" className="text-gray-400 hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/research" className="text-gray-300 hover:text-white transition-colors text-sm">Research</Link></li>
              <li><Link to="/publications" className="text-gray-300 hover:text-white transition-colors text-sm">Publications</Link></li>
              <li><Link to="/team" className="text-gray-300 hover:text-white transition-colors text-sm">Team</Link></li>
              <li><Link to="/resources" className="text-gray-300 hover:text-white transition-colors text-sm">Resources</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-white transition-colors text-sm">Contact</Link></li>
              <li>
                <Link to="/admin" className="text-gray-300 hover:text-white transition-colors text-sm flex items-center">
                  Admin Dashboard <Shield className="h-3 w-3 ml-1" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm flex items-center">
                  Research Protocols <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm flex items-center">
                  Software Tools <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm flex items-center">
                  Datasets <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm flex items-center">
                  Lab Manual <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                <div className="text-sm text-gray-300">
                  <p>University Science Building</p>
                  <p>Room 301, 123 Research Drive</p>
                  <p>Academic City, ST 12345</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-300">(555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-300">contact@droelab.edu</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Dr. Doe's Laboratory. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;