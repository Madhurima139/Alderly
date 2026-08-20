import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { BellRing, CalendarCheck, Crown, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api, { formatApiError } from "@/lib/api";

const fmtDate = (iso) => {
  try {
    return format(parseISO(iso), "d MMM yyyy");
  } catch {
    return iso;
  }
};

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [reminder, setReminder] = useState({ title: "", date: "", time: "", notes: "" });
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () => api.get("/dashboard").then((r) => setData(r.data));
  useEffect(() => {
    load().catch((e) => toast.error(formatApiError(e)));
  }, []);

  const addReminder = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/reminders", reminder);
      toast.success("Reminder added. Our team will call at the scheduled time.");
      setReminder({ title: "", date: "", time: "", notes: "" });
      setAdding(false);
      load();
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setSaving(false);
    }
  };

  if (!data) {
    return <div className="max-w-6xl mx-auto px-4 py-20 text-lg" data-testid="dashboard-loading">Loading your dashboard…</div>;
  }

  const { user, subscription, bookings, reminders } = data;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-14" data-testid="dashboard-page">
      <h1 className="text-4xl font-bold tracking-tight mb-2" data-testid="dashboard-greeting">
        Namaste, {user.name.split(" ")[0]}
      </h1>
      <p className="text-lg text-muted-foreground mb-10">Here is everything happening with your family's care.</p>

      {/* Subscription */}
      <section className="mb-10" data-testid="dashboard-subscription-section">
        {subscription ? (
          <div className="rounded-3xl bg-primary text-white p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <span className="bg-white/10 rounded-2xl p-3"><Crown size={28} /></span>
              <div>
                <h2 className="text-white text-2xl font-semibold" data-testid="active-plan-name">{subscription.plan_name}</h2>
                <p className="text-white/80 text-base" data-testid="active-plan-expiry">
                  Active until {fmtDate(subscription.expires_at)}
                </p>
              </div>
            </div>
            <Link to="/plans" data-testid="change-plan-button">
              <Button variant="outline" className="rounded-full h-12 px-6 text-base border-white/40 text-white bg-transparent hover:bg-white/10">
                Change Plan
              </Button>
            </Link>
          </div>
        ) : (
          <div className="rounded-3xl bg-white border-2 border-dashed border-[#E2E8DE] p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-semibold mb-1">No active membership yet</h2>
              <p className="text-lg text-muted-foreground">Become a member to unlock all services at the best rates.</p>
            </div>
            <Link to="/plans" data-testid="dashboard-view-plans-button">
              <Button className="rounded-full h-14 px-8 text-lg font-semibold bg-secondary hover:bg-secondary/90 text-white">
                View Care Plans
              </Button>
            </Link>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Bookings */}
        <section className="bg-white rounded-3xl border border-[#E2E8DE] p-8" data-testid="dashboard-bookings-section">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <CalendarCheck size={26} className="text-secondary" /> Upcoming Bookings
            </h2>
            <Link to="/services" data-testid="dashboard-book-service-link">
              <Button variant="outline" className="rounded-full h-11 px-5 text-base border-2">Book</Button>
            </Link>
          </div>
          {bookings.length === 0 ? (
            <p className="text-lg text-muted-foreground" data-testid="no-bookings-message">
              No bookings yet. Book a service and it will appear here.
            </p>
          ) : (
            <ul className="space-y-4">
              {bookings.map((b) => (
                <li key={b.id} className="rounded-2xl bg-accent/40 p-5" data-testid={`booking-item-${b.id}`}>
                  <p className="text-lg font-semibold">{b.service_name}</p>
                  <p className="text-base text-muted-foreground">
                    For {b.elder_name} · {fmtDate(b.date)} at {b.time}
                  </p>
                  <span className="inline-block mt-2 text-sm font-semibold uppercase tracking-wide text-primary bg-white rounded-full px-3 py-1">
                    {b.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Reminders */}
        <section className="bg-white rounded-3xl border border-[#E2E8DE] p-8" data-testid="dashboard-reminders-section">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <BellRing size={26} className="text-secondary" /> Follow-up Reminders
            </h2>
            <Button
              variant="outline"
              className="rounded-full h-11 px-5 text-base border-2"
              data-testid="add-reminder-button"
              onClick={() => setAdding(!adding)}
            >
              <Plus size={18} className="mr-1" /> Add
            </Button>
          </div>

          {adding && (
            <form onSubmit={addReminder} className="rounded-2xl bg-accent/40 p-5 mb-6 space-y-4" data-testid="reminder-form">
              <div>
                <Label htmlFor="r-title" className="text-base mb-1 block">What should we remind?</Label>
                <Input id="r-title" data-testid="reminder-title-input" required placeholder="e.g. BP medicine after dinner"
                  className="h-12 text-base rounded-xl bg-white" value={reminder.title}
                  onChange={(e) => setReminder({ ...reminder, title: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="r-date" className="text-base mb-1 block">Date</Label>
                  <Input id="r-date" type="date" data-testid="reminder-date-input" required
                    className="h-12 text-base rounded-xl bg-white" value={reminder.date}
                    onChange={(e) => setReminder({ ...reminder, date: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="r-time" className="text-base mb-1 block">Time</Label>
                  <Input id="r-time" type="time" data-testid="reminder-time-input" required
                    className="h-12 text-base rounded-xl bg-white" value={reminder.time}
                    onChange={(e) => setReminder({ ...reminder, time: e.target.value })} />
                </div>
              </div>
              <Button type="submit" data-testid="reminder-submit-button" disabled={saving}
                className="rounded-full h-12 px-6 text-base bg-secondary hover:bg-secondary/90 text-white">
                {saving ? "Saving…" : "Save Reminder"}
              </Button>
            </form>
          )}

          {reminders.length === 0 ? (
            <p className="text-lg text-muted-foreground" data-testid="no-reminders-message">
              No reminders yet. Add one and our care team will call to remind.
            </p>
          ) : (
            <ul className="space-y-4">
              {reminders.map((r) => (
                <li key={r.id} className="rounded-2xl bg-accent/40 p-5" data-testid={`reminder-item-${r.id}`}>
                  <p className="text-lg font-semibold">{r.title}</p>
                  <p className="text-base text-muted-foreground">{fmtDate(r.date)} at {r.time}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
