//frontend/src/components/Footer.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';

function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex space-x-4">
            <SocialLink href="https://www.facebook.com/profile.php?id=61564423130144" icon={<FaFacebookF />} />
            <SocialLink href="https://x.com/ELIMINATORCREW" icon={<FaTwitter />} />
            <SocialLink href="https://www.instagram.com/elimhub/" icon={<FaInstagram />} />
            <SocialLink href="https://www.youtube.com/@FootballEliminator" icon={<FaYoutube />} />
          </div>
          <nav className="flex flex-wrap justify-center space-x-4">
            <FooterLink to="/about">About</FooterLink>
            <FooterLink to="/contact">Contact</FooterLink>
            <FooterLink to="/privacy">Privacy Policy</FooterLink>
            <FooterLink to="/terms">Terms of Service</FooterLink>
          </nav>
          <div className="text-gray-600 text-sm">
            © 2024 Football Eliminator. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, icon }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-nfl-blue hover:text-nfl-gold transition-colors duration-200"
    >
      <span className="sr-only">{icon.type.name}</span>
      {React.cloneElement(icon, { className: "w-6 h-6" })}
    </a>
  );
}

function FooterLink({ to, children }) {
  return (
    <Link
      to={to}
      className="text-gray-600 hover:text-nfl-gold transition-colors duration-200"
    >
      {children}
    </Link>
  );
}

export default Footer;