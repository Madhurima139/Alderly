import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { formatApiError } from "@/lib/api";

const Signup = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      toast.success("Account created. Welcome to Alderly!");
      navigate("/dashboard");
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16" data-testid="signup-page">
      <h1 className="text-4xl font-bold tracking-tight mb-3">Create your account</h1>
      <p className="text-lg text-muted-foreground mb-10">Two minutes today, peace of mind every day.</p>

      <form onSubmit={submit} className="bg-white rounded-3xl border border-[#E2E8DE] p-8 shadow-sm space-y-6" data-testid="signup-form">
        {error && (
          <div className="bg-destructive/10 text-destructive rounded-xl px-4 py-3 text-base" data-testid="signup-error">
            {error}
          </div>
        )}
        <div>
          <Label htmlFor="name" className="text-lg mb-2 block">Your full name</Label>
          <Input id="name" data-testid="signup-name-input" required placeholder="e.g. Priya Sharma"
            className="h-14 text-lg rounded-xl" value={form.name} onChange={set("name")} />
        </div>
        <div>
          <Label htmlFor="email" className="text-lg mb-2 block">Email address</Label>
          <Input id="email" type="email" data-testid="signup-email-input" required placeholder="you@example.com"
            className="h-14 text-lg rounded-xl" value={form.email} onChange={set("email")} />
        </div>
        <div>
          <Label htmlFor="phone" className="text-lg mb-2 block">Phone number</Label>
          <Input id="phone" data-testid="signup-phone-input" required placeholder="e.g. 94150 12345"
            className="h-14 text-lg rounded-xl" value={form.phone} onChange={set("phone")} />
        </div>
        <div>
          <Label htmlFor="password" className="text-lg mb-2 block">Create a password</Label>
          <Input id="password" type="password" data-testid="signup-password-input" required placeholder="At least 6 characters"
            className="h-14 text-lg rounded-xl" value={form.password} onChange={set("password")} />
        </div>
        <Button type="submit" data-testid="signup-submit-button" disabled={loading}
          className="rounded-full h-14 w-full text-lg font-semibold bg-secondary hover:bg-secondary/90 text-white">
          {loading ? "Creating account…" : "Create My Account"}
        </Button>
        <p className="text-base text-muted-foreground text-center">
          Already have an account?{" "}
          <Link to="/login" data-testid="signup-login-link" className="text-secondary font-semibold">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;
