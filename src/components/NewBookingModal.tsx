import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Calendar, 
  User, 
  Mail, 
  Phone, 
  BedDouble, 
  CreditCard, 
  Sparkles, 
  DollarSign,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Room, RoomType, PaymentStatus, Reservation } from '../types';

interface NewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableRooms: Room[];
  onCreateReservation: (reservation: Omit<Reservation, 'id' | 'createdAt' | 'folioBalance'>) => void;
}

export const NewBookingModal: React.FC<NewBookingModalProps> = ({
  isOpen,
  onClose,
  availableRooms,
  onCreateReservation,
}) => {
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [checkInDate, setCheckInDate] = useState('2026-09-16');
  const [checkOutDate, setCheckOutDate] = useState('2026-09-19');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [selectedRoomId, setSelectedRoomId] = useState<string>(availableRooms[0]?.id || '');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Paid in Full');
  const [specialRequests, setSpecialRequests] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const selectedRoom = availableRooms.find(r => r.id === selectedRoomId) || availableRooms[0];

  // Calculate nights
  const calculateNights = () => {
    try {
      const d1 = new Date(checkInDate);
      const d2 = new Date(checkOutDate);
      const diffTime = Math.abs(d2.getTime() - d1.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 1;
    } catch {
      return 1;
    }
  };

  const nights = calculateNights();
  const roomPricePerNight = selectedRoom?.pricePerNight || 320;
  const totalAmount = roomPricePerNight * nights;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      setErrorMsg('Please enter guest full name');
      return;
    }
    if (!selectedRoom) {
      setErrorMsg('Please select an available room');
      return;
    }

    onCreateReservation({
      guestName: guestName.trim(),
      guestEmail: guestEmail.trim() || `${guestName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      guestPhone: guestPhone.trim() || '+1 (555) 000-1234',
      roomId: selectedRoom.id,
      roomNumber: selectedRoom.number,
      roomType: selectedRoom.type,
      checkInDate,
      checkOutDate,
      adults,
      children,
      status: 'Confirmed',
      totalAmount,
      paymentStatus,
      specialRequests: specialRequests.trim(),
      idVerified: false,
      keyCardIssued: false,
    });

    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          id="new-booking-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#0D231E]/85 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            id="new-booking-modal"
            className="bg-[#1A3A32] border border-[#D4AF37]/30 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-[#0D231E] bg-[#1A3A32] flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#0D231E] text-[#D4AF37] border border-[#D4AF37]/40 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-[#F7F4EB] font-display">
                    New Guest Reservation
                  </h2>
                  <p className="text-xs text-[#F7F4EB]/70">
                    Create booking and allocate inventory in real-time
                  </p>
                </div>
              </div>

              <button
                id="close-new-booking-modal"
                onClick={onClose}
                className="text-[#F7F4EB]/70 hover:text-[#F7F4EB] p-2 rounded-lg hover:bg-[#0D231E] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Guest Details */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F7F4EB]/70 mb-3 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Guest Information</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-medium text-[#F7F4EB] mb-1">
                      Full Name *
                    </label>
                    <input
                      id="guest-name-input"
                      type="text"
                      required
                      placeholder="e.g. Lady Genevieve Vance"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full bg-[#0D231E] border border-[#1A3A32] focus:border-[#D4AF37] rounded-xl px-3 py-2 text-sm text-[#F7F4EB] placeholder:text-[#F7F4EB]/40 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#F7F4EB] mb-1">
                      Email Address
                    </label>
                    <input
                      id="guest-email-input"
                      type="email"
                      placeholder="genevieve@example.com"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="w-full bg-[#0D231E] border border-[#1A3A32] focus:border-[#D4AF37] rounded-xl px-3 py-2 text-sm text-[#F7F4EB] placeholder:text-[#F7F4EB]/40 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#F7F4EB] mb-1">
                      Phone Number
                    </label>
                    <input
                      id="guest-phone-input"
                      type="text"
                      placeholder="+1 (555) 234-5678"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="w-full bg-[#0D231E] border border-[#1A3A32] focus:border-[#D4AF37] rounded-xl px-3 py-2 text-sm text-[#F7F4EB] placeholder:text-[#F7F4EB]/40 outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Dates & Party Size */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F7F4EB]/70 mb-3 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Dates &amp; Occupancy</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#F7F4EB] mb-1">
                      Check-In Date
                    </label>
                    <input
                      id="checkin-date-input"
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="w-full bg-[#0D231E] border border-[#1A3A32] focus:border-[#D4AF37] rounded-xl px-3 py-2 text-sm text-[#F7F4EB] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#F7F4EB] mb-1">
                      Check-Out Date
                    </label>
                    <input
                      id="checkout-date-input"
                      type="date"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className="w-full bg-[#0D231E] border border-[#1A3A32] focus:border-[#D4AF37] rounded-xl px-3 py-2 text-sm text-[#F7F4EB] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#F7F4EB] mb-1">
                      Adults
                    </label>
                    <select
                      id="adults-select"
                      value={adults}
                      onChange={(e) => setAdults(Number(e.target.value))}
                      className="w-full bg-[#0D231E] border border-[#1A3A32] focus:border-[#D4AF37] rounded-xl px-3 py-2 text-sm text-[#F7F4EB] outline-none"
                    >
                      <option value={1}>1 Adult</option>
                      <option value={2}>2 Adults</option>
                      <option value={3}>3 Adults</option>
                      <option value={4}>4 Adults</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#F7F4EB] mb-1">
                      Children
                    </label>
                    <select
                      id="children-select"
                      value={children}
                      onChange={(e) => setChildren(Number(e.target.value))}
                      className="w-full bg-[#0D231E] border border-[#1A3A32] focus:border-[#D4AF37] rounded-xl px-3 py-2 text-sm text-[#F7F4EB] outline-none"
                    >
                      <option value={0}>0 Children</option>
                      <option value={1}>1 Child</option>
                      <option value={2}>2 Children</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Room Selection */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F7F4EB]/70 mb-3 flex items-center gap-1.5">
                  <BedDouble className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Assign Clean Room ({availableRooms.length} available)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto p-1">
                  {availableRooms.map((rm) => {
                    const isSelected = (selectedRoomId || availableRooms[0]?.id) === rm.id;
                    return (
                      <div
                        key={rm.id}
                        id={`room-select-${rm.number}`}
                        onClick={() => setSelectedRoomId(rm.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#0D231E] border-[#D4AF37] text-[#F7F4EB] shadow-md'
                            : 'bg-[#0D231E]/60 border-[#1A3A32] hover:border-[#D4AF37]/50 text-[#F7F4EB]/80'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#F7F4EB]">Room {rm.number}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1A3A32] text-[#D4AF37] font-mono border border-[#D4AF37]/20">
                              Floor {rm.floor}
                            </span>
                          </div>
                          <p className="text-xs text-[#F7F4EB]/60">{rm.type}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-sm text-[#D4AF37]">${rm.pricePerNight}</span>
                          <span className="text-[10px] text-[#F7F4EB]/50 block">/night</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment & Special Requests */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#F7F4EB] mb-1">
                    Payment Terms
                  </label>
                  <select
                    id="payment-status-select"
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                    className="w-full bg-[#0D231E] border border-[#1A3A32] focus:border-[#D4AF37] rounded-xl px-3 py-2 text-sm text-[#F7F4EB] outline-none"
                  >
                    <option value="Paid in Full">Paid in Full (Credit Card)</option>
                    <option value="Deposit Paid">Deposit Paid (50% held)</option>
                    <option value="Due on Arrival">Pay Due on Arrival at Desk</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#F7F4EB] mb-1">
                    Special Requests / VIP Notes
                  </label>
                  <input
                    id="special-requests-input"
                    type="text"
                    placeholder="e.g. Extra pillows, champagne, late arrival"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className="w-full bg-[#0D231E] border border-[#1A3A32] focus:border-[#D4AF37] rounded-xl px-3 py-2 text-sm text-[#F7F4EB] placeholder:text-[#F7F4EB]/40 outline-none"
                  />
                </div>
              </div>

              {/* Total Calculation Card */}
              <div className="p-4 rounded-xl bg-[#0D231E] border border-[#1A3A32] flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#F7F4EB]/70 block">Estimated Booking Total</span>
                  <span className="text-xs text-[#F7F4EB]/50">
                    {nights} nights @ ${roomPricePerNight}/night
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold font-display text-[#D4AF37]">
                    ${totalAmount.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-[#F7F4EB]/60 block">incl. luxury hospitality tax</span>
                </div>
              </div>

              {/* Footer CTA */}
              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#F7F4EB]/70 hover:bg-[#0D231E] hover:text-[#F7F4EB] transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="submit-create-booking-btn"
                  type="submit"
                  className="px-6 py-2 rounded-xl text-xs font-bold bg-[#D4AF37] hover:bg-[#e6c86e] text-[#0D231E] transition-all shadow-lg shadow-[#D4AF37]/20 active:scale-95 cursor-pointer"
                >
                  Confirm &amp; Allocate Room
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
