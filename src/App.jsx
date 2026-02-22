import React, { useState, useEffect } from 'react';
import { 
  User, Phone, Mail, MapPin, CheckCircle, 
  CreditCard, Lock, Shield, Users, BarChart, 
  LogOut, Search, Camera, Check, X, Zap, Trophy, ChevronRight
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
  const [currentUser, setCurrentUser] = useState(null);
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
          NPCC Cricket
        </div>
        <div className="flex gap-4 text-sm font-semibold">
          <button onClick={() => navigate('login')}>Login</button>
          <button onClick={() => navigate('admin-login')} className="text-[#d4b895]">Admin</button>
        </div>
      </div>
    </nav>
  );

  // --- LANDING PAGE ---
  const LandingPage = () => (
    <div className="max-w-4xl mx-auto mt-12 px-4 text-center">
      <h1 className="text-4xl md:text-5xl font-black text-[#5c3a21] mb-4">NPCC Auction Portal</h1>
      <p className="text-gray-600 mb-10">Select your league category to register</p>
      <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto text-left">
        <button onClick={() => { setRegistrationCategory('Youth'); navigate('register'); }} className="bg-white p-8 rounded-2xl shadow-lg border-2 border-transparent hover:border-blue-500 transition group">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4"><Zap /></div>
          <h2 className="text-2xl font-bold mb-1">Youth League</h2>
          <p className="text-gray-500 text-sm mb-4">Ages 15 to 35</p>
          <div className="flex items-center text-blue-600 font-bold">Register Now <ChevronRight size={18}/></div>
        </button>
        <button onClick={() => { setRegistrationCategory('40+'); navigate('register'); }} className="bg-white p-8 rounded-2xl shadow-lg border-2 border-transparent hover:border-[#5c3a21] transition group">
          <div className="w-12 h-12 bg-orange-100 text-orange-700 rounded-lg flex items-center justify-center mb-4"><Trophy /></div>
          <h2 className="text-2xl font-bold mb-1">40+ League</h2>
          <p className="text-gray-500 text-sm mb-4">Age 40 & Above</p>
          <div className="flex items-center text-[#5c3a21] font-bold">Register Now <ChevronRight size={18}/></div>
        </button>
      </div>
    </div>
  );

  // --- REGISTRATION FORM ---
  const RegistrationForm = () => {
    const [formData, setFormData] = useState({ name: '', age: '', contact: '', email: '', native: '' });
    const [photo, setPhoto] = useState(null);

    const handleFormSubmit = (e) => {
      e.preventDefault();
      if(!photo) return alert("Please upload a photo!");
      setTempPlayer({ 
        ...formData, 
        category: registrationCategory, 
        id: 'NPCC' + Date.now().toString().slice(-4), 
        photoUrl: photo,
        timestamp: new Date().toISOString()
      });
      navigate('payment');
    };

    return (
      <form onSubmit={handleFormSubmit} className="max-w-xl mx-auto mt-8 p-6 bg-white rounded-xl shadow-md space-y-4">
        <h2 className="text-2xl font-bold text-center text-[#5c3a21]">Register for {registrationCategory}</h2>
        <input required placeholder="Full Name" className="w-full p-3 border rounded-lg" onChange={e => setFormData({...formData, name: e.target.value})} />
        <input required type="number" placeholder="Age" className="w-full p-3 border rounded-lg" onChange={e => setFormData({...formData, age: e.target.value})} />
        <input required type="tel" placeholder="Mobile Number" className="w-full p-3 border rounded-lg" onChange={e => setFormData({...formData, contact: e.target.value})} />
        <input required type="text" placeholder="Native Place" className="w-full p-3 border rounded-lg" onChange={e => setFormData({...formData, native: e.target.value})} />
        <div className="border-2 border-dashed p-6 text-center cursor-pointer relative bg-gray-50 rounded-lg">
          {photo ? <img src={photo} className="h-24 mx-auto rounded-full" /> : <div className="flex flex-col items-center"><Camera size={30} className="text-gray-400"/><span className="text-sm text-gray-500 mt-2">Upload Profile Photo</span></div>}
          <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={async e => setPhoto(await compressImage(e.target.files[0]))} />
        </div>
        <button className="w-full bg-[#5c3a21] text-white py-3 rounded-lg font-bold text-lg">Proceed to Payment</button>
      </form>
    );
  };

  // --- PAYMENT SCREEN ---
  const RealPayment = () => {
    const [screenshotUrl, setScreenshotUrl] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    
    // Naya QR Link
    const customQrImage = "https://i.ibb.co/994m8R0W/1000276929.png"; 

    const handleComplete = async () => {
      setIsSaving(true);
      try {
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'players', tempPlayer.id);
        await setDoc(docRef, { 
          ...tempPlayer, 
          paymentStatus: 'Pending', 
          auctionStatus: 'Unsold', 
          team: '-',
          paymentScreenshot: screenshotUrl 
        });
        navigate('success');
      } catch (err) { alert("Error: " + err.message); }
      setIsSaving(false);
    };

    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-xl shadow-lg text-center border-t-4 border-green-500">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Scan & Pay ₹500</h2>
        <div className="bg-gray-50 p-4 rounded-xl mb-6">
          <img src={customQrImage} alt="QR Code" className="w-56 mx-auto mb-4 border p-2 bg-white" />
          <p className="font-bold">Bhuvan Jain</p>
          <p className="text-sm text-gray-500">UPI ID: bjain6851-1@okaxis</p>
        </div>
        
        <div className="border-2 border-dashed p-4 mb-6 relative bg-blue-50 rounded-lg">
          {screenshotUrl ? <img src={screenshotUrl} className="h-32 mx-auto rounded" /> : "Upload Payment Screenshot"}
          <input type="file" accept="image/*" className="absolute inset-0 opacity-0" onChange={async e => setScreenshotUrl(await compressImage(e.target.files[0]))} />
        </div>

        <button onClick={handleComplete} disabled={!screenshotUrl || isSaving} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold disabled:bg-gray-400">
          {isSaving ? "Submitting..." : "Submit Registration"}
        </button>
      </div>
    );
  };

  // --- SUCCESS SCREEN ---
  const SuccessPage = () => (
    <div className="max-w-md mx-auto mt-20 text-center p-6 bg-white rounded-xl shadow-lg">
      <CheckCircle size={60} className="text-green-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-800">Registration Success!</h2>
      <p className="text-gray-600 mt-2">Your payment is being verified by the admin.</p>
      <button onClick={() => navigate('landing')} className="mt-6 bg-[#5c3a21] text-white px-8 py-2 rounded-lg font-bold">Go Back Home</button>
    </div>
  );

  // --- ADMIN LOGIN ---
  const AdminLogin = () => {
    const [p, setP] = useState('');
    const handle = (e) => { e.preventDefault(); if(p === 'bababhuvandev') { setIsAdmin(true); navigate('admin-dashboard'); } else { alert("Wrong Password!"); } };
    return (
      <form onSubmit={handle} className="max-w-xs mx-auto mt-20 p-8 bg-white shadow-xl rounded-xl border-t-4 border-[#5c3a21]">
        <h2 className="text-xl font-bold mb-6 text-center">Admin Login</h2>
        <input type="password" placeholder="Admin Password" className="w-full p-3 border rounded-lg mb-4" onChange={e => setP(e.target.value)} />
        <button className="w-full bg-black text-white py-3 rounded-lg font-bold">Enter Dashboard</button>
      </form>
    );
  };

  // --- ADMIN DASHBOARD ---
  const AdminDashboard = () => {
    const [viewSS, setViewSS] = useState(null);
    const updateP = async (id, data) => { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'players', id), data); };

    return (
      <div className="max-w-6xl mx-auto mt-8 p-4">
        <h2 className="text-3xl font-bold mb-6 text-[#5c3a21]">Auction Admin</h2>
        <div className="bg-white rounded-xl shadow overflow-hidden border">
          <table className="w-full text-left">
            <thead className="bg-gray-100"><tr><th className="p-4">Player</th><th className="p-4">Payment</th><th className="p-4">Status</th></tr></thead>
            <tbody>
              {players.map(p => (
                <tr key={p.id} className="border-b">
                  <td className="p-4 flex items-center gap-3">
                    <img src={p.photoUrl} className="w-10 h-10 rounded-full border shadow-sm" />
                    <div><div className="font-bold">{p.name}</div><div className="text-xs text-gray-500">{p.category}</div></div>
                  </td>
                  <td className="p-4">
                    {p.paymentStatus === 'Pending' ? (
                      <button onClick={() => setViewSS(p)} className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-bold">Verify Payment</button>
                    ) : (
                      <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold">Verified</span>
                    )}
                  </td>
                  <td className="p-4 text-sm font-medium">{p.auctionStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {viewSS && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-xl max-w-sm w-full text-center shadow-2xl">
              <h3 className="font-bold mb-4">Payment Proof</h3>
              <img src={viewSS.paymentScreenshot} className="max-h-80 mx-auto rounded mb-6 border" />
              <div className="flex gap-2">
                <button onClick={() => setViewSS(null)} className="flex-1 py-2 bg-gray-200 rounded font-bold">Close</button>
                <button onClick={() => { updateP(viewSS.id, { paymentStatus: 'Paid' }); setViewSS(null); }} className="flex-1 py-2 bg-green-600 text-white rounded font-bold">Approve</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // --- APP RENDER ---
  if (!user) return <div className="flex items-center justify-center h-screen font-bold text-[#5c3a21]">Connecting to Server...</div>;

  return (
    <div className="min-h-screen bg-[#f8f5f0] pb-20">
      <Navbar />
      {view === 'landing' && <LandingPage />}
      {view === 'register' && <RegistrationForm />}
      {view === 'payment' && <RealPayment />}
      {view === 'success' && <SuccessPage />}
      {view === 'admin-login' && <AdminLogin />}
      {view === 'admin-dashboard' && <AdminDashboard />}
    </div>
  );
                  }
                                                 
