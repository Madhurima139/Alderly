import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Pill, CalendarCheck, BellRing, Stethoscope, HeartHandshake, FlaskConical, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

const ICONS = { Pill, CalendarCheck, BellRing, Stethoscope, HeartHandshake, FlaskConical };

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/services")
      .then((r) => setServices(r.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-14" data-testid="services-page">
      <p className="text-base uppercase tracking-widest text-secondary font-semibold mb-3">Book a Service</p>
      <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">Choose the care you need</h1>
      <p className="text-xl text-muted-foreground mb-12 max-w-2xl leading-relaxed">
        Every service is handled by verified, trained professionals in Gorakhpur. Members get
        priority booking and member rates.
      </p>

      {loading ? (
        <p className="text-lg" data-testid="services-loading">Loading services…</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((s) => {
            const Icon = ICONS[s.icon] || HeartHandshake;
            return (
              <div
                key={s.slug}
                data-testid={`service-card-${s.slug}`}
                className="bg-white rounded-3xl p-8 border border-[#E2E8DE] shadow-sm hover:shadow-md transition-shadow flex gap-6"
              >
                <span className="inline-flex bg-accent rounded-2xl p-4 h-fit shrink-0">
                  <Icon size={30} strokeWidth={1.5} className="text-primary" />
                </span>
                <div>
                  <h2 className="text-2xl font-medium mb-2">{s.name}</h2>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-3">{s.description}</p>
                  <p className="text-base font-semibold text-primary mb-5">{s.price_label}</p>
                  <Link to={`/book/${s.slug}`} data-testid={`services-book-${s.slug}-button`}>
                    <Button className="rounded-full h-12 px-6 text-base bg-secondary hover:bg-secondary/90 text-white">
                      Book Now <ArrowRight className="ml-2" size={18} />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Services;
