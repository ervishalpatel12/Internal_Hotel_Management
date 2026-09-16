import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Wrench, 
  AlertTriangle, 
  Building2, 
  User, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { MaintenanceTicket, MaintenanceCategory, PriorityLevel, StaffMember, Room } from '../types';

interface NewMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  rooms: Room[];
  staff: StaffMember[];
  onCreateTicket: (ticket: Omit<MaintenanceTicket, 'id' | 'createdAt' | 'status'>) => void;
  defaultRoomNumber?: string;
}

export const NewMaintenanceModal: React.FC<NewMaintenanceModalProps> = ({
  isOpen,
  onClose,
  rooms,
  staff,
  onCreateTicket,
  defaultRoomNumber,
}) => {
  const [roomNumber, setRoomNumber] = useState(defaultRoomNumber || rooms[0]?.number || '101');
  const [category, setCategory] = useState<MaintenanceCategory>('HVAC & Climate');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('High');
  const [reportedBy, setReportedBy] = useState('Front Desk Agent');
  const maintenanceStaff = staff.filter(s => s.department === 'Maintenance');
  const [assignedStaffName, setAssignedStaffName] = useState(maintenanceStaff[0]?.name || 'Carlos Ramirez');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please enter a brief issue title');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Please describe the maintenance issue');
      return;
    }

    onCreateTicket({
      roomNumber,
      category,
      title: title.trim(),
      description: description.trim(),
      priority,
      reportedBy,
      assignedStaffName,
    });

    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          id="new-maintenance-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#0D231E]/85 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            id="new-maintenance-modal"
            className="bg-[#1A3A32] border border-[#D4AF37]/30 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-[#0D231E] bg-[#1A3A32] flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#0D231E] text-[#D4AF37] border border-[#D4AF37]/40 flex items-center justify-center">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-display text-[#F7F4EB]">
                    Log Maintenance Ticket
                  </h3>
                  <p className="text-xs text-[#F7F4EB]/70">
                    Dispatch engineering or facilities technicians
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="text-[#F7F4EB]/70 hover:text-[#F7F4EB] p-2 rounded-lg hover:bg-[#0D231E] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Room & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#F7F4EB] mb-1">
                    Room Number *
                  </label>
                  <select
                    id="ticket-room-select"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="w-full bg-[#0D231E] border border-[#1A3A32] focus:border-[#D4AF37] rounded-xl px-3 py-2 text-sm text-[#F7F4EB] outline-none"
                  >
                    {rooms.map((r) => (
                      <option key={r.id} value={r.number}>
                        Room {r.number} (Floor {r.floor} - {r.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#F7F4EB] mb-1">
                    Trade / Category *
                  </label>
                  <select
                    id="ticket-category-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as MaintenanceCategory)}
                    className="w-full bg-[#0D231E] border border-[#1A3A32] focus:border-[#D4AF37] rounded-xl px-3 py-2 text-sm text-[#F7F4EB] outline-none"
                  >
                    <option value="HVAC & Climate">HVAC &amp; Climate</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Door & RFID Lock">Door &amp; RFID Lock</option>
                    <option value="Furniture & Fixture">Furniture &amp; Fixture</option>
                    <option value="Audio & TV">Audio &amp; Smart TV</option>
                  </select>
                </div>
              </div>

              {/* Priority & Assigned Staff */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#F7F4EB] mb-1">
                    Priority Level *
                  </label>
                  <select
                    id="ticket-priority-select"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                    className="w-full bg-[#0D231E] border border-[#1A3A32] focus:border-[#D4AF37] rounded-xl px-3 py-2 text-sm text-[#F7F4EB] outline-none"
                  >
                    <option value="Urgent">Urgent (Room Offline)</option>
                    <option value="High">High (Service Degradation)</option>
                    <option value="Medium">Medium (Inspect Today)</option>
                    <option value="Low">Low (Routine Preventive)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#F7F4EB] mb-1">
                    Assign Technician
                  </label>
                  <select
                    id="ticket-assign-staff-select"
                    value={assignedStaffName}
                    onChange={(e) => setAssignedStaffName(e.target.value)}
                    className="w-full bg-[#0D231E] border border-[#1A3A32] focus:border-[#D4AF37] rounded-xl px-3 py-2 text-sm text-[#F7F4EB] outline-none"
                  >
                    {maintenanceStaff.map((st) => (
                      <option key={st.id} value={st.name}>
                        {st.name} ({st.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-medium text-[#F7F4EB] mb-1">
                  Issue Summary *
                </label>
                <input
                  id="ticket-title-input"
                  type="text"
                  required
                  placeholder="e.g. Master bath shower mixer cartridge seized"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#0D231E] border border-[#1A3A32] focus:border-[#D4AF37] rounded-xl px-3 py-2 text-sm text-[#F7F4EB] placeholder:text-[#F7F4EB]/40 outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-[#F7F4EB] mb-1">
                  Detailed Diagnostic Description *
                </label>
                <textarea
                  id="ticket-description-input"
                  rows={3}
                  required
                  placeholder="Provide details on symptom, affected components, and whether room must be taken out of service."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#0D231E] border border-[#1A3A32] focus:border-[#D4AF37] rounded-xl p-3 text-sm text-[#F7F4EB] placeholder:text-[#F7F4EB]/40 outline-none resize-none"
                />
              </div>

              {/* Reported By */}
              <div>
                <label className="block text-xs font-medium text-[#F7F4EB] mb-1">
                  Reported By
                </label>
                <input
                  id="ticket-reported-by-input"
                  type="text"
                  value={reportedBy}
                  onChange={(e) => setReportedBy(e.target.value)}
                  className="w-full bg-[#0D231E] border border-[#1A3A32] focus:border-[#D4AF37] rounded-xl px-3 py-2 text-sm text-[#F7F4EB] outline-none"
                />
              </div>

              {/* Footer */}
              <div className="pt-3 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#F7F4EB]/70 hover:bg-[#0D231E] hover:text-[#F7F4EB] transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="submit-create-ticket-btn"
                  type="submit"
                  className="px-6 py-2 rounded-xl text-xs font-bold bg-[#D4AF37] hover:bg-[#e6c86e] text-[#0D231E] transition-all shadow-lg shadow-[#D4AF37]/20 active:scale-95 cursor-pointer"
                >
                  Dispatch Maintenance Ticket
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
