import React, { useState, useEffect } from 'react';
import { 
  User, Phone, Mail, MapPin, CheckCircle, 
  CreditCard, Lock, Shield, Users, BarChart, 
  LogOut, Search, Camera, Check, X, Zap, Trophy, ChevronRight,
  ExternalLink, Calendar, Plus, Filter, Trash2, Edit3, ArrowRight
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

// --- HELPER: IMAGE COMPRESSION ---
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
  const [isAdmin, setIsAdmin] = useState(false);

  // --- AUTH & DATA SYNC ---
  useEffect(() => {
    signInAnonymously(auth).catch(err => console.error("Auth Error:", err));
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const playersRef = collection(db, 'artifacts', appId, 'public', 'data', 'players');
    const unsubscribe = onSnapshot(playersRef, (snapshot) => {
      setPlayers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const navigate = (v) => { setView(v); window.scrollTo(0,0); };

  // --- NAVBAR ---
  const Navbar = () => (
    <nav className="bg-[#5c3a21] text-white p-4 shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="font-bold text-xl cursor-pointer flex items-center gap-2" onClick={() => navigate('landing')}>
          <div className="w-8 h-8 bg-white text-[#5c3a21] rounded-full flex items-center justify-center font-black">N</div>
          NPCC Cricket Club
        </div>
        <div className="flex gap-4 text-sm font-semibold">
          <button onClick={() => navigate('landing')}>Register</button>
          <button onClick={() => navigate('admin-login')} className="text-[#d4b895]">Admin Portal</button>
        </div>
      </div>
    </nav>
  );

  // --- LANDING PAGE ---
  const LandingPage = () => (
    <div className="max-w-4xl mx-auto mt-12 px-4 text-center pb-20">
      <h1 className="text-5xl font-black text-[#5c3a21] mb-4">NPCC Auction 2026</h1>
      <p className="text-xl text-gray-600 mb-12">Register now to be part of the most awaited cricket league</p>
      
      <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto text-left">
        {/* Category Youth */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 hover:scale-105 transition-all">
          <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6"><Zap size={32}/></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Youth League</h2>
          <p className="text-gray-500 mb-6">Age Group: 15 to 35 Years</p>
          <button onClick={() => { setRegistrationCategory('Youth'); navigate('register'); }} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
            Start Registration <ArrowRight size={18}/>
          </button>
        </div>

        {/* Category 40+ */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 hover:scale-105 transition-all">
          <div className="w-14 h-14 bg-orange-100 text-orange-700 rounded-2xl flex items-center justify-center mb-6"><Trophy size={32}/></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">40+ League</h2>
          <p className="text-gray-500 mb-6">Age Group: 40 Years & Above</p>
          <button onClick={() => { setRegistrationCategory('40+'); navigate('register'); }} className="w-full bg-[#5c3a21] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
            Start Registration <ArrowRight size={18}/>
          </button>
        </div>
      </div>
    </div>
  );

  // --- REGISTRATION FORM ---
  const RegistrationForm = () => {
    const [formData, setFormData] = useState({ name: '', age: '', contact: '', email: '', native: '' });
    const [photo, setPhoto] = useState(null);

    const handleFormSubmit = (e) => {
      e.preventDefault();
      if(!photo) return alert("Please upload a clear profile photo.");
      setTempPlayer({ 
        ...formData, 
        category: registrationCategory, 
        id: 'NPCC' + Math.floor(1000 + Math.random() * 9000), 
        photoUrl: photo,
        timestamp: new Date().toISOString()
      });
      navigate('payment');
    };

    return (
      <div className="max-w-2xl mx-auto mt-8 p-8 bg-white rounded-3xl shadow-2xl border border-gray-100 mb-20">
        <h2 className="text-3xl font-black text-center text-[#5c3a21] mb-8 underline decoration-orange-300">Player Details</h2>
        <form onSubmit={handleFormSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 ml-1">Full Name</label>
              <input required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 ring-[#5c3a21]" onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 ml-1">Age</label>
              <input required type="number" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 ring-[#5c3a21]" onChange={e => setFormData({...formData, age: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 ml-1">Contact Number</label>
              <input required type="tel" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 ring-[#5c3a21]" onChange={e => setFormData({...formData, contact: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 ml-1">Email ID</label>
              <input required type="email" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 ring-[#5c3a21]" onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-sm font-bold text-gray-700 ml-1">Native Place</label>
              <input required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 ring-[#5c3a21]" onChange={e => setFormData({...formData, native: e.target.value})} />
            </div>
          </div>

          <div className="border-2 border-dashed border-gray-300 p-8 text-center cursor-pointer relative bg-gray-50 rounded-2xl hover:bg-gray-100 transition">
            {photo ? (
              <div className="flex flex-col items-center">
                <img src={photo} className="h-32 w-32 object-cover rounded-full border-4 border-white shadow-lg mb-2" />
                <p className="text-xs text-green-600 font-bold">Photo Selected!</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Camera size={40} className="text-gray-400 mb-2"/>
                <span className="font-bold text-gray-500">Upload Player Photo</span>
                <span className="text-xs text-gray-400">Clear face photo recommended</span>
              </div>
            )}
            <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={async e => setPhoto(await compressImage(e.target.files[0]))} />
          </div>

          <button className="w-full bg-[#5c3a21] text-white py-4 rounded-xl font-black text-xl shadow-lg hover:shadow-[#5c3a21]/30 transition-all">
            PROCEED TO PAYMENT
          </button>
        </form>
      </div>
    );
  };

  // --- PAYMENT SCREEN ---
  const RealPayment = () => {
    const [screenshotUrl, setScreenshotUrl] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    
    // Direct QR Image URL
    const customQrImage = "https://i.ibb.co/994m8R0W/1000276929.png"; 

    const handleComplete = async () => {
      setIsSaving(true);
      try {
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'players', tempPlayer.id);
        await setDoc(docRef, { 
          ...tempPlayer, 
          paymentStatus: 'Verification Pending', 
          auctionStatus: 'Unsold', 
          team: '-',
          paymentScreenshot: screenshotUrl 
        });
        navigate('success');
      } catch (err) { alert("Submission Failed: " + err.message); }
      setIsSaving(false);
    };

    return (
      <div className="max-w-md mx-auto mt-8 p-8 bg-white rounded-3xl shadow-2xl text-center border-t-8 border-green-500 mb-20">
        <h2 className="text-2xl font-black mb-2 text-gray-800">Registration Fee: ₹500</h2>
        <p className="text-gray-500 mb-8">Scan the QR code below to pay</p>
        
        <div className="bg-[#f0f4ff] p-6 rounded-3xl mb-8 shadow-inner border border-blue-50">
          <img src={customQrImage} alt="UPI QR" className="w-64 mx-auto mb-4 rounded-2xl shadow-lg bg-white p-3" />
          <div className="space-y-1">
            <p className="font-black text-gray-800 tracking-wide text-lg">Bhuvan Jain</p>
            <p className="text-sm font-bold text-blue-600 bg-blue-100 py-1 px-3 rounded-full inline-block">UPI ID: bjain6851-1@okaxis</p>
          </div>
        </div>
        
        <div className="text-left mb-8">
          <label className="block text-sm font-black text-gray-700 mb-3 text-center uppercase tracking-widest">Step 2: Upload Screenshot</label>
          <div className="border-4 border-dashed border-gray-200 p-6 relative bg-gray-50 rounded-2xl hover:border-green-400 transition-all cursor-pointer">
            {screenshotUrl ? (
              <img src={screenshotUrl} className="h-48 mx-auto rounded-lg shadow-md" />
            ) : (
              <div className="flex flex-col items-center py-4 text-gray-400">
                <CreditCard size={40} className="mb-2" />
                <p className="font-bold">Attach Payment Proof</p>
              </div>
            )}
            <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={async e => setScreenshotUrl(await compressImage(e.target.files[0]))} />
          </div>
        </div>

        <button onClick={handleComplete} disabled={!screenshotUrl || isSaving} className="w-full bg-green-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl hover:bg-green-700 disabled:bg-gray-300 transition-all">
          {isSaving ? "Submitting Registration..." : "COMPLETE REGISTRATION"}
        </button>
      </div>
    );
  };

  // --- SUCCESS SCREEN ---
  const SuccessPage = () => (
    <div className="max-w-md mx-auto mt-20 text-center p-10 bg-white rounded-3xl shadow-2xl border border-gray-100">
      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
        <CheckCircle size={50} />
      </div>
      <h2 className="text-3xl font-black text-gray-800 mb-3">All Done!</h2>
      <p className="text-gray-500 font-medium leading-relaxed mb-10">Your registration has been submitted. Admin will verify your payment within 24 hours.</p>
      <button onClick={() => navigate('landing')} className="w-full bg-[#5c3a21] text-white py-4 rounded-2xl font-black shadow-lg">
        BACK TO HOME
      </button>
    </div>
  );

  // --- ADMIN LOGIN ---
  const AdminLogin = () => {
    const [p, setP] = useState('');
    const handle = (e) => { e.preventDefault(); if(p === 'bababhuvandev') { setIsAdmin(true); navigate('admin-dashboard'); } else { alert("Wrong Password!"); } };
    return (
      <div className="max-w-md mx-auto mt-20 p-10 bg-white shadow-2xl rounded-3xl border-t-8 border-[#5c3a21]">
        <div className="flex justify-center mb-6 text-[#5c3a21]"><Lock size={40}/></div>
        <h2 className="text-2xl font-black mb-8 text-center text-gray-800">Admin Authentication</h2>
        <form onSubmit={handle} className="space-y-6">
          <input required type="password" placeholder="Enter Secure Key" className="w-full p-4 bg-gray-50 border rounded-2xl text-center text-xl tracking-tighter" onChange={e => setP(e.target.value)} />
          <button className="w-full bg-black text-white py-4 rounded-2xl font-black text-lg">ACCESS DASHBOARD</button>
        </form>
      </div>
    );
  };

  // --- ADMIN DASHBOARD ---
  const AdminDashboard = () => {
    const [viewSS, setViewSS] = useState(null);
    const updateP = async (id, data) => { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'players', id), data); };

    return (
      <div className="max-w-6xl mx-auto mt-12 p-4 pb-20">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-4xl font-black text-[#5c3a21]">Registrations</h2>
          <div className="bg-white px-6 py-2 rounded-full border shadow-sm font-bold text-gray-600">Total: {players.length}</div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-5 font-black text-gray-600 uppercase text-xs">Player Info</th>
                  <th className="p-5 font-black text-gray-600 uppercase text-xs text-center">Payment Proof</th>
                  <th className="p-5 font-black text-gray-600 uppercase text-xs">Category</th>
                </tr>
              </thead>
              <tbody>
                {players.map(p => (
                  <tr key={p.id} className="border-b hover:bg-gray-50 transition">
                    <td className="p-5 flex items-center gap-4">
                      <img src={p.photoUrl} className="w-12 h-12 rounded-full border-2 border-white shadow-md object-cover" />
                      <div>
                        <div className="font-black text-gray-800">{p.name}</div>
                        <div className="text-xs font-bold text-gray-500">{p.contact}</div>
                      </div>
                    </td>
                    <td className="p-5 text-center">
                      {p.paymentStatus === 'Verification Pending' ? (
                        <button onClick={() => setViewSS(p)} className="text-xs bg-orange-100 text-orange-700 px-4 py-2 rounded-full font-black border border-orange-200">VERIFY NOW</button>
                      ) : (
                        <span className="text-xs bg-green-100 text-green-700 px-4 py-2 rounded-full font-black border border-green-200 flex items-center justify-center gap-1 w-max mx-auto"><Check size={14}/> APPROVED</span>
                      )}
                    </td>
                    <td className="p-5">
                       <span className={`text-xs font-black px-3 py-1 rounded-md ${p.category === 'Youth' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>{p.category}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {viewSS && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl relative animate-in zoom-in duration-200">
              <button onClick={() => setViewSS(null)} className="absolute -top-4 -right-4 bg-white text-black rounded-full p-2 shadow-xl"><X/></button>
              <h3 className="font-black text-xl mb-6 text-gray-800 underline decoration-blue-300">Payment Screenshot</h3>
              <div className="bg-gray-100 p-2 rounded-2xl mb-8">
                <img src={viewSS.paymentScreenshot} className="max-h-96 mx-auto rounded-xl shadow-lg" />
              </div>
              <div className="flex gap-4">
                <button onClick={() => setViewSS(null)} className="flex-1 py-4 bg-gray-100 rounded-2xl font-black text-gray-500">CLOSE</button>
                <button onClick={() => { updateP(viewSS.id, { paymentStatus: 'Paid' }); setViewSS(null); }} className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-black shadow-lg">APPROVE</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // --- APP RENDER ---
  if (!user) return <div className="flex flex-col items-center justify-center h-screen bg-[#f8f5f0]"><div className="w-12 h-12 border-4 border-[#5c3a21] border-t-transparent rounded-full animate-spin mb-4"></div><p className="font-black text-[#5c3a21] animate-pulse">CONNECTING TO NPCC DATABASE...</p></div>;

  return (
    <div className="min-h-screen bg-[#f8f5f0] font-sans">
      <Navbar />
      <main>
        {view === 'landing' && <LandingPage />}
        {view === 'register' && <RegistrationForm />}
        {view === 'payment' && <RealPayment />}
        {view === 'success' && <SuccessPage />}
        {view === 'admin-login' && <AdminLogin />}
        {view === 'admin-dashboard' && <AdminDashboard />}
      </main>
    </div>
  );
}
