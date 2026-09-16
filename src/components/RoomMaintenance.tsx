import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wrench, 
  Sparkles, 
  BedDouble, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  User, 
  Filter, 
  Plus, 
  Radio, 
  ShieldAlert, 
  X, 
  ChevronRight, 
  Droplet, 
  Thermometer, 
  Zap, 
  KeyRound,
  Hammer
} from 'lucide-react';
import { Room, RoomStatus, MaintenanceTicket, StaffMember } from '../types';

interface RoomMaintenanceProps {
  rooms: Room[];
  maintenanceTickets: MaintenanceTicket[];
  staff: StaffMember[];
  onUpdateRoomStatus: (roomId: string, newStatus: RoomStatus) => void;
  onResolveTicket: (ticketId: string, roomNumber: string) => void;
  openNewTicketModal: (defaultRoomNumber?: string) => void;
  onQuickBackendSync: (action: string, endpoint: string) => void;
  onBatchCleanDirtyRooms: () => void;
}

export const RoomMaintenance: React.FC<RoomMaintenanceProps> = ({
  rooms,
  maintenanceTickets,
  staff,
  onUpdateRoomStatus,
  onResolveTicket,
  openNewTicketModal,
  onQuickBackendSync,
  onBatchCleanDirtyRooms,
}) => {
  const [viewMode, setViewMode] = useState<'rooms' | 'tickets'>('rooms');
  const [selectedFloor, setSelectedFloor] = useState<number | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | RoomStatus>('All');
  const [inspectingRoom, setInspectingRoom] = useState<Room | null>(null);

  // Filter rooms
  const filteredRooms = rooms.filter((r) => {
    const matchesFloor = selectedFloor === 'All' || r.floor === selectedFloor;
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesFloor && matchesStatus;
  });

  const dirtyCount = rooms.filter(r => r.status === 'Dirty').length;
  const maintenanceCount = rooms.filter(r => r.status === 'Maintenance').length;
  const inspectingCount = rooms.filter(r => r.status === 'Inspecting').length;
  const cleanCount = rooms.filter(r => r.status === 'Clean & Available').length;

  const openTickets = maintenanceTickets.filter(t => t.status !== 'Resolved');

  return (
    <div id="room-maintenance-container" className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-[#F7F4EB] tracking-tight">
            Guest Rooms &amp; Facilities Maintenance
          </h2>
          <p className="text-xs text-[#F7F4EB]/70 mt-0.5">
            Housekeeping room turn status, inspection flows, and engineering work orders
          </p>
        </div>

        {/* View Mode Toggle & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-[#0D231E] p-1.5 rounded-xl border border-[#1A3A32] text-xs">
            <button
              id="view-mode-rooms-btn"
              onClick={() => setViewMode('rooms')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                viewMode === 'rooms'
                  ? 'bg-[#D4AF37] text-[#0D231E] font-bold shadow-md shadow-[#D4AF37]/20'
                  : 'text-[#F7F4EB]/70 hover:text-[#F7F4EB]'
              }`}
            >
              <BedDouble className="w-3.5 h-3.5" />
              <span>Room Grid ({rooms.length})</span>
            </button>

            <button
              id="view-mode-tickets-btn"
              onClick={() => setViewMode('tickets')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                viewMode === 'tickets'
                  ? 'bg-[#D4AF37] text-[#0D231E] font-bold shadow-md shadow-[#D4AF37]/20'
                  : 'text-[#F7F4EB]/70 hover:text-[#F7F4EB]'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Work Orders ({openTickets.length})</span>
            </button>
          </div>

          <button
            id="report-issue-btn"
            onClick={() => openNewTicketModal()}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#D4AF37] hover:bg-[#e6c86e] text-[#0D231E] transition-all shadow-md shadow-[#D4AF37]/20 active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Log Work Order</span>
          </button>
        </div>
      </div>

      {/* Housekeeping Quick Turnover Actions */}
      <div className="bg-[#1A3A32]/90 border border-[#1A3A32] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/15 text-[#D4AF37] flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#F7F4EB]">Housekeeping Operations</h4>
            <p className="text-[11px] text-[#F7F4EB]/70">
              {dirtyCount} rooms awaiting cleaning • {inspectingCount} in inspection • {cleanCount} clean
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {dirtyCount > 0 && (
            <button
              id="batch-clean-dirty-rooms-btn"
              onClick={onBatchCleanDirtyRooms}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0D231E] hover:bg-[#15342d] text-[#D4AF37] border border-[#D4AF37]/30 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Dispatch Cleaning for All {dirtyCount} Dirty Rooms</span>
            </button>
          )}

          <button
            onClick={() => onQuickBackendSync('Sync Smart Thermostat HVAC Profiles', 'POST /api/v1/iot/climate/sync')}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0D231E] hover:bg-[#15342d] text-[#F7F4EB]/80 border border-[#1A3A32] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Radio className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Sync IoT Climate Presets</span>
          </button>
        </div>
      </div>

      {/* Rooms Floor Grid View */}
      {viewMode === 'rooms' && (
        <div className="space-y-4">
          {/* Filters: Floors & Status */}
          <div className="bg-[#1A3A32]/90 border border-[#1A3A32] rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Floor selector */}
            <div className="flex items-center gap-1 bg-[#0D231E] p-1 rounded-xl border border-[#1A3A32] text-xs">
              <span className="px-2 text-[#F7F4EB]/50 font-medium">Floor:</span>
              {(['All', 1, 2, 3, 4] as const).map((fl) => (
                <button
                  key={fl}
                  id={`floor-filter-${fl}`}
                  onClick={() => setSelectedFloor(fl)}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                    selectedFloor === fl
                      ? 'bg-[#D4AF37] text-[#0D231E] font-bold'
                      : 'text-[#F7F4EB]/70 hover:text-[#F7F4EB]'
                  }`}
                >
                  {fl === 'All' ? 'All Floors' : `Floor ${fl}`}
                </button>
              ))}
            </div>

            {/* Status pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {(['All', 'Clean & Available', 'Occupied', 'Dirty', 'Inspecting', 'Maintenance'] as const).map((st) => {
                const count = st === 'All' ? rooms.length : rooms.filter(r => r.status === st).length;
                const isSelected = statusFilter === st;

                return (
                  <button
                    key={st}
                    id={`status-filter-${st.toLowerCase().replace(/[\s&]+/g, '-')}`}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl font-semibold transition-colors flex items-center gap-1.5 cursor-pointer border ${
                      isSelected
                        ? 'bg-[#0D231E] border-[#D4AF37] text-[#D4AF37] font-bold shadow-sm'
                        : 'bg-[#0D231E]/60 border-[#1A3A32] text-[#F7F4EB]/70 hover:text-[#F7F4EB]'
                    }`}
                  >
                    <span>{st}</span>
                    <span className="text-[10px] opacity-70">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Room Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredRooms.map((room) => {
              const isClean = room.status === 'Clean & Available';
              const isOccupied = room.status === 'Occupied';
              const isDirty = room.status === 'Dirty';
              const isInspecting = room.status === 'Inspecting';
              const isMaintenance = room.status === 'Maintenance';

              return (
                <motion.div
                  key={room.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.15 }}
                  id={`room-card-${room.number}`}
                  className={`rounded-2xl p-4 border transition-all flex flex-col justify-between relative overflow-hidden ${
                    isOccupied
                      ? 'bg-[#1A3A32] border-[#D4AF37]/50 shadow-[#0D231E]/50'
                      : isClean
                      ? 'bg-[#1A3A32]/80 border-[#D4AF37]/30'
                      : isDirty
                      ? 'bg-[#1A3A32]/80 border-amber-600/40'
                      : isInspecting
                      ? 'bg-[#1A3A32]/80 border-emerald-500/40'
                      : 'bg-[#1A3A32]/80 border-amber-500/40'
                  }`}
                >
                  <div>
                    {/* Top Header of Room Card */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold font-display text-[#F7F4EB]">
                            {room.number}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#0D231E] text-[#D4AF37] border border-[#1A3A32]">
                            F{room.floor}
                          </span>
                        </div>
                        <span className="text-xs text-[#F7F4EB]/70 font-medium block mt-0.5">
                          {room.type}
                        </span>
                      </div>

                      {/* Status Tag */}
                      <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold border flex items-center gap-1 ${
                        isClean
                          ? 'bg-[#D4AF37]/15 text-[#D4AF37] border-[#D4AF37]/30'
                          : isOccupied
                          ? 'bg-[#0D231E] text-[#F7F4EB] border-[#D4AF37]/50'
                          : isDirty
                          ? 'bg-amber-900/30 text-amber-300 border-amber-500/30'
                          : isInspecting
                          ? 'bg-emerald-900/30 text-emerald-300 border-emerald-500/30'
                          : 'bg-[#0D231E] text-[#D4AF37] border-[#D4AF37]/40'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          isClean ? 'bg-[#D4AF37]' : isOccupied ? 'bg-[#F7F4EB]' : isDirty ? 'bg-amber-400' : isInspecting ? 'bg-emerald-400' : 'bg-[#D4AF37]'
                        }`} />
                        {room.status}
                      </span>
                    </div>

                    {/* Room Details / Occupant */}
                    <div className="mt-3.5 space-y-1.5 text-xs text-[#F7F4EB]/80">
                      {isOccupied && (
                        <div className="p-2 rounded-xl bg-[#0D231E]/80 border border-[#1A3A32] flex items-center justify-between">
                          <span className="text-[#F7F4EB]/60 text-[11px]">Occupant:</span>
                          <span className="font-semibold text-[#F7F4EB] truncate max-w-[140px] text-right">
                            {room.currentGuest || 'Registered Guest'}
                          </span>
                        </div>
                      )}

                      {isMaintenance && room.maintenanceIssue && (
                        <div className="p-2 rounded-xl bg-[#0D231E]/80 border border-[#D4AF37]/30 text-[11px] text-[#F7F4EB]/90">
                          <span className="font-semibold block text-[#D4AF37]">Issue:</span>
                          <span className="line-clamp-2">{room.maintenanceIssue}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[11px] text-[#F7F4EB]/70 pt-1">
                        <span>Rate: <b className="text-[#D4AF37]">${room.pricePerNight}</b>/night</span>
                        <span>Cleaned: <b className="text-[#F7F4EB]">{room.lastCleaned || 'Today'}</b></span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Status Action Controls */}
                  <div className="mt-4 pt-3 border-t border-[#0D231E] space-y-2">
                    <div className="flex items-center justify-between gap-1 text-[11px]">
                      <span className="text-[#F7F4EB]/50 font-medium">Quick Set:</span>
                      
                      <div className="flex items-center gap-1">
                        {!isClean && (
                          <button
                            id={`mark-clean-${room.number}`}
                            onClick={() => onUpdateRoomStatus(room.id, 'Clean & Available')}
                            title="Mark as Clean & Ready"
                            className="px-2 py-1 rounded bg-[#0D231E] hover:bg-[#D4AF37]/20 text-[#F7F4EB]/80 hover:text-[#D4AF37] text-[10px] font-semibold transition-colors cursor-pointer border border-[#1A3A32]"
                          >
                            Clean
                          </button>
                        )}

                        {!isDirty && !isOccupied && (
                          <button
                            id={`mark-dirty-${room.number}`}
                            onClick={() => onUpdateRoomStatus(room.id, 'Dirty')}
                            title="Mark as Dirty (Needs Turnover)"
                            className="px-2 py-1 rounded bg-[#0D231E] hover:bg-[#D4AF37]/20 text-[#F7F4EB]/80 hover:text-[#D4AF37] text-[10px] font-semibold transition-colors cursor-pointer border border-[#1A3A32]"
                          >
                            Dirty
                          </button>
                        )}

                        {!isInspecting && (
                          <button
                            id={`mark-inspecting-${room.number}`}
                            onClick={() => onUpdateRoomStatus(room.id, 'Inspecting')}
                            title="Mark as Under Inspection"
                            className="px-2 py-1 rounded bg-[#0D231E] hover:bg-[#D4AF37]/20 text-[#F7F4EB]/80 hover:text-[#D4AF37] text-[10px] font-semibold transition-colors cursor-pointer border border-[#1A3A32]"
                          >
                            Inspect
                          </button>
                        )}

                        {!isMaintenance && (
                          <button
                            id={`mark-maintenance-${room.number}`}
                            onClick={() => openNewTicketModal(room.number)}
                            title="Take Out of Service for Maintenance"
                            className="px-2 py-1 rounded bg-[#0D231E] hover:bg-[#D4AF37]/20 text-[#F7F4EB]/80 hover:text-[#D4AF37] text-[10px] font-semibold transition-colors cursor-pointer border border-[#1A3A32]"
                          >
                            Service
                          </button>
                        )}
                      </div>
                    </div>

                    <button
                      id={`inspect-room-details-${room.number}`}
                      onClick={() => setInspectingRoom(room)}
                      className="w-full py-1.5 rounded-lg bg-[#0D231E]/70 hover:bg-[#0D231E] text-[#F7F4EB]/80 hover:text-[#F7F4EB] border border-[#1A3A32] text-xs font-medium transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>Room Specs &amp; Amenities</span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#D4AF37]" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Maintenance Work Orders View */}
      {viewMode === 'tickets' && (
        <div className="space-y-4">
          <div className="bg-[#1A3A32]/90 border border-[#1A3A32] rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-xs font-bold text-[#F7F4EB] uppercase tracking-wider">
                Active Maintenance Dispatch Queue
              </span>
            </div>

            <button
              onClick={() => onQuickBackendSync('Export Work Orders to Facilities ERP', 'POST /api/v1/facilities/sync')}
              className="text-xs text-[#D4AF37] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Export Work Orders to ERP</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {maintenanceTickets.map((ticket) => {
              const isResolved = ticket.status === 'Resolved';
              const isUrgent = ticket.priority === 'Urgent';

              return (
                <div
                  key={ticket.id}
                  id={`ticket-card-${ticket.id}`}
                  className={`bg-[#1A3A32] border rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all ${
                    isResolved
                      ? 'border-[#1A3A32] opacity-60'
                      : isUrgent
                      ? 'border-[#D4AF37] shadow-[#0D231E]/30'
                      : 'border-[#1A3A32]'
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-[#D4AF37] font-semibold">{ticket.id}</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-[#0D231E] text-[#F7F4EB] font-bold border border-[#1A3A32]">
                            Room {ticket.roomNumber}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-[#F7F4EB] mt-1">{ticket.title}</h4>
                      </div>

                      <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold border ${
                        isUrgent
                          ? 'bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/50'
                          : ticket.priority === 'High'
                          ? 'bg-[#D4AF37]/15 text-[#D4AF37] border-[#D4AF37]/30'
                          : 'bg-[#0D231E] text-[#F7F4EB]/70 border-[#1A3A32]'
                      }`}>
                        {ticket.priority} Priority
                      </span>
                    </div>

                    <p className="text-xs text-[#F7F4EB]/80 mt-2.5 leading-relaxed">
                      {ticket.description}
                    </p>

                    <div className="mt-4 pt-3 border-t border-[#0D231E] grid grid-cols-2 gap-2 text-[11px] text-[#F7F4EB]/70">
                      <div>Category: <b className="text-[#F7F4EB]">{ticket.category}</b></div>
                      <div>Reported: <b className="text-[#F7F4EB]">{ticket.createdAt}</b></div>
                      <div>Assigned: <b className="text-[#F7F4EB]">{ticket.assignedStaffName}</b></div>
                      <div>Status: <b className={isResolved ? 'text-emerald-400' : 'text-[#D4AF37]'}>{ticket.status}</b></div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#0D231E] flex items-center justify-between">
                    <span className="text-[11px] text-[#F7F4EB]/50">
                      Reported by: {ticket.reportedBy}
                    </span>

                    {!isResolved ? (
                      <button
                        id={`resolve-ticket-btn-${ticket.id}`}
                        onClick={() => onResolveTicket(ticket.id, ticket.roomNumber)}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#D4AF37] hover:bg-[#e6c86e] text-[#0D231E] transition-all shadow-sm active:scale-95 flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0D231E]" />
                        <span>Resolve Ticket</span>
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Room Detail Modal */}
      <AnimatePresence>
        {inspectingRoom && (
          <div 
            id="room-specs-overlay"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#0D231E]/85 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              id="room-specs-modal"
              className="bg-[#1A3A32] border border-[#D4AF37]/30 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-[#0D231E] bg-[#1A3A32] flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 flex items-center justify-center">
                    <BedDouble className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-display text-[#F7F4EB]">
                      Suite {inspectingRoom.number} Specifications
                    </h3>
                    <p className="text-xs text-[#F7F4EB]/70">
                      Floor {inspectingRoom.floor} • {inspectingRoom.type}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setInspectingRoom(null)}
                  className="text-[#F7F4EB]/70 hover:text-[#F7F4EB] p-2 rounded-lg hover:bg-[#0D231E] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 overflow-y-auto">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#0D231E]/80 border border-[#1A3A32]">
                  <span className="text-xs text-[#F7F4EB]/70">Current Operational Status:</span>
                  <span className="text-xs font-bold text-[#D4AF37] bg-[#D4AF37]/15 px-2.5 py-1 rounded-lg border border-[#D4AF37]/30">
                    {inspectingRoom.status}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F7F4EB]/70 mb-2">
                    Room Amenities &amp; Features
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {inspectingRoom.amenities.map((amenity, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2.5 py-1 rounded-lg bg-[#0D231E] text-[#F7F4EB] border border-[#1A3A32]"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs text-[#F7F4EB]/80">
                  <div className="p-3 rounded-xl bg-[#0D231E]/80 border border-[#1A3A32]">
                    <span className="text-[#F7F4EB]/60 block text-[11px]">Max Capacity</span>
                    <span className="text-sm font-bold text-[#F7F4EB] mt-0.5 block">{inspectingRoom.maxGuests} Guests</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0D231E]/80 border border-[#1A3A32]">
                    <span className="text-[#F7F4EB]/60 block text-[11px]">Nightly Standard Rate</span>
                    <span className="text-sm font-bold text-[#D4AF37] mt-0.5 block">${inspectingRoom.pricePerNight}</span>
                  </div>
                </div>

                {inspectingRoom.currentGuest && (
                  <div className="p-3 rounded-xl bg-[#0D231E]/80 border border-[#1A3A32]">
                    <span className="text-[11px] uppercase tracking-wider text-[#F7F4EB]/60 block">Registered Occupant</span>
                    <span className="text-sm font-bold text-[#F7F4EB] mt-1 block">{inspectingRoom.currentGuest}</span>
                    <span className="text-[11px] text-[#F7F4EB]/70">Reservation Ref: {inspectingRoom.reservationId}</span>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-[#0D231E] bg-[#1A3A32] flex items-center justify-between">
                <button
                  onClick={() => {
                    const roomNum = inspectingRoom.number;
                    setInspectingRoom(null);
                    openNewTicketModal(roomNum);
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#D4AF37]/20 text-[#D4AF37] hover:bg-[#D4AF37]/30 border border-[#D4AF37]/30 transition-colors"
                >
                  Log Maintenance Issue
                </button>
                <button
                  onClick={() => setInspectingRoom(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#0D231E] text-[#F7F4EB]/80 hover:text-[#F7F4EB] transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
