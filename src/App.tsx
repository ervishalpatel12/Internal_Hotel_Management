/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  INITIAL_ROOMS, 
  INITIAL_RESERVATIONS, 
  INITIAL_MAINTENANCE_TICKETS, 
  INITIAL_STAFF, 
  INITIAL_SYNC_EVENTS 
} from './data/mockHotelData';
import { 
  Room, 
  Reservation, 
  MaintenanceTicket, 
  StaffMember, 
  BackendSyncEvent, 
  RoomStatus, 
  DutyStatus 
} from './types';
import { Header, ActiveTab } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { BookingManagement } from './components/BookingManagement';
import { CheckInOutDesk } from './components/CheckInOutDesk';
import { RoomMaintenance } from './components/RoomMaintenance';
import { StaffManagement } from './components/StaffManagement';
import { CanvasScrollAnimation } from './components/CanvasScrollAnimation';
import { BackendIntegrationModal } from './components/BackendIntegrationModal';
import { NewBookingModal } from './components/NewBookingModal';
import { NewMaintenanceModal } from './components/NewMaintenanceModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { Radio, Sparkles, Building2 } from 'lucide-react';

export default function App() {
  // Core Operational State
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [reservations, setReservations] = useState<Reservation[]>(INITIAL_RESERVATIONS);
  const [maintenanceTickets, setMaintenanceTickets] = useState<MaintenanceTicket[]>(INITIAL_MAINTENANCE_TICKETS);
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [syncEvents, setSyncEvents] = useState<BackendSyncEvent[]>(INITIAL_SYNC_EVENTS);

  // Active Navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Modals & Drawers
  const [isBackendModalOpen, setIsBackendModalOpen] = useState(false);
  const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false);
  const [isNewMaintenanceModalOpen, setIsNewMaintenanceModalOpen] = useState(false);
  const [maintenanceDefaultRoom, setMaintenanceDefaultRoom] = useState<string | undefined>(undefined);

  // Focused Check-in / Check-out Targets
  const [activeCheckInTarget, setActiveCheckInTarget] = useState<Reservation | null>(null);
  const [activeCheckOutTarget, setActiveCheckOutTarget] = useState<Reservation | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (
    type: ToastMessage['type'],
    title: string,
    description?: string
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts(prev => [...prev.slice(-3), { id, type, title, description }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Backend Integration Trigger Simulator
  const handleQuickBackendSync = (actionName: string, endpoint: string) => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    const newEvent: BackendSyncEvent = {
      id: `sync-${Date.now()}`,
      timestamp: time,
      module: actionName.includes('OTA') ? 'OTA Channels' : actionName.includes('RFID') ? 'Keycard Encoder' : 'Cloud PMS API',
      endpoint,
      action: actionName,
      statusText: 'Integration in progress • Webhook queue simulated',
    };

    setSyncEvents(prev => [newEvent, ...prev.slice(0, 19)]);
    addToast(
      'integration',
      'Backend Integration In Progress',
      `${actionName} simulated via ${endpoint}. Data is persisted locally.`
    );
  };

  // Create New Booking Handler
  const handleCreateReservation = (
    newResData: Omit<Reservation, 'id' | 'createdAt' | 'folioBalance'>
  ) => {
    const resId = `RES-${Math.floor(1060 + Math.random() * 9000)}`;
    const newRes: Reservation = {
      ...newResData,
      id: resId,
      folioBalance: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setReservations(prev => [newRes, ...prev]);

    // If reservation is for today, update room if necessary
    addToast(
      'success',
      `Reservation ${resId} Confirmed`,
      `Allocated Suite ${newRes.roomNumber} for ${newRes.guestName}.`
    );

    handleQuickBackendSync(
      `OTA Parity & Reservation Ingestion: ${resId}`,
      `POST /api/v1/reservations/${resId}`
    );
  };

  // Express Check-In Handler
  const handleConfirmCheckIn = (reservationId: string, keycardCode: string) => {
    const targetRes = reservations.find(r => r.id === reservationId);
    if (!targetRes) return;

    // Update reservation status
    setReservations(prev =>
      prev.map(r =>
        r.id === reservationId
          ? { ...r, status: 'Checked In', keyCardIssued: true, idVerified: true }
          : r
      )
    );

    // Update room status to Occupied
    setRooms(prev =>
      prev.map(rm =>
        rm.number === targetRes.roomNumber
          ? {
              ...rm,
              status: 'Occupied',
              currentGuest: targetRes.guestName,
              reservationId: targetRes.id,
              keyCardCode: keycardCode,
            }
          : rm
      )
    );

    addToast(
      'success',
      `Guest Checked In: ${targetRes.guestName}`,
      `Suite ${targetRes.roomNumber} is now Occupied. RFID key ${keycardCode} activated.`
    );

    handleQuickBackendSync(
      `Hardware RFID Keycard Issued for Room ${targetRes.roomNumber}`,
      `RPC /hardware/encoder/${keycardCode}/activate`
    );
  };

  // Express Check-Out Handler
  const handleConfirmCheckOut = (reservationId: string, finalFolioTotal: number) => {
    const targetRes = reservations.find(r => r.id === reservationId);
    if (!targetRes) return;

    // Update reservation
    setReservations(prev =>
      prev.map(r =>
        r.id === reservationId
          ? { ...r, status: 'Checked Out', folioBalance: 0, totalAmount: r.totalAmount + (finalFolioTotal - r.folioBalance) }
          : r
      )
    );

    // Update room to Dirty (needs housekeeping turnover!)
    setRooms(prev =>
      prev.map(rm =>
        rm.number === targetRes.roomNumber
          ? {
              ...rm,
              status: 'Dirty',
              currentGuest: undefined,
              reservationId: undefined,
              keyCardCode: undefined,
            }
          : rm
      )
    );

    addToast(
      'warning',
      `Check-Out Complete: Suite ${targetRes.roomNumber}`,
      `Folio settled ($${finalFolioTotal.toFixed(2)}). Room marked Dirty for housekeeping.`
    );

    handleQuickBackendSync(
      `Room ${targetRes.roomNumber} Turnover Dispatched to Housekeeping`,
      `PUT /api/v1/housekeeping/rooms/${targetRes.roomNumber}/status`
    );
  };

  // Cancel Reservation Handler
  const handleCancelReservation = (reservationId: string) => {
    const res = reservations.find(r => r.id === reservationId);
    if (!res) return;

    setReservations(prev =>
      prev.map(r =>
        r.id === reservationId ? { ...r, status: 'Cancelled' } : r
      )
    );

    addToast('info', `Reservation ${reservationId} Cancelled`, `Guest ${res.guestName}`);
    handleQuickBackendSync(`Cancel Reservation ${reservationId}`, `DELETE /api/v1/reservations/${reservationId}`);
  };

  // Update Room Status Handler
  const handleUpdateRoomStatus = (roomId: string, newStatus: RoomStatus) => {
    const target = rooms.find(r => r.id === roomId);
    if (!target) return;

    setRooms(prev =>
      prev.map(r => (r.id === roomId ? { ...r, status: newStatus } : r))
    );

    addToast('info', `Room ${target.number} Status Updated`, `Now set to ${newStatus}`);
    handleQuickBackendSync(
      `Room ${target.number} Status Change (${newStatus})`,
      `PUT /api/v1/rooms/${target.number}/status`
    );
  };

  // Batch Clean All Dirty Rooms
  const handleBatchCleanDirtyRooms = () => {
    const dirtyCount = rooms.filter(r => r.status === 'Dirty').length;
    setRooms(prev =>
      prev.map(r => (r.status === 'Dirty' ? { ...r, status: 'Clean & Available', lastCleaned: 'Just Now' } : r))
    );

    addToast(
      'success',
      `Housekeeping Batch Turnover Complete`,
      `All ${dirtyCount} dirty rooms marked Clean & Available.`
    );

    handleQuickBackendSync(
      `Housekeeping Shift Turnover (${dirtyCount} Rooms Sanitized)`,
      `POST /api/v1/housekeeping/batch-turnover`
    );
  };

  // Create Maintenance Ticket Handler
  const handleCreateTicket = (
    newTicketData: Omit<MaintenanceTicket, 'id' | 'createdAt' | 'status'>
  ) => {
    const ticketId = `TICK-${Math.floor(420 + Math.random() * 500)}`;
    const newTicket: MaintenanceTicket = {
      ...newTicketData,
      id: ticketId,
      status: 'Open',
      createdAt: 'Today, Just Now',
    };

    setMaintenanceTickets(prev => [newTicket, ...prev]);

    // If urgent or high priority, mark room out of service
    if (newTicket.priority === 'Urgent' || newTicket.priority === 'High') {
      setRooms(prev =>
        prev.map(r =>
          r.number === newTicket.roomNumber
            ? { ...r, status: 'Maintenance', maintenanceIssue: newTicket.title }
            : r
        )
      );
    }

    addToast(
      'warning',
      `Work Order ${ticketId} Dispatched`,
      `Room ${newTicket.roomNumber} assigned to ${newTicket.assignedStaffName}.`
    );

    handleQuickBackendSync(
      `Facilities Engineering Work Order ${ticketId}`,
      `POST /api/v1/facilities/tickets/${ticketId}`
    );
  };

  // Resolve Maintenance Ticket Handler
  const handleResolveTicket = (ticketId: string, roomNumber: string) => {
    setMaintenanceTickets(prev =>
      prev.map(t =>
        t.id === ticketId
          ? { ...t, status: 'Resolved', resolutionNotes: 'Repaired & safety inspected.' }
          : t
      )
    );

    // If room was in Maintenance, return it to Clean & Available
    setRooms(prev =>
      prev.map(r =>
        r.number === roomNumber && r.status === 'Maintenance'
          ? { ...r, status: 'Clean & Available', maintenanceIssue: undefined, lastCleaned: 'Just Now' }
          : r
      )
    );

    addToast(
      'success',
      `Work Order ${ticketId} Resolved`,
      `Room ${roomNumber} restored to Clean & Available status.`
    );

    handleQuickBackendSync(
      `Maintenance Ticket ${ticketId} Closed & Inspected`,
      `PUT /api/v1/facilities/tickets/${ticketId}/resolve`
    );
  };

  // Toggle Staff Duty Status
  const handleToggleDutyStatus = (staffId: string, newStatus: DutyStatus) => {
    const target = staff.find(s => s.id === staffId);
    if (!target) return;

    setStaff(prev =>
      prev.map(s => (s.id === staffId ? { ...s, status: newStatus } : s))
    );

    addToast(
      'info',
      `${target.name} Status: ${newStatus}`,
      `Department: ${target.department}`
    );

    handleQuickBackendSync(
      `Staff ${target.name} Shift Status (${newStatus})`,
      `PUT /api/v1/staff/${staffId}/duty-status`
    );
  };

  // Update Staff Shift
  const handleUpdateShift = (staffId: string, newShift: StaffMember['shift']) => {
    setStaff(prev =>
      prev.map(s => (s.id === staffId ? { ...s, shift: newShift } : s))
    );
  };

  const occupiedRoomsCount = rooms.filter(r => r.status === 'Occupied').length;
  const availableCleanRooms = rooms.filter(r => r.status === 'Clean & Available');

  return (
    <div id="hotel-app-root" className="min-h-screen bg-[#0D231E] text-[#F7F4EB] flex flex-col">
      {/* Top Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        occupiedRoomsCount={occupiedRoomsCount}
        totalRoomsCount={rooms.length}
        openNewBookingModal={() => setIsNewBookingModalOpen(true)}
        openBackendModal={() => setIsBackendModalOpen(true)}
        onQuickBackendSync={() => handleQuickBackendSync('Full Cloud Data Sync', 'POST /api/v1/pms/sync-all')}
      />

      {/* Main App Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="tab-dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
            >
              <DashboardOverview
                rooms={rooms}
                reservations={reservations}
                maintenanceTickets={maintenanceTickets}
                staff={staff}
                setActiveTab={setActiveTab}
                openNewBookingModal={() => setIsNewBookingModalOpen(true)}
                openBackendModal={() => setIsBackendModalOpen(true)}
                onQuickBackendSync={handleQuickBackendSync}
                onExpressCheckIn={(res) => {
                  setActiveTab('checkin');
                  setActiveCheckInTarget(res);
                }}
              />
            </motion.div>
          )}

          {activeTab === 'bookings' && (
            <motion.div
              key="tab-bookings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
            >
              <BookingManagement
                reservations={reservations}
                rooms={rooms}
                openNewBookingModal={() => setIsNewBookingModalOpen(true)}
                onExpressCheckIn={(res) => {
                  setActiveTab('checkin');
                  setActiveCheckInTarget(res);
                }}
                onExpressCheckOut={(res) => {
                  setActiveTab('checkin');
                  setActiveCheckOutTarget(res);
                }}
                onCancelReservation={handleCancelReservation}
                onQuickBackendSync={handleQuickBackendSync}
              />
            </motion.div>
          )}

          {activeTab === 'checkin' && (
            <motion.div
              key="tab-checkin"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
            >
              <CheckInOutDesk
                reservations={reservations}
                rooms={rooms}
                onConfirmCheckIn={handleConfirmCheckIn}
                onConfirmCheckOut={handleConfirmCheckOut}
                onQuickBackendSync={handleQuickBackendSync}
                activeCheckInTarget={activeCheckInTarget}
                setActiveCheckInTarget={setActiveCheckInTarget}
                activeCheckOutTarget={activeCheckOutTarget}
                setActiveCheckOutTarget={setActiveCheckOutTarget}
              />
            </motion.div>
          )}

          {activeTab === 'maintenance' && (
            <motion.div
              key="tab-maintenance"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
            >
              <RoomMaintenance
                rooms={rooms}
                maintenanceTickets={maintenanceTickets}
                staff={staff}
                onUpdateRoomStatus={handleUpdateRoomStatus}
                onResolveTicket={handleResolveTicket}
                openNewTicketModal={(roomNum) => {
                  setMaintenanceDefaultRoom(roomNum);
                  setIsNewMaintenanceModalOpen(true);
                }}
                onQuickBackendSync={handleQuickBackendSync}
                onBatchCleanDirtyRooms={handleBatchCleanDirtyRooms}
              />
            </motion.div>
          )}

          {activeTab === 'staff' && (
            <motion.div
              key="tab-staff"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
            >
              <StaffManagement
                staff={staff}
                onToggleDutyStatus={handleToggleDutyStatus}
                onUpdateShift={handleUpdateShift}
                onQuickBackendSync={handleQuickBackendSync}
              />
            </motion.div>
          )}

          {activeTab === 'walkthrough' && (
            <motion.div
              key="tab-walkthrough"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-6"
            >
              <CanvasScrollAnimation
                onOpenBookingModal={() => setIsNewBookingModalOpen(true)}
                onQuickBackendSync={handleQuickBackendSync}
                onExitToDashboard={() => {
                  setActiveTab('dashboard');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      {activeTab !== 'walkthrough' && (
        <footer className="mt-auto border-t border-[#1A3A32] bg-[#0D231E]/95 py-6 text-xs text-[#F7F4EB]/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-[#D4AF37]" />
              <span className="font-semibold text-[#F7F4EB]">AURA GRAND PMS v3.4</span>
              <span>• Hotel Operations Suite</span>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsBackendModalOpen(true)}
                className="flex items-center gap-1.5 text-[#D4AF37] hover:text-[#e6c86e] transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
                <span>Backend Integration: In Progress</span>
              </button>
              <span className="text-[#1A3A32]">|</span>
              <span>24 Suites • 4 Wings</span>
            </div>
          </div>
        </footer>
      )}

      {/* Backend Integration Showcase Modal */}
      <BackendIntegrationModal
        isOpen={isBackendModalOpen}
        onClose={() => setIsBackendModalOpen(false)}
        syncEvents={syncEvents}
        onTriggerMockSync={handleQuickBackendSync}
      />

      {/* New Booking Modal */}
      <NewBookingModal
        isOpen={isNewBookingModalOpen}
        onClose={() => setIsNewBookingModalOpen(false)}
        availableRooms={availableCleanRooms}
        onCreateReservation={handleCreateReservation}
      />

      {/* New Maintenance Issue Modal */}
      <NewMaintenanceModal
        isOpen={isNewMaintenanceModalOpen}
        onClose={() => {
          setIsNewMaintenanceModalOpen(false);
          setMaintenanceDefaultRoom(undefined);
        }}
        rooms={rooms}
        staff={staff}
        onCreateTicket={handleCreateTicket}
        defaultRoomNumber={maintenanceDefaultRoom}
      />

      {/* Toast Notification Stream */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
