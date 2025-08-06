import React from 'react';

const Footer = () => {
  return (
    <footer className="mt-8 pt-4 border-t border-gray-700 text-center text-sm text-gray-500">
      <p>© 2025 Gartic. All rights reserved.</p>
      <div className="mt-2 space-x-4">
        <a href="#" className="hover:text-white transition-colors">TERMS OF SERVICE</a>
        <a href="#" className="hover:text-white transition-colors">PRIVACY</a>
        <a href="#" className="hover:text-white transition-colors">BLOG</a>
      </div>
    </footer>
  );
};

export default Footer;
