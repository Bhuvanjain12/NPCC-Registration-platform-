import React, { useState, useEffect } from 'react';
import { 
  User, Phone, MapPin, CheckCircle, CreditCard, Lock, Shield, Users, 
  Camera, Check, X, Zap, Trophy, ChevronRight, ArrowRight, 
  Download, RefreshCcw, Filter, FileSpreadsheet, Edit3
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

// Helper: Image Compression
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
        canvas.width = 400; canvas.height = 400;
        ctx.drawImage(img, 0, 0, 400, 400);
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
    };
  });
};

export default function App() {
  const [user, setUser] = useState(null);
  const [players, setPlayers] = useState([]);
  const [view, setView] = useState('landing'); 
  const [category, setCategory] = useState(null); 
  const [tempPlayer, setTempPlayer] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('All');

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
    });
    return () => unsubscribe();
  }, [user]);

  const navigate = (v) => { setView(v); window.scrollTo(0,0); };

  // --- EXCEL EXPORT ---
  const exportData = () => {
    if (players.length === 0) return alert("Data nahi mila!");
    const headers = ["Name", "Category", "Age", "Contact", "Native", "Status", "AuctionStatus", "Team"];
    const rows = players.map(p => [p.name, p.category, p.age, p.contact, p.native, p.paymentStatus, p.auctionStatus, p.team || "-"]);
    let csv = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = "NPCC_Full_Report.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- UI COMPONENTS ---
  const Navbar = () => (
    <nav className="bg-[#5c3a21] text-white p-4 shadow-xl sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="font-bold text-xl cursor-pointer flex items-center gap-2" onClick={() => navigate('landing')}>
          <div className="w-8 h-8 bg-white text-[#5c3a21] rounded-full flex items-center justify-center font-black">N</div>
          NPCC Cricket
        </div>
        <div className="flex gap-4 text-xs font-bold uppercase tracking-widest">
          <button onClick={() => navigate('directory')} className="hover:text-orange-200">Players Pool</button>
          {!isAdmin ? (
            <button onClick={() => navigate('admin-login')} className="text-orange-200 border border-white/20 px-2 rounded">Admin</button>
          ) : (
            <button onClick={() => {setIsAdmin(false); navigate('landing');}} className="text-red-300">Exit Admin</button>
          )}
        </div>
      </div>
    </nav>
  );

  const Landing = () => (
    <div className="max-w-4xl mx-auto mt-12 px-4 text-center pb-20">
      <h1 className="text-5xl font-black text-[#5c3a21] mb-2 uppercase italic tracking-tighter">NPCC Auction 2026</h1>
      <p className="text-gray-500 mb-12 font-bold uppercase text-[10px] tracking-[4px]">Category Select Karein</p>
      <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        <button onClick={() => { setCategory('Youth'); navigate('register'); }} className="bg-white p-8 rounded-[40px] shadow-2xl border-2 border-transparent hover:border-blue-500 transition-all text-left group">
          <Zap className="text-blue-600 mb-4 group-hover:scale-125 transition-transform" size={40} />
          <h2 className="text-2xl font-black mb-1 uppercase italic">Youth League</h2>
          <p className="text-gray-400 text-[10px] mb-6 font-black uppercase tracking-widest">15 to 35 Saal</p>
          <div className="text-blue-600 font-black flex items-center gap-1 uppercase text-sm underline decoration-blue-200">Register Now</div>
        </button>
        <button onClick={() => { setCategory('40+'); navigate('register'); }} className="bg-white p-8 rounded-[40px] shadow-2xl border-2 border-transparent hover:border-orange-500 transition-all text-left group">
          <Trophy className="text-orange-700 mb-4 group-hover:scale-125 transition-transform" size={40} />
          <h2 className="text-2xl font-black mb-1 uppercase italic">40+ League</h2>
          <p className="text-gray-400 text-[10px] mb-6 font-black uppercase tracking-widest">40 Saal & Above</p>
          <div className="text-orange-700 font-black flex items-center gap-1 uppercase text-sm underline decoration-orange-200">Register Now</div>
        </button>
      </div>
      <button onClick={() => navigate('directory')} className="mt-16 bg-white border-4 border-[#5c3a21] text-[#5c3a21] px-12 py-5 rounded-full font-black uppercase tracking-widest text-xs hover:bg-[#5c3a21] hover:text-white transition-all shadow-2xl active:scale-95">
        View Auction Status Pool
      </button>
    </div>
  );

  const Register = () => {
    const [f, setF] = useState({ name: '', age: '', contact: '', native: '' });
    const [p, setP] = useState(null);

    const handleNext = (e) => {
      e.preventDefault();
      if(players.some(plr => plr.contact === f.contact)) return alert("❌ Ye number pehle se registered hai!");
      if(!p) return alert("Photo upload karein!");
      setTempPlayer({ ...f, category, photoUrl: p, timestamp: new Date().toISOString(), id: 'P' + Date.now().toString().slice(-6) });
      navigate('payment');
    };

    return (
      <form onSubmit={handleNext} className="max-w-xl mx-auto mt-8 p-10 bg-white rounded-[45px] shadow-2xl space-y-6 mx-4 border-b-[10px] border-[#5c3a21]">
        <h2 className="text-3xl font-black text-center text-[#5c3a21] uppercase italic tracking-tighter underline decoration-orange-400 underline-offset-8">Registration</h2>
        <div className="space-y-4">
          <input required placeholder="FULL NAME" className="w-full p-4 bg-gray-50 border-2 rounded-2xl font-bold uppercase focus:border-[#5c3a21] outline-none" onChange={e => setF({...f, name: e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
            <input required type="number" placeholder="AGE" className="w-full p-4 bg-gray-50 border-2 rounded-2xl font-bold focus:border-[#5c3a21] outline-none" onChange={e => setF({...f, age: e.target.value})} />
            <input required placeholder="MOBILE" className="w-full p-4 bg-gray-50 border-2 rounded-2xl font-bold focus:border-[#5c3a21] outline-none" onChange={e => setF({...f, contact: e.target.value})} />
          </div>
          <input required placeholder="NATIVE PLACE" className="w-full p-4 bg-gray-50 border-2 rounded-2xl font-bold uppercase focus:border-[#5c3a21] outline-none" onChange={e => setF({...f, native: e.target.value})} />
        </div>
        <div className="border-4 border-dashed p-8 text-center cursor-pointer relative rounded-[30px] bg-gray-50 border-gray-200">
          {p ? <img src={p} className="h-32 w-32 mx-auto rounded-full object-cover border-4 border-white shadow-xl" /> : <div className="text-gray-300 font-black flex flex-col items-center gap-2 uppercase text-[10px] tracking-widest"><Camera size={40}/> UPLOAD PHOTO</div>}
          <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={async e => setP(await compressImage(e.target.files[0]))} />
        </div>
        <button className="w-full bg-[#5c3a21] text-white py-5 rounded-3xl font-black text-lg shadow-xl uppercase">Next: Payment</button>
      </form>
    );
  };

  const Payment = () => {
    const [ss, setSs] = useState(null);
    const [saving, setSaving] = useState(false);
    const upi = "bjain6851-1@okaxis";
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`upi://pay?pa=${upi}&pn=Bhuvan%20Jain&am=500&cu=INR`)}`;

    const handleFinal = async () => {
      setSaving(true);
      try {
        const playerRef = doc(db, ...COLLECTION_PATH, tempPlayer.id);
        await setDoc(playerRef, { ...tempPlayer, paymentStatus: 'Verification Pending', auctionStatus: 'Unsold', team: '-', screenshot: ss });
        navigate('success');
      } catch (err) { alert("Error: " + err.message); }
      setSaving(false);
    };

    return (
      <div className="max-w-md mx-auto mt-8 p-8 bg-white rounded-[50px] shadow-2xl text-center border-t-[10px] border-green-500 mx-4">
        <h2 className="text-3xl font-black text-gray-800 mb-6 uppercase tracking-tighter italic">Pay Registration Fee</h2>
        <div className="bg-blue-50 p-6 rounded-[35px] mb-8 shadow-inner border-2 border-blue-100">
          <img src={qrUrl} className="w-64 mx-auto mb-4 rounded-3xl shadow-2xl bg-white p-3 border-4 border-white shadow-xl" alt="QR" />
          <p className="font-black text-gray-700 text-xl tracking-tight uppercase leading-none">Bhuvan Jain</p>
          <p className="text-[11px] font-black text-blue-600 bg-blue-100 py-1 px-3 rounded-full inline-block mt-3 tracking-widest italic">{upi}</p>
        </div>
        <div className="border-4 border-dotted p-6 relative bg-gray-50 rounded-3xl cursor-pointer mb-8 border-gray-200">
          {ss ? <img src={ss} className="h-48 mx-auto rounded-xl shadow-xl" /> : <div className="text-gray-300 font-black uppercase text-[10px] tracking-widest flex flex-col items-center gap-2"><CreditCard size={32}/> UPLOAD G-PAY SCREENSHOT</div>}
          <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={async e => setSs(await compressImage(e.target.files[0]))} />
        </div>
        <button onClick={handleFinal} disabled={!ss || saving} className="w-full bg-green-600 text-white py-5 rounded-[30px] font-black text-xl shadow-2xl disabled:bg-gray-300 tracking-tighter uppercase italic">
          {saving ? "SAVING..." : "FINISH REGISTRATION"}
        </button>
      </div>
    );
  };

  const PlayerDirectory = () => {
    const list = players.filter(p => filterType === 'All' || p.category === filterType);
    return (
      <div className="max-w-6xl mx-auto mt-8 p-6 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
           <h2 className="text-4xl font-black text-[#5c3a21] uppercase italic tracking-tighter underline decoration-[#5c3a21]/20">Auction Pool</h2>
           <div className="flex bg-white p-1.5 rounded-full border shadow-2xl overflow-hidden border-gray-100">
             {['All', 'Youth', '40+'].map(t => (
               <button key={t} onClick={() => setFilterType(t)} className={`px-8 py-2.5 rounded-full font-black text-xs uppercase transition-all ${filterType === t ? 'bg-[#5c3a21] text-white shadow-xl scale-105' : 'text-gray-400'}`}>{t}</button>
             ))}
           </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
          {list.map(p => (
            <div key={p.id} className="bg-white rounded-[40px] shadow-2xl overflow-hidden group hover:-translate-y-3 transition-all duration-500 border border-gray-100 text-center">
              <div className="h-64 relative">
                <img src={p.photoUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 shadow-inner" />
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                   <span className={`text-[10px] font-black px-3 py-1.5 rounded-full shadow-2xl text-white ${p.category === 'Youth' ? 'bg-blue-600' : 'bg-orange-600'}`}>{p.category}</span>
                   <span className={`text-[10px] font-black px-3 py-1.5 rounded-full shadow-2xl text-white ${p.paymentStatus === 'Paid' ? 'bg-green-600' : 'bg-red-500'}`}>{p.paymentStatus === 'Paid' ? 'VERIFIED' : 'PENDING'}</span>
                </div>
              </div>
              <div className="p-8">
                <h3 className="font-black text-2xl text-[#5c3a21] italic uppercase mb-1 tracking-tighter leading-tight">{p.name}</h3>
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-[3px] mb-4">{p.native} • {p.age} Saal</p>
                <div className={`p-3 rounded-2xl text-center font-black text-[10px] uppercase tracking-widest shadow-inner border-2 ${p.auctionStatus === 'Sold' ? 'bg-green-50 border-green-200 text-green-700 italic' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                  {p.auctionStatus === 'Sold' ? `TEAM: ${p.team}` : 'UNSOLD'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const AdminDashboard = () => {
    const [sel, setSel] = useState(null);
    const upd = async (id, data) => { await updateDoc(doc(db, ...COLLECTION_PATH, id), data); };
    return (
      <div className="max-w-7xl mx-auto mt-10 p-4 pb-40">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 px-4">
           <h2 className="text-4xl font-black text-[#5c3a21] uppercase italic tracking-tighter underline decoration-orange-400 tracking-tighter">Admin Console</h2>
           <button onClick={exportData} className="bg-green-600 text-white px-10 py-4 rounded-full font-black text-sm shadow-2xl hover:bg-green-700 transition active:scale-95 flex items-center gap-2"><FileSpreadsheet size={20}/> EXCEL DOWNLOAD</button>
        </div>
        <div className="bg-white rounded-[50px] shadow-2xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto"><table className="w-full text-left min-w-[800px]">
            <thead className="bg-gray-100 border-b-2 font-black text-[10px] uppercase tracking-widest text-gray-500">
              <tr><th className="p-8">Profile</th><th className="p-8 text-center">Status</th><th className="p-8 text-center">Auction & Team</th></tr>
            </thead>
            <tbody>
              {players.map(p => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-orange-50/20">
                  <td className="p-8 flex items-center gap-5">
                    <img src={p.photoUrl} className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-2xl" />
                    <div><div className="font-black text-[#5c3a21] uppercase text-lg italic leading-none mb-1 tracking-tighter">{p.name}</div><div className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{p.category} • {p.contact}</div></div>
                  </td>
                  <td className="p-8 text-center">
                    {p.paymentStatus === 'Paid' ? (<span className="text-[11px] font-black bg-green-100 text-green-700 px-5 py-2 rounded-full border-2 border-green-200 italic uppercase">Verified</span>) : (<button onClick={() => setSel(p)} className="text-[11px] font-black bg-orange-100 text-orange-700 px-5 py-2 rounded-full border-2 border-orange-200 animate-pulse italic uppercase shadow-xl">Check SS</button>)}
                  </td>
                  <td className="p-8 text-center">
                    <div className="flex items-center gap-2 justify-center">
                      <select className="text-[10px] font-black border-2 rounded-xl p-2 uppercase outline-none focus:border-[#5c3a21]" value={p.auctionStatus} onChange={(e) => upd(p.id, { auctionStatus: e.target.value })}>
                        <option value="Unsold">UNSOLD</option><option value="Sold">SOLD</option>
                      </select>
                      <input placeholder="Team Name" className="text-[10px] font-black border-2 p-2 rounded-xl w-40 uppercase focus:border-[#5c3a21] outline-none shadow-inner" value={p.team === '-' ? '' : p.team} onChange={(e) => upd(p.id, { team: e.target.value })} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
        {sel && (
          <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-[999] backdrop-blur-xl">
            <div className="bg-white p-10 rounded-[60px] w-full max-w-lg text-center relative shadow-2xl border-8 border-orange-50 animate-in zoom-in duration-200">
              <button onClick={() => setSel(null)} className="absolute -top-6 -right-6 bg-[#5c3a21] text-white rounded-full p-4 shadow-2xl active:scale-90 transition-all"><X size={28}/></button>
              <h3 className="font-black text-2xl mb-8 text-[#5c3a21] italic uppercase underline decoration-orange-400">Proof Screenshot</h3>
              <div className="bg-gray-100 p-3 rounded-[40px] mb-10 border-4 border-gray-50 shadow-inner overflow-hidden"><img src={sel.screenshot} className="max-h-[450px] mx-auto rounded-[30px] shadow-2xl object-contain" /></div>
              <div className="flex gap-4">
                <button onClick={() => setSel(null)} className="flex-1 py-5 bg-gray-100 rounded-[30px] font-black text-gray-400 italic">CLOSE</button>
                <button onClick={async () => { await upd(sel.id, { paymentStatus: 'Paid' }); setSel(null); }} className="flex-1 py-5 bg-green-600 text-white rounded-[30px] font-black shadow-2xl italic tracking-tighter uppercase">APPROVE PLAYER</button>
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
      <div className="max-w-md mx-auto mt-20 p-12 bg-white shadow-2xl rounded-[50px] border-t-[10px] border-[#5c3a21] text-center mx-4">
        <Shield size={60} className="mx-auto text-[#5c3a21] mb-8" />
        <h2 className="text-3xl font-black mb-10 uppercase tracking-tighter italic">Admin Portal</h2>
        <input type="password" placeholder="Passkey" className="w-full p-5 bg-gray-50 border-2 rounded-3xl text-center font-black text-2xl mb-8 tracking-widest shadow-inner focus:border-[#5c3a21] outline-none" onChange={e => {if(e.target.value === 'bababhuvandev') {setIsAdmin(true); navigate('admin')}}} />
      </div>
    );
  };

  if (loading) return <div className="h-screen flex flex-col items-center justify-center bg-[#f8f5f0] text-[#5c3a21] font-black tracking-widest uppercase text-xs italic"><RefreshCcw className="animate-spin mb-6" size={60}/><p className="animate-pulse tracking-widest font-black uppercase">Connecting NPCC Server...</p></div>;

  return (
    <div className="min-h-screen bg-[#f8f5f0] font-sans pb-20">
      <Navbar />
      <main>
        {view === 'landing' && <Landing />}
        {view === 'register' && <Register />}
        {view === 'payment' && <Payment />}
        {view === 'directory' && <PlayerDirectory />}
        {view === 'admin-login' && <AdminLogin />}
        {view === 'admin' && <AdminDashboard />}
        {view === 'success' && (
          <div className="max-w-md mx-auto mt-20 text-center p-12 bg-white rounded-[60px] shadow-2xl mx-4 border-b-[10px] border-green-500">
            <CheckCircle size={80} className="text-green-500 mx-auto mb-8 animate-bounce" />
            <h2 className="text-4xl font-black text-gray-800 italic uppercase">Done!</h2>
            <p className="text-gray-400 mt-4 font-bold text-sm uppercase tracking-widest italic tracking-tighter leading-relaxed">Aapka data save ho gaya hai.</p>
            <button onClick={() => navigate('directory')} className="mt-12 w-full bg-[#5c3a21] text-white py-5 rounded-[30px] font-black uppercase italic shadow-2xl tracking-tighter">View Pool</button>
          </div>
        )}
      </main>
    </div>
  );
                                            }
