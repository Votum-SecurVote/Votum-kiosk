"use client";

import { useState, useEffect, useRef } from "react";
import { CheckCircle, XCircle, AlertTriangle, ShieldAlert, LogOut, RotateCcw, Fingerprint, Activity, SkipForward, UploadCloud, Image as ImageIcon } from "lucide-react";

interface LogEntry {
  level: "INFO" | "SUCCESS" | "WARNING" | "ERROR" | "DEBUG";
  message: string;
  timestamp: string;
}

interface VerificationStep {
  stage: string;
  status: "pending" | "success" | "failed" | "skipped" | "verified";
  score?: number;
  similarity?: number;
}

export default function VerificationPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [frameData, setFrameData] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("SYSTEM READY");
  const [statusColor, setStatusColor] = useState<string>("blue");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationSteps, setVerificationSteps] = useState<VerificationStep[]>([]);
  
  // Aadhaar Upload States
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
  const [aadhaarPreview, setAadhaarPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAadhaarUploaded, setIsAadhaarUploaded] = useState(false);
  
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
      } else if (data.type === "steps") {
        setVerificationSteps(data.data);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setAadhaarFile(file);
      // Generate a quick local preview before upload
      const localPreviewUrl = URL.createObjectURL(file);
      setAadhaarPreview(localPreviewUrl);
      setIsAadhaarUploaded(false); // Reset unlock state if they pick a new file
    }
  };

  const handleUploadAadhaar = async () => {
    if (!aadhaarFile) return;
    
    setIsUploading(true);
    setLogs((prev) => [...prev, { level: "INFO", message: "Uploading Aadhaar image...", timestamp: new Date().toLocaleTimeString('en-US',{hour12:false}) }]);

    const formData = new FormData();
    formData.append("file", aadhaarFile);

    try {
      const response = await fetch("http://localhost:8000/upload-aadhaar", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (result.status === "success") {
        setAadhaarPreview(result.preview); // Use the validated backend preview box
        setIsAadhaarUploaded(true);
      } else {
        setIsAadhaarUploaded(false);
      }
    } catch (error) {
       setLogs((prev) => [...prev, { level: "ERROR", message: "Failed to upload Aadhaar image.", timestamp: new Date().toLocaleTimeString('en-US',{hour12:false}) }]);
       setIsAadhaarUploaded(false);
    } finally {
      setIsUploading(false);
    }
  };

  const startVerification = async () => {
    if (isVerifying || !isAadhaarUploaded) return;
    setIsVerifying(true);
    setLogs([]);
    setVerificationSteps([]);
    try {
      await fetch("http://localhost:8000/start-verification", { method: "POST" });
    } catch (error) {
      setLogs((prev) => [...prev, { level: "ERROR", message: "Failed to connect to API", timestamp: new Date().toLocaleTimeString('en-US',{hour12:false}) }]);
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
      case "DEBUG": return "text-[#a855f7]"; // purple for debug
      default: return "text-gray-500";
    }
  };
  
  const formatStageName = (stage: string) => {
    return stage.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  const renderStepIcon = (status: string) => {
    switch (status) {
      case "success":
      case "verified":
        return <CheckCircle className="text-green-500" size={20} />;
      case "failed":
        return <XCircle className="text-red-500" size={20} />;
      case "skipped":
        return <SkipForward className="text-gray-400" size={20} />;
      default:
        return <Activity className="text-blue-500 animate-pulse" size={20} />;
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
      
      {/* Top Section: Split view for Camera and Aadhaar Upload */}
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">
          
        {/* Camera Feed */}
        <div className="w-full bg-[#111827] rounded-xl overflow-hidden shadow-xl aspect-video relative border border-gray-800 flex items-center justify-center">
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

        {/* Aadhaar Upload Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col h-full">
           <div className="flex items-center gap-2 mb-4 shrink-0">
             <UploadCloud className="text-brand-blue" size={20} />
             <h2 className="font-bold text-gray-900 tracking-wide md:text-md lg:text-lg">Aadhaar / Government ID</h2>
           </div>

           <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 p-4 mb-4 relative overflow-hidden group">
             {aadhaarPreview ? (
               <div className="relative w-full h-full flex items-center justify-center">
                   <img src={aadhaarPreview} alt="Aadhaar Preview" className="max-h-full max-w-full object-contain rounded-md border border-gray-200" />
                   {isAadhaarUploaded && (
                     <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1 shadow-md">
                       <CheckCircle size={16} />
                     </div>
                   )}
               </div>
             ) : (
                <div className="flex flex-col items-center justify-center text-gray-400 text-center space-y-3">
                  <ImageIcon size={48} className="text-gray-300"/>
                  <p className="text-sm">Upload Government ID Face Image</p>
                  <p className="text-xs text-gray-400">.JPG, .JPEG, .PNG</p>
                </div>
             )}
             <input type="file" accept="image/jpeg, image/png, image/jpg" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
           </div>

           <button 
             onClick={handleUploadAadhaar} 
             disabled={!aadhaarFile || isUploading || isAadhaarUploaded}
             className={`w-full py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
               isAadhaarUploaded ? "bg-green-100 text-green-700 border border-green-300 cursor-not-allowed" :
               !aadhaarFile ? "bg-gray-100 text-gray-400 cursor-not-allowed" : 
               "bg-brand-blue text-white hover:bg-[#0b41aa]"
             }`}
           >
             {isUploading ? <Activity className="animate-spin" size={16} /> : isAadhaarUploaded ? <CheckCircle size={16} /> : <UploadCloud size={16} />}
             {isUploading ? "UPLOADING..." : isAadhaarUploaded ? "ID UPLOADED" : "UPLOAD AADHAAR IMAGE"}
           </button>
        </div>

      </div>

      {/* Bottom Section: Status and Logs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-72">
        
        {/* Verification Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col h-full overflow-hidden">
          <div className="flex items-center gap-2 mb-4 shrink-0">
            <ShieldAlert className="text-brand-blue" size={20} />
            <h2 className="font-bold text-gray-900 tracking-wide text-lg">VERIFICATION STATUS</h2>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 mb-4 scrollbar-thin scrollbar-thumb-gray-200">
            {verificationSteps.length === 0 ? (
               <div className="h-full flex items-center justify-center text-gray-400 italic text-sm">Waiting for scan to begin...</div>
            ) : (
              <div className="space-y-3">
                {verificationSteps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 transition-colors">
                    {renderStepIcon(step.status)}
                    <div className="flex-1">
                      <span className={`font-semibold text-sm ${
                        step.status === "failed" ? "text-red-600" :
                        step.status === "skipped" ? "text-gray-400" :
                        "text-gray-800"
                      }`}>
                        {formatStageName(step.stage)}
                      </span>
                      {step.status === "failed" && <span className="text-xs text-red-500 ml-2">FAILED</span>}
                      {step.status === "skipped" && <span className="text-xs text-gray-400 ml-2">SKIPPED</span>}
                      {(step.score !== undefined || step.similarity !== undefined) && (
                         <span className="text-xs text-gray-500 ml-2 font-mono">
                           ({step.score !== undefined ? `Score: ${step.score}` : `Sim: ${step.similarity}`})
                         </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={`mt-auto border-2 rounded-lg p-3 flex items-center justify-between shrink-0 ${statusBgColor}`}>
            <div className="flex items-center gap-3">
              {statusColor === "green" ? <CheckCircle className="text-green-500" size={24} /> : 
               statusColor === "red" || statusColor === "orange" ? <AlertTriangle className="text-red-500" size={24} /> : 
               <Activity className="text-blue-500 animate-pulse" size={24} />}
              <span className={`text-lg font-bold ${statusTextColor} truncate max-w-[200px]`}>{status}</span>
            </div>
          </div>
        </div>

        {/* System Logs */}
        <div className="bg-[#111827] rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.05)] border border-gray-800 p-6 flex flex-col font-mono relative overflow-hidden h-full">
          <div className="flex items-center gap-2 mb-4 text-white shrink-0">
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
          <button onClick={() => { setStatus("SYSTEM READY"); setStatusColor("blue"); setLogs([]); setVerificationSteps([]); setAadhaarFile(null); setAadhaarPreview(null); setIsAadhaarUploaded(false); }} className="flex w-48 items-center justify-center gap-2 bg-white border-2 border-brand-blue text-brand-blue hover:bg-blue-50 px-8 py-3.5 rounded-lg font-bold transition-colors text-sm">
            <RotateCcw size={18} />
            RETRY SCAN
          </button>
          <button 
            onClick={startVerification} 
            disabled={isVerifying || !isAadhaarUploaded} 
            title={!isAadhaarUploaded ? "Please upload an Aadhaar ID first" : "Start Biometric Scan"}
            className={`flex w-64 items-center justify-center gap-2 px-8 py-3.5 rounded-lg font-bold transition-colors shadow-md text-sm ${
              isVerifying || !isAadhaarUploaded ? "bg-gray-400 text-gray-200 cursor-not-allowed opacity-50" : "bg-[#0d3484] hover:bg-[#0b41aa] text-white"
            }`}
          >
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
