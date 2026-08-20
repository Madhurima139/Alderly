import { HeartPulse, Phone, Mail, MapPin } from "lucide-react";

const Footer = () => (
  <footer className="bg-primary text-white mt-24" data-testid="footer">
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-14 grid grid-cols-1 md:grid-cols-3 gap-10">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className="bg-white/10 rounded-2xl p-2.5">
            <HeartPulse size={24} strokeWidth={1.8} />
          </span>
          <span className="font-heading font-bold text-2xl">Alderly</span>
        </div>
        <p className="text-white/80 text-base leading-relaxed">
          Complete elder care for Gorakhpur — medicines, appointments, nurses, caretakers and
          reminders, all in one place.
        </p>
      </div>
      <div>
        <h3 className="text-white text-xl font-semibold mb-4">Talk to our Care Team</h3>
        <ul className="space-y-3 text-white/80 text-base">
          <li className="flex items-center gap-3">
            <Phone size={20} /> <span data-testid="footer-phone">+91 90000 12345</span>
          </li>
          <li className="flex items-center gap-3">
            <Mail size={20} /> <span data-testid="footer-email">care@alderly.in</span>
          </li>
          <li className="flex items-center gap-3">
            <MapPin size={20} /> <span>Golghar, Gorakhpur, Uttar Pradesh</span>
          </li>
        </ul>
      </div>
      <div>
        <h3 className="text-white text-xl font-semibold mb-4">Our Promise</h3>
        <p className="text-white/80 text-base leading-relaxed">
          Every caretaker and nurse is background-verified and trained. Your parents are cared
          for like our own family.
        </p>
      </div>
    </div>
    <div className="border-t border-white/15 py-5 text-center text-white/70 text-sm">
      © {new Date().getFullYear()} Alderly. Made with care in Gorakhpur.
    </div>
  </footer>
);

export default Footer;
