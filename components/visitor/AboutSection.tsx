export function AboutSection() {
  return (
    <section id="about" className="section-gap bg-white">
      <div className="container-shell grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="overflow-hidden rounded-[2rem] shadow-soft">
          <img
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1400&q=80"
            alt="Real estate team discussing land development"
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-amber-500">About Us</p>
          <h2 className="text-3xl font-bold text-primary sm:text-4xl">Trusted by 1000+ Customers</h2>
          <p className="mt-5 text-slate-600">
            Sree Infra Developers builds transparent open-plot opportunities with legally clear documentation, practical
            locations, and customer-first support across Proddatur and nearby growth corridors.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ['Ramesh Kumar', 'Founder'],
              ['Lakshmi Devi', 'Director'],
              ['Suresh Reddy', 'Director']
            ].map(([name, role]) => (
              <article key={name} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center shadow-sm">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
                  {name.charAt(0)}
                </div>
                <h3 className="font-semibold text-slate-900">{name}</h3>
                <p className="mt-1 text-sm text-slate-500">{role}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
