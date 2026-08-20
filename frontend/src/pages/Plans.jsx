import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import api, { formatApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const Plans = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [selected, setSelected] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    api.get("/plans").then((r) => setPlans(r.data));
  }, []);

  const choosePlan = (plan) => {
    if (!user) {
      navigate("/login", { state: { from: "/plans" } });
      return;
    }
    setSelected(plan);
  };

  const confirmSubscription = async () => {
    setProcessing(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      await api.post("/subscriptions", { plan_id: selected.plan_id });
      toast.success(`Welcome to ${selected.name}! Your membership is now active.`);
      setSelected(null);
      navigate("/dashboard");
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-14" data-testid="plans-page">
      <p className="text-base uppercase tracking-widest text-secondary font-semibold mb-3">Care Plans</p>
      <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">One membership, every service</h1>
      <p className="text-xl text-muted-foreground mb-12 max-w-2xl leading-relaxed">
        All Alderly services are included in every plan. Pick monthly, six-monthly or annual —
        change or cancel anytime.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan) => (
          <div
            key={plan.plan_id}
            data-testid={`plan-card-${plan.plan_id}`}
            className={`relative bg-white rounded-3xl p-8 border shadow-sm flex flex-col ${
              plan.popular ? "border-secondary border-2 shadow-md" : "border-[#E2E8DE]"
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-4 left-8 bg-secondary text-white rounded-full px-4 py-1.5 text-sm font-semibold inline-flex items-center gap-1">
                <Star size={14} /> Most Loved
              </span>
            )}
            <h2 className="text-2xl font-semibold mb-1">{plan.name}</h2>
            <p className="text-base text-muted-foreground mb-6">{plan.tagline}</p>
            <div className="mb-6">
              <span className="text-5xl font-bold text-primary" data-testid={`plan-price-${plan.plan_id}`}>
                ₹{plan.price.toLocaleString("en-IN")}
              </span>
              <span className="text-lg text-muted-foreground ml-2">{plan.per_label}</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-lg">
                  <Check size={22} className="text-primary shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Button
              data-testid={`subscribe-${plan.plan_id}-button`}
              onClick={() => choosePlan(plan)}
              className={`rounded-full h-14 text-lg font-semibold w-full ${
                plan.popular
                  ? "bg-secondary hover:bg-secondary/90 text-white"
                  : "bg-primary hover:bg-primary/90 text-white"
              }`}
            >
              Choose {plan.name}
            </Button>
          </div>
        ))}
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="rounded-3xl sm:max-w-lg" data-testid="checkout-dialog">
          <DialogHeader>
            <DialogTitle className="text-2xl font-heading">Confirm your membership</DialogTitle>
            <DialogDescription className="text-lg">
              You are subscribing to <strong>{selected?.name}</strong> — ₹
              {selected?.price.toLocaleString("en-IN")} {selected?.per_label}.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-accent/50 rounded-2xl p-5 text-base text-muted-foreground">
            This is a demo checkout — no real payment will be charged. Your membership activates
            instantly.
          </div>
          <DialogFooter>
            <Button
              data-testid="confirm-subscription-button"
              onClick={confirmSubscription}
              disabled={processing}
              className="rounded-full h-14 px-8 text-lg font-semibold bg-secondary hover:bg-secondary/90 text-white w-full"
            >
              {processing ? "Processing…" : `Pay ₹${selected?.price.toLocaleString("en-IN")} & Activate`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Plans;
