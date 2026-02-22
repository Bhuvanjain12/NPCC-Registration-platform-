import React, { useState, useEffect, useMemo } from 'react';
import { 
  User, Phone, Mail, MapPin, CheckCircle, 
  CreditCard, Lock, Shield, Users, BarChart, 
  LogOut, Search, Edit3, Camera, Check, X, 
  Zap, Trophy, ChevronRight, ExternalLink,
  ArrowRight, Calendar, Filter, Plus, Trash2
} from 'lucide-react';

// --- FIREBASE INITIALIZATION ---
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

// --- UTILITY: IMAGE COMPRESSION ---
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
  const [registrationCategory, setRegistrationCategory] = useState(null); 
  const [tempPlayer, setTempPlayer] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // --- FIREBASE AUTH ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.error("Auth Failed:", err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- DATA FETCHING ---
  useEffect(() => {
    if (!user) return;
    const playersRef = collection(db, 'artifacts', appId, 'public', 'data', 'players');
    const unsubscribe = onSnapshot(playersRef, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setPlayers(list);
    });
    return () => unsubscribe();
  }, [user]);

  const navigate = (v) => { setView(v); window.scrollTo(0,0); };

  // --- COMPONENTS ---

  const Navbar = () => (
    <nav className="bg-[#5c3a21] text-white p-4 shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2 font-bold text-xl cursor-pointer" onClick={() => navigate(isAdmin ? 'admin-dashboard' : 'landing')}>
          <div className="w-8 h-8 bg-white text-[#5c3a21] rounded-full flex items-center justify-center font-black">N</div>
          NPCC Cricket Club
        </div>
        <div className="flex gap-4 text-sm font-semibold">
          {!isAdmin && !currentUser && (
            <>
              <button onClick={() => navigate('landing')}>Register</button>
              <button onClick={() => navigate('login')}>Login</button>
              <button onClick={() => navigate('admin-login')} className="text-[#d4b895]">Admin</button>
            </>
          )}
          {(isAdmin || currentUser) && (
            <button onClick={() => { setIsAdmin(false); setCurrentUser(null); navigate('landing'); }} className="text-red-300">Logout</button>
          )}
        </div>
      </div>
    </nav>
  );

  const LandingPage = () => (
    <div className="max-w-4xl mx-auto mt-12 px-4 text-center">
      <h1 className="text-4xl md:text-5xl font-black text-[#5c3a21] mb-4">NPCC Auction 2026</h1>
      <p className="text-gray-600 mb-12">Choose your category to start registration</p>
      <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto text-left">
        <button onClick={() => { setRegistrationCategory('Youth'); navigate('register'); }} className="bg-white p-8 rounded-3xl shadow-xl border-2 border-transparent hover:border-blue-500 transition-all">
          <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6"><Zap size={32}/></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Youth League</h2>
          <p className="text-gray-500 mb-6">Ages 15 to 35</p>
          <div className="flex items-center text-blue-600 font-bold">Register Now <ArrowRight size={18} className="ml-1" /></div>
        </button>
        <button onClick={() => { setRegistrationCategory('40+'); navigate('register'); }} className="bg-white p-8 rounded-3xl shadow-xl border-2 border-transparent hover:border-[#5c3a21] transition-all">
          <div className="w-14 h-14 bg-orange-100 text-orange-700 rounded-2xl flex items-center justify-center mb-6"><Trophy size={32}/></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">40+ League</h2>
          <p className="text-gray-500 mb-6">Age 40 & Above</p>
          <div className="flex items-center text-[#5c3a21] font-bold">Register Now <ArrowRight size={18} className="ml-1" /></div>
        </button>
      </div>
    </div>
  );

  const RegistrationForm = () => {
    const [form, setForm] = useState({ name: '', age: '', contact: '', email: '', native: '' });
    const [photo, setPhoto] = useState(null);
    const [err, setErr] = useState('');

    const handleSubmit = (e) => {
      e.preventDefault();
      const age = parseInt(form.age);
      if (registrationCategory === 'Youth' && (age < 15 || age > 35)) return setErr("Youth age must be 15-35");
      if (registrationCategory === '40+' && age < 40) return setErr("40+ age must be 40 or above");
      if (!photo) return setErr("Please upload a player photo");

      setTempPlayer({ ...form, category: registrationCategory, id: 'NPCC' + Date.now().toString().slice(-4), photoUrl: photo, timestamp: new Date().toISOString() });
      navigate('payment');
    };

    return (
      <div className="max-w-xl mx-auto mt-8 p-8 bg-white rounded-3xl shadow-2xl">
        <h2 className="text-3xl font-black text-[#5c3a21] mb-6 text-center">{registrationCategory} Registration</h2>
        {err && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-center font-bold border border-red-200">{err}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input required placeholder="Full Name" className="w-full p-3 border rounded-xl" onChange={e => setForm({...form, name: e.target.value})} />
          <input required type="number" placeholder="Age" className="w-full p-3 border rounded-xl" onChange={e => setForm({...form, age: e.target.value})} />
          <input required placeholder="Mobile Number" className="w-full p-3 border rounded-xl" onChange={e => setForm({...form, contact: e.target.value})} />
          <input required placeholder="Native Place" className="w-full p-3 border rounded-xl" onChange={e => setForm({...form, native: e.target.value})} />
          <div className="border-2 border-dashed p-6 text-center cursor-pointer relative bg-gray-50 rounded-xl">
            {photo ? <img src={photo} className="h-24 mx-auto rounded-full" /> : <div className="text-gray-400 font-bold">Click to Upload Photo</div>}
            <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={async e => setPhoto(await compressImage(e.target.files[0]))} />
          </div>
          <button className="w-full bg-[#5c3a21] text-white py-4 rounded-xl font-black shadow-lg">PROCEED TO PAYMENT</button>
        </form>
      </div>
    );
  };

  const RealPayment = () => {
    const [ss, setSs] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const qrImage = "https://i.ibb.co/994m8R0W/1000276929.png"; 

    const handleComplete = async () => {
      setIsSaving(true);
      try {
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'players', tempPlayer.id);
        await setDoc(docRef, { ...tempPlayer, paymentStatus: 'Verification Pending', auctionStatus: 'Unsold', team: '-', paymentScreenshot: ss });
        navigate('success');
      } catch (err) { alert("Error: " + err.message); }
      setIsSaving(false);
    };

    return (
      <div className="max-w-md mx-auto mt-8 p-8 bg-white rounded-3xl shadow-2xl text-center border-t-8 border-green-500">
        <h2 className="text-2xl font-black mb-6">Payment: ₹500</h2>
        <div className="bg-gray-50 p-6 rounded-2xl mb-6">
          <img src={qrImage} className="w-56 mx-auto mb-4 rounded-xl shadow-md border" />
          <p className="font-bold text-lg">Bhuvan Jain</p>
          <p className="text-blue-600 font-bold">UPI: bjain6851-1@okaxis</p>
        </div>
        <div className="border-2 border-dashed p-4 mb-6 relative bg-gray-50 rounded-xl cursor-pointer">
          {ss ? <img src={ss} className="h-32 mx-auto rounded" /> : <div className="font-bold text-gray-400">Upload Screenshot</div>}
          <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={async e => setSs(await compressImage(e.target.files[0]))} />
        </div>
        <button onClick={handleComplete} disabled={!ss || isSaving} className="w-full bg-green-600 text-white py-4 rounded-xl font-black disabled:bg-gray-300">
          {isSaving ? "SUBMITTING..." : "SUBMIT REGISTRATION"}
        </button>
      </div>
    );
  };

  const Success = () => (
    <div className="max-w-md mx-auto mt-20 text-center p-10 bg-white rounded-3xl shadow-xl">
      <CheckCircle size={60} className="text-green-500 mx-auto mb-4" />
      <h2 className="text-2xl font-black">All Done!</h2>
      <p className="text-gray-500 mt-2 mb-8">Admin will verify your payment shortly.</p>
      <button onClick={() => navigate('landing')} className="w-full bg-[#5c3a21] text-white py-3 rounded-xl font-bold">BACK TO HOME</button>
    </div>
  );

  const OTPLogin = () => {
    const [phone, setPhone] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpInput, setOtpInput] = useState('');
    const [genOtp, setGenOtp] = useState('');
    
    const handleLogin = () => {
      const p = players.find(x => x.contact === phone);
      if(!p) return alert("Not registered");
      const o = Math.floor(1000 + Math.random() * 9000).toString();
      setGenOtp(o); setOtpSent(true);
    };

    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-3xl shadow-xl">
        <h2 className="text-2xl font-black text-center mb-6">Player Login</h2>
        {!otpSent ? (
          <div className="space-y-4">
            <input placeholder="Mobile Number" className="w-full p-3 border rounded-xl" onChange={e => setPhone(e.target.value)} />
            <button onClick={handleLogin} className="w-full bg-[#5c3a21] text-white py-3 rounded-xl font-bold">GET OTP</button>
          </div>
        ) : (
          <div className="space-y-4 text-center">
            <div className="bg-blue-50 p-2 text-sm text-blue-600 rounded">Demo OTP: {genOtp}</div>
            <input placeholder="Enter OTP" className="w-full p-3 border rounded-xl text-center font-bold" onChange={e => setOtpInput(e.target.value)} />
            <button onClick={() => { if(otpInput === genOtp) { setCurrentUser(players.find(x => x.contact === phone)); navigate('landing'); } }} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold">VERIFY</button>
          </div>
        )}
      </div>
    );
  };

  const AdminLogin = () => {
    const [p, setP] = useState('');
    return (
      <div className="max-w-sm mx-auto mt-20 p-8 bg-white rounded-3xl shadow-xl">
        <h2 className="text-2xl font-black text-center mb-6">Admin Login</h2>
        <input type="password" placeholder="Password" className="w-full p-3 border rounded-xl mb-4" onChange={e => setP(e.target.value)} />
        <button onClick={() => { if(p === 'bababhuvandev') { setIsAdmin(true); navigate('admin-dashboard'); } }} className="w-full bg-black text-white py-3 rounded-xl font-bold">ENTER</button>
      </div>
    );
  };

  const AdminDashboard = () => {
    const [sel, setSel] = useState(null);
    return (
      <div className="max-w-5xl mx-auto mt-12 p-4">
        <h2 className="text-3xl font-black text-[#5c3a21] mb-8">Admin Dashboard</h2>
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b"><tr><th className="p-4">Player</th><th className="p-4">Category</th><th className="p-4">Status</th></tr></thead>
            <tbody>
              {players.map(p => (
                <tr key={p.id} className="border-b">
                  <td className="p-4 flex items-center gap-3"><img src={p.photoUrl} className="w-10 h-10 rounded-full object-cover border" /><div><div className="font-bold">{p.name}</div><div className="text-xs text-gray-400">{p.contact}</div></div></td>
                  <td className="p-4 font-bold text-sm">{p.category}</td>
                  <td className="p-4">
                    {p.paymentStatus === 'Verification Pending' ? (
                      <button onClick={() => setSel(p)} className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">Verify Proof</button>
                    ) : (<span className="text-green-600 font-bold text-xs uppercase">Verified</span>)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {sel && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[100]">
            <div className="bg-white p-6 rounded-3xl w-full max-w-sm text-center">
              <h3 className="font-bold mb-4">Payment Screenshot</h3>
              <img src={sel.paymentScreenshot} className="max-h-80 mx-auto rounded-xl mb-6" />
              <div className="flex gap-2">
                <button onClick={() => setSel(null)} className="flex-1 py-2 bg-gray-100 rounded-xl font-bold">Close</button>
                <button onClick={async () => { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'players', sel.id), { paymentStatus: 'Paid' }); setSel(null); }} className="flex-1 py-2 bg-green-600 text-white rounded-xl font-bold">Approve</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center bg-[#f8f5f0] text-[#5c3a21] font-black text-xl animate-pulse">Connecting to Server...</div>;

  return (
    <div className="min-h-screen bg-[#f8f5f0]">
      <Navbar />
      <main className="pb-20">
        {view === 'landing' && <LandingPage />}
        {view === 'register' && <RegistrationForm />}
        {view === 'payment' && <RealPayment />}
        {view === 'success' && <Success />}
        {view === 'login' && <OTPLogin />}
        {view === 'admin-login' && <AdminLogin />}
        {view === 'admin-dashboard' && <AdminDashboard />}
      </main>
    </div>
  );
}

    
