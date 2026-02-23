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

// MANDATORY PATH
const COLLECTION_PATH = ['artifacts', appId, 'public', 'data', 'players'];

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

function App() {
  const [user, setUser] = useState(null);
  const [players, setPlayers] = useState([]);
  const [view, setView] = useState('landing'); 
  const [category, setCategory] = useState(null); 
  const [tempPlayer, setTempPlayer] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // --- AUTHENTICATION ---
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

  // --- DATA SYNC ---
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

  // --- EXCEL EXPORT ---
  const exportData = () => {
    if (players.length === 0) return alert("No data available!");
    const headers = ["Name", "Category", "Age", "DOB", "Contact", "Native Place", "Payment Status", "Auction Status", "Team"];
    const rows = players.map(p => [
      p.name, p.category, p.age, p.dob || "N/A", p.contact, p.native, p.paymentStatus, p.auctionStatus, p.team || "-"
    ]);
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `NPCC_Dhulandi_Cup_Report.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- FILTERED DATA ---
  const filteredList = useMemo(() => {
    return players.filter(p => {
      const matchType = filterType === 'All' || p.category === filterType;
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.native.toLowerCase().includes(searchTerm.toLowerCase());
      return matchType && matchSearch;
    });
  }, [players, filterType, searchTerm]);

  // --- UI COMPONENTS ---

  const Navbar = () => (
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

  const Landing = () => (
    <div className="max-w-6xl mx-auto mt-16 px-4 text-center pb-24 relative">
      {/* Decorative Splashes */}
      <div className="absolute top-0 -left-20 w-64 h-64 bg-pink-400 opacity-10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 -right-20 w-80 h-80 bg-orange-400 opacity-10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="mb-6 inline-flex items-center gap-2 bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-sm border border-white/50">
        <Sparkles size={14} className="text-pink-500 animate-pulse"/> Season 2026 Live
      </div>
      
      <h1 className="text-6xl md:text-9xl font-black text-slate-900 mb-6 uppercase tracking-tighter leading-[0.85] animate-in fade-in slide-in-from-bottom-10 duration-700">
        NPCC <br/> 
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-orange-500 to-yellow-500 drop-shadow-sm">
          DHULANDI CUP
        </span>
      </h1>
      
      <p className="text-slate-500 mb-16 font-bold text-lg max-w-2xl mx-auto uppercase tracking-widest italic opacity-80">
        Cricket of Colors • Celebrate the Season
      </p>
      
      <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">
        <button onClick={() => { setCategory('Youth'); navigate('register'); }} className="relative bg-white p-12 rounded-[3.5rem] shadow-[0_30px_60px_-15px_rgba(219,39,119,0.2)] border-2 border-transparent hover:border-pink-300 transition-all text-left group overflow-hidden active:scale-95">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-pink-50 rounded-full group-hover:scale-150 transition-transform duration-700 group-hover:bg-pink-100"></div>
          <Zap className="text-pink-600 mb-8 relative z-10" size={56} />
          <h2 className="text-4xl font-black mb-2 relative z-10 text-slate-800 uppercase italic">Youth Pool</h2>
          <p className="text-pink-400 text-xs mb-8 relative z-10 font-black tracking-widest">15 - 35 YEARS</p>
          <div className="bg-pink-600 text-white w-max px-6 py-2 rounded-full font-black flex items-center gap-2 uppercase text-xs relative z-10 shadow-lg group-hover:bg-pink-700">Register <ArrowRight size={16}/></div>
        </button>

        <button onClick={() => { setCategory('40+'); navigate('register'); }} className="relative bg-white p-12 rounded-[3.5rem] shadow-[0_30px_60px_-15px_rgba(124,58,237,0.2)] border-2 border-transparent hover:border-purple-300 transition-all text-left group overflow-hidden active:scale-95">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-purple-50 rounded-full group-hover:scale-150 transition-transform duration-700 group-hover:bg-purple-100"></div>
          <Trophy className="text-purple-600 mb-8 relative z-10" size={56} />
          <h2 className="text-4xl font-black mb-2 relative z-10 text-slate-800 uppercase italic">40+ League</h2>
          <p className="text-purple-400 text-xs mb-8 relative z-10 font-black tracking-widest">VETERANS ONLY</p>
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

  const Register = () => {
    const [form, setForm] = useState({ name: '', age: '', contact: '', native: '', dob: '' });
    const [photo, setPhoto] = useState(null);
    const [isComping, setIsComping] = useState(false);

    const handleNext = (e) => {
      e.preventDefault();
      if(players.some(p => p.contact === form.contact)) return alert("Mobile number already registered!");
      if(!photo) return alert("Please upload your photo!");
      setTempPlayer({ ...form, category, photoUrl: photo, timestamp: new Date().toISOString(), id: 'P' + Date.now().toString().slice(-6) });
      navigate('payment');
    };

    return (
      <form onSubmit={handleNext} className="max-w-2xl mx-auto mt-12 p-12 bg-white rounded-[4rem] shadow-2xl space-y-10 mx-4 border border-pink-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Palette size={150} className="text-pink-500" />
        </div>
        
        <div className="text-center relative z-10">
          <h2 className="text-4xl font-black text-slate-800 uppercase italic tracking-tighter">Candidate Info</h2>
          <div className="h-1.5 w-24 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="space-y-6 relative z-10">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-500 ml-5">Full Player Name</label>
            <input required placeholder="Enter Name" className="w-full p-6 bg-slate-50 border-2 border-transparent rounded-[2rem] font-bold uppercase focus:bg-white focus:border-pink-500 transition-all outline-none" onChange={e => setForm({...form, name: e.target.value})} />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-500 ml-5">Age</label>
              <input required type="number" placeholder="Years" className="w-full p-6 bg-slate-50 border-2 border-transparent rounded-[2rem] font-bold focus:bg-white focus:border-pink-500 transition-all outline-none" onChange={e => setForm({...form, age: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-500 ml-5">Date of Birth</label>
              <input required type="date" className="w-full p-6 bg-slate-50 border-2 border-transparent rounded-[2rem] font-bold focus:bg-white focus:border-pink-500 transition-all outline-none" onChange={e => setForm({...form, dob: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-500 ml-5">WhatsApp No.</label>
              <input required placeholder="Contact" className="w-full p-6 bg-slate-50 border-2 border-transparent rounded-[2rem] font-bold focus:bg-white focus:border-pink-500 transition-all outline-none" onChange={e => setForm({...form, contact: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-500 ml-5">Native Place</label>
              <input required placeholder="City/Town" className="w-full p-6 bg-slate-50 border-2 border-transparent rounded-[2rem] font-bold uppercase focus:bg-white focus:border-pink-500 transition-all outline-none" onChange={e => setForm({...form, native: e.target.value})} />
            </div>
          </div>
        </div>

        <div className="border-4 border-dashed p-10 text-center cursor-pointer relative rounded-[3rem] bg-pink-50/50 border-pink-100 hover:bg-pink-50 transition-all group">
          {photo ? (
            <img src={photo} className="h-44 w-44 mx-auto rounded-[2.5rem] object-cover border-4 border-white shadow-2xl rotate-2" />
          ) : (
            <div className="text-pink-300 font-black flex flex-col items-center gap-4 uppercase text-xs tracking-widest group-hover:text-pink-500 transition-colors">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                <Camera size={32}/>
              </div>
              {isComping ? "Scaling Gulal..." : "Upload Profile Photo"}
            </div>
          )}
          <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={async e => {
            setIsComping(true);
            setPhoto(await compressImage(e.target.files[0]));
            setIsComping(false);
          }} />
        </div>
        
        <button type="submit" disabled={isComping} className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-7 rounded-full font-black text-xl shadow-2xl hover:shadow-pink-300 transition-all flex items-center justify-center gap-3 active:scale-95 uppercase tracking-widest">
          {isComping ? "Please wait..." : "Continue Registration"} <ChevronRight size={22}/>
        </button>
      </form>
    );
  };

  const Payment = () => {
    const [ss, setSs] = useState(null);
    const [saving, setSaving] = useState(false);
    const upiId = "bjain6851@okaxis";
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`upi://pay?pa=${upiId}&pn=Bhuvan%20Jain&cu=INR`)}`;

    const handleFinalSubmit = async () => {
      setSaving(true);
      try {
        const playerRef = doc(db, ...COLLECTION_PATH, tempPlayer.id);
        await setDoc(playerRef, { 
          ...tempPlayer, 
          paymentStatus: 'Pending', 
          auctionStatus: 'Unsold', 
          team: '-', 
          screenshot: ss 
        });
        navigate('success');
      } catch (err) { 
        alert("UPLOAD FAILED: " + err.message); 
      }
      setSaving(false);
    };

    return (
      <div className="max-w-xl mx-auto mt-12 p-12 bg-white rounded-[4rem] shadow-2xl text-center border-t-[15px] border-pink-500 mx-4">
        <h2 className="text-4xl font-black text-slate-800 mb-2 italic tracking-tighter uppercase leading-none underline decoration-pink-200">DHULANDI CUP</h2>
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.4em] mb-10">Entry Confirmation</h3>
        
        <div className="bg-gradient-to-b from-pink-50 to-white p-12 rounded-[3.5rem] mb-10 border border-pink-100 shadow-inner">
          <div className="bg-white p-6 rounded-3xl shadow-2xl inline-block mb-6 rotate-1">
            <img src={qrUrl} className="w-64 h-64" alt="QR" />
          </div>
          <p className="font-black text-slate-800 text-2xl tracking-tighter uppercase mb-1">Bhuvan Jain</p>
          <div className="bg-purple-100 text-purple-700 py-2.5 px-8 rounded-full inline-block font-black text-[10px] tracking-[0.2em] mb-8 uppercase">
            {upiId}
          </div>
          <p className="text-xs font-bold text-pink-400 uppercase tracking-widest leading-relaxed">
            Scan & Pay to join the grand league.<br/>Amount is flexible for registration.
          </p>
        </div>

        <div className="text-left mb-10">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-6 mb-3 block">Attach Transfer Proof</label>
          <div className="border-4 border-dotted p-12 relative bg-slate-50 rounded-[3rem] cursor-pointer border-slate-200 hover:bg-white hover:border-pink-400 transition-all flex flex-col items-center gap-5 group">
            {ss ? (
              <img src={ss} className="h-64 mx-auto rounded-3xl shadow-2xl border-4 border-white" />
            ) : (
              <>
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl text-pink-400 group-hover:scale-110 transition-transform">
                  <CreditCard size={32}/>
                </div>
                <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Select Screenshot</span>
              </>
            )}
            <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={async e => setSs(await compressImage(e.target.files[0]))} />
          </div>
        </div>

        <button onClick={handleFinalSubmit} disabled={!ss || saving} className="w-full bg-slate-900 text-white py-7 rounded-full font-black text-xl shadow-2xl disabled:bg-slate-200 transition-all uppercase tracking-widest active:scale-95">
          {saving ? "SAVING CANDIDATE..." : "Submit Registration"}
        </button>
      </div>
    );
  };

  const PlayerDirectory = () => {
    return (
      <div className="max-w-7xl mx-auto mt-12 p-6 pb-32">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-10">
           <div className="text-center md:text-left">
              <h2 className="text-7xl font-black text-slate-900 uppercase italic tracking-tighter leading-none mb-4">THE POOL</h2>
              <p className="text-pink-500 font-black uppercase tracking-[0.4em] text-[10px] flex items-center gap-3">
                <div className="w-12 h-1 bg-pink-500 rounded-full"></div> DHULANDI CUP 2026
              </p>
           </div>
           
           <div className="flex flex-col gap-5 w-full md:w-auto">
             <div className="relative group">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-pink-400 group-focus-within:text-pink-600 transition-colors" size={20} />
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
                <div className="h-96 relative overflow-hidden">
                  <img src={p.photoUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute top-8 left-8 flex flex-col gap-3">
                     <span className={`text-[8px] font-black px-5 py-2 rounded-full shadow-2xl text-white backdrop-blur-md uppercase tracking-widest ${p.category === 'Youth' ? 'bg-blue-600/80' : 'bg-orange-600/80'}`}>{p.category}</span>
                     <span className={`text-[8px] font-black px-5 py-2 rounded-full shadow-2xl text-white backdrop-blur-md uppercase tracking-widest ${p.paymentStatus === 'Paid' ? 'bg-emerald-600/80' : 'bg-slate-800/80'}`}>{p.paymentStatus === 'Paid' ? 'VERIFIED' : 'PENDING'}</span>
                  </div>
                </div>
                <div className="p-12 text-center relative bg-white">
                  <h3 className="font-black text-4xl text-slate-800 uppercase leading-none mb-3 tracking-tighter italic">{p.name}</h3>
                  <div className="flex items-center justify-center gap-3 mb-8">
                    <p className="text-[10px] font-black text-pink-500 uppercase tracking-widest">{p.native}</p>
                    <div className="w-1.5 h-1.5 bg-slate-100 rounded-full"></div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.age} Yrs</p>
                  </div>
                  
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

  const AdminDashboard = () => {
    const [sel, setSel] = useState(null);
    const upd = async (id, data) => { 
      try { await updateDoc(doc(db, ...COLLECTION_PATH, id), data); } catch (err) { alert(err.message); }
    };

    const stats = useMemo(() => {
      const total = players.length;
      const verified = players.filter(p => p.paymentStatus === 'Paid').length;
      const sold = players.filter(p => p.auctionStatus === 'Sold').length;
      return { total, verified, sold };
    }, [players]);
    
    return (
      <div className="max-w-7xl mx-auto mt-12 p-6 pb-40">
        <div className="flex flex-col lg:flex-row justify-between items-end mb-16 gap-10">
           <div className="w-full lg:w-auto">
              <h2 className="text-7xl font-black text-slate-900 uppercase italic tracking-tighter leading-none mb-6 underline decoration-pink-500">Command</h2>
              <div className="flex flex-wrap gap-6">
                <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 shadow-2xl flex flex-col items-center min-w-[150px]">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Players</span>
                  <span className="text-5xl font-black text-slate-900 leading-none">{stats.total}</span>
                </div>
                <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 shadow-2xl flex flex-col items-center min-w-[150px]">
                  <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-2">Verified</span>
                  <span className="text-5xl font-black text-emerald-600 leading-none">{stats.verified}</span>
                </div>
                <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 shadow-2xl flex flex-col items-center min-w-[150px]">
                  <span className="text-[9px] font-black text-pink-400 uppercase tracking-widest mb-2">Sold</span>
                  <span className="text-5xl font-black text-pink-600 leading-none">{stats.sold}</span>
                </div>
              </div>
           </div>
           <button onClick={exportData} className="flex items-center gap-4 bg-emerald-600 text-white px-14 py-6 rounded-full font-black text-xs shadow-[0_20px_50px_rgba(5,150,105,0.4)] hover:bg-emerald-700 transition active:scale-95 uppercase tracking-[0.2em]">
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
                        <img src={p.photoUrl} className="w-24 h-24 rounded-[2.5rem] object-cover border-4 border-white shadow-2xl transition-transform group-hover:scale-110 group-hover:rotate-2" />
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
                        <button onClick={() => setSel(p)} className="bg-orange-500 text-white px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-orange-100 hover:bg-orange-600 transition-all active:scale-95">Check SS</button>
                      )}
                    </td>
                    <td className="p-12">
                      <div className="flex items-center gap-6 justify-center">
                        <select className="bg-slate-50 border-2 border-transparent rounded-[1.5rem] p-4 font-black text-[10px] uppercase tracking-widest outline-none focus:border-pink-500 transition-all" value={p.auctionStatus} onChange={(e) => upd(p.id, { auctionStatus: e.target.value })}>
                          <option value="Unsold">In Pool</option>
                          <option value="Sold">Sold</option>
                        </select>
                        <div className="relative">
                          <Edit3 className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                          <input placeholder="TEAM NAME" className="bg-slate-50 border-2 border-transparent rounded-[1.5rem] p-4 w-56 font-black text-[10px] uppercase tracking-widest focus:bg-white focus:border-pink-500 outline-none shadow-inner" value={p.team === '-' ? '' : p.team} onChange={(e) => upd(p.id, { team: e.target.value })} />
                        </div>
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
                {sel.screenshot ? (
                   <img src={sel.screenshot} className="max-h-[500px] w-full object-contain rounded-3xl shadow-2xl" />
                ) : (
                   <div className="text-slate-300 uppercase font-black tracking-[0.5em]">No Data Attachment</div>
                )}
              </div>
              <div className="flex gap-6">
                <button onClick={() => setSel(null)} className="flex-1 py-7 bg-slate-50 rounded-full font-black text-slate-400 uppercase tracking-[0.2em] text-xs">Dismiss</button>
                <button onClick={async () => { await upd(sel.id, { paymentStatus: 'Paid' }); setSel(null); }} className="flex-1 py-7 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full font-black shadow-2xl uppercase tracking-[0.2em] text-xs hover:shadow-emerald-200 transition-all">Verify & Approve</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const AdminLogin = () => {
    const [p, setP] = useState('');
    return (
      <div className="max-w-md mx-auto mt-24 p-16 bg-white rounded-[5rem] shadow-2xl text-center border border-pink-50 mx-4">
        <div className="w-24 h-24 bg-pink-50 text-pink-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-lg rotate-3">
          <Shield size={48} />
        </div>
        <h2 className="text-4xl font-black mb-12 uppercase tracking-tighter italic text-slate-800">Admin Login</h2>
        <div className="space-y-6">
          <input type="password" placeholder="ENTER SECRET KEY" className="w-full p-8 bg-slate-50 border-2 border-transparent rounded-[2.5rem] text-center font-black text-2xl tracking-[0.4em] shadow-inner focus:bg-white focus:border-pink-500 transition-all outline-none" onChange={e => {if(e.target.value === 'bababhuvandev') {setIsAdmin(true); navigate('admin')}}} />
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em]">Restricted Territory</p>
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#fdfaf8] text-slate-900 font-black tracking-[0.5em] uppercase text-xs italic">
      <div className="relative mb-12 scale-150">
        <RefreshCcw className="animate-spin text-pink-500" size={64}/>
        <div className="absolute inset-0 flex items-center justify-center">
          <Palette size={24} className="animate-bounce text-purple-600"/>
        </div>
      </div>
      <p className="animate-pulse">Loading Championship Server...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fdfaf8] font-sans pb-20 selection:bg-pink-100 selection:text-pink-900 overflow-x-hidden">
      <Navbar />
      <main className="animate-in fade-in duration-1000">
        {view === 'landing' && <Landing />}
        {view === 'register' && <Register />}
        {view === 'payment' && <Payment />}
        {view === 'directory' && <PlayerDirectory />}
        {view === 'admin-login' && <AdminLogin />}
        {view === 'admin' && <AdminDashboard />}
        {view === 'success' && (
          <div className="max-w-xl mx-auto mt-24 text-center p-20 bg-white rounded-[6rem] shadow-[0_50px_100px_-20px_rgba(219,39,119,0.15)] mx-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-5 bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500"></div>
            <div className="w-28 h-28 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-12 shadow-inner">
              <CheckCircle size={64} className="animate-bounce" />
            </div>
            <h2 className="text-6xl font-black text-slate-900 italic uppercase tracking-tighter leading-[0.8] mb-8">Registration<br/><span className="text-pink-600">Success!</span></h2>
            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest italic leading-relaxed mb-16">
              Your details are secured in our pool.<br/>Check the live directory for verification updates.
            </p>
            <button onClick={() => navigate('directory')} className="w-full bg-slate-900 text-white py-8 rounded-full font-black uppercase italic shadow-2xl tracking-[0.3em] text-xs hover:-translate-y-2 transition-all">Go to Pool Directory</button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
