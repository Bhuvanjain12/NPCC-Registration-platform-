import React, { useState, useEffect, useMemo } from 'react';
import { 
  User, Phone, MapPin, CheckCircle, CreditCard, Lock, Shield, Users, 
  Search, Camera, Check, X, Zap, Trophy, ChevronRight, ArrowRight, 
  Download, RefreshCcw, Filter, LayoutGrid, LogOut, FileSpreadsheet, Edit3, Calendar,
  Activity, Info, Sparkles, Palette, ToggleLeft, ToggleRight
} from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, setDoc, updateDoc } from 'firebase/firestore';

// --- CONFIGURATION ---
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

// Aggressive Image Compression
const compressImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const SIZE = 300; 
        canvas.width = SIZE; 
        canvas.height = SIZE;
        ctx.drawImage(img, 0, 0, SIZE, SIZE);
        resolve(canvas.toDataURL('image/jpeg', 0.5)); 
      };
    };
  });
};

// --- SUB-COMPONENTS (DEFINED OUTSIDE TO FIX FOCUS BUG) ---

const Navbar = ({ navigate, isAdmin, setIsAdmin }) => (
  <nav className="bg-white/80 backdrop-blur-xl p-4 shadow-xl sticky top-0 z-50 border-b border-pink-100">
    <div className="max-w-7xl mx-auto flex justify-between items-center">
      <div className="font-black text-2xl cursor-pointer flex items-center gap-3 tracking-tighter" onClick={() => navigate('landing')}>
        <div className="w-10 h-10 bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg rotate-3">
          <Palette size={20} />
        </div>
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600 hidden sm:block uppercase tracking-tighter font-black">DHULANDI CUP</span>
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600 sm:hidden uppercase tracking-tighter">NPCC</span>
      </div>
      <div className="flex gap-4 text-xs font-black uppercase tracking-widest items-center">
        <button onClick={() => navigate('directory')} className="text-purple-600 hover:text-pink-500 transition-colors">Directory</button>
        {!isAdmin ? (
          <button onClick={() => navigate('admin-login')} className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-5 py-2.5 rounded-full shadow-lg hover:shadow-pink-200 transition-all flex items-center gap-2">
            <Shield size={14} /> Admin
          </button>
        ) : (
          <button onClick={() => {setIsAdmin(false); navigate('landing');}} className="text-red-500 font-black">EXIT</button>
        )}
      </div>
    </div>
  </nav>
);

const Landing = ({ navigate, setCategory, regControl }) => (
  <div className="max-w-6xl mx-auto mt-16 px-4 text-center pb-24 relative">
    <div className="mb-6 inline-flex items-center gap-2 bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-sm border border-white/50">
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
      {/* Youth Button - Clean */}
      <button 
        disabled={!regControl.youthOpen}
        onClick={() => { setCategory('Youth'); navigate('register'); }} 
        className={`relative p-12 rounded-[3.5rem] shadow-xl border-2 transition-all text-left group overflow-hidden active:scale-95 ${!regControl.youthOpen ? 'bg-gray-100 border-gray-200 cursor-not-allowed grayscale' : 'bg-white border-transparent hover:border-pink-300'}`}
      >
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-pink-50 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
        <Zap className={`${!regControl.youthOpen ? 'text-gray-400' : 'text-pink-600'} mb-10 relative z-10`} size={56} />
        <h2 className="text-5xl font-black mb-12 relative z-10 text-slate-800 uppercase italic leading-none">Youth Pool</h2>
        <div className={`${!regControl.youthOpen ? 'bg-gray-400' : 'bg-pink-600'} text-white w-max px-8 py-3 rounded-full font-black flex items-center gap-2 uppercase text-xs relative z-10 shadow-lg`}>
          {regControl.youthOpen ? 'Register Now' : 'Closed'} <ArrowRight size={16}/>
        </div>
      </button>

      {/* 40+ Button - Clean */}
      <button 
        disabled={!regControl.fortyPlusOpen}
        onClick={() => { setCategory('40+'); navigate('register'); }} 
        className={`relative p-12 rounded-[3.5rem] shadow-xl border-2 transition-all text-left group overflow-hidden active:scale-95 ${!regControl.fortyPlusOpen ? 'bg-gray-100 border-gray-200 cursor-not-allowed grayscale' : 'bg-white border-transparent hover:border-purple-300'}`}
      >
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-purple-50 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
        <Trophy className={`${!regControl.fortyPlusOpen ? 'text-gray-400' : 'text-purple-600'} mb-10 relative z-10`} size={56} />
        <h2 className="text-5xl font-black mb-12 relative z-10 text-slate-800 uppercase italic leading-none">40+ League</h2>
        <div className={`${!regControl.fortyPlusOpen ? 'bg-gray-400' : 'bg-purple-600'} text-white w-max px-8 py-3 rounded-full font-black flex items-center gap-2 uppercase text-xs relative z-10 shadow-lg`}>
          {regControl.fortyPlusOpen ? 'Register Now' : 'Closed'} <ArrowRight size={16}/>
        </div>
      </button>
    </div>
    <div className="mt-24">
      <button onClick={() => navigate('directory')} className="group relative bg-slate-900 text-white px-20 py-7 rounded-full font-black uppercase tracking-[0.3em] text-sm shadow-2xl overflow-hidden active:scale-95">
        <span className="relative z-10">Check Live Directory</span>
        <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </button>
    </div>
  </div>
);

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
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-10">
         <div className="text-center md:text-left">
            <h2 className="text-7xl font-black text-slate-900 uppercase italic tracking-tighter leading-none mb-4">THE POOL</h2>
            <p className="text-pink-500 font-black uppercase tracking-[0.4em] text-[10px] flex items-center gap-3">
              <span className="w-12 h-1 bg-pink-500 rounded-full"></span> DHULANDI CUP 2026
            </p>
         </div>
         <div className="flex flex-col gap-5 w-full md:w-auto">
           <div className="relative group">
             <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-pink-400" size={20} />
             <input 
                type="text" 
                placeholder="FIND A PLAYER..." 
                className="bg-white border-2 border-slate-100 rounded-full pl-16 pr-8 py-5 w-full md:w-96 font-black text-xs tracking-widest focus:border-pink-500 outline-none shadow-2xl transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
           <div className="flex bg-white p-2 rounded-full border shadow-2xl border-slate-100 overflow-hidden">
             {['All', 'Youth', '40+'].map(t => (
               <button key={t} onClick={() => setFilterType(t)} className={`flex-1 px-10 py-4 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${filterType === t ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-xl scale-105' : 'text-slate-400 hover:text-pink-600'}`}>{t}</button>
             ))}
           </div>
         </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
        {filteredList.map(p => (
          <div key={p.id} className="bg-white rounded-[4rem] shadow-2xl overflow-hidden group hover:-translate-y-6 transition-all duration-700 border border-slate-50">
            <div className="h-96 relative overflow-hidden">
              <img src={p.photoUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-110" />
              <div className="absolute top-8 left-8 flex flex-col gap-3">
                 <span className={`text-[8px] font-black px-5 py-2 rounded-full shadow-2xl text-white backdrop-blur-md uppercase tracking-widest ${p.category === 'Youth' ? 'bg-blue-600/80' : 'bg-orange-600/80'}`}>{p.category}</span>
                 <span className={`text-[8px] font-black px-5 py-2 rounded-full shadow-2xl text-white backdrop-blur-md uppercase tracking-widest ${p.paymentStatus === 'Paid' ? 'bg-emerald-600/80' : 'bg-slate-800/80'}`}>{p.paymentStatus === 'Paid' ? 'VERIFIED' : 'PENDING'}</span>
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-1">
                {p.availability && Object.entries(p.availability).filter(([_, v]) => v).map(([date]) => (
                  <span key={date} className="bg-white/20 backdrop-blur-md text-white text-[7px] font-black px-2 py-1 rounded-full uppercase tracking-tighter border border-white/30">
                    Avail: {date}
                  </span>
                ))}
              </div>
            </div>
            <div className="p-12 text-center bg-white">
              <h3 className="font-black text-4xl text-slate-800 uppercase leading-none mb-3 tracking-tighter italic">{p.name}</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">{p.native} • {p.age} Yrs</p>
              <div className={`py-5 px-8 rounded-full text-center font-black text-[10px] uppercase tracking-[0.3em] border-2 transition-all ${p.auctionStatus === 'Sold' ? 'bg-emerald-50 border-emerald-100 text-emerald-600 italic' : 'bg-slate-50 border-slate-100 text-slate-300'}`}>
                {p.auctionStatus === 'Sold' ? `TEAM: ${p.team}` : 'IN POOL'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminDashboard = ({ players, exportData, upd, regControl, updateControl }) => {
  const [sel, setSel] = useState(null);
  return (
    <div className="max-w-7xl mx-auto mt-12 p-6 pb-40">
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
             <div>
               <p className="font-black text-slate-800 uppercase text-lg italic">Youth Pool</p>
               <p className={`text-[10px] font-bold uppercase tracking-widest ${regControl.youthOpen ? 'text-emerald-500' : 'text-red-500'}`}>
                 Currently {regControl.youthOpen ? 'Open' : 'Closed'}
               </p>
             </div>
             <button onClick={() => updateControl('youthOpen', !regControl.youthOpen)} className="transition-transform active:scale-90">
               {regControl.youthOpen ? <ToggleRight size={48} className="text-emerald-500" /> : <ToggleLeft size={48} className="text-slate-300" />}
             </button>
           </div>

           <div className="bg-slate-50 p-6 rounded-[2rem] flex items-center justify-between border-2 border-transparent hover:border-purple-200 transition-all">
             <div>
               <p className="font-black text-slate-800 uppercase text-lg italic">40+ League</p>
               <p className={`text-[10px] font-bold uppercase tracking-widest ${regControl.fortyPlusOpen ? 'text-emerald-500' : 'text-red-500'}`}>
                 Currently {regControl.fortyPlusOpen ? 'Open' : 'Closed'}
               </p>
             </div>
             <button onClick={() => updateControl('fortyPlusOpen', !regControl.fortyPlusOpen)} className="transition-transform active:scale-90">
               {regControl.fortyPlusOpen ? <ToggleRight size={48} className="text-emerald-500" /> : <ToggleLeft size={48} className="text-slate-300" />}
             </button>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-[4rem] shadow-2xl border border-slate-100 overflow-hidden text-center">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1200px]">
            <thead className="bg-slate-50 border-b-2 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">
              <tr>
                <th className="p-12">Candidate Profile</th>
                <th className="p-12 text-center">Availability</th>
                <th className="p-12 text-center">Status</th>
                <th className="p-12 text-center">Assign Team</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {players.map(p => (
                <tr key={p.id} className="hover:bg-pink-50/20 transition-all">
                  <td className="p-12">
                    <div className="flex items-center gap-8">
                      <img src={p.photoUrl} className="w-24 h-24 rounded-[2.5rem] object-cover border-4 border-white shadow-2xl transition-transform" />
                      <div>
                        <div className="font-black text-slate-900 uppercase text-2xl italic tracking-tighter leading-none mb-2">{p.name}</div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.contact} • {p.native}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-12 text-center">
                    <div className="flex flex-wrap gap-2 justify-center max-w-[200px] mx-auto">
                      {p.availability && Object.entries(p.availability).map(([date, val]) => (
                        <span key={date} className={`text-[8px] font-black px-2 py-1 rounded-full border uppercase tracking-widest ${val ? 'bg-emerald-100 border-emerald-300 text-emerald-700' : 'bg-red-50 border-red-200 text-red-400 opacity-30'}`}>
                          {date}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-12 text-center">
                    {p.paymentStatus === 'Paid' ? (
                      <div className="text-emerald-600 font-black uppercase text-[10px] tracking-widest">APPROVED</div>
                    ) : (
                      <button onClick={() => setSel(p)} className="bg-orange-500 text-white px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg">Verify Proof</button>
                    )}
                  </td>
                  <td className="p-12">
                    <div className="flex items-center gap-6 justify-center">
                      <select className="bg-slate-50 border-2 border-transparent rounded-[1.5rem] p-4 font-black text-[10px] uppercase outline-none focus:border-pink-500" value={p.auctionStatus} onChange={(e) => upd(p.id, { auctionStatus: e.target.value })}>
                        <option value="Unsold">In Pool</option><option value="Sold">Sold</option>
                      </select>
                      <input placeholder="TEAM NAME" className="bg-slate-50 border-2 border-transparent rounded-[1.5rem] p-4 w-56 font-black text-[10px] uppercase outline-none focus:bg-white focus:border-pink-500" value={p.team === '-' ? '' : p.team} onChange={(e) => upd(p.id, { team: e.target.value })} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {sel && (
        <div className="fixed inset-0 bg-slate-900/95 flex items-center justify-center p-4 z-[999] backdrop-blur-2xl">
          <div className="bg-white p-16 rounded-[5rem] w-full max-w-2xl text-center relative shadow-2xl">
            <button onClick={() => setSel(null)} className="absolute -top-5 -right-5 bg-white text-slate-900 rounded-full p-5 shadow-2xl"><X size={28}/></button>
            <h3 className="font-black text-4xl mb-10 italic uppercase underline decoration-pink-500">Transaction Proof</h3>
            <div className="bg-slate-50 p-6 rounded-[3.5rem] mb-12 flex items-center justify-center min-h-[400px]">
              <img src={sel.screenshot} className="max-h-[500px] w-full object-contain rounded-3xl" />
            </div>
            <button onClick={async () => { await upd(sel.id, { paymentStatus: 'Paid' }); setSel(null); }} className="w-full py-7 bg-emerald-600 text-white rounded-full font-black shadow-2xl uppercase tracking-widest text-xs">Verify & Approve</button>
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
    const playersRef = collection(db, ...COLLECTION_PATH);
    const unsubPlayers = onSnapshot(playersRef, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setPlayers(list);
    });

    const controlRef = doc(db, ...SETTINGS_DOC_PATH);
    const unsubControl = onSnapshot(controlRef, (snapshot) => {
      if (snapshot.exists()) setRegControl(snapshot.data());
      else setDoc(controlRef, { youthOpen: true, fortyPlusOpen: true });
    });

    return () => { unsubPlayers(); unsubControl(); };
  }, [user]);

  const navigate = (v) => { setView(v); window.scrollTo(0,0); };

  const exportData = () => {
    if (players.length === 0) return alert("No data available!");
    const headers = ["Name", "Category", "Age", "DOB", "Contact", "Native", "Payment", "Auction", "Team", "Availability"];
    const rows = players.map(p => {
      const availStr = p.availability ? Object.entries(p.availability).filter(([_,v])=>v).map(([d])=>d).join("|") : "None";
      return [p.name, p.category, p.age, p.dob, p.contact, p.native, p.paymentStatus, p.auctionStatus, p.team || "-", availStr];
    });
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `NPCC_Master_Data.csv`;
    link.click();
  };

  const upd = async (id, data) => { 
    try { await updateDoc(doc(db, ...COLLECTION_PATH, id), data); } catch (err) { alert(err.message); }
  };

  const updateControl = async (field, value) => {
    try { await updateDoc(doc(db, ...SETTINGS_DOC_PATH), { [field]: value }); } catch (err) { alert(err.message); }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#fdfaf8] text-slate-900 font-black tracking-[0.5em] uppercase text-xs italic">
      <RefreshCcw className="animate-spin text-pink-500 mb-12" size={64}/>
      <p className="animate-pulse">Connecting Cloud...</p>
    </div>
  );

  const availDates = category === 'Youth' ? ['4 Apr', '5 Apr'] : ['3 Apr', '4 Apr', '5 Apr'];

  return (
    <div className="min-h-screen bg-[#fdfaf8] font-sans pb-20 overflow-x-hidden selection:bg-pink-200">
      <Navbar navigate={navigate} isAdmin={isAdmin} setIsAdmin={setIsAdmin} />
      <main>
        {view === 'landing' && <Landing navigate={navigate} setCategory={setCategory} regControl={regControl} />}
        
        {view === 'register' && (
          <form onSubmit={async (e) => {
            e.preventDefault();
            const f = e.target.elements;
            const photo = await compressImage(f.photo.files[0]);
            if (Object.values(availability).filter(v => v).length === 0) return alert("Select availability!");
            setTempPlayer({ 
              name: f.name.value, age: f.age.value, contact: f.contact.value, native: f.native.value, dob: f.dob.value,
              category, photoUrl: photo, timestamp: new Date().toISOString(), id: 'P' + Date.now().toString().slice(-6),
              availability
            });
            navigate('payment');
          }} className="max-w-2xl mx-auto mt-12 p-12 bg-white rounded-[4rem] shadow-2xl space-y-10 mx-4 border border-pink-50">
            <h2 className="text-4xl font-black text-slate-800 uppercase italic text-center underline decoration-pink-300">Registration</h2>
            <div className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-pink-500 ml-4">Full Name</label>
                 <input name="name" required placeholder="NAME" className="w-full p-6 bg-slate-50 rounded-[2rem] font-black uppercase focus:border-pink-500 border-2 border-transparent outline-none transition-all shadow-inner" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-pink-500 ml-4">Age</label>
                   <input name="age" required type="number" placeholder="AGE" className="w-full p-6 bg-slate-50 rounded-[2rem] font-black focus:border-pink-500 border-2 border-transparent outline-none transition-all shadow-inner" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-pink-500 ml-4">DOB</label>
                   <input 
                      name="dob" 
                      required 
                      type="text"
                      onFocus={(e) => e.target.type = 'date'}
                      onBlur={(e) => !e.target.value && (e.target.type = 'text')}
                      placeholder="mm/dd/yyyy" 
                      className="w-full p-6 bg-slate-50 rounded-[2rem] font-black focus:border-pink-500 border-2 border-transparent outline-none transition-all shadow-inner" 
                   />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-pink-500 ml-4">WhatsApp No.</label>
                   <input name="contact" required placeholder="NUMBER" className="w-full p-6 bg-slate-50 rounded-[2rem] font-black focus:border-pink-500 border-2 border-transparent outline-none transition-all shadow-inner" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-pink-500 ml-4">Native in Rajasthan</label>
                   <input name="native" required placeholder="CITY/TOWN" className="w-full p-6 bg-slate-50 rounded-[2rem] font-black uppercase focus:border-pink-500 border-2 border-transparent outline-none transition-all shadow-inner" />
                </div>
              </div>
            </div>

            <div className="bg-pink-50/50 p-8 rounded-[2.5rem] border border-pink-100 text-center">
               <p className="font-black text-slate-800 uppercase text-[10px] tracking-widest mb-6">Availability</p>
               <div className="flex flex-wrap gap-4">
                 {availDates.map(date => (
                   <label key={date} className={`flex-1 min-w-[100px] flex items-center justify-center gap-3 p-4 rounded-2xl cursor-pointer transition-all border-2 ${availability[date] ? 'bg-pink-600 border-pink-600 text-white shadow-lg' : 'bg-white border-pink-100 text-pink-200'}`}>
                     <input type="checkbox" className="hidden" checked={!!availability[date]} onChange={() => setAvailability({...availability, [date]: !availability[date]})} />
                     <span className="font-black uppercase text-[10px] tracking-widest">{date}</span>
                     {availability[date] ? <CheckCircle size={16}/> : <div className="w-4 h-4 rounded-full border-2 border-pink-100"/>}
                   </label>
                 ))}
               </div>
            </div>

            <div className="border-4 border-dashed p-10 text-center rounded-[3rem] bg-slate-50 border-slate-200 relative group">
              <Camera size={40} className="mx-auto text-pink-300 mb-4" />
              <span className="text-[10px] font-black text-pink-300 uppercase tracking-widest">Upload Profile Photo</span>
              <input name="photo" type="file" required accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
            <button type="submit" className="w-full bg-slate-900 text-white py-8 rounded-full font-black text-xl shadow-2xl active:scale-95 transition-all">REGISTER NOW</button>
          </form>
        )}

        {view === 'payment' && (
          <div className="max-w-xl mx-auto mt-12 p-12 bg-white rounded-[4rem] shadow-2xl text-center border-t-[15px] border-pink-500 mx-4">
             <h2 className="text-4xl font-black text-slate-800 mb-8 italic tracking-tighter uppercase leading-none underline decoration-pink-200">Pay 600 using this QR</h2>
             <div className="bg-gradient-to-b from-pink-50 to-white p-12 rounded-[3.5rem] mb-10 border border-pink-100 shadow-inner">
               <img src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`upi://pay?pa=bjain6851@okaxis&pn=Bhuvan%20Jain&am=600&cu=INR`)}`} className="w-64 mx-auto mb-8 rounded-3xl shadow-2xl bg-white p-4 border border-gray-100" alt="QR" />
               <p className="font-black text-slate-800 text-2xl uppercase mb-1 tracking-tighter">Bhuvan Jain</p>
               <div className="bg-purple-100 text-purple-700 py-2.5 px-8 rounded-full inline-block font-black text-[10px] uppercase mb-8 tracking-widest shadow-sm">bjain6851@okaxis</div>
             </div>
             <div className="border-4 border-dotted p-12 bg-slate-50 rounded-[3rem] border-slate-200 relative mb-10 group hover:border-pink-400 transition-colors">
               <CreditCard size={32} className="mx-auto text-slate-300 mb-2 group-hover:text-pink-400 transition-colors" />
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Success Screenshot</span>
               <input type="file" required accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={async (e) => {
                 const ss = await compressImage(e.target.files[0]);
                 setTempPlayer(prev => ({ ...prev, screenshot: ss }));
               }} />
             </div>
             <button onClick={async () => {
               if(!tempPlayer.screenshot) return alert("Upload screenshot!");
               try {
                 await setDoc(doc(db, ...COLLECTION_PATH, tempPlayer.id), tempPlayer);
                 navigate('success');
               } catch(err) { alert(err.message); }
             }} className="w-full bg-slate-900 text-white py-8 rounded-full font-black text-xl shadow-2xl active:scale-95 transition-all uppercase tracking-widest">SUBMIT DATA</button>
          </div>
        )}
        {view === 'directory' && <PlayerDirectory players={players} filterType={filterType} setFilterType={setFilterType} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />}
        {view === 'admin-login' && (
          <div className="max-w-md mx-auto mt-24 p-16 bg-white rounded-[5rem] shadow-2xl text-center border border-pink-50 mx-4">
            <Shield size={48} className="mx-auto text-pink-500 mb-10" />
            <h2 className="text-4xl font-black mb-12 uppercase italic text-slate-800 tracking-tighter leading-none">Admin Access</h2>
            <input type="password" placeholder="SECRET KEY" className="w-full p-8 bg-slate-50 border-2 rounded-[2.5rem] text-center font-black text-2xl outline-none focus:border-pink-500 transition-all shadow-inner" onChange={e => {if(e.target.value === 'bababhuvandev') {setIsAdmin(true); navigate('admin')}}} />
          </div>
        )}
        {view === 'admin' && <AdminDashboard players={players} exportData={exportData} upd={upd} regControl={regControl} updateControl={updateControl} />}
        {view === 'success' && (
          <div className="max-w-xl mx-auto mt-24 text-center p-20 bg-white rounded-[6rem] shadow-2xl mx-4 border-b-8 border-emerald-500">
            <CheckCircle size={64} className="mx-auto text-emerald-500 mb-10 animate-bounce" />
            <h2 className="text-6xl font-black text-slate-900 italic uppercase leading-[0.8] mb-8 underline decoration-emerald-200">Registered!</h2>
            <button onClick={() => navigate('directory')} className="w-full bg-slate-900 text-white py-8 rounded-full font-black uppercase italic tracking-widest text-xs shadow-2xl hover:-translate-y-1 transition-all">Check Live Directory</button>
          </div>
        )}
      </main>
    </div>
  );
}
