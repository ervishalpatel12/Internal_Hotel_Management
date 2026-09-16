import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Search, 
  Filter, 
  Plus, 
  User, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  KeyRound, 
  Phone, 
  Mail, 
  Radio, 
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { Reservation, ReservationStatus, RoomType, Room } from '../types';

interface BookingManagementProps {
  reservations: Reservation[];
  rooms: Room[];
  openNewBookingModal: () => void;
  onExpressCheckIn: (reservation: Reservation) => void;
  onExpressCheckOut: (reservation: Reservation) => void;
  onCancelReservation: (reservationId: string) => void;
  onQuickBackendSync: (action: string, endpoint: string) => void;
}

export const BookingManagement: React.FC<BookingManagementProps> = ({
  reservations,
  rooms,
  openNewBookingModal,
  onExpressCheckIn,
  onExpressCheckOut,
  onCancelReservation,
  onQuickBackendSync,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | ReservationStatus>('All');
  const [roomTypeFilter, setRoomTypeFilter] = useState<string>('All');

  // Filter reservations
  const filteredReservations = reservations.filter((res) => {
    const matchesSearch = 
      res.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.roomNumber.includes(searchQuery) ||
      res.guestEmail.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || res.status === statusFilter;
    const matchesRoomType = roomTypeFilter === 'All' || res.roomType === roomTypeFilter;

    return matchesSearch && matchesStatus && matchesRoomType;
  });

  const totalRevenue = reservations.reduce((sum, r) => sum + r.totalAmount, 0);
  const activeInHouseCount = reservations.filter(r => r.status === 'Checked In').length;
  const confirmedArrivalsCount = reservations.filter(r => r.status === 'Confirmed').length;

  return (
    <div id="booking-management-container" className="space-y-6 pb-12">
      {/* Top Banner with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-[#F7F4EB] tracking-tight">
            Guest Reservations &amp; Folios
          </h2>
          <p className="text-xs text-[#F7F4EB]/60 mt-0.5">
            Realtime reservation inventory, OTA bookings sync &amp; billing status
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            id="sync-ota-bookings-btn"
            onClick={() => onQuickBackendSync('OTA Reservations Pull (Expedia/Booking.com)', 'POST /api/v1/ota/sync-reservations')}
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-[#1A3A32] hover:bg-[#234d42] border border-[#1A3A32] hover:border-[#D4AF37]/50 text-xs font-semibold text-[#F7F4EB] transition-all cursor-pointer group"
          >
            <Radio className="w-3.5 h-3.5 text-[#D4AF37] group-hover:animate-pulse" />
            <span>Sync OTA Channels</span>
          </button>

          <button
            id="create-booking-primary-btn"
            onClick={openNewBookingModal}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#e6c86e] text-[#0D231E] font-bold text-xs shadow-lg shadow-[#D4AF37]/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Reservation</span>
          </button>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-[#1A3A32]/90 border border-[#1A3A32]">
          <span className="text-[11px] uppercase tracking-wider text-[#F7F4EB]/60 block">Total Bookings</span>
          <span className="text-2xl font-bold font-display text-[#F7F4EB] mt-1 block">{reservations.length}</span>
          <span className="text-[10px] text-[#F7F4EB]/40">active ledger records</span>
        </div>
        <div className="p-4 rounded-xl bg-[#1A3A32]/90 border border-[#1A3A32]">
          <span className="text-[11px] uppercase tracking-wider text-[#F7F4EB]/60 block">In-House Guests</span>
          <span className="text-2xl font-bold font-display text-emerald-400 mt-1 block">{activeInHouseCount}</span>
          <span className="text-[10px] text-[#F7F4EB]/40">currently occupied</span>
        </div>
        <div className="p-4 rounded-xl bg-[#1A3A32]/90 border border-[#1A3A32]">
          <span className="text-[11px] uppercase tracking-wider text-[#F7F4EB]/60 block">Upcoming Arrivals</span>
          <span className="text-2xl font-bold font-display text-[#D4AF37] mt-1 block">{confirmedArrivalsCount}</span>
          <span className="text-[10px] text-[#F7F4EB]/40">rooms pre-allocated</span>
        </div>
        <div className="p-4 rounded-xl bg-[#1A3A32]/90 border border-[#1A3A32]">
          <span className="text-[11px] uppercase tracking-wider text-[#F7F4EB]/60 block">Folio Volume</span>
          <span className="text-2xl font-bold font-display text-[#D4AF37] mt-1 block">${totalRevenue.toLocaleString()}</span>
          <span className="text-[10px] text-[#F7F4EB]/40">gross reservation revenue</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#1A3A32]/90 border border-[#1A3A32] rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#F7F4EB]/50 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="search-bookings-input"
            type="text"
            placeholder="Search guest, booking ID, or room..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0D231E]/80 border border-[#1A3A32] focus:border-[#D4AF37] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F7F4EB] placeholder:text-[#F7F4EB]/40 outline-none transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center bg-[#0D231E]/80 p-1 rounded-xl border border-[#1A3A32] text-xs">
            {(['All', 'Confirmed', 'Checked In', 'Checked Out', 'Cancelled'] as const).map((st) => (
              <button
                key={st}
                id={`filter-status-${st.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  statusFilter === st
                    ? 'bg-[#D4AF37] text-[#0D231E] font-bold'
                    : 'text-[#F7F4EB]/70 hover:text-[#F7F4EB]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <select
            id="filter-room-type-select"
            value={roomTypeFilter}
            onChange={(e) => setRoomTypeFilter(e.target.value)}
            className="bg-[#0D231E]/80 border border-[#1A3A32] focus:border-[#D4AF37] rounded-xl px-3 py-2 text-xs text-[#F7F4EB] outline-none"
          >
            <option value="All">All Room Tiers</option>
            <option value="Classic King">Classic King</option>
            <option value="Deluxe Queen">Deluxe Queen</option>
            <option value="Executive Suite">Executive Suite</option>
            <option value="Presidential Suite">Presidential Suite</option>
            <option value="Garden Terrace Villa">Garden Terrace Villa</option>
          </select>
        </div>
      </div>

      {/* Bookings Table / List */}
      <div className="bg-[#1A3A32]/90 border border-[#1A3A32] rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1A3A32] bg-[#0D231E]/90 text-[11px] uppercase tracking-wider text-[#F7F4EB]/60">
                <th className="py-3.5 px-4 font-semibold">Booking Ref &amp; Guest</th>
                <th className="py-3.5 px-4 font-semibold">Room &amp; Tier</th>
                <th className="py-3.5 px-4 font-semibold">Dates &amp; Stay</th>
                <th className="py-3.5 px-4 font-semibold">Folio &amp; Total</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A3A32]/70 text-xs">
              {filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#F7F4EB]/50">
                    No reservations match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredReservations.map((res) => {
                  const isCheckedIn = res.status === 'Checked In';
                  const isConfirmed = res.status === 'Confirmed';
                  const isCheckedOut = res.status === 'Checked Out';

                  return (
                    <tr 
                      key={res.id} 
                      className="hover:bg-[#0D231E]/40 transition-colors"
                    >
                      {/* Guest & ID */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-[#F7F4EB] text-sm">
                          {res.guestName}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[#F7F4EB]/60 text-[11px]">
                          <span className="font-mono text-[#D4AF37] font-medium">{res.id}</span>
                          <span>•</span>
                          <span>{res.guestEmail}</span>
                        </div>
                        {res.specialRequests && (
                          <div className="mt-1 text-[11px] text-[#D4AF37]/90 italic line-clamp-1">
                            Note: {res.specialRequests}
                          </div>
                        )}
                      </td>

                      {/* Room & Tier */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#F7F4EB]">Room {res.roomNumber}</span>
                          {res.keyCardIssued && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                              <KeyRound className="w-2.5 h-2.5" /> Key Active
                            </span>
                          )}
                        </div>
                        <span className="text-[#F7F4EB]/60 text-[11px] block">{res.roomType}</span>
                      </td>

                      {/* Dates */}
                      <td className="py-4 px-4">
                        <div className="text-[#F7F4EB]/90">
                          {res.checkInDate} → {res.checkOutDate}
                        </div>
                        <div className="text-[11px] text-[#F7F4EB]/60">
                          {res.adults} Adults {res.children > 0 ? `• ${res.children} Children` : ''}
                        </div>
                      </td>

                      {/* Payment */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-[#F7F4EB] text-sm">
                          ${res.totalAmount.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            res.paymentStatus === 'Paid in Full'
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : res.paymentStatus === 'Deposit Paid'
                              ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40'
                              : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          }`}>
                            {res.paymentStatus}
                          </span>
                          {res.folioBalance > 0 && (
                            <span className="text-[10px] text-rose-300">
                              Bal: ${res.folioBalance}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          isCheckedIn
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : isConfirmed
                            ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30'
                            : isCheckedOut
                            ? 'bg-[#0D231E] text-[#F7F4EB]/60 border border-[#1A3A32]'
                            : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            isCheckedIn ? 'bg-emerald-400' : isConfirmed ? 'bg-[#D4AF37]' : 'bg-[#F7F4EB]/40'
                          }`} />
                          {res.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {isConfirmed && (
                            <button
                              id={`table-checkin-btn-${res.id}`}
                              onClick={() => onExpressCheckIn(res)}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#D4AF37] hover:bg-[#e6c86e] text-[#0D231E] transition-all shadow-sm active:scale-95 cursor-pointer"
                            >
                              Check-In
                            </button>
                          )}

                          {isCheckedIn && (
                            <button
                              id={`table-checkout-btn-${res.id}`}
                              onClick={() => onExpressCheckOut(res)}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#D4AF37] hover:bg-[#e6c86e] text-[#0D231E] transition-all shadow-sm active:scale-95 cursor-pointer"
                            >
                              Check-Out
                            </button>
                          )}

                          <button
                            id={`sync-single-res-${res.id}`}
                            onClick={() => onQuickBackendSync(`Sync Reservation ${res.id} to Cloud DB`, `PUT /api/v1/reservations/${res.id}`)}
                            title="Sync record with Cloud Backend"
                            className="p-1.5 rounded-lg text-[#F7F4EB]/50 hover:text-[#D4AF37] hover:bg-[#0D231E] transition-colors cursor-pointer"
                          >
                            <Radio className="w-3.5 h-3.5" />
                          </button>

                          {isConfirmed && (
                            <button
                              id={`cancel-res-${res.id}`}
                              onClick={() => onCancelReservation(res.id)}
                              title="Cancel Reservation"
                              className="text-[11px] text-rose-400 hover:text-rose-300 hover:underline px-1.5 py-1 cursor-pointer"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
