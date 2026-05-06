import Image from 'next/image'

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-primary text-white">
      <div className="container-shell grid gap-8 py-12 md:grid-cols-3">
        <div className="flex flex-col items-start">
          <Image src="/branding.png" alt="S-Square Marketings Logo" width={160} height={40} className="h-10 w-auto mb-3" />
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
            <li>{process.env.NEXT_PUBLIC_CONTACT_PHONE ?? '+91-XXXXXXXXXX'}</li>
            <li>ssquremarketing@gmail.com</li>
            <li>Municipal park road, 22/217, Gandhi Rd, opp. Rotary EYE Hospital, beside SBI Main branch, Rameswaram, Proddatur, Andhra Pradesh 516360</li>
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
