import Link from 'next/link'

function InstagramIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  )
}

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-400 py-12 mt-20">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <p className="text-white font-light text-xl tracking-widest uppercase mb-3">iiknala</p>
          <p className="text-sm leading-relaxed mb-6">
            Un lugar de paz, un espacio de energía.<br />
            Yoga · Wellness · Drills®
          </p>
          <div className="flex gap-3">
            <a
              href="https://www.instagram.com/iiknala/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-stone-800 hover:bg-[#4a6741] text-stone-400 hover:text-white rounded-xl flex items-center justify-center transition-colors"
              aria-label="Instagram"
            >
              <InstagramIcon />
            </a>
            <a
              href="https://www.facebook.com/iiknala/?locale=es_LA"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-stone-800 hover:bg-[#4a6741] text-stone-400 hover:text-white rounded-xl flex items-center justify-center transition-colors"
              aria-label="Facebook"
            >
              <FacebookIcon />
            </a>
          </div>
        </div>
        <div>
          <h4 className="text-white font-medium mb-3 tracking-wide">Navegación</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/clases" className="hover:text-white transition-colors">Clases</Link></li>
            <li><Link href="/formacion" className="hover:text-white transition-colors">Formación 200H</Link></li>
            <li><Link href="/auth/login" className="hover:text-white transition-colors">Mi cuenta</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-medium mb-3 tracking-wide">Contacto</h4>
          <ul className="space-y-2 text-sm">
            <li>iiknalayoga@gmail.com</li>
            <li>
              <a href="https://www.instagram.com/iiknala/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                @iiknala en Instagram
              </a>
            </li>
            <li>
              <a href="https://www.facebook.com/iiknala/?locale=es_LA" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                iiknala en Facebook
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 mt-10 border-t border-stone-800 pt-6 text-xs text-center">
        © {new Date().getFullYear()} iiknala. Todos los derechos reservados.
      </div>
    </footer>
  )
}
