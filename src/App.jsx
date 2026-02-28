import React, { useState, useEffect, useMemo, memo } from 'react';
import { 
  User, Phone, MapPin, CheckCircle, CreditCard, Lock, Shield, Users, 
  Search, Camera, Check, X, Zap, Trophy, ChevronRight, ArrowRight, 
  Download, RefreshCcw, Filter, LayoutGrid, LogOut, FileSpreadsheet, Edit3, Calendar,
  Activity, Info, Sparkles, Palette, ToggleLeft, ToggleRight, Loader2
} from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, setDoc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAH1uDW3MJ29NzkmGL9A_sZk1k2j4e-PWQ",
  authDomain: "npcc-registration-platform.firebaseapp.com",
  projectId: "npcc-registration-platform",
  storageBucket: "npcc-registration-platform.firebasestorage.app",
  messagingSenderId: "778084490263",
  appId: "1:778084490263:web:b61cdc54c5912fc35e5052",
  measurementId: "G-V8H5V6F284"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = "npcc-registration-platform";

const COLLECTION_PATH = ['artifacts', appId, 'public', 'data', 'players'];
const SETTINGS_DOC_PATH = ['artifacts', appId, 'public', 'data', 'settings', 'registrationControl'];

// Aggressive Compression for iOS/Android Compatibility
const compressImage = (file, isScreenshot = false) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const MAX_SIZE = isScreenshot ? 450 : 220; 
        let width = img.width;
        let height = img.height;
        if (width > height) { if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; } } 
        else { if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; } }
        canvas.width = width; canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', isScreenshot ? 0.5 : 0.3));
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

// --- SUB-COMPONENTS (DEFINED OUTSIDE TO FIX FOCUS BUG) ---

const Navbar = memo(({ navigate, isAdmin, setIsAdmin }) => (
  <nav className="bg-white/90 backdrop-blur-xl p-4 shadow-xl sticky top-0 z-50 border-b border-pink-100">
    <div className="max-w-7xl mx-auto flex justify-between items-center text-sans">
      <div className="font-black text-2xl cursor-pointer flex items-center gap-2 tracking-tighter" onClick={() => navigate('landing')}>
        <div className="w-10 h-10 bg-gradient-to-tr from-pink-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg rotate-3">
          <Palette size={20} />
        </div>
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600 hidden sm:block uppercase font-black">DHULANDI CUP</span>
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600 sm:hidden uppercase tracking-tighter">NPCC</span>
      </div>
      <div className="flex gap-4 text-xs font-black uppercase tracking-widest items-center">
        <button onClick={() => navigate('directory')} className="text-purple-600 hover:text-pink-500 transition-colors">Directory</button>
        {!isAdmin ? (
          <button onClick={() => navigate('admin-login')} className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-5 py-2 rounded-full shadow-lg text-[10px]">Admin</button>
        ) : (
          <button onClick={() => {setIsAdmin(false); navigate('landing');}} className="text-red-500 font-black">EXIT</button>
        )}
      </div>
    </div>
  </nav>
));

const Landing = memo(({ navigate, setCategory, regControl }) => (
  <div className="max-w-6xl mx-auto mt-12 px-4 text-center pb-24 relative">
    <div className="mb-6 inline-flex items-center gap-2 bg-gradient-to-r from-pink-50 to-purple-50 text-purple-700 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-sm border border-white">
      <Sparkles size={14} className="text-pink-500 animate-pulse"/> Season 2026 Live
    </div>
    <h1 className="text-6xl md:text-9xl font-black text-slate-900 mb-6 uppercase tracking-tighter leading-[0.85]">
      NPCC <br/> 
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-orange-500 to-yellow-500 drop-shadow-sm">
        DHULANDI CUP
      </span>
    </h1>
    <p className="text-slate-500 mb-16 font-bold text-lg max-w-2xl mx-auto uppercase tracking-widest italic opacity-80 leading-relaxed">
      Cricket of Colors • Professional Championship
    </p>
    <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">
      <button 
        disabled={!regControl.youthOpen}
        onClick={() => { setCategory('Youth'); navigate('register'); }} 
        className={`relative p-12 rounded-[3.5rem] shadow-xl border-2 transition-all text-left group overflow-hidden active:scale-95 ${!regControl.youthOpen ? 'bg-gray-100 border-gray-200 cursor-not-allowed grayscale opacity-60' : 'bg-white border-transparent hover:border-pink-300 shadow-pink-100'}`}
      >
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-pink-50 rounded-full"></div>
        <Zap className={`${!regControl.youthOpen ? 'text-gray-400' : 'text-pink-600'} mb-10 relative z-10`} size={56} />
        <h2 className="text-5xl font-black mb-10 relative z-10 text-slate-800 uppercase italic leading-none">Youth Pool</h2>
        <div className={`${!regControl.youthOpen ? 'bg-gray-400' : 'bg-pink-600'} text-white w-max px-8 py-3 rounded-full font-black flex items-center gap-2 uppercase text-xs relative z-10 shadow-lg`}>
          {regControl.youthOpen ? 'Register Now' : 'Closed'} <ArrowRight size={16}/>
        </div>
      </button>

      <button 
        disabled={!regControl.fortyPlusOpen}
        onClick={() => { setCategory('40+'); navigate('register'); }} 
        className={`relative p-12 rounded-[3.5rem] shadow-xl border-2 transition-all text-left group overflow-hidden active:scale-95 ${!regControl.fortyPlusOpen ? 'bg-gray-100 border-gray-200 cursor-not-allowed grayscale opacity-60' : 'bg-white border-transparent hover:border-purple-300 shadow-purple-100'}`}
      >
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-purple-50 rounded-full"></div>
        <Trophy className={`${!regControl.fortyPlusOpen ? 'text-gray-400' : 'text-purple-600'} mb-10 relative z-10`} size={56} />
        <h2 className="text-5xl font-black mb-10 relative z-10 text-slate-800 uppercase italic leading-none">40+ League</h2>
        <div className={`${!regControl.fortyPlusOpen ? 'bg-gray-400' : 'bg-purple-600'} text-white w-max px-8 py-3 rounded-full font-black flex items-center gap-2 uppercase text-xs relative z-10 shadow-lg`}>
          {regControl.fortyPlusOpen ? 'Register Now' : 'Closed'} <ArrowRight size={16}/>
        </div>
      </button>
    </div>
    <div className="mt-24">
      <button onClick={() => navigate('directory')} className="group relative bg-slate-900 text-white px-20 py-7 rounded-full font-black uppercase tracking-[0.3em] text-sm shadow-2xl overflow-hidden active:scale-95 transition-all">
        <span className="relative z-10">Check Live Directory</span>
        <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </button>
    </div>
  </div>
));

const PlayerCard = memo(({ p }) => (
  <div className="bg-white rounded-[4rem] shadow-xl overflow-hidden group hover:-translate-y-4 transition-all duration-500 border border-slate-50">
    <div className="h-80 relative overflow-hidden bg-slate-100">
      <img src={p.photoUrl} loading="lazy" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-110" alt={p.name} />
      <div className="absolute top-8 left-8 flex flex-col gap-2">
         <span className={`text-[8px] font-black px-4 py-1.5 rounded-full shadow-2xl text-white backdrop-blur-md uppercase tracking-widest ${p.category === 'Youth' ? 'bg-blue-600/80' : 'bg-orange-600/80'}`}>{p.category}</span>
         <span className={`text-[8px] font-black px-4 py-1.5 rounded-full shadow-2xl text-white backdrop-blur-md uppercase tracking-widest ${p.paymentStatus === 'Paid' ? 'bg-emerald-600/80' : 'bg-slate-800/80'}`}>{p.paymentStatus === 'Paid' ? 'VERIFIED' : 'PENDING'}</span>
      </div>
      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-1">
        {p.availability && Object.entries(p.availability).filter(([_, v]) => v).map(([date]) => (
          <span key={date} className="bg-white/20 backdrop-blur-md text-white text-[7px] font-black px-2 py-1 rounded-full uppercase tracking-tighter border border-white/30">Avail: {date}</span>
        ))}
      </div>
    </div>
    <div className="p-10 text-center bg-white">
      <h3 className="font-black text-4xl text-slate-800 uppercase leading-none mb-3 tracking-tighter italic">{p.name}</h3>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{p.native} • {p.age} Yrs</p>
      <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em] mb-6 italic leading-none">DOB: {p.dob || "N/A"}</p>
      <div className={`py-4 px-6 rounded-full text-center font-black text-[10px] uppercase tracking-[0.2em] border-2 transition-all ${p.auctionStatus === 'Sold' ? 'bg-emerald-50 border-emerald-100 text-emerald-600 italic' : 'bg-slate-50 border-slate-100 text-slate-300'}`}>
        {p.auctionStatus === 'Sold' ? `TEAM: ${p.team}` : 'IN POOL'}
      </div>
    </div>
  </div>
));

const PlayerDirectory = ({ players, filterType, setFilterType, searchTerm, setSearchTerm }) => {
  const filteredList = useMemo(() => {
    return players.filter(p => {
      const matchType = filterType === 'All' || p.category === filterType;
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.native.toLowerCase().includes(searchTerm.toLowerCase());
      return matchType && matchSearch;
    });
  }, [players, filterType, searchTerm]);

  return (
    <div className="max-w-7xl mx-auto mt-12 p-6 pb-32">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-10 text-center md:text-left">
         <div>
            <h2 className="text-7xl font-black text-slate-900 uppercase italic tracking-tighter leading-none mb-4">THE POOL</h2>
            <p className="text-pink-500 font-black uppercase tracking-[0.4em] text-[10px] flex items-center justify-center md:justify-start gap-3 italic">
              <span className="w-12 h-1 bg-pink-500 rounded-full hidden md:block"></span> DHULANDI CUP 2026
            </p>
         </div>
         <div className="flex flex-col gap-5 w-full md:w-auto">
           <div className="relative">
             <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-pink-400" size={20} />
             <input type="text" placeholder="FIND A PLAYER..." className="bg-white border-2 border-slate-100 rounded-full pl-16 pr-8 py-5 w-full md:w-96 font-black text-xs tracking-widest focus:border-pink-500 outline-none shadow-2xl transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
           </div>
           <div className="flex bg-white p-2 rounded-full border shadow-2xl border-slate-100 overflow-hidden">
             {['All', 'Youth', '40+'].map(t => (
               <button key={t} onClick={() => setFilterType(t)} className={`flex-1 px-10 py-4 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${filterType === t ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-xl scale-105' : 'text-slate-400 hover:text-pink-600'}`}>{t}</button>
             ))}
           </div>
         </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12 text-sans">
        {filteredList.map(p => <PlayerCard key={p.id} p={p} />)}
      </div>
    </div>
  );
};

const AdminDashboard = ({ players, exportData, upd, regControl, updateControl }) => {
  const [sel, setSel] = useState(null);
  return (
    <div className="max-w-7xl mx-auto mt-12 p-6 pb-40 font-sans">
      <div className="flex flex-col lg:flex-row justify-between items-end mb-16 gap-10">
         <h2 className="text-7xl font-black text-slate-900 uppercase italic tracking-tighter leading-none underline decoration-pink-500">Command</h2>
         <button onClick={exportData} className="flex items-center gap-4 bg-emerald-600 text-white px-14 py-6 rounded-full font-black text-xs shadow-2xl active:scale-95 uppercase tracking-widest">
           <FileSpreadsheet size={24}/> Export Report
         </button>
      </div>

      <div className="bg-white p-10 rounded-[3rem] shadow-2xl mb-16 border border-pink-100">
        <h3 className="text-2xl font-black text-slate-800 uppercase italic mb-8 flex items-center gap-3">
          <Activity className="text-pink-500" /> Registration Switch
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
           <div className="bg-slate-50 p-6 rounded-[2rem] flex items-center justify-between border-2 border-transparent hover:border-pink-200 transition-all">
             <div><p className="font-black text-slate-800 uppercase text-lg italic leading-none">Youth Pool</p>
             <p className={`text-[10px] font-bold uppercase tracking-widest ${regControl.youthOpen ? 'text-emerald-500' : 'text-red-500'}`}>Currently {regControl.youthOpen ? 'Open' : 'Closed'}</p></div>
             <button onClick={() => updateControl('youthOpen', !regControl.youthOpen)} className="active:scale-90 transition-all">
               {regControl.youthOpen ? <ToggleRight size={48} className="text-emerald-500" /> : <ToggleLeft size={48} className="text-slate-300" />}
             </button>
           </div>
           <div className="bg-slate-50 p-6 rounded-[2rem] flex items-center justify-between border-2 border-transparent hover:border-purple-200 transition-all">
             <div><p className="font-black text-slate-800 uppercase text-lg italic leading-none">40+ League</p>
             <p className={`text-[10px] font-bold uppercase tracking-widest ${regControl.fortyPlusOpen ? 'text-emerald-500' : 'text-red-500'}`}>Currently {regControl.fortyPlusOpen ? 'Open' : 'Closed'}</p></div>
             <button onClick={() => updateControl('fortyPlusOpen', !regControl.fortyPlusOpen)} className="active:scale-90 transition-all">
               {regControl.fortyPlusOpen ? <ToggleRight size={48} className="text-emerald-500" /> : <ToggleLeft size={48} className="text-slate-300" />}
             </button>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-[4rem] shadow-2xl border border-slate-100 overflow-hidden text-center">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1200px]">
            <thead className="bg-slate-50 border-b-2 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">
              <tr><th className="p-12">Candidate</th><th className="p-12 text-center">Availability</th><th className="p-12 text-center">Status</th><th className="p-12 text-center">Assign Team</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {players.map(p => (
                <tr key={p.id} className="hover:bg-pink-50/20 transition-all group">
                  <td className="p-12">
                    <div className="flex items-center gap-8">
                      <img src={p.photoUrl} className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-xl transition-all group-hover:scale-110" alt="" />
                      <div>
                        <div className="font-black text-slate-900 uppercase text-2xl italic tracking-tighter leading-none mb-2">{p.name}</div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.contact} • {p.native} • {p.dob}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-12 text-center text-[10px] font-bold text-slate-400 uppercase">
                    {p.availability && Object.entries(p.availability).filter(([_,v])=>v).map(([d])=>d).join(", ")}
                  </td>
                  <td className="p-12 text-center">
                    {p.paymentStatus === 'Paid' ? (
                      <div className="text-emerald-600 font-black uppercase text-[10px] tracking-widest px-6 py-2 bg-emerald-50 rounded-full inline-block">APPROVED</div>
                    ) : (
                      <button onClick={() => setSel(p)} className="bg-orange-500 text-white px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">Verify Proof</button>
                    )}
                  </td>
                  <td className="p-12">
                    <div className="flex items-center gap-6 justify-center">
                      <select className="bg-slate-50 border-2 border-transparent rounded-[1.5rem] p-4 font-black text-[10px] uppercase outline-none focus:border-pink-500" value={p.auctionStatus} onChange={(e) => upd(p.id, { auctionStatus: e.target.value })}>
                        <option value="Unsold">In Pool</option><option value="Sold">Sold</option>
                      </select>
                      <input placeholder="TEAM NAME" className="bg-slate-50 border-2 border-transparent rounded-[1.5rem] p-4 w-56 font-black text-[10px] uppercase outline-none focus:bg-white focus:border-pink-500 shadow-inner" value={p.team === '-' ? '' : p.team} onChange={(e) => upd(p.id, { team: e.target.value })} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {sel && (
        <div className="fixed inset-0 bg-slate-900/95 flex items-center justify-center p-4 z-[999] backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="bg-white p-16 rounded-[5rem] w-full max-w-2xl text-center relative shadow-2xl">
            <button onClick={() => setSel(null)} className="absolute -top-5 -right-5 bg-white text-slate-900 rounded-full p-5 shadow-2xl hover:scale-110 transition-all"><X size={28}/></button>
            <h3 className="font-black text-4xl mb-10 italic uppercase underline decoration-pink-500 tracking-tighter italic">Proof Review</h3>
            <div className="bg-slate-50 p-6 rounded-[3.5rem] mb-12 flex items-center justify-center min-h-[400px]">
              {sel.screenshot ? <img src={sel.screenshot} className="max-h-[500px] w-full object-contain rounded-3xl shadow-2xl" alt="Proof" /> : <div className="text-slate-300 font-black tracking-[0.5em]">NO DATA</div>}
            </div>
            <button onClick={async () => { await upd(sel.id, { paymentStatus: 'Paid' }); setSel(null); }} className="w-full py-7 bg-emerald-600 text-white rounded-full font-black shadow-2xl uppercase tracking-widest text-xs hover:bg-emerald-700 transition-all">Verify & Approve</button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- MAIN APP ---

export default function App() {
  const [user, setUser] = useState(null);
  const [players, setPlayers] = useState([]);
  const [view, setView] = useState('landing'); 
  const [category, setCategory] = useState(null); 
  const [tempPlayer, setTempPlayer] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [regControl, setRegControl] = useState({ youthOpen: true, fortyPlusOpen: true });
  const [availability, setAvailability] = useState({});
  const [imgLoading, setImgLoading] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try { await signInAnonymously(auth); } catch (err) { console.error("Auth Error:", err); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
        setUser(u);
        setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubPlayers = onSnapshot(collection(db, ...COLLECTION_PATH), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setPlayers(list);
    });
    const unsubControl = onSnapshot(doc(db, ...SETTINGS_DOC_PATH), (snapshot) => {
      if (snapshot.exists()) setRegControl(snapshot.data());
      else setDoc(doc(db, ...SETTINGS_DOC_PATH), { youthOpen: true, fortyPlusOpen: true });
    });
    return () => { unsubPlayers(); unsubControl(); };
  }, [user]);

  const navigate = (v) => { setView(v); window.scrollTo(0,0); };

  const exportData = () => {
    if (players.length === 0) return alert("No data available!");
    const headers = ["Name", "Category", "Age", "DOB", "Contact", "Native", "Status", "Team", "Availability"];
    const rows = players.map(p => {
      const availStr = p.availability ? Object.entries(p.availability).filter(([_,v])=>v).map(([d])=>d).join("|") : "None";
      return [p.name, p.category, p.age, p.dob, p.contact, p.native, p.paymentStatus, p.team || "-", availStr];
    });
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `NPCC_Master_Report.csv`;
    link.click();
  };

  const upd = async (id, data) => { try { await updateDoc(doc(db, ...COLLECTION_PATH, id), data); } catch (err) { alert(err.message); } };
  const updateControl = async (field, value) => { try { await updateDoc(doc(db, ...SETTINGS_DOC_PATH), { [field]: value }); } catch (err) { alert(err.message); } };

  const handlePhotoUpload = async (e, setPhotoState, isScreenshot = false) => {
    const file = e.target.files[0];
    if (!file) return;
    setImgLoading(true);
    try {
      const compressed = await compressImage(file, isScreenshot);
      setPhotoState(compressed);
    } catch (err) { alert("Image size too large."); }
    setImgLoading(false);
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#fdfaf8] text-slate-900 font-black tracking-[0.5em] uppercase text-xs italic">
      <RefreshCcw className="animate-spin text-pink-500 mb-12" size={64}/>
      <p className="animate-pulse">Accessing Cloud Server...</p>
    </div>
  );

  const availDates = category === 'Youth' ? ['4 Apr', '5 Apr'] : ['3 Apr', '4 Apr', '5 Apr'];

  return (
    <div className="min-h-screen bg-[#fdfaf8] font-sans pb-20 overflow-x-hidden selection:bg-pink-200">
      <Navbar navigate={navigate} isAdmin={isAdmin} setIsAdmin={setIsAdmin} />
      <main className="animate-in fade-in duration-500">
        {view === 'landing' && <Landing navigate={navigate} setCategory={setCategory} regControl={regControl} />}
        
        {view === 'register' && (
          <form onSubmit={async (e) => {
            e.preventDefault();
            const f = e.target.elements;
            if (!tempPlayer?.photoUrl) return alert("Upload profile photo!");
            if (Object.values(availability).filter(v => v).length === 0) return alert("Select availability!");
            setTempPlayer(prev => ({ 
              ...prev, name: f.name.value, age: f.age.value, contact: f.contact.value, native: f.native.value, dob: f.dob.value,
              category, timestamp: new Date().toISOString(), id: 'P' + Date.now().toString().slice(-6),
              availability, paymentStatus: 'Pending', auctionStatus: 'Unsold', team: '-'
            }));
            navigate('payment');
          }} className="max-w-2xl mx-auto mt-12 p-12 bg-white rounded-[4rem] shadow-2xl space-y-10 mx-4 border border-pink-50 font-sans">
            <h2 className="text-4xl font-black text-slate-800 uppercase italic text-center underline decoration-pink-300">Registration</h2>
            <div className="space-y-6 text-left">
              <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-pink-500 ml-4">Full Player Name</label>
              <input name="name" required placeholder="NAME" className="w-full p-6 bg-slate-50 rounded-[2rem] font-bold uppercase focus:border-pink-500 border-2 border-transparent outline-none transition-all shadow-inner" /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-pink-500 ml-4">Age</label>
                <input name="age" required type="number" placeholder="AGE" className="w-full p-6 bg-slate-50 rounded-[2rem] font-bold focus:border-pink-500 outline-none transition-all shadow-inner border-2 border-transparent" /></div>
                <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-pink-500 ml-4">DOB (mm/dd/yyyy)</label>
                <input name="dob" required type="date" className="w-full p-6 bg-slate-50 rounded-[2rem] font-bold focus:border-pink-500 outline-none transition-all shadow-inner border-2 border-transparent" /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-pink-500 ml-4">WhatsApp Number</label>
                <input name="contact" required placeholder="NUMBER" className="w-full p-6 bg-slate-50 rounded-[2rem] font-bold focus:border-pink-500 border-2 border-transparent outline-none transition-all shadow-inner" /></div>
                <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-pink-500 ml-4">Native in Rajasthan</label>
                <input name="native" required placeholder="CITY/TOWN" className="w-full p-6 bg-slate-50 rounded-[2rem] font-bold uppercase focus:border-pink-500 border-2 border-transparent outline-none transition-all shadow-inner" /></div>
              </div>
            </div>
            <div className="bg-pink-50/50 p-8 rounded-[2.5rem] border border-pink-100 text-center">
               <p className="font-black text-slate-800 uppercase text-[10px] tracking-widest mb-6 italic leading-none">Select Availability</p>
               <div className="flex flex-wrap gap-4">
                 {availDates.map(date => (
                   <label key={date} className={`flex-1 min-w-[100px] flex items-center justify-center gap-3 p-4 rounded-2xl cursor-pointer transition-all border-2 ${availability[date] ? 'bg-pink-600 border-pink-600 text-white shadow-lg shadow-pink-200' : 'bg-white border-pink-100 text-pink-200'}`}>
                     <input type="checkbox" className="hidden" checked={!!availability[date]} onChange={() => setAvailability({...availability, [date]: !availability[date]})} />
                     <span className="font-black uppercase text-[10px] tracking-widest">{date}</span>
                     {availability[date] ? <CheckCircle size={16}/> : <div className="w-4 h-4 rounded-full border-2 border-pink-100"/>}
                   </label>
                 ))}
               </div>
            </div>
            <div className="border-4 border-dashed p-10 text-center rounded-[3rem] bg-slate-50 border-slate-200 relative group flex flex-col items-center justify-center min-h-[160px]">
              {tempPlayer?.photoUrl ? <img src={tempPlayer.photoUrl} className="h-32 w-32 rounded-2xl object-cover border-4 border-white shadow-lg" alt="" /> : 
              <>{imgLoading ? <Loader2 className="animate-spin text-pink-500" size={40}/> : <Camera size={40} className="text-pink-300 mb-2"/>}
              <span className="text-[10px] font-black text-pink-300 uppercase tracking-widest">{imgLoading ? "Processing..." : "Profile Photo"}</span></>}
              <input type="file" required accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" onChange={(e) => handlePhotoUpload(e, (url) => setTempPlayer(p => ({...p, photoUrl: url})))} />
            </div>
            <button type="submit" className="w-full bg-slate-900 text-white py-8 rounded-full font-black text-xl shadow-2xl active:scale-95 transition-all uppercase tracking-widest">REGISTER NOW</button>
          </form>
        )}

        {view === 'payment' && (
          <div className="max-w-xl mx-auto mt-12 p-12 bg-white rounded-[4rem] shadow-2xl text-center border-t-[15px] border-pink-500 mx-4">
             <h2 className="text-3xl font-black text-slate-800 mb-8 italic tracking-tighter uppercase leading-none underline decoration-pink-200">Pay 600 using this QR</h2>
             <div className="bg-gradient-to-b from-pink-50 to-white p-12 rounded-[3.5rem] mb-10 border border-pink-100 shadow-inner">
               <div className="bg-white p-4 rounded-3xl shadow-2xl inline-block mb-8 rotate-1">
                 <img src="https://i.ibb.co/6RTPXNKM/1000277092.png" className="w-64 h-auto rounded-xl" alt="QR" />
               </div>
               <p className="font-black text-slate-800 text-2xl uppercase mb-1 tracking-tighter leading-none">Bhuvan Jain</p>
               <div className="bg-purple-100 text-purple-700 py-2.5 px-8 rounded-full inline-block font-black text-[10px] uppercase mb-8 tracking-widest shadow-sm">bjain6851@okaxis</div>
             </div>
             <div className="border-4 border-dotted p-12 bg-slate-50 rounded-[3rem] border-slate-200 relative mb-10 group hover:border-pink-400 min-h-[160px] flex flex-col items-center justify-center">
               {tempPlayer?.screenshot ? <img src={tempPlayer.screenshot} className="h-44 w-auto rounded-xl shadow-lg border-2 border-white" alt="" /> : 
               <>{imgLoading ? <Loader2 className="animate-spin text-pink-500" size={40}/> : <CreditCard size={32} className="text-slate-300 mb-2"/>}
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{imgLoading ? "Processing..." : "Payment Proof"}</span></>}
               <input type="file" required accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" onChange={(e) => handlePhotoUpload(e, (url) => setTempPlayer(p => ({...p, screenshot: url})), true)} />
             </div>
             <button onClick={async () => {
               if(!tempPlayer.screenshot) return alert("Upload screenshot!");
               try { await setDoc(doc(db, ...COLLECTION_PATH, tempPlayer.id), tempPlayer); navigate('success'); } catch(err) { alert(err.message); }
             }} className="w-full bg-slate-900 text-white py-8 rounded-full font-black text-xl shadow-2xl active:scale-95 transition-all uppercase tracking-widest">SUBMIT DATA</button>
          </div>
        )}
        {view === 'directory' && <PlayerDirectory players={players} filterType={filterType} setFilterType={setFilterType} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />}
        {view === 'admin-login' && (
          <div className="max-w-md mx-auto mt-24 p-16 bg-white rounded-[5rem] shadow-2xl text-center border border-pink-50 mx-4">
            <Shield size={48} className="mx-auto text-pink-500 mb-10" />
            <h2 className="text-4xl font-black mb-12 uppercase italic text-slate-800 tracking-tighter">Admin Portal</h2>
            <input type="password" placeholder="SECRET KEY" className="w-full p-8 bg-slate-50 border-2 rounded-[2.5rem] text-center font-black text-2xl outline-none focus:border-pink-500 shadow-inner transition-all" onChange={e => {if(e.target.value === 'bababhuvandev') {setIsAdmin(true); navigate('admin')}}} />
          </div>
        )}
        {view === 'admin' && <AdminDashboard players={players} exportData={exportData} upd={upd} regControl={regControl} updateControl={updateControl} />}
        {view === 'success' && (
          <div className="max-w-xl mx-auto mt-24 text-center p-20 bg-white rounded-[6rem] shadow-2xl mx-4 border-b-8 border-emerald-500">
            <CheckCircle size={64} className="mx-auto text-emerald-500 mb-10 animate-bounce" />
            <h2 className="text-6xl font-black text-slate-900 italic uppercase tracking-tighter leading-[0.8] mb-8 underline decoration-emerald-200 text-sans">Success!</h2>
            <button onClick={() => navigate('directory')} className="w-full bg-slate-900 text-white py-8 rounded-full font-black uppercase italic tracking-widest text-xs shadow-2xl hover:-translate-y-1 transition-all">View Directory</button>
          </div>
        )}
      </main>
    </div>
  );
}
