import {
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaLinkedin,
  FaPhone,
  FaMailBulk,
} from "react-icons/fa";
import { FaMapPin } from "react-icons/fa6";
const Footer = () => (
  <footer className="bg-slate-950 text-white mt-16">
    <div className="max-w-7xl mx-auto px-4 py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
      <div>
        <h2 className="text-2xl font-black">Zenvy</h2>
        <p className="mt-3 text-slate-400">
          Modern responsive e-commerce store made with React and Tailwind CSS.
        </p>
        <div className="flex gap-3 mt-5">
          <FaFacebook />
          <FaInstagram />
          <FaTwitter />
        </div>
      </div>
      <div>
        <h3 className="font-bold mb-4">Quick Links</h3>
        <p className="text-slate-400 grid gap-2">
          <span>Products</span>
          <span>Deals</span>
          <span>Cart</span>
          <span>Admin</span>
        </p>
      </div>
      <div>
        <h3 className="font-bold mb-4">Categories</h3>
        <p className="text-slate-400 grid gap-2">
          <span>Mobiles</span>
          <span>Fashion</span>
          <span>Electronics</span>
          <span>Home</span>
        </p>
      </div>
      <div>
        <h3 className="font-bold mb-4">Contact</h3>
        <p className="text-slate-400 grid gap-3">
          <span className="flex gap-2">
            <FaPhone /> +91 98765 43210
          </span>
          <span className="flex gap-2">
            <FaMailBulk /> support@zenvy.com
          </span>
          <span className="flex gap-2">
            <FaMapPin /> India
          </span>
        </p>
      </div>
    </div>
    <div className="border-t border-slate-800 py-4 text-center text-slate-500 text-sm">
      © 2026 Zenvy Shop. All rights reserved.
    </div>
  </footer>
);
export default Footer;
