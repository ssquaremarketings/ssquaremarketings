export function AboutSection() {
  return (
    <section id="about" className="section-gap bg-white">
      <div className="container-shell grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="overflow-hidden rounded-[2rem] shadow-soft">
          <img
            src="/about.png"
            alt="Real estate team discussing land development"
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-amber-500">About Us</p>
          <h2 className="text-3xl font-bold text-primary sm:text-4xl">Trusted by 1000+ Customers</h2>
          <p className="mt-5 text-slate-600">
            S-Square Marketings delivers trusted real-estate solutions with transparent dealings, legally verified properties, and customer-focused service across Proddatur and surrounding growth regions. We specialize in open plots, residential houses, agriculture lands, and premium ventures designed to match investment goals, future growth, and secure property ownership.

          </p>
          <div className="mt-8 flex justify-center">
            <article className="w-full max-w-xs rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center shadow-sm">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
                N
              </div>
              <h3 className="font-semibold text-slate-900">Narasimha Somu</h3>
              <p className="mt-1 text-sm text-slate-500">Founder</p>
            </article>
          </div>
        </div>
      </div>
    </section>
  )
}
