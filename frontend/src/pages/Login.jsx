import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { formatApiError } from "@/lib/api";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success("Welcome back!");
      navigate(location.state?.from || "/dashboard");
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16" data-testid="login-page">
      <h1 className="text-4xl font-bold tracking-tight mb-3">Sign in to Alderly</h1>
      <p className="text-lg text-muted-foreground mb-10">Welcome back. Your family's care awaits.</p>

      <form onSubmit={submit} className="bg-white rounded-3xl border border-[#E2E8DE] p-8 shadow-sm space-y-6" data-testid="login-form">
        {error && (
          <div className="bg-destructive/10 text-destructive rounded-xl px-4 py-3 text-base" data-testid="login-error">
            {error}
          </div>
        )}
        <div>
          <Label htmlFor="email" className="text-lg mb-2 block">Email address</Label>
          <Input id="email" type="email" data-testid="login-email-input" required placeholder="you@example.com"
            className="h-14 text-lg rounded-xl" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="password" className="text-lg mb-2 block">Password</Label>
          <Input id="password" type="password" data-testid="login-password-input" required placeholder="Your password"
            className="h-14 text-lg rounded-xl" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <Button type="submit" data-testid="login-submit-button" disabled={loading}
          className="rounded-full h-14 w-full text-lg font-semibold bg-secondary hover:bg-secondary/90 text-white">
          {loading ? "Signing in…" : "Sign In"}
        </Button>
        <p className="text-base text-muted-foreground text-center">
          New to Alderly?{" "}
          <Link to="/signup" data-testid="login-signup-link" className="text-secondary font-semibold">
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
