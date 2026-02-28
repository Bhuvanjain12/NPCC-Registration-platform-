import React, { useState, useEffect, useMemo } from 'react';
import { 
  User, Phone, MapPin, CheckCircle, CreditCard, Lock, Shield, Users, 
  Search, Camera, Check, X, Zap, Trophy, ChevronRight, ArrowRight, 
  Download, RefreshCcw, Filter, LayoutGrid, LogOut, FileSpreadsheet, Edit3, Calendar,
  Activity, Info, Sparkles, Palette
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

// --- HELPERS ---

// Aggressive Image Compression for high capacity (1000+ users)
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

// --- SUB-COMPONENTS (DEFINED OUTSIDE TO PREVENT RE-RENDERING FOCUS BUG) ---

const Navbar = ({ navigate, isAdmin, setIsAdmin }) => (
  <nav className="bg-white/80 backdrop-blur-xl p-4 shadow-xl sticky top-0 z-50 border-b border-pink-100">
    <div className="max-w-7xl mx-auto flex justify-between items-center">
      <div className="font-black text-2xl cursor-pointer flex items-center gap-3 tracking-tighter" onClick={() => navigate('landing')}>
        <div className="w-10 h-10 bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg rotate-3">
          <Palette size={20} />
        </div>
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600 hidden sm:block uppercase">DHULANDI CUP</span>
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600 sm:hidden uppercase tracking-tighter">NPCC</span>
      </div>
      <div className="flex gap-4 text-xs font-black uppercase tracking-widest items-center">
        <button onClick={() => navigate('directory')} className="text-purple-600 hover:text-pink-500 transition-colors">The Pool</button>
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

const Landing = ({ navigate, setCategory }) => (
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
    <p className="text-slate-500 mb-16 font-bold text-lg max-w-2xl mx-auto uppercase tracking-widest italic opacity-80">
      Cricket of Colors • Celebrate the Season
    </p>
    <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">
      <button onClick={() => { setCategory('Youth'); navigate('register'); }} className="relative bg-white p-12 rounded-[3.5rem] shadow-xl border-2 border-transparent hover:border-pink-300 transition-all text-left group overflow-hidden active:scale-95">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-pink-50 rounded-full group-hover:scale-150 transition-transform duration-700 group-hover:bg-pink-100"></div>
        <Zap className="text-pink-600 mb-8 relative z-10" size={56} />
        <h2 className="text-4xl font-black mb-10 relative z-10 text-slate-800 uppercase italic">Youth Pool</h2>
        <div className="bg-pink-600 text-white w-max px-6 py-2 rounded-full font-black flex items-center gap-2 uppercase text-xs relative z-10 shadow-lg group-hover:bg-pink-700">Register <ArrowRight size={16}/></div>
      </button>

      <button onClick={() => { setCategory('40+'); navigate('register'); }} className="relative bg-white p-12 rounded-[3.5rem] shadow-xl border-2 border-transparent hover:border-purple-300 transition-all text-left group overflow-hidden active:scale-95">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-purple-50 rounded-full group-hover:scale-150 transition-transform duration-700 group-hover:bg-purple-100"></div>
        <Trophy className="text-purple-600 mb-8 relative z-10" size={56} />
        <h2 className="text-4xl font-black mb-10 relative z-10 text-slate-800 uppercase italic">40+ League</h2>
        <div className="bg-purple-600 text-white w-max px-6 py-2 rounded-full font-black flex items-center gap-2 uppercase text-xs relative z-10 shadow-lg group-hover:bg-purple-700">Register <ArrowRight size={16}/></div>
      </button>
    </div>
    <div className="mt-24">
      <button 
        onClick={() => navigate('directory')}
        className="group relative bg-slate-900 text-white px-20 py-7 rounded-full font-black uppercase tracking-[0.3em] text-sm hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] transition-all overflow-hidden"
      >
        <span className="relative z-10">Check Auction Pool</span>
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
           <div className="relative">
             <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-pink-400" size={20} />
             <input 
                type="text" 
                placeholder="FIND A PLAYER..." 
                className="bg-white border-2 border-slate-100 rounded-full pl-16 pr-8 py-5 w-full md:w-96 font-black text-xs tracking-widest focus:border-pink-500 outline-none shadow-2xl transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
           <div className="flex bg-white p-2 rounded-full border shadow-2xl border-slate-100">
             {['All', 'Youth', '40+'].map(t => (
               <button key={t} onClick={() => setFilterType(t)} className={`flex-1 px-10 py-4 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${filterType === t ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-xl scale-105' : 'text-slate-400 hover:text-pink-600'}`}>{t}</button>
             ))}
           </div>
         </div>
      </div>

      {filteredList.length === 0 ? (
        <div className="py-40 text-center">
          <Users size={100} className="mx-auto text-slate-100 mb-8" />
          <p className="font-black text-slate-300 text-3xl uppercase tracking-widest italic leading-none">Candidate Pool Empty</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
          {filteredList.map(p => (
            <div key={p.id} className="bg-white rounded-[4rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] overflow-hidden group hover:-translate-y-6 transition-all duration-700 border border-slate-50">
              <div className="h-96 relative overflow-hidden text-center">
                <img src={p.photoUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-110" />
                <div className="absolute top-8 left-8 flex flex-col gap-3">
                   <span className={`text-[8px] font-black px-5 py-2 rounded-full shadow-2xl text-white backdrop-blur-md uppercase tracking-widest ${p.category === 'Youth' ? 'bg-blue-600/80' : 'bg-orange-600/80'}`}>{p.category}</span>
                   <span className={`text-[8px] font-black px-5 py-2 rounded-full shadow-2xl text-white backdrop-blur-md uppercase tracking-widest ${p.paymentStatus === 'Paid' ? 'bg-emerald-600/80' : 'bg-slate-800/80'}`}>{p.paymentStatus === 'Paid' ? 'VERIFIED' : 'PENDING'}</span>
                </div>
              </div>
              <div className="p-12 text-center bg-white">
                <h3 className="font-black text-4xl text-slate-800 uppercase leading-none mb-3 tracking-tighter italic">{p.name}</h3>
                <div className="flex items-center justify-center gap-3 mb-4">
                  <p className="text-[10px] font-black text-pink-500 uppercase tracking-widest">{p.native}</p>
                  <div className="w-1.5 h-1.5 bg-slate-100 rounded-full"></div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.age} Yrs</p>
                </div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-8 flex items-center justify-center gap-2">
                  <Calendar size={12}/> DOB: {p.dob || "N/A"}
                </p>
                <div className={`py-5 px-8 rounded-full text-center font-black text-[10px] uppercase tracking-[0.3em] shadow-inner border-2 transition-all ${p.auctionStatus === 'Sold' ? 'bg-emerald-50 border-emerald-100 text-emerald-600 italic' : 'bg-slate-50 border-slate-100 text-slate-300'}`}>
                  {p.auctionStatus === 'Sold' ? `TEAM: ${p.team}` : 'IN POOL'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AdminDashboard = ({ players, exportData, upd }) => {
  const [sel, setSel] = useState(null);
  
  return (
    <div className="max-w-7xl mx-auto mt-12 p-6 pb-40">
      <div className="flex flex-col lg:flex-row justify-between items-end mb-16 gap-10">
         <h2 className="text-7xl font-black text-slate-900 uppercase italic tracking-tighter leading-none mb-6 underline decoration-pink-500">Command</h2>
         <button onClick={exportData} className="flex items-center gap-4 bg-emerald-600 text-white px-14 py-6 rounded-full font-black text-xs shadow-2xl active:scale-95 uppercase tracking-widest">
           <FileSpreadsheet size={24}/> Export Report
         </button>
      </div>
      
      <div className="bg-white rounded-[4rem] shadow-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1000px]">
            <thead className="bg-slate-50 border-b-2 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">
              <tr>
                <th className="p-12">Candidate Profile</th>
                <th className="p-12">Birth Info</th>
                <th className="p-12 text-center">Status</th>
                <th className="p-12 text-center">Assign</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {players.map(p => (
                <tr key={p.id} className="hover:bg-pink-50/20 transition-all group">
                  <td className="p-12">
                    <div className="flex items-center gap-8">
                      <img src={p.photoUrl} className="w-24 h-24 rounded-[2.5rem] object-cover border-4 border-white shadow-2xl transition-transform group-hover:scale-110" />
                      <div>
                        <div className="font-black text-slate-900 uppercase text-2xl italic tracking-tighter leading-none mb-2">{p.name}</div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
                          <Phone size={12}/> {p.contact} <div className="w-1.5 h-1.5 bg-slate-200 rounded-full"></div> {p.native}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-12">
                    <div className="text-sm font-black text-slate-700 uppercase tracking-tighter italic">
                      {p.dob || "Unknown"}
                    </div>
                  </td>
                  <td className="p-12 text-center">
                    {p.paymentStatus === 'Paid' ? (
                      <div className="bg-emerald-100 text-emerald-700 font-black uppercase text-[10px] tracking-widest px-6 py-2 rounded-full inline-flex items-center gap-2">
                        <CheckCircle size={14}/> APPROVED
                      </div>
                    ) : (
                      <button onClick={() => setSel(p)} className="bg-orange-500 text-white px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:bg-orange-600 transition-all active:scale-95">Verify SS</button>
                    )}
                  </td>
                  <td className="p-12">
                    <div className="flex items-center gap-6 justify-center">
                      <select className="bg-slate-50 border-2 border-transparent rounded-[1.5rem] p-4 font-black text-[10px] uppercase tracking-widest outline-none focus:border-pink-500 transition-all" value={p.auctionStatus} onChange={(e) => upd(p.id, { auctionStatus: e.target.value })}>
                        <option value="Unsold">In Pool</option>
                        <option value="Sold">Sold</option>
                      </select>
                      <input placeholder="TEAM NAME" className="bg-slate-50 border-2 border-transparent rounded-[1.5rem] p-4 w-56 font-black text-[10px] uppercase focus:bg-white focus:border-pink-500 outline-none shadow-inner" value={p.team === '-' ? '' : p.team} onChange={(e) => upd(p.id, { team: e.target.value })} />
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
          <div className="bg-white p-16 rounded-[5rem] w-full max-w-2xl text-center relative shadow-[0_50px_100px_rgba(0,0,0,0.5)] border border-white/20">
            <button onClick={() => setSel(null)} className="absolute -top-5 -right-5 bg-white text-slate-900 rounded-full p-5 shadow-2xl hover:scale-110 transition-transform"><X size={28}/></button>
            <h3 className="font-black text-4xl mb-10 text-slate-800 italic uppercase underline decoration-pink-500 tracking-tighter">Transfer Proof</h3>
            <div className="bg-slate-50 p-6 rounded-[3.5rem] mb-12 border shadow-inner overflow-hidden flex items-center justify-center min-h-[400px]">
              <img src={sel.screenshot} className="max-h-[500px] w-full object-contain rounded-3xl shadow-xl" />
            </div>
            <div className="flex gap-6">
              <button onClick={() => setSel(null)} className="flex-1 py-7 bg-slate-50 rounded-full font-black text-slate-400 uppercase tracking-widest text-xs">Dismiss</button>
              <button onClick={async () => { await upd(sel.id, { paymentStatus: 'Paid' }); setSel(null); }} className="flex-1 py-7 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full font-black shadow-2xl uppercase tracking-widest text-xs hover:shadow-emerald-200 transition-all">Verify & Approve</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- MAIN APP COMPONENT ---

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
    const unsubscribe = onSnapshot(playersRef, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setPlayers(list);
    }, (err) => {
      console.error("Sync Error:", err);
    });
    return () => unsubscribe();
  }, [user]);

  const navigate = (v) => { setView(v); window.scrollTo(0,0); };

  const exportData = () => {
    if (players.length === 0) return alert("No data available!");
    const headers = ["Name", "Category", "Age", "DOB", "Contact", "Native Place", "Payment Status", "Auction Status", "Team"];
    const rows = players.map(p => [p.name, p.category, p.age, p.dob || "N/A", p.contact, p.native, p.paymentStatus, p.auctionStatus, p.team || "-"]);
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `NPCC_Dhulandi_Cup_Report.csv`;
    link.click();
  };

  const upd = async (id, data) => { 
    try { await updateDoc(doc(db, ...COLLECTION_PATH, id), data); } catch (err) { alert(err.message); }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#fdfaf8] text-slate-900 font-black tracking-[0.5em] uppercase text-xs italic">
      <RefreshCcw className="animate-spin text-pink-500 mb-12" size={64}/>
      <p className="animate-pulse">Loading Championship Server...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fdfaf8] font-sans pb-20 overflow-x-hidden selection:bg-pink-200">
      <Navbar navigate={navigate} isAdmin={isAdmin} setIsAdmin={setIsAdmin} />
      <main className="animate-in fade-in duration-1000">
        {view === 'landing' && <Landing navigate={navigate} setCategory={setCategory} />}
        
        {view === 'register' && (
          <form onSubmit={async (e) => {
            e.preventDefault();
            const f = e.target.elements;
            const photo = await compressImage(f.photo.files[0]);
            setTempPlayer({ 
              name: f.name.value, age: f.age.value, contact: f.contact.value, native: f.native.value, dob: f.dob.value,
              category, photoUrl: photo, timestamp: new Date().toISOString(), id: 'P' + Date.now().toString().slice(-6) 
            });
            navigate('payment');
          }} className="max-w-2xl mx-auto mt-12 p-12 bg-white rounded-[4rem] shadow-2xl space-y-10 mx-4 border border-pink-50 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Palette size={150} className="text-pink-500" /></div>
            <h2 className="text-4xl font-black text-slate-800 uppercase italic text-center underline decoration-pink-200 underline-offset-8">Registration</h2>
            <div className="space-y-6 relative z-10">
              <input name="name" required placeholder="FULL PLAYER NAME" className="w-full p-6 bg-slate-50 border-2 border-transparent rounded-[2rem] font-bold uppercase focus:bg-white focus:border-pink-500 transition-all outline-none" />
              <div className="grid grid-cols-2 gap-8">
                <input name="age" required type="number" placeholder="AGE" className="w-full p-6 bg-slate-50 border-2 border-transparent rounded-[2rem] font-bold focus:bg-white focus:border-pink-500 transition-all outline-none" />
                <input name="dob" required type="date" className="w-full p-6 bg-slate-50 border-2 border-transparent rounded-[2rem] font-bold focus:bg-white focus:border-pink-500 transition-all outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-8">
                <input name="contact" required placeholder="WHATSAPP NO." className="w-full p-6 bg-slate-50 border-2 border-transparent rounded-[2rem] font-bold focus:bg-white focus:border-pink-500 transition-all outline-none" />
                <input name="native" required placeholder="NATIVE PLACE" className="w-full p-6 bg-slate-50 border-2 border-transparent rounded-[2rem] font-bold uppercase focus:bg-white focus:border-pink-500 transition-all outline-none" />
              </div>
            </div>
            <div className="border-4 border-dashed p-10 text-center rounded-[3rem] bg-pink-50/30 border-pink-100 group relative cursor-pointer">
              <Camera size={40} className="mx-auto text-pink-300 mb-4 group-hover:text-pink-500 transition-colors" />
              <span className="text-[10px] font-black text-pink-300 uppercase tracking-widest group-hover:text-pink-500 transition-colors">Upload Profile Photo</span>
              <input name="photo" type="file" required accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-7 rounded-full font-black text-xl shadow-2xl hover:shadow-pink-200 transition-all uppercase tracking-widest active:scale-95">Continue Registration</button>
          </form>
        )}

        {view === 'payment' && (
          <div className="max-w-xl mx-auto mt-12 p-12 bg-white rounded-[4rem] shadow-2xl text-center border-t-[15px] border-pink-500 mx-4 relative overflow-hidden">
             <h2 className="text-4xl font-black text-slate-800 mb-2 italic tracking-tighter uppercase underline decoration-pink-200">DHULANDI CUP</h2>
             <p className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] mb-10">Entry Confirmation</p>
             
             <div className="bg-gradient-to-b from-pink-50 to-white p-12 rounded-[3.5rem] mb-10 border border-pink-100 shadow-inner">
               <div className="bg-white p-6 rounded-3xl shadow-2xl inline-block mb-6 rotate-1">
                 <img src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`upi://pay?pa=bjain6851@okaxis&pn=Bhuvan%20Jain&cu=INR`)}`} className="w-64 h-64" alt="QR" />
               </div>
               <p className="font-black text-slate-800 text-2xl uppercase mb-1 tracking-tighter">Bhuvan Jain</p>
               <div className="bg-purple-100 text-purple-700 py-2.5 px-8 rounded-full inline-block font-black text-[10px] uppercase mb-8 tracking-widest">bjain6851@okaxis</div>
               <p className="text-xs font-bold text-pink-400 uppercase tracking-widest">Scan & Pay to join the grand league</p>
             </div>

             <div className="text-left mb-10">
               <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-6 mb-3 block uppercase">Attach Transfer Proof</label>
               <div className="border-4 border-dotted p-12 bg-slate-50 rounded-[3rem] border-slate-200 relative group cursor-pointer hover:bg-white hover:border-pink-400 transition-all flex flex-col items-center gap-4">
                 <CreditCard size={32} className="text-pink-400 group-hover:scale-110 transition-transform" />
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Screenshot</span>
                 <input type="file" required accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={async (e) => {
                   const ss = await compressImage(e.target.files[0]);
                   setTempPlayer(prev => ({ ...prev, screenshot: ss }));
                 }} />
                 {tempPlayer?.screenshot && <div className="text-emerald-500 font-black text-[10px] uppercase">✓ File Selected</div>}
               </div>
             </div>

             <button onClick={async () => {
               if(!tempPlayer.screenshot) return alert("Please upload screenshot!");
               try {
                 await setDoc(doc(db, ...COLLECTION_PATH, tempPlayer.id), { 
                   ...tempPlayer, 
                   paymentStatus: 'Pending', 
                   auctionStatus: 'Unsold', 
                   team: '-' 
                 });
                 navigate('success');
               } catch(err) { alert(err.message); }
             }} className="w-full bg-slate-900 text-white py-8 rounded-full font-black text-xl shadow-2xl active:scale-95 transition-all uppercase tracking-widest">Submit Final Registration</button>
          </div>
        )}

        {view === 'directory' && (
          <PlayerDirectory 
            players={players} 
            filterType={filterType} 
            setFilterType={setFilterType} 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm} 
          />
        )}

        {view === 'admin-login' && (
          <div className="max-w-md mx-auto mt-24 p-16 bg-white rounded-[5rem] shadow-2xl text-center border border-pink-50 mx-4">
            <Shield size={48} className="mx-auto text-pink-500 mb-10 rotate-3 shadow-pink-100" />
            <h2 className="text-4xl font-black mb-12 uppercase italic text-slate-800 tracking-tighter leading-none underline decoration-pink-500 underline-offset-8">Admin Access</h2>
            <input 
              type="password" 
              placeholder="ENTER SECRET KEY" 
              className="w-full p-8 bg-slate-50 border-2 rounded-[2.5rem] text-center font-black text-2xl tracking-[0.4em] outline-none transition-all focus:bg-white focus:border-pink-500 shadow-inner" 
              onChange={e => {if(e.target.value === 'bababhuvandev') {setIsAdmin(true); navigate('admin')}}} 
            />
          </div>
        )}

        {view === 'admin' && <AdminDashboard players={players} exportData={exportData} upd={upd} />}

        {view === 'success' && (
          <div className="max-w-xl mx-auto mt-24 text-center p-20 bg-white rounded-[6rem] shadow-[0_50px_100px_-20px_rgba(219,39,119,0.15)] mx-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-5 bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500"></div>
            <div className="w-28 h-28 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-12 shadow-inner">
              <CheckCircle size={64} className="animate-bounce" />
            </div>
            <h2 className="text-6xl font-black text-slate-900 italic uppercase tracking-tighter leading-[0.8] mb-8 underline decoration-emerald-100 underline-offset-8">Success!</h2>
            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest italic leading-relaxed mb-16 px-4">Your details are live in the candidate pool.<br/>Verification updates will reflect shortly.</p>
            <button onClick={() => navigate('directory')} className="w-full bg-slate-900 text-white py-8 rounded-full font-black uppercase italic shadow-2xl tracking-[0.3em] text-xs hover:-translate-y-2 transition-all">Go to Pool Directory</button>
          </div>
        )}
      </main>
    </div>
  );
}
