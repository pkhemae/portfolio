import React from 'react';
import { FaLinkedin, FaTwitter } from 'react-icons/fa';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white py-12">
      <div className="container mx-auto text-center">
        <p>Copyright &copy; {currentYear} Khémara Parc</p>
        <div className="flex justify-center space-x-4 mt-2">
          <a href="https://www.linkedin.com/in/khemaraparc" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 hover:cursor-pointer">
            <FaLinkedin size={24} />
          </a>
          <a href="https://www.twitter.com/pkhemae" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 hover:cursor-pointer">
            <FaTwitter size={24} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
