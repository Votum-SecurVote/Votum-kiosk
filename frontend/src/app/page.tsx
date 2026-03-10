"use client";

import { useState, useEffect, useRef } from "react";
import { CheckCircle, AlertTriangle, ShieldAlert, LogOut, RotateCcw, Fingerprint, Activity } from "lucide-react";

interface LogEntry {
  level: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
  message: string;
  timestamp: string;
}

export default function VerificationPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [frameData, setFrameData] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("SYSTEM READY");
  const [statusColor, setStatusColor] = useState<string>("blue");
  const [isVerifying, setIsVerifying] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Connect to WebSocket
    const ws = new WebSocket("ws://localhost:8000/camera-stream");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "frame") {
        setFrameData(data.data);
      } else if (data.type === "log") {
        setLogs((prev) => [...prev, data as LogEntry]);
      } else if (data.type === "status") {
        setStatus(data.message.toUpperCase());
        setStatusColor(data.color);
        if (data.color === "green" || data.color === "red") {
            setIsVerifying(false);
        }
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const startVerification = async () => {
    if (isVerifying) return;
    setIsVerifying(true);
    setLogs([]);
    try {
      await fetch("http://localhost:8000/start-verification", { method: "POST" });
    } catch (error) {
      setLogs((prev) => [...prev, { level: "ERROR", message: "Failed to connect to API", timestamp: new Date().toISOString() }]);
      setIsVerifying(false);
      setStatus("CONNECTION ERROR");
      setStatusColor("red");
    }
  };

  const getLogColor = (level: string) => {
    switch (level) {
      case "INFO": return "text-[#3b82f6]";
      case "SUCCESS": return "text-[#22c55e]";
      case "WARNING": return "text-[#f97316]";
      case "ERROR": return "text-[#ef4444]";
      default: return "text-gray-500";
    }
  };

  const statusBgColor = statusColor === "green" ? "bg-green-50 border-green-200" :
                        statusColor === "red" ? "bg-red-50 border-red-200" :
                        statusColor === "orange" ? "bg-orange-50 border-orange-200" :
                        "bg-blue-50 border-blue-200";

  const statusTextColor = statusColor === "green" ? "text-green-700" :
                          statusColor === "red" ? "text-red-700" :
                          statusColor === "orange" ? "text-orange-700" :
                          "text-blue-700";

  return (
    <div className="flex-1 flex flex-col p-6 max-w-[1400px] mx-auto w-full gap-6">
      
      {/* Top Section: Camera Feed */}
      <div className="w-full bg-[#111827] rounded-xl overflow-hidden shadow-xl aspect-[21/9] relative border border-gray-800 flex items-center justify-center">
        {frameData ? (
          <img src={frameData} alt="Live feed" className="w-full h-full object-cover opacity-90" />
        ) : (
          <div className="text-gray-500 flex flex-col items-center gap-4">
            <Activity className="animate-spin" size={48} />
            <p className="font-mono text-sm tracking-widest uppercase">Initializing Biometrics Engine...</p>
          </div>
        )}
        
        {/* Overlay scanning effect */}
        {isVerifying && frameData && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
             <div className="w-64 h-64 border-2 border-brand-lightBlue/50 relative">
               <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-brand-blue"></div>
               <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-brand-blue"></div>
               <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-brand-blue"></div>
               <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-brand-blue"></div>
               {/* Scan line */}
               <div className="absolute top-0 left-0 w-full h-1 bg-brand-lightBlue/60 shadow-[0_0_8px_2px_rgba(11,65,170,0.5)] animate-[scan_2s_ease-in-out_infinite]"></div>
             </div>
          </div>
        )}

        {/* Bottom overlay status */}
        <div className="absolute bottom-6 left-6 bg-black/80 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 border border-gray-700 backdrop-blur-sm">
          <Fingerprint size={16} className={statusColor === 'green' ? 'text-green-400' : 'text-brand-lightBlue'} />
          <span className="font-mono">{status}</span>
        </div>
      </div>

      {/* Bottom Section: Status and Logs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-64">
        
        {/* Verification Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <ShieldAlert className="text-brand-blue" size={20} />
            <h2 className="font-bold text-gray-900 tracking-wide text-lg">VERIFICATION STATUS</h2>
          </div>

          <div className={`mt-auto mb-auto border-2 rounded-lg p-6 flex items-center justify-between ${statusBgColor}`}>
            <div className="flex items-center gap-4">
              {statusColor === "green" ? <CheckCircle className="text-green-500" size={32} /> : 
               statusColor === "red" || statusColor === "orange" ? <AlertTriangle className="text-red-500" size={32} /> : 
               <Activity className="text-blue-500 animate-pulse" size={32} />}
              <span className={`text-xl font-bold ${statusTextColor}`}>{status}</span>
            </div>
            <span className={`text-sm font-black tracking-widest ${statusTextColor}`}>
              {statusColor === "green" ? "PASSED" : statusColor === "red" ? "FAILED" : isVerifying ? "ANALYZING..." : "WAITING"}
            </span>
          </div>
        </div>

        {/* System Logs */}
        <div className="bg-[#111827] rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.05)] border border-gray-800 p-6 flex flex-col font-mono relative overflow-hidden">
          <div className="flex items-center gap-2 mb-4 text-white">
            <Activity size={20} className="text-brand-blue"/>
            <h2 className="font-bold tracking-wide text-lg">SYSTEM LOGS</h2>
          </div>

          <div className="flex-1 overflow-y-auto bg-[#0a0f18] border border-gray-900 rounded-lg p-5 text-sm leading-relaxed scrollbar-thin scrollbar-thumb-gray-800">
            {logs.length === 0 ? (
               <div className="text-gray-600 italic">Waiting for system events...</div>
            ) : (
                logs.map((log, i) => (
                  <div key={i} className="mb-2 transition-colors break-words flex gap-2 font-mono whitespace-pre-wrap">
                    <span className="text-gray-500 opacity-60 min-w-fit flex-shrink-0">[{log.timestamp}]</span>
                    <span className={`font-bold flex-shrink-0 ${getLogColor(log.level)}`}>[{log.level}]</span>
                    <span className="text-[#64748b] leading-tight">{log.message}</span>
                  </div>
                ))
            )}
            <div ref={logsEndRef} />
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex justify-between items-center bg-white px-0 py-4 mt-auto">
        <button onClick={() => window.location.reload()} className="flex items-center justify-center gap-2 bg-[#e2e8f0] hover:bg-[#cbd5e1] text-slate-800 px-8 py-3.5 rounded-lg font-bold transition-colors w-48 text-sm">
          <LogOut size={18} />
          EXIT KIOSK
        </button>
        <div className="flex gap-4">
          <button onClick={() => { setStatus("SYSTEM READY"); setStatusColor("blue"); setLogs([]); }} className="flex w-48 items-center justify-center gap-2 bg-white border-2 border-brand-blue text-brand-blue hover:bg-blue-50 px-8 py-3.5 rounded-lg font-bold transition-colors text-sm">
            <RotateCcw size={18} />
            RETRY SCAN
          </button>
          <button onClick={startVerification} disabled={isVerifying} className="flex w-64 items-center justify-center gap-2 bg-[#0d3484] hover:bg-[#0b41aa] text-white px-8 py-3.5 rounded-lg font-bold transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm">
            <Fingerprint size={18} />
            {isVerifying ? "VERIFYING..." : "START VERIFICATION"}
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes scan {
          0% { transform: translateY(0); }
          50% { transform: translateY(256px); }
          100% { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
