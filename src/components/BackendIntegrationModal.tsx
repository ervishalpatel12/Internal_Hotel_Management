import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Server, 
  Cpu, 
  Radio, 
  Wifi, 
  Database, 
  CheckCircle2, 
  Clock, 
  Play, 
  X, 
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { BackendSyncEvent } from '../types';

interface BackendIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncEvents: BackendSyncEvent[];
  onTriggerMockSync: (actionName: string, endpoint: string) => void;
}

export const BackendIntegrationModal: React.FC<BackendIntegrationModalProps> = ({
  isOpen,
  onClose,
  syncEvents,
  onTriggerMockSync,
}) => {
  const [selectedModule, setSelectedModule] = useState<'all' | 'ota' | 'rfid' | 'pms'>('all');
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulate = (actionName: string, endpoint: string) => {
    setIsSimulating(true);
    onTriggerMockSync(actionName, endpoint);
    setTimeout(() => {
      setIsSimulating(false);
    }, 600);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          id="backend-integration-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#0D231E]/85 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            id="backend-integration-modal"
            className="bg-[#1A3A32] border border-[#D4AF37]/30 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-[#0D231E] bg-[#1A3A32] flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#0D231E] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-xl font-bold tracking-tight text-[#F7F4EB]">
                      Backend Integration Status
                    </h2>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#0D231E] border border-[#D4AF37]/30 text-[#D4AF37]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
                      Integration In Progress
                    </span>
                  </div>
                  <p className="text-xs text-[#F7F4EB]/70 mt-0.5">
                    Live telemetry preview of pending server pipelines, OTA channel sync &amp; hardware locks
                  </p>
                </div>
              </div>

              <button
                id="close-backend-modal-btn"
                onClick={onClose}
                className="text-[#F7F4EB]/70 hover:text-[#F7F4EB] p-2 rounded-lg hover:bg-[#0D231E] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Showcase Banner */}
            <div className="bg-[#0D231E]/90 p-4 mx-6 mt-6 rounded-xl border border-[#D4AF37]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-[#1A3A32] text-[#D4AF37] mt-0.5 border border-[#D4AF37]/30">
                  <Radio className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#D4AF37]">
                    Client State Operating Reliably in Realtime
                  </h4>
                  <p className="text-xs text-[#F7F4EB]/80 mt-0.5 leading-relaxed">
                    Full hotel operations (check-ins, bookings, room turns, staff duty) are actively managed in local reactive state. Backend REST/GraphQL endpoints are marked as <span className="font-semibold text-[#D4AF37]">Integration In Progress</span>.
                  </p>
                </div>
              </div>
              <button
                id="trigger-live-sync-test-btn"
                onClick={() => handleSimulate('Manual Cloud PMS Sync Triggered', 'POST /api/v1/pms/sync-all')}
                disabled={isSimulating}
                className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-[#D4AF37] text-[#0D231E] hover:bg-[#e6c86e] active:scale-95 transition-all shadow-md shadow-[#D4AF37]/20 cursor-pointer disabled:opacity-50"
              >
                <Play className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
                <span>{isSimulating ? 'Dispatching...' : 'Test Backend Sync'}</span>
              </button>
            </div>

            {/* Connector Pipelines Grid */}
            <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div 
                id="connector-ota"
                className="p-3.5 rounded-xl bg-[#0D231E]/80 border border-[#1A3A32] hover:border-[#D4AF37]/50 transition-all cursor-pointer group"
                onClick={() => handleSimulate('OTA Channels Poll Request', 'GET /api/v1/ota/channels/status')}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-[#F7F4EB] font-semibold text-xs">
                    <Wifi className="w-4 h-4 text-[#D4AF37]" />
                    <span>OTA Channel Manager</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#1A3A32] text-[#D4AF37] font-mono border border-[#D4AF37]/20">In Progress</span>
                </div>
                <p className="text-[11px] text-[#F7F4EB]/70">
                  Booking.com, Expedia &amp; Agoda 2-way sync bridge
                </p>
                <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#F7F4EB]/50 group-hover:text-[#D4AF37]">
                  <span>Simulate Webhook</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </div>

              <div 
                id="connector-rfid"
                className="p-3.5 rounded-xl bg-[#0D231E]/80 border border-[#1A3A32] hover:border-[#D4AF37]/50 transition-all cursor-pointer group"
                onClick={() => handleSimulate('Hardware Keycard Reader Ping', 'GET /hardware/encoder/status')}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-[#F7F4EB] font-semibold text-xs">
                    <Cpu className="w-4 h-4 text-[#D4AF37]" />
                    <span>Keycard RFID Reader</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#1A3A32] text-[#D4AF37] font-mono border border-[#D4AF37]/20">In Progress</span>
                </div>
                <p className="text-[11px] text-[#F7F4EB]/70">
                  Dormakaba / ASSA ABLOY NFC door encoder link
                </p>
                <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#F7F4EB]/50 group-hover:text-[#D4AF37]">
                  <span>Simulate Ping</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </div>

              <div 
                id="connector-pms"
                className="p-3.5 rounded-xl bg-[#0D231E]/80 border border-[#1A3A32] hover:border-[#D4AF37]/50 transition-all cursor-pointer group"
                onClick={() => handleSimulate('Cloud Database Heartbeat', 'GET /api/v1/health/postgres')}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-[#F7F4EB] font-semibold text-xs">
                    <Database className="w-4 h-4 text-[#D4AF37]" />
                    <span>Cloud PMS &amp; ERP</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#1A3A32] text-[#D4AF37] font-mono border border-[#D4AF37]/20">In Progress</span>
                </div>
                <p className="text-[11px] text-[#F7F4EB]/70">
                  Accounting ledgers, guest profiles &amp; POS billing sync
                </p>
                <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#F7F4EB]/50 group-hover:text-[#D4AF37]">
                  <span>Simulate Heartbeat</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </div>
            </div>

            {/* Live Event Stream Log */}
            <div className="flex-1 overflow-y-auto px-6 pb-6 min-h-[160px]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#F7F4EB]/70">
                    Simulated Integration Event Feed
                  </span>
                </div>
                <span className="text-[11px] text-[#F7F4EB]/50 font-mono">
                  {syncEvents.length} events logged
                </span>
              </div>

              <div className="space-y-2 font-mono text-xs">
                {syncEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-3 rounded-lg bg-[#0D231E]/80 border border-[#1A3A32] flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:border-[#D4AF37]/40 transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-2.5">
                      <span className="text-[#F7F4EB]/50 shrink-0 text-[11px]">
                        [{evt.timestamp}]
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#1A3A32] text-[#D4AF37] border border-[#1A3A32]">
                        {evt.module}
                      </span>
                      <span className="text-[#F7F4EB] text-xs font-sans">
                        {evt.action}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[#F7F4EB]/60 text-[11px]">{evt.endpoint}</span>
                      <span className="text-[10px] text-[#D4AF37] bg-[#0D231E] px-2 py-0.5 rounded border border-[#D4AF37]/30">
                        Pending In Progress
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#0D231E] bg-[#1A3A32] flex items-center justify-between text-xs text-[#F7F4EB]/70">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                All UI actions show &quot;Integration in progress&quot; while maintaining full client state interactivity.
              </span>
              <button
                id="dismiss-backend-modal-btn"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-[#0D231E] text-[#F7F4EB] hover:text-[#D4AF37] transition-colors border border-[#1A3A32]"
              >
                Close View
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
