import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import api, { formatApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const BookService = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [service, setService] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    elder_name: "",
    phone: "",
    address: "",
    date: "",
    time: "",
    notes: "",
  });

  useEffect(() => {
    if (user === false) {
      navigate("/login", { state: { from: `/book/${slug}` } });
    }
  }, [user, navigate, slug]);

  useEffect(() => {
    api.get("/services").then((r) => {
      const found = r.data.find((s) => s.slug === slug);
      setService(found || null);
    });
  }, [slug]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/bookings", {
        ...form,
        service_slug: service.slug,
        service_name: service.name,
      });
      toast.success("Booking confirmed! Our care team will call you to verify details.");
      navigate("/dashboard");
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (!service) {
    return <div className="max-w-3xl mx-auto px-4 py-20 text-lg" data-testid="booking-loading">Loading…</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-14" data-testid="book-service-page">
      <p className="text-base uppercase tracking-widest text-secondary font-semibold mb-3">Book a Service</p>
      <h1 className="text-4xl font-bold tracking-tight mb-3" data-testid="booking-service-title">{service.name}</h1>
      <p className="text-lg text-muted-foreground mb-10 leading-relaxed">{service.description}</p>

      <form
        onSubmit={submit}
        className="bg-white rounded-3xl border border-[#E2E8DE] p-8 sm:p-10 shadow-sm space-y-7"
        data-testid="booking-form"
      >
        <div>
          <Label htmlFor="elder_name" className="text-lg mb-2 block">Name of the elder</Label>
          <Input id="elder_name" data-testid="booking-elder-name-input" required placeholder="e.g. Smt. Kamla Devi"
            className="h-14 text-lg rounded-xl" value={form.elder_name} onChange={set("elder_name")} />
        </div>
        <div>
          <Label htmlFor="phone" className="text-lg mb-2 block">Contact phone number</Label>
          <Input id="phone" data-testid="booking-phone-input" required placeholder="e.g. 94150 12345"
            className="h-14 text-lg rounded-xl" value={form.phone} onChange={set("phone")} />
        </div>
        <div>
          <Label htmlFor="address" className="text-lg mb-2 block">Address in Gorakhpur</Label>
          <Textarea id="address" data-testid="booking-address-input" required placeholder="House number, street, area, landmark"
            className="text-lg rounded-xl min-h-[100px]" value={form.address} onChange={set("address")} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="date" className="text-lg mb-2 block">Preferred date</Label>
            <Input id="date" type="date" data-testid="booking-date-input" required
              className="h-14 text-lg rounded-xl" value={form.date} onChange={set("date")} />
          </div>
          <div>
            <Label htmlFor="time" className="text-lg mb-2 block">Preferred time</Label>
            <Input id="time" type="time" data-testid="booking-time-input" required
              className="h-14 text-lg rounded-xl" value={form.time} onChange={set("time")} />
          </div>
        </div>
        <div>
          <Label htmlFor="notes" className="text-lg mb-2 block">Anything we should know? (optional)</Label>
          <Textarea id="notes" data-testid="booking-notes-input" placeholder="Prescription details, health conditions, special requests"
            className="text-lg rounded-xl min-h-[90px]" value={form.notes} onChange={set("notes")} />
        </div>
        <Button
          type="submit"
          data-testid="booking-submit-button"
          disabled={submitting}
          className="rounded-full h-14 px-10 text-lg font-semibold bg-secondary hover:bg-secondary/90 text-white w-full sm:w-auto"
        >
          {submitting ? "Confirming…" : `Confirm ${service.name} Booking`}
        </Button>
      </form>
    </div>
  );
};

export default BookService;
