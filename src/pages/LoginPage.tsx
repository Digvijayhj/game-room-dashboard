import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Gamepad2, ShieldAlert } from "lucide-react";
const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const {
    login
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get redirect path or default to dashboard
  const from = (location.state as any)?.from?.pathname || "/dashboard";
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await login(email, password);
      navigate(from, {
        replace: true
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };
  return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#8B0000] to-black p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-[#DAA520]/10 rounded-full border border-[#DAA520]/20"></div>
      <div className="absolute bottom-1/4 left-1/4 w-40 h-40 bg-white/5 rounded-full border border-[#DAA520]/10"></div>
      <div className="absolute top-1/3 left-1/3 w-20 h-20 bg-[#8B0000]/30 rounded-full"></div>
      <div className="absolute bottom-10 right-10 grid grid-cols-4 gap-1">
        {[...Array(16)].map((_, i) => <div key={i} className="w-1 h-1 bg-[#DAA520]/60 rounded-full"></div>)}
      </div>
      <div className="absolute top-20 left-1/4 w-4 h-4 bg-[#DAA520] rounded-full"></div>
      <div className="absolute bottom-40 right-1/3 w-6 h-6 bg-[#DAA520]/30 rounded-full"></div>
      
      {/* Back to home link */}
      <Link to="/" className="absolute top-6 left-6 flex items-center text-[#DAA520] hover:underline">
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to Home
      </Link>
      
      <Card className="w-full max-w-md p-8 bg-black/70 backdrop-blur-sm border border-[#DAA520]/30 shadow-xl relative z-10">
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center mb-4">
            <span className="text-[#DAA520] font-bold text-2xl mr-1">Game Room</span>
            <span className="text-white font-bold text-2xl">Dashboard</span>
          </div>
          <div className="w-20 h-20 flex items-center justify-center bg-[#8B0000]/20 rounded-full mb-4 border border-[#DAA520]/20">
            <Gamepad2 className="h-10 w-10 text-[#DAA520]" />
          </div>
          <h1 className="text-3xl font-bold text-white mt-2">Loker Student Union</h1>
          <p className="text-[#DAA520] mt-1">California State University, Dominguez Hills</p>
        </div>

        {error && <div className="bg-[#8B0000]/20 border border-[#8B0000] text-white text-sm rounded p-4 mb-6 flex items-center">
            <ShieldAlert className="h-5 w-5 text-[#DAA520] mr-2 flex-shrink-0" />
            {error}
          </div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-white">
              Email
            </label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your.email@my.csudh.edu" required className="bg-black/50 border-[#DAA520] focus:border-white text-white" />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-white">
              Password
            </label>
            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required className="bg-black/50 border-[#DAA520] focus:border-white text-white" />
          </div>

          <Button type="submit" className="w-full bg-[#8B0000] hover:bg-[#8B0000]/90 text-white font-semibold rounded-full border border-[#DAA520]/30" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>

          <div className="mt-4 text-center text-sm">
            <p className="text-white/70">For demonstration purposes only.</p>
            <p className="text-[#DAA520] text-xs mt-1">Use demo account: admin@example.com / admin123</p>
          </div>
        </form>
        
        <div className="mt-6 pt-6 border-t border-[#DAA520]/20 text-center text-xs text-white/50">
          <p>© {new Date().getFullYear()} California State University, Dominguez Hills</p>
          <p>Loker Student Union - Game Room</p>
        </div>
      </Card>
    </div>;
};
export default LoginPage;