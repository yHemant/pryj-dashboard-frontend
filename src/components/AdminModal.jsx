import React, { useState } from 'react';
import { adminLogin, uploadData } from '../services/api';
import { X, Upload, CheckCircle } from 'lucide-react';

export default function AdminModal({ isOpen, onClose, onRefresh }) {
    const [auth, setAuth] = useState(false);
    const [password, setPassword] = useState('');
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('');

    if (!isOpen) return null;

    const handleLogin = async () => {
    try {
        await adminLogin(password);
        setAuth(true);
        setStatus('');
    } catch (err) { 
        // Differentiate between an actual 401 Unauthorized and a Network/CORS error
        if (err.response && err.response.status === 401) {
            setStatus('Invalid password');
        } else {
            setStatus(`Connection error: ${err.message}`);
            console.error("Login Error details:", err);
        }
    }
};

    const handleUpload = async () => {
        if (!file) return;
        setStatus('Uploading...');
        try {
            const res = await uploadData(file);
            setStatus(`Success! Processed ${res.data.processedCount} rows.`);
            onRefresh();
            setTimeout(onClose, 2000);
        } catch (err) { setStatus('Upload failed: ' + err.message); }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                    <X size={20} />
                </button>
                <h2 className="text-xl font-bold mb-4 text-emerald-400">Admin Panel</h2>
                
                {!auth ? (
                    <div className="flex flex-col gap-4">
                        <input type="password" placeholder="Enter Admin Password" 
                            className="bg-slate-900 border border-slate-700 rounded p-2 text-white outline-none focus:border-emerald-500"
                            value={password} onChange={e => setPassword(e.target.value)} />
                        <button onClick={handleLogin} className="bg-emerald-600 hover:bg-emerald-500 rounded p-2 font-semibold">Login</button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 items-center border-2 border-dashed border-slate-600 rounded-xl p-8">
                        <Upload size={48} className="text-slate-400 mb-2" />
                        <input type="file" accept=".xlsx" onChange={e => setFile(e.target.files[0])} className="text-sm text-slate-400" />
                        <button onClick={handleUpload} disabled={!file} className="w-full mt-4 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 rounded p-2 font-semibold">Upload Excel Data</button>
                    </div>
                )}
                {status && <p className="mt-4 text-center text-sm font-medium text-amber-400">{status}</p>}
            </div>
        </div>
    );
}