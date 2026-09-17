import { useState } from "react";

// Apna business WhatsApp number yahan daalo (country code ke saath, bina + ya spaces ke)
// e.g. India ka number 98765 43210 hoga to WHATSAPP_NUMBER = "919876543210"
const WHATSAPP_NUMBER = "919999999999";
const DEFAULT_MESSAGE = "Hi Zenvy team, mujhe kuch help chahiye.";

const WhatsAppButton = () => {
  const [hover, setHover] = useState(false);

  const link = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-[#25D366] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 pl-3 pr-3 py-3"
      style={{ paddingRight: hover ? "1.1rem" : "0.75rem" }}
      aria-label="Chat with us on WhatsApp"
    >
      <svg viewBox="0 0 32 32" className="w-7 h-7 shrink-0" fill="currentColor">
        <path d="M16.001 3C9.373 3 4 8.373 4 15c0 2.386.694 4.61 1.892 6.484L4 29l7.703-1.845A11.94 11.94 0 0016.001 27C22.628 27 28 21.627 28 15S22.628 3 16.001 3zm6.995 16.845c-.303.85-1.502 1.556-2.464 1.76-.655.14-1.51.25-4.386-.94-3.68-1.523-6.05-5.243-6.235-5.487-.178-.244-1.49-1.984-1.49-3.784 0-1.8.943-2.685 1.278-3.052.302-.33.657-.412.877-.412.219 0 .438.002.63.012.201.01.472-.076.738.564.303.727.99 2.512 1.077 2.696.086.184.145.4.03.645-.116.246-.174.4-.343.615-.17.216-.359.482-.512.647-.17.184-.348.383-.15.75.198.367.878 1.457 1.886 2.36 1.298 1.163 2.393 1.523 2.76 1.696.367.174.582.147.796-.088.213-.234.913-1.063 1.157-1.428.244-.365.487-.303.822-.184.335.117 2.126 1.004 2.49 1.187.365.184.608.276.7.428.09.153.09.884-.213 1.735z" />
      </svg>
      {hover && (
        <span className="text-sm font-bold whitespace-nowrap">Chat with us</span>
      )}
    </a>
  );
};

export default WhatsAppButton;
