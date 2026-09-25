import { useState, useEffect } from 'react';

export default function Login({ onLogin }) {
    const [user, setUser] = useState('');
    const [pass, setPass] = useState('');
    const [err, setErr] = useState('');

    useEffect(() => {
        document.title = 'Al Najjar - Admin Login';
    }, []);

    const handleLogin = (e) => {
        e.preventDefault();
        const username = user.trim();
        const password = pass.trim();
        
        if (!username || !password) {
            setErr('Please enter both username and password.');
            return;
        }

        if (username.toLowerCase() === 'alnajjar' && password === 'alnajjar123$') {
            sessionStorage.setItem('admin_auth', 'true');
            onLogin();
        } else {
            setErr('Invalid username or password.');
            setPass('');
        }
    };

    return (
        <div className="min-h-screen bg-[#0f0f12] flex items-center justify-center p-4 selection:bg-brand/30 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-brand/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-brand/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="bg-[#18181b] p-8 sm:p-10 rounded-3xl w-full max-w-sm border border-white/8 shadow-2xl relative z-10 flex flex-col gap-6">
                <div className="text-center flex flex-col gap-2">
                    <div className="mx-auto w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center mb-2">
                        <span className="material-icons text-brand text-[24px]">admin_panel_settings</span>
                    </div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Admin Portal</h1>
                    <p className="text-[12px] font-bold text-zinc-500 uppercase tracking-wider">Secure Access Only</p>
                </div>

                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <div className="relative">
                        <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-[18px]">person</span>
                        <input 
                            type="text" 
                            value={user} 
                            onChange={e => { setUser(e.target.value); setErr(''); }} 
                            placeholder="Username" 
                            className="w-full bg-[#0f0f12] border border-white/8 rounded-xl pl-11 pr-4 py-3.5 text-[14px] text-white font-semibold focus:outline-none focus:border-brand/60 transition-colors placeholder:text-zinc-600" 
                        />
                    </div>
                    <div className="relative">
                        <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-[18px]">lock</span>
                        <input 
                            type="password" 
                            value={pass} 
                            onChange={e => { setPass(e.target.value); setErr(''); }} 
                            placeholder="Password" 
                            className="w-full bg-[#0f0f12] border border-white/8 rounded-xl pl-11 pr-4 py-3.5 text-[14px] text-white font-semibold focus:outline-none focus:border-brand/60 transition-colors placeholder:text-zinc-600" 
                        />
                    </div>
                    
                    {err && (
                        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
                            <span className="material-icons text-red-400 text-[16px]">error_outline</span>
                            <p className="text-red-400 text-[12px] font-bold">{err}</p>
                        </div>
                    )}
                    
                    <button 
                        type="submit" 
                        className="w-full bg-brand hover:bg-brand/80 text-black font-black mt-2 py-3.5 rounded-xl transition-all shadow-lg shadow-brand/20 hover:shadow-brand/40 active:scale-[0.98] uppercase tracking-wide text-[13px]"
                    >
                        Sign In
                    </button>
                    
                    <a href="/" className="text-[11px] font-bold text-zinc-500 hover:text-zinc-300 text-center mt-2 flex items-center justify-center gap-1 transition-colors">
                        <span className="material-icons text-[14px]">arrow_back</span>
                        Return to site
                    </a>
                </form>
            </div>
        </div>
    );
}
