import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Pill, CalendarCheck, BellRing, Stethoscope, HeartHandshake, FlaskConical,
  ArrowRight, ShieldCheck, PhoneCall, ClipboardList, CheckCircle2, Quote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const ICONS = { Pill, CalendarCheck, BellRing, Stethoscope, HeartHandshake, FlaskConical };

const HERO_IMG =
  "https://images.unsplash.com/photo-1762955911431-4c44c7c3f408?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzB8MHwxfHNlYXJjaHwxfHxudXJzZSUyMGhlbHBpbmclMjBlbGRlcmx5fGVufDB8fHx8MTc4NzIwNTk4Nnww&ixlib=rb-4.1.0&q=85";
const TESTIMONIAL_IMG =
  "https://images.pexels.com/photos/5637572/pexels-photo-5637572.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";

const STEPS = [
  { icon: PhoneCall, title: "Tell us what you need", text: "Call us or book online in a few clicks. No complicated forms." },
  { icon: ClipboardList, title: "We arrange everything", text: "A dedicated care coordinator confirms and assigns verified staff." },
  { icon: CheckCircle2, title: "Care arrives at home", text: "Medicines, nurses or caretakers reach your doorstep on time." },
];

const Landing = () => {
  const { user } = useAuth();
  const [services, setServices] = useState([]);

  useEffect(() => {
    api.get("/services").then((r) => setServices(r.data)).catch(() => {});
  }, []);

  return (
    <div data-testid="landing-page">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 pt-14 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="animate-fade-up">
          <p className="text-base uppercase tracking-widest text-secondary font-semibold mb-4">
            Elder care, made for Gorakhpur
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6">
            Care for your parents, just a few clicks away
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed mb-8 max-w-xl">
            Medicine delivery, hospital appointments, trained nurses, caretakers and gentle
            follow-up reminders — everything your loved ones need, in one place.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to={user ? "/services" : "/signup"} data-testid="hero-get-started-button">
              <Button className="rounded-full h-14 px-8 text-lg font-semibold bg-secondary hover:bg-secondary/90 text-white">
                {user ? "Book a Service" : "Get Started"} <ArrowRight className="ml-2" size={22} />
              </Button>
            </Link>
            <Link to="/plans" data-testid="hero-view-plans-button">
              <Button variant="outline" className="rounded-full h-14 px-8 text-lg font-semibold border-2">
                View Care Plans
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-2 mt-8 text-muted-foreground">
            <ShieldCheck size={22} className="text-primary" />
            <span className="text-base">Verified nurses & caretakers · Serving all of Gorakhpur</span>
          </div>
        </div>
        <div className="animate-fade-up" style={{ animationDelay: "0.15s" }}>
          <img
            src={HERO_IMG}
            alt="Caregiver assisting an elderly couple"
            data-testid="hero-image"
            className="rounded-3xl shadow-lg shadow-primary/10 w-full object-cover aspect-[4/3]"
          />
        </div>
      </section>

      {/* Services */}
      <section className="bg-white border-y border-[#E2E8DE] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <p className="text-base uppercase tracking-widest text-secondary font-semibold mb-3">What we do</p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-12">
            Every care service your family needs
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((s, i) => {
              const Icon = ICONS[s.icon] || HeartHandshake;
              return (
                <div
                  key={s.slug}
                  data-testid={`service-card-${s.slug}`}
                  className="bg-card rounded-3xl p-8 border border-[#E2E8DE] shadow-sm hover:shadow-md transition-shadow animate-fade-up"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <span className="inline-flex bg-accent rounded-2xl p-3.5 mb-5">
                    <Icon size={28} strokeWidth={1.5} className="text-primary" />
                  </span>
                  <h3 className="text-2xl font-medium mb-3">{s.name}</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-5">{s.short}</p>
                  <p className="text-base font-semibold text-primary mb-6">{s.price_label}</p>
                  <Link to={`/book/${s.slug}`} data-testid={`book-service-${s.slug}-button`}>
                    <Button variant="outline" className="rounded-full h-12 px-6 text-base border-2">
                      Book this Service <ArrowRight className="ml-2" size={18} />
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-20">
        <p className="text-base uppercase tracking-widest text-secondary font-semibold mb-3">Simple by design</p>
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-12">How Alderly works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((step, i) => (
            <div key={step.title} className="rounded-3xl p-8 bg-accent/50 border border-[#E2E8DE]">
              <span className="inline-flex bg-white rounded-2xl p-3.5 mb-5 shadow-sm">
                <step.icon size={28} strokeWidth={1.5} className="text-secondary" />
              </span>
              <p className="text-base font-semibold text-secondary mb-1">Step {i + 1}</p>
              <h3 className="text-2xl font-medium mb-3">{step.title}</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonial */}
      <section className="bg-white border-y border-[#E2E8DE] py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <img
            src={TESTIMONIAL_IMG}
            alt="Happy senior couple"
            data-testid="testimonial-image"
            className="rounded-3xl shadow-lg shadow-primary/10 w-full object-cover aspect-[4/3]"
          />
          <div>
            <Quote size={40} className="text-secondary mb-6" strokeWidth={1.5} />
            <blockquote className="text-2xl leading-relaxed font-medium text-primary mb-6">
              “I live in Delhi and my parents are in Gorakhpur. Alderly delivers their medicines,
              takes my father for his checkups, and calls me after every visit. It feels like
              family is there.”
            </blockquote>
            <p className="text-lg font-semibold">Ramesh Gupta</p>
            <p className="text-base text-muted-foreground">Son of Alderly members, Golghar</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-20">
        <div className="rounded-3xl bg-primary text-white p-10 sm:p-16 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div>
            <h2 className="text-white text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
              One membership. Complete peace of mind.
            </h2>
            <p className="text-white/85 text-lg max-w-2xl leading-relaxed">
              All Alderly services are included in our care plans — monthly, six-monthly or
              annual. Choose what suits your family.
            </p>
          </div>
          <Link to="/plans" data-testid="cta-view-plans-button">
            <Button className="rounded-full h-14 px-8 text-lg font-semibold bg-secondary hover:bg-secondary/90 text-white whitespace-nowrap">
              See Care Plans <ArrowRight className="ml-2" size={22} />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Landing;
