import React from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  KeyRound, 
  Calendar, 
  Wrench, 
  Users, 
  Sparkles, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Radio, 
  Clock, 
  DollarSign, 
  ShieldCheck,
  BedDouble,
  Sparkle,
  Film
} from 'lucide-react';
import { Room, Reservation, MaintenanceTicket, StaffMember } from '../types';
import { ActiveTab } from './Header';

interface DashboardOverviewProps {
  rooms: Room[];
  reservations: Reservation[];
  maintenanceTickets: MaintenanceTicket[];
  staff: StaffMember[];
  setActiveTab: (tab: ActiveTab) => void;
  openNewBookingModal: () => void;
  openBackendModal: () => void;
  onQuickBackendSync: (action: string, endpoint: string) => void;
  onExpressCheckIn: (reservation: Reservation) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  rooms,
  reservations,
  maintenanceTickets,
  staff,
  setActiveTab,
  openNewBookingModal,
  openBackendModal,
  onQuickBackendSync,
  onExpressCheckIn,
}) => {
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(r => r.status === 'Occupied').length;
  const cleanRooms = rooms.filter(r => r.status === 'Clean & Available').length;
  const dirtyRooms = rooms.filter(r => r.status === 'Dirty').length;
  const inspectingRooms = rooms.filter(r => r.status === 'Inspecting').length;
  const maintenanceRooms = rooms.filter(r => r.status === 'Maintenance').length;

  const occupancyRate = Math.round((occupiedRooms / totalRooms) * 100);

  // Today's arrivals (Confirmed reservations)
  const pendingArrivals = reservations.filter(r => r.status === 'Confirmed');
  // Today's departures (sample filtered)
  const inHouseGuests = reservations.filter(r => r.status === 'Checked In');

  const openTickets = maintenanceTickets.filter(t => t.status !== 'Resolved');
  const urgentTickets = openTickets.filter(t => t.priority === 'Urgent' || t.priority === 'High');

  const onDutyStaff = staff.filter(s => s.status === 'On Duty');

  // Revenue calculation estimate
  const estimatedDailyRevenue = inHouseGuests.reduce((acc, curr) => acc + (curr.totalAmount / 3), 0);

  return (
    <div id="dashboard-overview-container" className="space-y-8 pb-12">
      {/* Top Welcome & Integration Notification Banner */}
      <div className="bg-gradient-to-r from-[#1A3A32] via-[#234d42] to-[#1A3A32] border border-[#D4AF37]/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-[#D4AF37]/10 to-transparent pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono uppercase tracking-widest text-[#D4AF37] bg-[#D4AF37]/15 px-2.5 py-0.5 rounded-full border border-[#D4AF37]/30">
                Front Office &amp; Operations Portal
              </span>
              <span className="text-xs text-[#F7F4EB]/60">• September 15, 2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#F7F4EB] tracking-tight">
              Welcome to Aura Grand Property Management
            </h1>
            <p className="text-sm text-[#F7F4EB]/80 mt-1 max-w-2xl leading-relaxed">
              Realtime overview of guest arrivals, room maintenance status, housekeeping assignments, and on-duty personnel.
            </p>
          </div>

          {/* Backend Integration Showcase Widget */}
          <div className="shrink-0 flex items-center gap-3 bg-[#0D231E]/80 p-3.5 rounded-xl border border-[#D4AF37]/30">
            <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#F7F4EB]">Backend Cloud Sync</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37] font-mono">
                  Integration In Progress
                </span>
              </div>
              <p className="text-[11px] text-[#F7F4EB]/60 mt-0.5">
                Full frontend client state active • APIs queued
              </p>
            </div>
            <button
              id="dashboard-open-backend-modal"
              onClick={openBackendModal}
              className="ml-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#D4AF37] hover:bg-[#e6c86e] text-[#0D231E] transition-colors shadow-sm cursor-pointer"
            >
              Details
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Occupancy Card */}
        <motion.div 
          whileHover={{ y: -2 }}
          transition={{ duration: 0.15 }}
          className="bg-[#1A3A32]/90 border border-[#1A3A32] hover:border-[#D4AF37]/40 rounded-2xl p-5 shadow-lg relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#F7F4EB]/70">
              Total Occupancy
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/15 text-[#D4AF37] flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-display text-[#F7F4EB]">{occupancyRate}%</span>
            <span className="text-xs text-[#F7F4EB]/60">({occupiedRooms}/{totalRooms} Rooms)</span>
          </div>
          <div className="mt-4 w-full bg-[#0D231E] rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-[#D4AF37] to-[#e6c86e] h-2 rounded-full transition-all duration-500"
              style={{ width: `${occupancyRate}%` }}
            />
          </div>
          <div className="mt-3 flex justify-between text-[11px] text-[#F7F4EB]/60">
            <span className="text-emerald-400">{cleanRooms} Clean Available</span>
            <span className="text-rose-400">{dirtyRooms} Need Cleaning</span>
          </div>
        </motion.div>

        {/* Guest Arrivals Today */}
        <motion.div 
          whileHover={{ y: -2 }}
          transition={{ duration: 0.15 }}
          className="bg-[#1A3A32]/90 border border-[#1A3A32] hover:border-[#D4AF37]/40 rounded-2xl p-5 shadow-lg relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#F7F4EB]/70">
              Pending Arrivals Today
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/15 text-[#D4AF37] flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-display text-[#F7F4EB]">{pendingArrivals.length}</span>
            <span className="text-xs text-[#F7F4EB]/60">guests scheduled</span>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <button 
              id="kpi-goto-checkin-btn"
              onClick={() => setActiveTab('checkin')}
              className="text-xs font-semibold text-[#D4AF37] hover:text-[#e6c86e] flex items-center gap-1 group cursor-pointer"
            >
              <span>Go to Front Desk</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <span className="text-[11px] text-[#F7F4EB]/50 font-mono">
              {inHouseGuests.length} In-House
            </span>
          </div>
        </motion.div>

        {/* Maintenance & Housekeeping Attention */}
        <motion.div 
          whileHover={{ y: -2 }}
          transition={{ duration: 0.15 }}
          className="bg-[#1A3A32]/90 border border-[#1A3A32] hover:border-[#D4AF37]/40 rounded-2xl p-5 shadow-lg relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#F7F4EB]/70">
              Maintenance &amp; Service
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/15 text-rose-300 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-display text-[#F7F4EB]">{openTickets.length}</span>
            <span className="text-xs text-rose-300 font-semibold">
              ({urgentTickets.length} urgent/high)
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <button 
              id="kpi-goto-maintenance-btn"
              onClick={() => setActiveTab('maintenance')}
              className="text-xs font-semibold text-rose-300 hover:text-rose-200 flex items-center gap-1 group cursor-pointer"
            >
              <span>Inspect Tickets</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <span className="text-[11px] text-[#F7F4EB]/60">
              {maintenanceRooms} rooms offline
            </span>
          </div>
        </motion.div>

        {/* Staff on Duty */}
        <motion.div 
          whileHover={{ y: -2 }}
          transition={{ duration: 0.15 }}
          className="bg-[#1A3A32]/90 border border-[#1A3A32] hover:border-[#D4AF37]/40 rounded-2xl p-5 shadow-lg relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#F7F4EB]/70">
              Staff Operations
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-300 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-display text-[#F7F4EB]">{onDutyStaff.length}</span>
            <span className="text-xs text-[#F7F4EB]/60">active on duty</span>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <button 
              id="kpi-goto-staff-btn"
              onClick={() => setActiveTab('staff')}
              className="text-xs font-semibold text-emerald-300 hover:text-emerald-200 flex items-center gap-1 group cursor-pointer"
            >
              <span>View Roster &amp; Shifts</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <span className="text-[11px] text-[#F7F4EB]/60">
              3 Shifts active
            </span>
          </div>
        </motion.div>
      </div>

      {/* Room Status Matrix Bar */}
      <div className="bg-[#1A3A32]/90 border border-[#1A3A32] rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-[#F7F4EB] flex items-center gap-2">
              <BedDouble className="w-4 h-4 text-[#D4AF37]" />
              <span>Realtime Room Inventory Status</span>
            </h3>
            <p className="text-xs text-[#F7F4EB]/60 mt-0.5">
              Current state across all 4 floors (24 suites &amp; villas)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="dashboard-view-all-rooms-btn"
              onClick={() => setActiveTab('maintenance')}
              className="text-xs font-semibold text-[#D4AF37] hover:text-[#e6c86e] px-3 py-1.5 rounded-lg bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 transition-colors cursor-pointer"
            >
              Open Floor Matrix →
            </button>
          </div>
        </div>

        {/* Stacked Proportional Bar */}
        <div className="w-full h-3 bg-[#0D231E] rounded-full overflow-hidden flex">
          <div style={{ width: `${(occupiedRooms / totalRooms) * 100}%` }} className="bg-[#D4AF37] h-full" title={`Occupied: ${occupiedRooms}`} />
          <div style={{ width: `${(cleanRooms / totalRooms) * 100}%` }} className="bg-emerald-500 h-full" title={`Clean: ${cleanRooms}`} />
          <div style={{ width: `${(dirtyRooms / totalRooms) * 100}%` }} className="bg-rose-500 h-full" title={`Dirty: ${dirtyRooms}`} />
          <div style={{ width: `${(inspectingRooms / totalRooms) * 100}%` }} className="bg-sky-500 h-full" title={`Inspecting: ${inspectingRooms}`} />
          <div style={{ width: `${(maintenanceRooms / totalRooms) * 100}%` }} className="bg-purple-500 h-full" title={`Maintenance: ${maintenanceRooms}`} />
        </div>

        {/* Legend */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#D4AF37]" />
            <span className="text-xs text-[#F7F4EB]/80 font-medium">Occupied: <b className="text-[#F7F4EB]">{occupiedRooms}</b></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-xs text-[#F7F4EB]/80 font-medium">Clean &amp; Ready: <b className="text-[#F7F4EB]">{cleanRooms}</b></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500" />
            <span className="text-xs text-[#F7F4EB]/80 font-medium">Dirty / Needs Clean: <b className="text-[#F7F4EB]">{dirtyRooms}</b></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-sky-500" />
            <span className="text-xs text-[#F7F4EB]/80 font-medium">Inspecting: <b className="text-[#F7F4EB]">{inspectingRooms}</b></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-xs text-[#F7F4EB]/80 font-medium">Out for Maintenance: <b className="text-[#F7F4EB]">{maintenanceRooms}</b></span>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Pending Arrivals & Priority Action Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Express Arrival Queue (7 cols) */}
        <div className="lg:col-span-7 bg-[#1A3A32]/90 border border-[#1A3A32] rounded-2xl p-6 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-[#F7F4EB] flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#D4AF37]" />
                  <span>Pending Guest Arrivals Today</span>
                </h3>
                <p className="text-xs text-[#F7F4EB]/60 mt-0.5">
                  Pre-assigned rooms ready for 1-click express check-in and RFID card issuing
                </p>
              </div>
              <button 
                id="arrivals-see-all-btn"
                onClick={() => setActiveTab('checkin')}
                className="text-xs font-semibold text-[#F7F4EB]/70 hover:text-[#D4AF37] transition-colors cursor-pointer"
              >
                View Desk ({pendingArrivals.length})
              </button>
            </div>

            <div className="space-y-3">
              {pendingArrivals.length === 0 ? (
                <div className="text-center py-8 text-[#F7F4EB]/60 text-sm">
                  All scheduled arrivals for today have been checked in.
                </div>
              ) : (
                pendingArrivals.slice(0, 3).map((res) => {
                  const targetRoom = rooms.find(r => r.number === res.roomNumber);
                  const isRoomClean = targetRoom?.status === 'Clean & Available';

                  return (
                    <div 
                      key={res.id}
                      className="p-4 rounded-xl bg-[#0D231E]/80 border border-[#1A3A32] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#D4AF37]/40 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-[#F7F4EB]">{res.guestName}</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-[#1A3A32] text-[#D4AF37] font-mono border border-[#D4AF37]/30">
                            {res.id}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-[#F7F4EB]/70">
                          <span>Room <strong className="text-[#F7F4EB]">{res.roomNumber}</strong> ({res.roomType})</span>
                          <span>•</span>
                          <span>{res.adults} Guests</span>
                          <span>•</span>
                          <span className={isRoomClean ? 'text-emerald-400 font-medium' : 'text-[#D4AF37] font-medium'}>
                            {targetRoom?.status || 'Assigned'}
                          </span>
                        </div>
                        {res.specialRequests && (
                          <p className="text-[11px] text-[#F7F4EB]/60 italic">
                            &ldquo;{res.specialRequests}&rdquo;
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          id={`express-checkin-btn-${res.id}`}
                          onClick={() => onExpressCheckIn(res)}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#D4AF37] hover:bg-[#e6c86e] text-[#0D231E] transition-all shadow-sm active:scale-95 cursor-pointer"
                        >
                          Express Check-In
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#1A3A32] flex items-center justify-between">
            <button
              id="new-booking-from-dashboard-btn"
              onClick={openNewBookingModal}
              className="text-xs font-semibold text-[#D4AF37] hover:text-[#e6c86e] flex items-center gap-1.5 cursor-pointer"
            >
              <span>+ Create Walk-in / New Reservation</span>
            </button>
            <button
              onClick={() => onQuickBackendSync('Booking.com OTA Rate Availability Broadcast', 'POST /api/v1/ota/sync')}
              className="text-xs text-[#F7F4EB]/60 hover:text-[#D4AF37] flex items-center gap-1 cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Broadcast Channel Parity</span>
            </button>
          </div>
        </div>

        {/* Right Column: Quick Operations Launchpad (5 cols) */}
        <div className="lg:col-span-5 bg-[#1A3A32]/90 border border-[#1A3A32] rounded-2xl p-6 shadow-lg space-y-4">
          <div>
            <h3 className="text-base font-bold text-[#F7F4EB] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span>Operations Launchpad</span>
            </h3>
            <p className="text-xs text-[#F7F4EB]/60 mt-0.5">
              Instant shortcuts to streamline daily staff workflows
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              id="quick-action-new-booking"
              onClick={openNewBookingModal}
              className="p-3 rounded-xl bg-[#0D231E]/70 hover:bg-[#0D231E] border border-[#1A3A32] hover:border-[#D4AF37]/50 text-left transition-all cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-lg bg-[#D4AF37]/15 text-[#D4AF37] flex items-center justify-center mb-2">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold text-[#F7F4EB] group-hover:text-[#D4AF37]">
                New Reservation
              </div>
              <div className="text-[11px] text-[#F7F4EB]/60 mt-0.5">
                Book suite with dynamic rate
              </div>
            </button>

            <button
              id="quick-action-desk"
              onClick={() => setActiveTab('checkin')}
              className="p-3 rounded-xl bg-[#0D231E]/70 hover:bg-[#0D231E] border border-[#1A3A32] hover:border-[#D4AF37]/50 text-left transition-all cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-lg bg-[#D4AF37]/15 text-[#D4AF37] flex items-center justify-center mb-2">
                <KeyRound className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold text-[#F7F4EB] group-hover:text-[#D4AF37]">
                Front Desk Desk
              </div>
              <div className="text-[11px] text-[#F7F4EB]/60 mt-0.5">
                Keycard issuance &amp; folios
              </div>
            </button>

            <button
              id="quick-action-room-grid"
              onClick={() => setActiveTab('maintenance')}
              className="p-3 rounded-xl bg-[#0D231E]/70 hover:bg-[#0D231E] border border-[#1A3A32] hover:border-[#D4AF37]/50 text-left transition-all cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-lg bg-rose-500/15 text-rose-300 flex items-center justify-center mb-2">
                <Wrench className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold text-[#F7F4EB] group-hover:text-rose-300">
                Room Maintenance
              </div>
              <div className="text-[11px] text-[#F7F4EB]/60 mt-0.5">
                Manage tickets &amp; turns
              </div>
            </button>

            <button
              id="quick-action-staff"
              onClick={() => setActiveTab('staff')}
              className="p-3 rounded-xl bg-[#0D231E]/70 hover:bg-[#0D231E] border border-[#1A3A32] hover:border-[#D4AF37]/50 text-left transition-all cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-300 flex items-center justify-center mb-2">
                <Users className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold text-[#F7F4EB] group-hover:text-emerald-300">
                Staff &amp; Shifts
              </div>
              <div className="text-[11px] text-[#F7F4EB]/60 mt-0.5">
                Manage 8 active personnel
              </div>
            </button>

            <button
              id="quick-action-3d-walkthrough"
              onClick={() => setActiveTab('walkthrough')}
              className="p-3 rounded-xl bg-[#0D231E]/70 hover:bg-[#0D231E] border border-[#1A3A32] hover:border-[#D4AF37]/50 text-left transition-all cursor-pointer group sm:col-span-2"
            >
              <div className="w-7 h-7 rounded-lg bg-[#D4AF37]/15 text-[#D4AF37] flex items-center justify-center mb-2">
                <Film className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold text-[#F7F4EB] group-hover:text-[#D4AF37]">
                3D Canvas Tour
              </div>
              <div className="text-[11px] text-[#F7F4EB]/60 mt-0.5">
                Smooth video scrub animation
              </div>
            </button>
          </div>

          {/* Urgent Housekeeping / Maintenance Notice */}
          <div className="mt-4 p-3.5 rounded-xl bg-[#0D231E]/80 border border-[#1A3A32] space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-[#F7F4EB]/80">
              <span className="flex items-center gap-1.5 text-[#D4AF37]">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Urgent Room Attention</span>
              </span>
              <span className="text-[11px] text-[#F7F4EB]/50">2 tickets</span>
            </div>
            <div className="text-xs text-[#F7F4EB]/90 bg-[#1A3A32]/80 p-2 rounded-lg border border-[#1A3A32]">
              <div className="font-semibold text-[#F7F4EB]">Room 304 • Plumbing Fluctuation</div>
              <div className="text-[11px] text-[#F7F4EB]/60">Assigned to Carlos Ramirez • Valve replacement required</div>
            </div>
            <div className="text-xs text-[#F7F4EB]/90 bg-[#1A3A32]/80 p-2 rounded-lg border border-[#1A3A32]">
              <div className="font-semibold text-[#F7F4EB]">Room 106 • HVAC Acoustic Noise</div>
              <div className="text-[11px] text-[#F7F4EB]/60">Damper adjustment needed prior to 18:00 check-in</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
