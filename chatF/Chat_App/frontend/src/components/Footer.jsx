// Refactorización de Footer.jsx para diseño moderno y responsivo

import React from "react";
import { FaPenAlt } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-50 text-slate-700 py-10 mt-10 border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        <div>
          <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
            ARCODE <FaPenAlt size={14} />
          </h4>
          <p className="text-sm">San Pedro de las Colonias</p>
          <p className="text-sm">Torreon, Coahuila</p>
          <p className="text-sm">México - 27018</p>
          <a
            href="mailto:arcode907@gmail.com"
            className="text-indigo-600 hover:underline text-sm"
          >
            arcode907@gmail.com
          </a>
        </div>

        <div>
          <h4 className="font-semibold text-lg mb-3">Pages</h4>
          <ul className="space-y-1 text-sm">
            <li><Link to="/" className="hover:underline text-indigo-600">Home</Link></li>
            <li><Link to="/home" className="hover:underline text-indigo-600">Dashboard</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-lg mb-3">Links</h4>
          <ul className="space-y-1 text-sm">
            <li>
              <a href="https://www.linkedin.com/in/carlosr-rocha/" target="_blank" rel="noreferrer" className="hover:underline text-indigo-600">LinkedIn</a>
            </li>
            <li>
              <a href="https://github.com/RobertoRochaT" target="_blank" rel="noreferrer" className="hover:underline text-indigo-600">GitHub</a>
            </li>
            <li>
              <a href="https://www.instagram.com/arcode2025/" target="_blank" rel="noreferrer" className="hover:underline text-indigo-600">Instagram</a>
            </li>
            <li>
              <a href="mailto:arcode907@gmail.com" target="_blank" rel="noreferrer" className="hover:underline text-indigo-600">E-Mail</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="text-center text-sm mt-10 text-gray-500">
        © 2024 ARCODE. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
