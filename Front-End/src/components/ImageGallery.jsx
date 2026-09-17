import { useState, useRef } from "react";

const fallbackImage = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=900";

// images: string[] — pehli image hamesha cover/primary hoti hai
const ImageGallery = ({ images = [], alt }) => {
  const list = images.length ? images : [fallbackImage];
  const [active, setActive] = useState(0);
  const [zoomStyle, setZoomStyle] = useState({ display: "none" });
  const containerRef = useRef(null);

  const handleMouseMove = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomStyle({
      display: "block",
      backgroundImage: `url(${list[active]})`,
      backgroundPosition: `${x}% ${y}%`,
    });
  };

  const handleMouseLeave = () => setZoomStyle({ display: "none" });

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative overflow-hidden rounded-[2rem] bg-slate-50 dark:bg-slate-950 cursor-zoom-in group"
      >
        <img
          src={list[active]}
          alt={alt}
          onError={(e) => { e.target.src = fallbackImage; }}
          className="w-full h-[360px] md:h-[480px] object-contain p-3"
        />
        {/* Desktop hover-zoom lens — pointer:fine screens (mouse) only, avoids weirdness on touch */}
        <div
          className="hidden md:block absolute inset-0 pointer-events-none bg-no-repeat opacity-0 group-hover:opacity-100 transition-opacity duration-150"
          style={{
            ...zoomStyle,
            backgroundSize: "220%",
          }}
        />
        <span className="absolute bottom-3 right-3 text-[11px] font-semibold bg-black/60 text-white px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
          Hover to zoom
        </span>
      </div>

      {list.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {list.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActive(idx)}
              className={`shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border-2 transition-colors ${
                active === idx
                  ? "border-blue-600"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600"
              }`}
            >
              <img
                src={img}
                alt={`${alt} thumbnail ${idx + 1}`}
                onError={(e) => { e.target.src = fallbackImage; }}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
