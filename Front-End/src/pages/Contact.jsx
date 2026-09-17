const Contact = () => (
  <section className="max-w-7xl mx-auto px-4 py-12">
    <div className="grid lg:grid-cols-2 gap-8">
      <div>
        <h1 className="text-4xl font-black">Contact Us</h1>
        <p className="text-slate-500 mt-3">
          Have questions? Send us a message.
        </p>
        <div className="mt-8 grid gap-4">
          <p className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            Email: support@zenvy.com
          </p>
          <p className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            Phone: +91 98765 43210
          </p>
          <p className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            Location: India
          </p>
        </div>
      </div>
      <form className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-soft grid gap-4">
        <input
          className="px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
          placeholder="Name"
        />
        <input
          className="px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
          placeholder="Email"
        />
        <textarea
          rows="5"
          className="px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
          placeholder="Message"
        ></textarea>
        <button className="py-3 rounded-2xl bg-blue-600 text-white font-bold">
          Send Message
        </button>
      </form>
    </div>
  </section>
);
export default Contact;
