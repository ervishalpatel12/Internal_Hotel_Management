import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Clock, 
  Phone, 
  Mail, 
  MapPin, 
  CheckCircle2, 
  Coffee, 
  Radio, 
  Send, 
  ShieldCheck, 
  Filter, 
  Calendar,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { StaffMember, Department, DutyStatus } from '../types';

interface StaffManagementProps {
  staff: StaffMember[];
  onToggleDutyStatus: (staffId: string, newStatus: DutyStatus) => void;
  onUpdateShift: (staffId: string, newShift: StaffMember['shift']) => void;
  onQuickBackendSync: (action: string, endpoint: string) => void;
}

export const StaffManagement: React.FC<StaffManagementProps> = ({
  staff,
  onToggleDutyStatus,
  onUpdateShift,
  onQuickBackendSync,
}) => {
  const [departmentFilter, setDepartmentFilter] = useState<'All' | Department>('All');
  const [shiftFilter, setShiftFilter] = useState<string>('All');
  const [broadcastText, setBroadcastText] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const filteredStaff = staff.filter((s) => {
    const matchDept = departmentFilter === 'All' || s.department === departmentFilter;
    const matchShift = shiftFilter === 'All' || s.shift.includes(shiftFilter);
    return matchDept && matchShift;
  });

  const onDutyCount = staff.filter(s => s.status === 'On Duty').length;
  const onBreakCount = staff.filter(s => s.status === 'On Break').length;
  const offDutyCount = staff.filter(s => s.status === 'Off Duty').length;

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;
    setIsBroadcasting(true);
    onQuickBackendSync(`Broadcast to ${onDutyCount} On-Duty Staff: "${broadcastText}"`, 'POST /api/v1/staff/push-notification');
    setTimeout(() => {
      setIsBroadcasting(false);
      setBroadcastText('');
    }, 600);
  };

  return (
    <div id="staff-management-container" className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-[#F7F4EB] tracking-tight">
            Hotel Staff Roster &amp; Shift Management
          </h2>
          <p className="text-xs text-[#F7F4EB]/70 mt-0.5">
            Coordinate housekeeping, engineering, front desk reception, and management operations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="sync-hr-payroll-btn"
            onClick={() => onQuickBackendSync('Sync Timecards with HR & Payroll ERP', 'POST /api/v1/hr/timecards/sync')}
            className="px-3.5 py-2 rounded-xl bg-[#1A3A32] hover:bg-[#224b41] border border-[#1A3A32] hover:border-[#D4AF37]/40 text-xs font-semibold text-[#F7F4EB] transition-all flex items-center gap-2 cursor-pointer"
          >
            <Radio className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Sync Timecards with HR</span>
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-[#1A3A32]/90 border border-[#1A3A32]">
          <span className="text-[11px] uppercase tracking-wider text-[#F7F4EB]/60 block">Total Staff</span>
          <span className="text-2xl font-bold font-display text-[#F7F4EB] mt-1 block">{staff.length}</span>
          <span className="text-[10px] text-[#F7F4EB]/50">certified personnel</span>
        </div>
        <div className="p-4 rounded-xl bg-[#1A3A32]/90 border border-[#1A3A32]">
          <span className="text-[11px] uppercase tracking-wider text-[#F7F4EB]/60 block">Active On Duty</span>
          <span className="text-2xl font-bold font-display text-[#D4AF37] mt-1 block">{onDutyCount}</span>
          <span className="text-[10px] text-[#F7F4EB]/50">currently working shifts</span>
        </div>
        <div className="p-4 rounded-xl bg-[#1A3A32]/90 border border-[#1A3A32]">
          <span className="text-[11px] uppercase tracking-wider text-[#F7F4EB]/60 block">On Break</span>
          <span className="text-2xl font-bold font-display text-[#F7F4EB] mt-1 block">{onBreakCount}</span>
          <span className="text-[10px] text-[#F7F4EB]/50">meal &amp; rest intervals</span>
        </div>
        <div className="p-4 rounded-xl bg-[#1A3A32]/90 border border-[#1A3A32]">
          <span className="text-[11px] uppercase tracking-wider text-[#F7F4EB]/60 block">Off Duty</span>
          <span className="text-2xl font-bold font-display text-[#F7F4EB]/50 mt-1 block">{offDutyCount}</span>
          <span className="text-[10px] text-[#F7F4EB]/50">next shift pending</span>
        </div>
      </div>

      {/* Broadcast Message Widget */}
      <form onSubmit={handleBroadcast} className="p-4 rounded-2xl bg-[#1A3A32] border border-[#1A3A32] shadow-md flex flex-col sm:flex-row items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#D4AF37] shrink-0">
          <Send className="w-4 h-4 text-[#D4AF37]" />
          <span>Broadcast Shift Push:</span>
        </div>
        <input
          id="broadcast-input"
          type="text"
          placeholder="e.g. VIP delegation arriving at 19:30. Front desk and concierge please assemble in lobby."
          value={broadcastText}
          onChange={(e) => setBroadcastText(e.target.value)}
          className="flex-1 bg-[#0D231E] border border-[#1A3A32] focus:border-[#D4AF37] rounded-xl px-3 py-2 text-xs text-[#F7F4EB] placeholder:text-[#F7F4EB]/40 outline-none w-full"
        />
        <button
          id="send-broadcast-btn"
          type="submit"
          disabled={isBroadcasting || !broadcastText.trim()}
          className="shrink-0 px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#e6c86e] text-[#0D231E] text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#D4AF37]/20"
        >
          <span>{isBroadcasting ? 'Dispatching...' : 'Dispatch Alert'}</span>
        </button>
      </form>

      {/* Filter Tabs */}
      <div className="bg-[#1A3A32]/90 border border-[#1A3A32] rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Department Filters */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {(['All', 'Front Desk', 'Housekeeping', 'Maintenance', 'Concierge', 'Management'] as const).map((dept) => (
            <button
              key={dept}
              id={`dept-filter-${dept.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => setDepartmentFilter(dept)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer border ${
                departmentFilter === dept
                  ? 'bg-[#D4AF37] text-[#0D231E] border-[#D4AF37] font-bold shadow-sm'
                  : 'bg-[#0D231E] border-[#1A3A32] text-[#F7F4EB]/70 hover:text-[#F7F4EB]'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        {/* Shift Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#F7F4EB]/70">Shift:</span>
          <select
            id="shift-filter-select"
            value={shiftFilter}
            onChange={(e) => setShiftFilter(e.target.value)}
            className="bg-[#0D231E] border border-[#1A3A32] rounded-xl px-3 py-1.5 text-xs text-[#F7F4EB] outline-none"
          >
            <option value="All">All Shifts (24 Hours)</option>
            <option value="Morning">Morning (07:00 - 15:30)</option>
            <option value="Evening">Evening (15:00 - 23:30)</option>
            <option value="Night">Night (23:00 - 07:30)</option>
          </select>
        </div>
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredStaff.map((member) => {
          const isOnDuty = member.status === 'On Duty';
          const isOnBreak = member.status === 'On Break';

          return (
            <motion.div
              key={member.id}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.15 }}
              id={`staff-card-${member.id}`}
              className="bg-[#1A3A32] border border-[#1A3A32] hover:border-[#D4AF37]/50 rounded-2xl p-5 shadow-lg flex flex-col justify-between"
            >
              <div>
                {/* Header with Avatar & Department */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-xl bg-[#0D231E] border border-[#D4AF37]/40 flex items-center justify-center font-bold text-[#D4AF37] shadow-md">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#F7F4EB]">{member.name}</h4>
                      <span className="text-xs text-[#F7F4EB]/70">{member.role}</span>
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#0D231E] text-[#D4AF37] border border-[#1A3A32]">
                    {member.department}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#0D231E]/60 text-[#F7F4EB]/60 border border-[#1A3A32]">
                    {member.shift.split(' ')[0]} Shift
                  </span>
                </div>

                {/* Details */}
                <div className="mt-3.5 space-y-1.5 text-xs text-[#F7F4EB]/80">
                  <div className="flex items-center gap-2 text-[#F7F4EB]/70">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-[#D4AF37]" />
                    <span className="truncate">{member.assignedZone}</span>
                  </div>

                  <div className="flex items-center gap-2 text-[#F7F4EB]/70">
                    <Phone className="w-3.5 h-3.5 shrink-0 text-[#D4AF37]" />
                    <span>{member.phone}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span className="text-[#F7F4EB]/60">Active Tasks:</span>
                    <span className="font-bold text-[#F7F4EB] bg-[#0D231E] px-2 py-0.5 rounded border border-[#1A3A32]">
                      {member.activeTasksCount} tasks
                    </span>
                  </div>
                </div>
              </div>

              {/* Duty Status Interactive Toggle Controls */}
              <div className="mt-5 pt-3 border-t border-[#0D231E] space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#F7F4EB]/60 font-medium">Status:</span>
                  <div className="flex items-center gap-1">
                    <button
                      id={`status-onduty-${member.id}`}
                      onClick={() => onToggleDutyStatus(member.id, 'On Duty')}
                      className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors cursor-pointer border ${
                        isOnDuty
                          ? 'bg-[#D4AF37] text-[#0D231E] font-bold border-[#D4AF37]'
                          : 'bg-[#0D231E] text-[#F7F4EB]/70 hover:text-[#F7F4EB] border-[#1A3A32]'
                      }`}
                    >
                      On Duty
                    </button>
                    <button
                      id={`status-onbreak-${member.id}`}
                      onClick={() => onToggleDutyStatus(member.id, 'On Break')}
                      className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors cursor-pointer border ${
                        isOnBreak
                          ? 'bg-[#F7F4EB] text-[#0D231E] font-bold border-[#F7F4EB]'
                          : 'bg-[#0D231E] text-[#F7F4EB]/70 hover:text-[#F7F4EB] border-[#1A3A32]'
                      }`}
                    >
                      Break
                    </button>
                    <button
                      id={`status-offduty-${member.id}`}
                      onClick={() => onToggleDutyStatus(member.id, 'Off Duty')}
                      className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors cursor-pointer border ${
                        member.status === 'Off Duty'
                          ? 'bg-[#0D231E] text-[#F7F4EB] font-bold border-[#D4AF37]/40'
                          : 'bg-[#0D231E] text-[#F7F4EB]/50 hover:text-[#F7F4EB] border-[#1A3A32]'
                      }`}
                    >
                      Off
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-[#F7F4EB]/50 pt-1">
                  <span>Shift: {member.shift}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
