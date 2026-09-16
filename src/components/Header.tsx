import React, { useState } from 'react';
import { 
  Building2, 
  Calendar, 
  KeyRound, 
  Wrench, 
  Users, 
  LayoutDashboard, 
  Plus, 
  Radio, 
  Sparkles, 
  Clock, 
  Bell,
  Menu,
  X,
  Film
} from 'lucide-react';

export type ActiveTab = 'dashboard' | 'bookings' | 'checkin' | 'maintenance' | 'staff' | 'walkthrough';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  occupiedRoomsCount: number;
  totalRoomsCount: number;
  openNewBookingModal: () => void;
  openBackendModal: () => void;
  onQuickBackendSync: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  occupiedRoomsCount,
  totalRoomsCount,
  openNewBookingModal,
  openBackendModal,
  onQuickBackendSync,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const occupancyPercentage = Math.round((occupiedRoomsCount / totalRoomsCount) * 100);

  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'bookings' as ActiveTab, label: 'Reservations', icon: Calendar },
    { id: 'checkin' as ActiveTab, label: 'Front Desk', icon: KeyRound },
    { id: 'maintenance' as ActiveTab, label: 'Rooms & Maintenance', icon: Wrench },
    { id: 'staff' as ActiveTab, label: 'Staff & Shifts', icon: Users },
    { id: 'walkthrough' as ActiveTab, label: '3D Walkthrough', icon: Film },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0D231E]/95 backdrop-blur-xl border-b border-[#1A3A32]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Hotel Brand */}
          <div className="flex items-center space-x-4">
            <div 
              onClick={() => setActiveTab('dashboard')} 
              className="cursor-pointer flex items-center space-x-3 group"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#D4AF37] via-[#e6c86e] to-[#b5952f] p-0.5 shadow-lg shadow-[#D4AF37]/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-[#0D231E] rounded-[10px] flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-[#D4AF37]" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-xl font-bold tracking-tight text-[#F7F4EB] group-hover:text-[#D4AF37] transition-colors">
                    AURA GRAND
                  </span>
                  <span className="text-[10px] tracking-widest font-mono uppercase px-1.5 py-0.5 rounded bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                    5★ LUXURY
                  </span>
                </div>
                <p className="text-[11px] text-[#F7F4EB]/70 font-medium tracking-wide">
                  Hotel &amp; Residences • PMS Suite
                </p>
              </div>
            </div>

            {/* Occupancy Mini Pill */}
            <div className="hidden lg:flex items-center space-x-2 pl-4 border-l border-[#1A3A32] text-xs">
              <span className="text-[#F7F4EB]/70">Occupancy:</span>
              <span className="font-semibold text-[#F7F4EB]">
                {occupiedRoomsCount}/{totalRoomsCount}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                {occupancyPercentage}%
              </span>
            </div>
          </div>

          {/* Center Navigation Tabs (Desktop) */}
          <nav className="hidden md:flex items-center space-x-1 bg-[#0D231E]/80 p-1.5 rounded-xl border border-[#1A3A32]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-[#D4AF37] text-[#0D231E] shadow-md shadow-[#D4AF37]/20 font-bold'
                      : 'text-[#F7F4EB]/70 hover:text-[#F7F4EB] hover:bg-[#1A3A32]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#0D231E]' : 'text-[#D4AF37]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-3">
            {/* Backend Integration Indicator & Trigger */}
            <button
              id="backend-integration-status-btn"
              onClick={openBackendModal}
              title="Click to inspect live backend integration progress"
              className="relative flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#1A3A32] hover:bg-[#234d42] border border-[#D4AF37]/40 hover:border-[#D4AF37] text-xs text-[#F7F4EB] transition-all group shadow-sm hover:shadow-[#D4AF37]/10 cursor-pointer"
            >
              <div className="relative flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-ping absolute inline-flex opacity-75" />
                <span className="w-2 h-2 rounded-full bg-[#D4AF37] relative inline-flex" />
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#D4AF37] font-bold leading-none">
                  Backend Sync
                </span>
                <span className="text-[11px] font-semibold text-[#F7F4EB] group-hover:text-white leading-tight">
                  Integration In Progress
                </span>
              </div>
              <Radio className="w-3.5 h-3.5 text-[#D4AF37] ml-1 group-hover:scale-110 transition-transform" />
            </button>

            {/* Quick Action: New Reservation */}
            <button
              id="header-new-reservation-btn"
              onClick={openNewBookingModal}
              className="hidden sm:inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#e6c86e] hover:from-[#c29f2e] hover:to-[#D4AF37] text-[#0D231E] font-bold text-xs shadow-lg shadow-[#D4AF37]/25 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#0D231E] stroke-[2.5]" />
              <span>Book Room</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-[#F7F4EB]/80 hover:text-[#F7F4EB] hover:bg-[#1A3A32]"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#1A3A32] space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`mobile-nav-${item.id}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-[#D4AF37] text-[#0D231E] font-bold'
                      : 'text-[#F7F4EB]/80 hover:bg-[#1A3A32]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
            <div className="pt-3 border-t border-[#1A3A32] flex gap-2">
              <button
                onClick={() => {
                  openNewBookingModal();
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#D4AF37] text-[#0D231E] font-bold text-xs text-center flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>New Reservation</span>
              </button>
              <button
                onClick={() => {
                  openBackendModal();
                  setMobileMenuOpen(false);
                }}
                className="px-4 py-2.5 rounded-xl bg-[#1A3A32] text-[#D4AF37] border border-[#D4AF37]/40 text-xs font-semibold"
              >
                Backend Status
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
