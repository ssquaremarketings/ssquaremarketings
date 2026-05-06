export function ValuesSection() {
  const values = [
    ['Best Interest Rates', 'Investment options planned for long-term growth and strong utility.'],
    ['Stable Pricing', 'Transparent rates designed to avoid hidden cost surprises.'],
    ['Best Market Prices', 'Well-located projects priced for strong regional value.'],
    ['Data Security', 'Customer details are handled with privacy-conscious practices.']
  ]

  return (
    <section id="values" className="section-gap bg-white">
      <div className="container-shell">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-500">Why Choose Us</p>
          <h2 className="mt-3 text-3xl font-bold text-primary sm:text-4xl">Value We Give To You</h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {values.map(([title, description]) => (
            <article key={title} className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-primary">{title}</h3>
              <p className="mt-2 text-slate-600">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
