import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Gamepad2, Users, Trophy, Calendar, ChevronRight, Zap, Shield, Star, BarChart3 } from "lucide-react";
const LandingPage: React.FC = () => {
  return <div className="min-h-screen bg-gradient-to-br from-[#8B0000] to-[#FEF7CD] overflow-hidden">
      {/* Header - UPDATED */}
      <header className="bg-black/20 backdrop-blur-sm py-4 px-6 sticky top-0 z-50">
        <div className="container flex items-center justify-between">
          <div className="flex items-center">
            
            <div className="flex flex-col">
              
              <span className="font-bold text-lg text-[#daa520]/0">GAME ROOM</span>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-12">
            <a href="#hours" className="text-white font-medium hover:text-[#DAA520] transition-colors">
              Hours
            </a>
            <a href="#location" className="text-white font-medium hover:text-[#DAA520] transition-colors">
              Location
            </a>
            <a href="#features" className="text-white font-medium hover:text-[#DAA520] transition-colors">
              Dashboard
            </a>
          </div>
          <Link to="/login">
            <Button className="bg-[#8B0000] hover:bg-[#8B0000]/90 text-white rounded-full px-8 border border-[#DAA520]/50">
              Login
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative">
        <div className="container mx-auto px-6 py-16 md:py-20 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-7xl text-[#DAA520] md:text-7xl font-extrabold">
                GAME ROOM
              </h1>
              <h2 className="text-5xl md:text-6xl font-bold text-white">DASHBOARD</h2>
              <p className="text-lg text-white/90 max-w-md">
                A place for students to hang out in a fun and inviting lounge-type atmosphere that includes video game consoles, billiards tables, board games and music-on-demand.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link to="/login">
                  <Button size="lg" className="bg-[#8B0000] hover:bg-[#8B0000]/90 text-white rounded-full px-8 py-6 border border-[#DAA520]/50">
                    SIGN IN
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <img src="/lsu-uploads/e7b5555d-acca-4e27-9d51-160209531e60.png" alt="CSUDH Toros Mascot" className="w-full max-w-md mx-auto scale-110 drop-shadow-[0_0_15px_rgba(218,165,32,0.5)]" />
              
              {/* Decorative elements */}
              <div className="absolute -bottom-10 -right-10 grid grid-cols-4 gap-1">
                {[...Array(16)].map((_, i) => <div key={i} className="w-1 h-1 bg-[#DAA520]/60 rounded-full"></div>)}
              </div>
            </div>
          </div>
        </div>
        {/* Background decorative circles */}
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-[#8B0000]/20 backdrop-blur-sm rounded-full border border-[#DAA520]/10"></div>
        <div className="absolute bottom-10 left-10 w-32 h-32 bg-black/20 backdrop-blur-sm rounded-full border border-[#DAA520]/10"></div>
        <div className="absolute top-20 left-1/4 w-8 h-8 bg-[#DAA520]/20 rounded-full"></div>
        <div className="absolute bottom-40 right-1/3 w-12 h-12 bg-[#DAA520]/10 rounded-full"></div>
      </section>

      {/* Hours and Location Section */}
      <section id="hours" className="py-16 bg-black/40 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-white mb-12">Game Room Hours</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-black/30 backdrop-blur-sm p-8 rounded-lg shadow-md border border-[#DAA520]/20">
              <h3 className="text-xl font-semibold mb-6 text-white">Operating Hours</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-[#DAA520]">Monday - Thursday</span>
                  <span className="text-white">9:00 AM - 7:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#DAA520]">Friday</span>
                  <span className="text-white">10:00 AM - 3:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#DAA520]">Saturday - Sunday</span>
                  <span className="text-white">Closed</span>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-[#DAA520]/20">
                <p className="text-white/80">Discount tickets for amusement parks can also be purchased here.</p>
              </div>
            </div>
            <div id="location" className="bg-black/30 backdrop-blur-sm p-8 rounded-lg shadow-md border border-[#DAA520]/20">
              <h3 className="text-xl font-semibold mb-6 text-white">Location</h3>
              <p className="text-white/90 mb-2">Lower Level, LSU Room 140</p>
              <p className="text-white/90 mb-4">Loker Student Union</p>
              <address className="not-italic text-white/80">
                1000 E. Victoria Street<br />
                Carson, CA 90747
              </address>
              <p className="text-white mt-4">
                <span className="text-[#DAA520]">Phone:</span> 310.243.3854
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Features Section */}
      <section id="features" className="py-16 bg-gradient-to-br from-[#8B0000]/90 to-black/70 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-white mb-12">Game Room Dashboard Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-black/30 backdrop-blur-sm p-8 rounded-lg shadow-md border border-[#DAA520]/20 hover:scale-105 transition-all group">
              <Gamepad2 className="h-12 w-12 text-[#DAA520] mb-4 group-hover:text-white transition-colors" />
              <h3 className="text-xl font-semibold mb-2 text-white">Activity Management</h3>
              <p className="text-white/80">Track and manage all game room activities including console usage, billiards, and board games.</p>
            </div>
            <div className="bg-black/30 backdrop-blur-sm p-8 rounded-lg shadow-md border border-[#DAA520]/20 hover:scale-105 transition-all group">
              <BarChart3 className="h-12 w-12 text-[#DAA520] mb-4 group-hover:text-white transition-colors" />
              <h3 className="text-xl font-semibold mb-2 text-white">Revenue Tracking</h3>
              <p className="text-white/80">Monitor revenue from ticket sales, equipment rentals, and other services in real-time.</p>
            </div>
            <div className="bg-black/30 backdrop-blur-sm p-8 rounded-lg shadow-md border border-[#DAA520]/20 hover:scale-105 transition-all group">
              <Users className="h-12 w-12 text-[#DAA520] mb-4 group-hover:text-white transition-colors" />
              <h3 className="text-xl font-semibold mb-2 text-white">User Management</h3>
              <p className="text-white/80">Manage staff access, roles, and permissions for efficient operation of the game room.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      

      {/* Footer */}
      <footer className="border-t border-[#DAA520]/30 py-8 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center">
              <img src="/lsu-uploads/36a975ae-e2ca-41d9-a947-cfbca28fc1eb.png" alt="CSUDH Loker Student Union Logo" className="h-10 object-contain" />
            </div>
            <div className="flex gap-6">
              
              
              
            </div>
            <div className="text-sm text-gray-600">
              © {new Date().getFullYear()} California State University, Dominguez Hills
            </div>
          </div>
        </div>
      </footer>
    </div>;
};
export default LandingPage;