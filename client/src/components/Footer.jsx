import { Link } from 'react-router-dom';
import { Video, Twitter, Github, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gold/20 border border-gold/30 flex items-center justify-center">
                <Video size={18} className="text-gold" />
              </div>
              <span className="font-display text-xl font-bold text-shimmer">Velora Meet</span>
            </div>
            <p className="text-white/30 text-sm leading-relaxed max-w-xs">
              Crystal-clear video conferencing powered by WebRTC. Built for teams that move fast.
            </p>
            <div className="flex gap-4 mt-6">
              {[Twitter, Github, Linkedin].map((Icon, i) => (
                <a key={i} href="#"
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 hover:border-gold/30 hover:text-gold flex items-center justify-center text-white/30 transition-all">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            {
              title: 'Product',
              links: ['Features', 'Pricing', 'Changelog', 'Roadmap'],
            },
            {
              title: 'Company',
              links: ['About', 'Blog', 'Careers', 'Contact'],
            },
          ].map(col => (
            <div key={col.title}>
              <h4 className="text-xs font-mono uppercase tracking-widest text-white/30 mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map(l => (
                  <li key={l}>
                    <a href="#" className="text-sm text-white/40 hover:text-white transition-colors">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/20 text-xs">© 2024 Velora Meet. Built with WebRTC & ❤️</p>
          <div className="flex gap-6">
            {['Privacy', 'Terms', 'Security'].map(l => (
              <a key={l} href="#" className="text-white/20 text-xs hover:text-white/40 transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
