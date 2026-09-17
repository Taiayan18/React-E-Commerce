const About = () => (
  <section className="max-w-7xl mx-auto px-4 py-12">
    <div className="grid lg:grid-cols-2 gap-10 items-center">
      <div>
        <p className="text-blue-600 font-bold">About Us</p>
        <h1 className="text-4xl md:text-5xl font-black mt-2">
          India's modern online shopping experience.
        </h1>
        <p className="text-slate-600 dark:text-slate-300 mt-5 text-lg">
          Zenvy is a responsive e-commerce frontend where users can explore
          products, filter categories, view deals, add products to cart and
          enjoy a clean shopping UI.
        </p>
        <div className="grid sm:grid-cols-3 gap-4 mt-8">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <b className="text-2xl">12+</b>
            <p>Products</p>
          </div>
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <b className="text-2xl">7+</b>
            <p>Categories</p>
          </div>
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <b className="text-2xl">100%</b>
            <p>Responsive</p>
          </div>
        </div>
      </div>
      <img
        className="rounded-[2rem] shadow-soft"
        src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200"
      />
    </div>
  </section>
);
export default About;
