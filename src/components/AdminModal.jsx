import React, { useState } from 'react';
import { adminLogin, uploadData } from '../services/api';
import { X, Upload, CheckCircle2, AlertCircle, Lock, FileSpreadsheet, Loader2 } from 'lucide-react';

export default function AdminModal({ isOpen, onClose, onRefresh }) {
    const [auth, setAuth] = useState(false);
    const [password, setPassword] = useState('');
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('');
    const [statusType, setStatusType] = useState('info'); // 'info' | 'success' | 'error'
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleLogin = async (e) => {
        if (e) e.preventDefault();
        setIsLoading(true);
        setStatus('');
        try {
            await adminLogin(password);
            setAuth(true);
            setStatusType('success');
            setStatus('Authenticated successfully.');
        } catch (err) { 
            setStatusType('error');
            if (err.response && err.response.status === 401) {
                setStatus('Invalid admin password. Please try again.');
            } else {
                setStatus(`Connection error: ${err.message}`);
                console.error("Login Error details:", err);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setIsLoading(true);
        setStatusType('info');
        setStatus('Uploading and processing Excel workbook...');
        try {
            const res = await uploadData(file);
            setStatusType('success');
            setStatus(`Success! Processed and upserted ${res.data.processedCount} records.`);
            onRefresh();
            setTimeout(() => {
                onClose();
                setFile(null);
                setStatus('');
            }, 2000);
        } catch (err) { 
            setStatusType('error');
            setStatus('Upload failed: ' + err.message); 
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-md p-4">
            <div className="glass-panel rounded-3xl border border-white/90 shadow-2xl max-w-md w-full overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200/70 flex items-center justify-between bg-white/40 backdrop-blur-md">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-100/80 text-blue-700 flex items-center justify-center">
                            <Lock size={16} />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-900">Admin Control Panel</h2>
                            <p className="text-xs text-slate-500">Upload Monthly CLI Excel Performance Data</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6">
                    {!auth ? (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                    Admin Password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter administrative password..."
                                    className="w-full px-3.5 py-2.5 text-sm glass-input rounded-xl outline-none transition-all text-slate-900"
                                    autoFocus
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || !password}
                                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
                            >
                                {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                                Unlock Admin Portal
                            </button>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                    Select Monthly Excel Report (.xlsx)
                                </label>
                                <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-6 text-center transition-colors bg-slate-50/50 hover:bg-blue-50/20">
                                    <FileSpreadsheet size={36} className="mx-auto text-blue-600 mb-2" />
                                    <input 
                                        type="file" 
                                        accept=".xlsx, .xls"
                                        id="excel-file"
                                        className="hidden"
                                        onChange={(e) => setFile(e.target.files[0])} 
                                    />
                                    <label 
                                        htmlFor="excel-file" 
                                        className="cursor-pointer text-sm font-semibold text-blue-600 hover:text-blue-700"
                                    >
                                        Click to choose file
                                    </label>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {file ? file.name : "or drag and drop spreadsheet here"}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={handleUpload}
                                disabled={isLoading || !file}
                                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
                            >
                                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                Upload & Upsert Data
                            </button>
                        </div>
                    )}

                    {/* Status Alert Banner */}
                    {status && (
                        <div className={`mt-4 p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
                            statusType === 'error' 
                                ? 'bg-rose-50 text-rose-800 border border-rose-200' 
                                : statusType === 'success'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-blue-50 text-blue-800 border border-blue-200'
                        }`}>
                            {statusType === 'error' ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
                            <span>{status}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}