const SectionTitle = ({ small, title, text }) => (
  <div className="text-center max-w-2xl mx-auto mb-10">
    <p className="text-blue-600 font-bold uppercase tracking-widest text-sm">
      {small}
    </p>
    <h2 className="text-3xl md:text-5xl font-black mt-2">{title}</h2>
    <p className="text-slate-500 dark:text-slate-400 mt-4">{text}</p>
  </div>
);
export default SectionTitle;
