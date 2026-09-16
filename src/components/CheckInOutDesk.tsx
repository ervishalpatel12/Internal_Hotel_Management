import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  KeyRound, 
  UserCheck, 
  CreditCard, 
  LogOut, 
  LogIn, 
  ShieldCheck, 
  Sparkles, 
  Radio, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  X, 
  Wifi, 
  DollarSign, 
  Receipt, 
  Printer, 
  Send
} from 'lucide-react';
import { Reservation, Room } from '../types';

interface CheckInOutDeskProps {
  reservations: Reservation[];
  rooms: Room[];
  onConfirmCheckIn: (reservationId: string, keycardCode: string) => void;
  onConfirmCheckOut: (reservationId: string, finalFolioTotal: number) => void;
  onQuickBackendSync: (action: string, endpoint: string) => void;
  activeCheckInTarget: Reservation | null;
  setActiveCheckInTarget: (res: Reservation | null) => void;
  activeCheckOutTarget: Reservation | null;
  setActiveCheckOutTarget: (res: Reservation | null) => void;
}

export const CheckInOutDesk: React.FC<CheckInOutDeskProps> = ({
  reservations,
  rooms,
  onConfirmCheckIn,
  onConfirmCheckOut,
  onQuickBackendSync,
  activeCheckInTarget,
  setActiveCheckInTarget,
  activeCheckOutTarget,
  setActiveCheckOutTarget,
}) => {
  const [subTab, setSubTab] = useState<'arrivals' | 'inhouse' | 'departures'>('arrivals');

  // Check-In Modal state
  const [idVerified, setIdVerified] = useState(true);
  const [isEncodingCard, setIsEncodingCard] = useState(false);
  const [cardEncoded, setCardEncoded] = useState(false);
  const [keycardUid, setKeycardUid] = useState('RFID-9842-NFC');

  // Check-Out Modal state
  const [keyReturned, setKeyReturned] = useState(true);
  const [minibarCharge, setMinibarCharge] = useState(35);
  const [roomServiceCharge, setRoomServiceCharge] = useState(45);

  const pendingArrivals = reservations.filter(r => r.status === 'Confirmed');
  const inHouseGuests = reservations.filter(r => r.status === 'Checked In');
  // Departures: In-house guests scheduled to depart
  const todayDepartures = inHouseGuests.filter(r => r.checkOutDate <= '2026-09-17');

  const startCheckIn = (res: Reservation) => {
    setActiveCheckInTarget(res);
    setIdVerified(true);
    setCardEncoded(false);
    setKeycardUid(`RFID-${res.roomNumber}-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  const startCheckOut = (res: Reservation) => {
    setActiveCheckOutTarget(res);
    setKeyReturned(true);
    setMinibarCharge(Math.floor(Math.random() * 40) + 15);
    setRoomServiceCharge(Math.floor(Math.random() * 60) + 20);
  };

  const handleSimulateKeyEncoding = () => {
    setIsEncodingCard(true);
    setTimeout(() => {
      setIsEncodingCard(false);
      setCardEncoded(true);
      onQuickBackendSync('Hardware RFID Encoder Link', `RPC /hardware/encoder/issue/${keycardUid}`);
    }, 900);
  };

  const handleFinishCheckIn = () => {
    if (!activeCheckInTarget) return;
    onConfirmCheckIn(activeCheckInTarget.id, keycardUid);
    setActiveCheckInTarget(null);
  };

  const handleFinishCheckOut = () => {
    if (!activeCheckOutTarget) return;
    const finalAmount = activeCheckOutTarget.folioBalance + minibarCharge + roomServiceCharge;
    onConfirmCheckOut(activeCheckOutTarget.id, finalAmount);
    setActiveCheckOutTarget(null);
  };

  return (
    <div id="check-in-out-desk-container" className="space-y-6 pb-12">
      {/* Station Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-[#F7F4EB] tracking-tight">
            Front Desk Concierge &amp; Key Station
          </h2>
          <p className="text-xs text-[#F7F4EB]/60 mt-0.5">
            Express identity verification, RFID keycard programming, and folio settlement
          </p>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center bg-[#0D231E]/90 p-1.5 rounded-xl border border-[#1A3A32]">
          <button
            id="subtab-arrivals-btn"
            onClick={() => setSubTab('arrivals')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              subTab === 'arrivals'
                ? 'bg-[#D4AF37] text-[#0D231E] font-bold shadow-md shadow-[#D4AF37]/20'
                : 'text-[#F7F4EB]/60 hover:text-[#F7F4EB]'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Arrivals ({pendingArrivals.length})</span>
          </button>

          <button
            id="subtab-inhouse-btn"
            onClick={() => setSubTab('inhouse')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              subTab === 'inhouse'
                ? 'bg-emerald-500 text-[#0D231E] font-bold shadow-md shadow-emerald-500/20'
                : 'text-[#F7F4EB]/60 hover:text-[#F7F4EB]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>In-House ({inHouseGuests.length})</span>
          </button>

          <button
            id="subtab-departures-btn"
            onClick={() => setSubTab('departures')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              subTab === 'departures'
                ? 'bg-[#D4AF37] text-[#0D231E] font-bold shadow-md shadow-[#D4AF37]/20'
                : 'text-[#F7F4EB]/60 hover:text-[#F7F4EB]'
            }`}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Departures ({todayDepartures.length})</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {subTab === 'arrivals' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-[#F7F4EB]/60 px-1">
            <span>Guests scheduled for check-in today</span>
            <button
              onClick={() => onQuickBackendSync('Sync Pre-Check-in Digital Mobile Keys', 'POST /api/v1/mobile-keys/push')}
              className="text-[#D4AF37] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Broadcast Mobile Check-in Link</span>
            </button>
          </div>

          {pendingArrivals.length === 0 ? (
            <div className="bg-[#1A3A32]/90 border border-[#1A3A32] rounded-2xl p-12 text-center text-[#F7F4EB]/60">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="font-semibold text-[#F7F4EB]">All scheduled arrivals have been checked in.</p>
              <p className="text-xs text-[#F7F4EB]/50 mt-1">Ready for walk-ins or new reservation creations.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingArrivals.map((res) => {
                const room = rooms.find(r => r.number === res.roomNumber);
                const isRoomClean = room?.status === 'Clean & Available';

                return (
                  <div
                    key={res.id}
                    id={`arrival-card-${res.id}`}
                    className="bg-[#1A3A32]/90 border border-[#1A3A32] hover:border-[#D4AF37]/40 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-xs font-mono text-[#D4AF37] font-semibold">{res.id}</span>
                          <h4 className="text-base font-bold text-[#F7F4EB] mt-0.5">{res.guestName}</h4>
                        </div>
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                          Room {res.roomNumber}
                        </span>
                      </div>

                      <div className="mt-3 space-y-1.5 text-xs text-[#F7F4EB]/80">
                        <div className="flex items-center justify-between">
                          <span className="text-[#F7F4EB]/60">Room Tier:</span>
                          <span className="font-medium text-[#F7F4EB]">{res.roomType}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#F7F4EB]/60">Dates:</span>
                          <span>{res.checkInDate} → {res.checkOutDate}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#F7F4EB]/60">Party:</span>
                          <span>{res.adults} Adults {res.children > 0 ? `, ${res.children} Child` : ''}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#F7F4EB]/60">Room Readiness:</span>
                          <span className={isRoomClean ? 'text-emerald-400 font-semibold flex items-center gap-1' : 'text-[#D4AF37] font-semibold'}>
                            {isRoomClean ? <><CheckCircle2 className="w-3 h-3" /> Ready for Guest</> : room?.status}
                          </span>
                        </div>
                      </div>

                      {res.specialRequests && (
                        <div className="mt-3 p-2.5 rounded-xl bg-[#0D231E]/80 border border-[#1A3A32] text-[11px] text-[#D4AF37]/90 italic">
                          &ldquo;{res.specialRequests}&rdquo;
                        </div>
                      )}
                    </div>

                    <div className="mt-5 pt-3 border-t border-[#1A3A32] flex items-center justify-between">
                      <div className="text-xs font-semibold text-[#F7F4EB]/80">
                        Total: <b className="text-[#F7F4EB]">${res.totalAmount.toLocaleString()}</b>
                      </div>

                      <button
                        id={`start-express-checkin-${res.id}`}
                        onClick={() => startCheckIn(res)}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-[#D4AF37] hover:bg-[#e6c86e] text-[#0D231E] transition-all shadow-md shadow-[#D4AF37]/20 active:scale-95 flex items-center gap-1.5 cursor-pointer"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Express Check-In</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* In-House Guests Tab */}
      {subTab === 'inhouse' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inHouseGuests.map((res) => (
              <div
                key={res.id}
                className="bg-[#1A3A32]/90 border border-[#1A3A32] rounded-2xl p-5 shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-mono text-emerald-400 font-semibold">Active Stay</span>
                      <h4 className="text-base font-bold text-[#F7F4EB] mt-0.5">{res.guestName}</h4>
                    </div>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      Room {res.roomNumber}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs text-[#F7F4EB]/80">
                    <div className="flex items-center justify-between">
                      <span className="text-[#F7F4EB]/60">Room Tier:</span>
                      <span className="font-medium text-[#F7F4EB]">{res.roomType}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#F7F4EB]/60">Departure Date:</span>
                      <span className="text-[#D4AF37] font-medium">{res.checkOutDate}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#F7F4EB]/60">Keycard Status:</span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <KeyRound className="w-3 h-3" /> Active RFID
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#F7F4EB]/60">Folio Balance:</span>
                      <span className={res.folioBalance > 0 ? 'text-[#D4AF37] font-bold' : 'text-[#F7F4EB]/60'}>
                        ${res.folioBalance}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-[#1A3A32] flex items-center justify-between">
                  <button
                    onClick={() => onQuickBackendSync(`Audit Folio for ${res.guestName}`, `GET /api/v1/billing/folio/${res.id}`)}
                    className="text-xs text-[#F7F4EB]/60 hover:text-[#D4AF37] flex items-center gap-1 cursor-pointer"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Folio Audit</span>
                  </button>

                  <button
                    id={`start-checkout-${res.id}`}
                    onClick={() => startCheckOut(res)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#D4AF37] hover:bg-[#e6c86e] text-[#0D231E] transition-all shadow-sm active:scale-95 cursor-pointer"
                  >
                    Express Check-Out
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Departures Tab */}
      {subTab === 'departures' && (
        <div className="space-y-3">
          <div className="text-xs text-[#F7F4EB]/60 px-1">
            Guests scheduled for checkout today or tomorrow
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todayDepartures.map((res) => (
              <div
                key={res.id}
                className="bg-[#1A3A32]/90 border border-[#1A3A32] rounded-2xl p-5 shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-mono text-[#D4AF37] font-semibold">Ready for Checkout</span>
                      <h4 className="text-base font-bold text-[#F7F4EB] mt-0.5">{res.guestName}</h4>
                    </div>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                      Room {res.roomNumber}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs text-[#F7F4EB]/80">
                    <div className="flex items-center justify-between">
                      <span className="text-[#F7F4EB]/60">Folio Balance:</span>
                      <span className="font-bold text-[#D4AF37]">${res.folioBalance}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#F7F4EB]/60">Total Stay:</span>
                      <span>${res.totalAmount}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-[#1A3A32] flex items-center justify-end">
                  <button
                    onClick={() => startCheckOut(res)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#D4AF37] hover:bg-[#e6c86e] text-[#0D231E] transition-all shadow-md shadow-[#D4AF37]/20 active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Settle &amp; Check-Out</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Express Check-In Modal with RFID Card Issuing Simulator */}
      <AnimatePresence>
        {activeCheckInTarget && (
          <div 
            id="express-checkin-overlay"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#0D231E]/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              id="express-checkin-modal"
              className="bg-[#1A3A32] border border-[#1A3A32] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-6 border-b border-[#0D231E] bg-[#1A3A32] flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 flex items-center justify-center">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-display text-[#F7F4EB]">
                      Express Check-In Desk
                    </h3>
                    <p className="text-xs text-[#F7F4EB]/60">
                      Issuing keys &amp; activating room occupancy
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveCheckInTarget(null)}
                  className="text-[#F7F4EB]/60 hover:text-[#F7F4EB] p-2 rounded-lg hover:bg-[#0D231E] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5 overflow-y-auto">
                {/* Guest Summary Card */}
                <div className="p-4 rounded-xl bg-[#0D231E]/80 border border-[#1A3A32] space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-[#F7F4EB]/60 font-mono">
                        {activeCheckInTarget.id}
                      </span>
                      <h4 className="text-lg font-bold text-[#F7F4EB]">
                        {activeCheckInTarget.guestName}
                      </h4>
                    </div>
                    <span className="text-sm font-bold text-[#D4AF37] bg-[#D4AF37]/15 px-3 py-1 rounded-xl border border-[#D4AF37]/30">
                      Room {activeCheckInTarget.roomNumber}
                    </span>
                  </div>
                  <div className="text-xs text-[#F7F4EB]/80 grid grid-cols-2 gap-2 pt-1">
                    <div>Dates: <b>{activeCheckInTarget.checkInDate} → {activeCheckInTarget.checkOutDate}</b></div>
                    <div>Category: <b>{activeCheckInTarget.roomType}</b></div>
                    <div>Party: <b>{activeCheckInTarget.adults} Adults {activeCheckInTarget.children > 0 ? `, ${activeCheckInTarget.children} Children` : ''}</b></div>
                    <div>Payment: <b>{activeCheckInTarget.paymentStatus}</b></div>
                  </div>
                </div>

                {/* Step 1: ID Verification */}
                <div className="p-4 rounded-xl bg-[#0D231E]/60 border border-[#1A3A32] flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#F7F4EB] block">Government ID / Passport Verified</span>
                      <span className="text-[11px] text-[#F7F4EB]/60">Identity matched with reservation name</span>
                    </div>
                  </div>
                  <input
                    id="verify-id-checkbox"
                    type="checkbox"
                    checked={idVerified}
                    onChange={(e) => setIdVerified(e.target.checked)}
                    className="w-4 h-4 rounded text-[#D4AF37] focus:ring-[#D4AF37] bg-[#0D231E] border-[#1A3A32] cursor-pointer"
                  />
                </div>

                {/* Step 2: Digital Keycard Simulator (Motion Animation) */}
                <div className="p-5 rounded-xl bg-gradient-to-b from-[#0D231E] to-[#1A3A32] border border-[#1A3A32] space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F7F4EB] flex items-center gap-1.5">
                      <Wifi className="w-4 h-4 text-[#D4AF37]" />
                      <span>Smart RFID Keycard Programming</span>
                    </span>
                    <span className="text-[11px] font-mono text-[#F7F4EB]/60">
                      {keycardUid}
                    </span>
                  </div>

                  {/* Visual Luxury Keycard */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="relative w-full h-36 rounded-2xl p-4 bg-gradient-to-tr from-[#0D231E] via-[#1A3A32] to-[#D4AF37]/20 border border-[#D4AF37]/50 shadow-xl flex flex-col justify-between overflow-hidden"
                  >
                    <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-[#D4AF37]/10 blur-xl pointer-events-none" />
                    
                    <div className="flex items-center justify-between">
                      <span className="font-display font-bold text-sm tracking-wider text-[#D4AF37]">
                        AURA GRAND
                      </span>
                      <div className="flex items-center gap-1 text-[10px] text-[#D4AF37] font-mono">
                        <Wifi className="w-3 h-3 animate-pulse" />
                        <span>NFC SMART LOCK</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-2xl font-bold font-display text-[#F7F4EB]">
                        Suite {activeCheckInTarget.roomNumber}
                      </div>
                      <div className="text-[11px] text-[#F7F4EB]/70">
                        Guest: {activeCheckInTarget.guestName}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-[#F7F4EB]/60 pt-1 border-t border-[#1A3A32]">
                      <span>EXP: {activeCheckInTarget.checkOutDate}</span>
                      <span className={cardEncoded ? 'text-emerald-400 font-bold' : 'text-[#D4AF37]'}>
                        {cardEncoded ? 'TOKEN ENCODED & ACTIVE' : 'AWAITING HARDWARE ENCODER'}
                      </span>
                    </div>
                  </motion.div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      id="encode-keycard-trigger-btn"
                      type="button"
                      onClick={handleSimulateKeyEncoding}
                      disabled={isEncodingCard}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-[#D4AF37] hover:bg-[#e6c86e] text-[#0D231E] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${isEncodingCard ? 'animate-spin' : ''}`} />
                      <span>{isEncodingCard ? 'Encoding NFC Token...' : cardEncoded ? 'Re-Encode Key' : 'Encode Physical Keycard'}</span>
                    </button>

                    <span className="text-[11px] text-[#F7F4EB]/60 flex items-center gap-1">
                      <Radio className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Hardware encoder integration in progress</span>
                    </span>
                  </div>
                </div>

                {/* Pre-Authorization Deposit Notice */}
                <div className="text-xs text-[#F7F4EB]/60 flex items-center justify-between px-2">
                  <span>Incidentals Pre-Auth Hold:</span>
                  <span className="font-semibold text-[#F7F4EB]">$250.00 (Standard Security Hold)</span>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-[#0D231E] bg-[#1A3A32] flex items-center justify-end space-x-3">
                <button
                  onClick={() => setActiveCheckInTarget(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#F7F4EB]/70 hover:bg-[#0D231E] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="confirm-complete-checkin-btn"
                  onClick={handleFinishCheckIn}
                  className="px-6 py-2 rounded-xl text-xs font-bold bg-[#D4AF37] hover:bg-[#e6c86e] text-[#0D231E] transition-all shadow-lg shadow-[#D4AF37]/20 active:scale-95 cursor-pointer"
                >
                  Complete Check-In &amp; Hand Keys
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Express Check-Out Modal */}
      <AnimatePresence>
        {activeCheckOutTarget && (
          <div 
            id="express-checkout-overlay"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#0D231E]/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              id="express-checkout-modal"
              className="bg-[#1A3A32] border border-[#1A3A32] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-6 border-b border-[#0D231E] bg-[#1A3A32] flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 flex items-center justify-center">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-display text-[#F7F4EB]">
                      Guest Check-Out &amp; Folio Settlement
                    </h3>
                    <p className="text-xs text-[#F7F4EB]/60">
                      Room {activeCheckOutTarget.roomNumber} • {activeCheckOutTarget.guestName}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveCheckOutTarget(null)}
                  className="text-[#F7F4EB]/60 hover:text-[#F7F4EB] p-2 rounded-lg hover:bg-[#0D231E] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5 overflow-y-auto">
                {/* Itemized Folio Calculation */}
                <div className="space-y-3 bg-[#0D231E]/80 p-4 rounded-xl border border-[#1A3A32]">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F7F4EB]/60">
                    Final Folio Ledger
                  </h4>
                  
                  <div className="space-y-2 text-xs text-[#F7F4EB]/80">
                    <div className="flex items-center justify-between">
                      <span>Room Nights ({activeCheckOutTarget.roomType})</span>
                      <span className="font-medium text-[#F7F4EB]">${activeCheckOutTarget.totalAmount} (Paid)</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Prior Outstanding Incidentals</span>
                      <span className="font-medium text-[#F7F4EB]">${activeCheckOutTarget.folioBalance}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Minibar Final Inspection</span>
                      <div className="flex items-center gap-1">
                        <span className="text-[#F7F4EB]/50">$</span>
                        <input
                          type="number"
                          value={minibarCharge}
                          onChange={(e) => setMinibarCharge(Number(e.target.value))}
                          className="w-16 bg-[#1A3A32] border border-[#1A3A32] focus:border-[#D4AF37] rounded px-2 py-0.5 text-right text-xs text-[#F7F4EB] outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Room Service / Dining Bar</span>
                      <div className="flex items-center gap-1">
                        <span className="text-[#F7F4EB]/50">$</span>
                        <input
                          type="number"
                          value={roomServiceCharge}
                          onChange={(e) => setRoomServiceCharge(Number(e.target.value))}
                          className="w-16 bg-[#1A3A32] border border-[#1A3A32] focus:border-[#D4AF37] rounded px-2 py-0.5 text-right text-xs text-[#F7F4EB] outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#1A3A32] flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F7F4EB]">Final Settlement Due</span>
                    <span className="text-xl font-bold font-display text-[#D4AF37]">
                      ${(activeCheckOutTarget.folioBalance + minibarCharge + roomServiceCharge).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Key Return Confirmation */}
                <div className="p-4 rounded-xl bg-[#0D231E]/60 border border-[#1A3A32] flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-[#D4AF37]/15 text-[#D4AF37]">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#F7F4EB] block">RFID Keycard Returned</span>
                      <span className="text-[11px] text-[#F7F4EB]/60">Keycard deactivated from room lock</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={keyReturned}
                    onChange={(e) => setKeyReturned(e.target.checked)}
                    className="w-4 h-4 rounded text-[#D4AF37] focus:ring-[#D4AF37] bg-[#0D231E] border-[#1A3A32] cursor-pointer"
                  />
                </div>

                <div className="p-3 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-xs text-[#D4AF37] flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    Completing check-out will automatically mark Room {activeCheckOutTarget.roomNumber} as <b>&ldquo;Dirty&rdquo;</b> and alert Executive Housekeeping for room turnover.
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-[#0D231E] bg-[#1A3A32] flex items-center justify-end space-x-3">
                <button
                  onClick={() => setActiveCheckOutTarget(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#F7F4EB]/70 hover:bg-[#0D231E] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="confirm-complete-checkout-btn"
                  onClick={handleFinishCheckOut}
                  className="px-6 py-2 rounded-xl text-xs font-bold bg-[#D4AF37] hover:bg-[#e6c86e] text-[#0D231E] transition-all shadow-lg shadow-[#D4AF37]/20 active:scale-95 cursor-pointer"
                >
                  Settle Folio &amp; Release Room
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
