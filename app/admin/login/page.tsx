"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Button from "@/components/ui/Button";
import { Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Invalid email or password.");
      setIsLoading(false);
      return;
    }

    // Check if they actually have the admin role before redirecting
    if (data.user && data.user.role !== "admin") {
      await supabase.auth.signOut();
      setError("This account exists, but does not have admin privileges. Did you run the SQL command in Supabase?");
      setIsLoading(false);
      return;
    }

    router.push("/admin/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-blush">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg border border-brand-rose/20">
        <h1 className="text-2xl font-bold text-center text-brand-plum mb-6">
          ASR Admin Login
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-brand-plum mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-brand-rose/30 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-plum bg-brand-white text-brand-plum"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-brand-plum mb-1"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-3 pr-10 py-2 border border-brand-rose/30 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-plum bg-brand-white text-brand-plum"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-brand-plum/60 hover:text-brand-plum"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-brand-rose">{error}</p>}

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-4"
            disabled={isLoading}
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}
