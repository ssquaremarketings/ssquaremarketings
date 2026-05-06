export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-primary text-white">
      <div className="container-shell grid gap-8 py-12 md:grid-cols-3">
        <div className="flex flex-col items-start">
          <img src="/branding.png" alt="S-Square Marketings Logo" className="h-10 w-auto mb-3" loading="lazy" />
          <p className="mt-3 text-sm text-slate-200">Premium open plots for secure and smart land investment.</p>
        </div>
        <div>
          <h3 className="text-lg font-bold text-amber-300">Quick Links</h3>
          <ul className="mt-3 grid gap-2 text-sm text-slate-200">
            <li><a href="#about">About</a></li>
            <li><a href="#projects">Projects</a></li>
            <li><a href="#values">Values</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-bold text-amber-300">Contact Info</h3>
          <ul className="mt-3 grid gap-2 text-sm text-slate-200">
            <li>+91-XXXXXXXXXX</li>
            <li>info@sreeinfra.com</li>
            <li>Proddatur, Andhra Pradesh</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-sm text-slate-200 flex flex-col items-center gap-1">
        <span>&copy; 2026 S-Square Marketings. All rights reserved.</span>
        <a
          href="https://instagram.com/sai_chandhan"
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-300 hover:underline hover:text-amber-400 transition"
        >
          Made by sai_chandhan
        </a>
      </div>
    </footer>
  )
}
