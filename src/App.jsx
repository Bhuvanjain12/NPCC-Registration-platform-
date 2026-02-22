import React, { useState, useEffect } from 'react';
import { 
  User, Phone, Mail, MapPin, CheckCircle, 
  CreditCard, Lock, Shield, Trophy, ChevronRight, Camera
} from 'lucide-react';

// FIREBASE INITIALIZATION
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

// Helper function to compress images
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

  // --- SUB-COMPONENTS ---
  const Navbar = () => (
    <nav className="bg-[#5c3a21] text-white p-4 shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="font-bold text-xl cursor-pointer" onClick={() => navigate('landing')}>NPCC Cricket</div>
        <div className="flex gap-4 text-sm">
          <button onClick={() => navigate('login')}>Login</button>
          <button onClick={() => navigate('admin-login')} className="text-[#d4b895]">Admin</button>
        </div>
      </div>
    </nav>
  );

  const LandingPage = () => (
    <div className="max-w-4xl mx-auto mt-12 px-4 text-center">
      <h1 className="text-4xl font-black text-[#5c3a21] mb-8">NPCC Auction Portal</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <button onClick={() => { setRegistrationCategory('Youth'); navigate('register'); }} className="bg-white p-8 rounded-2xl shadow-lg border-2 border-transparent hover:border-blue-500 transition">
          <h2 className="text-2xl font-bold mb-2">Youth League</h2>
          <p className="text-gray-500">Ages 15 to 35</p>
        </button>
        <button onClick={() => { setRegistrationCategory('40+'); navigate('register'); }} className="bg-white p-8 rounded-2xl shadow-lg border-2 border-transparent hover:border-[#5c3a21] transition">
          <h2 className="text-2xl font-bold mb-2">40+ League</h2>
          <p className="text-gray-500">Age 40 & Above</p>
        </button>
      </div>
    </div>
  );

  const RegistrationForm = () => {
    const [formData, setFormData] = useState({ name: '', age: '', contact: '', email: '', native: '' });
    const [photo, setPhoto] = useState(null);

    const handleSubmit = (e) => {
      e.preventDefault();
      if(!photo) return alert("Photo upload karein!");
      setTempPlayer({ ...formData, category: registrationCategory, id: 'NPCC' + Date.now().toString().slice(-4), photoUrl: photo });
      navigate('payment');
    };

    return (
      <form onSubmit={handleSubmit} className="max-w-xl mx-auto mt-8 p-6 bg-white rounded-xl shadow-md space-y-4">
        <h2 className="text-2xl font-bold text-center">Register as {registrationCategory}</h2>
        <input required placeholder="Full Name" className="w-full p-2 border rounded" onChange={e => setFormData({...formData, name: e.target.value})} />
        <input required type="number" placeholder="Age" className="w-full p-2 border rounded" onChange={e => setFormData({...formData, age: e.target.value})} />
        <input required type="tel" placeholder="Mobile Number" className="w-full p-2 border rounded" onChange={e => setFormData({...formData, contact: e.target.value})} />
        <input required type="text" placeholder="Native Place" className="w-full p-2 border rounded" onChange={e => setFormData({...formData, native: e.target.value})} />
        <div className="border-2 border-dashed p-4 text-center cursor-pointer relative">
          {photo ? <img src={photo} className="h-20 mx-auto" /> : "Click to Upload Photo"}
          <input type="file" className="absolute inset-0 opacity-0" onChange={async e => setPhoto(await compressImage(e.target.files[0]))} />
        </div>
        <button className="w-full bg-[#5c3a21] text-white py-3 rounded font-bold">Proceed to Payment</button>
      </form>
    );
  };

  const RealPayment = () => {
    const [screenshotUrl, setScreenshotUrl] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    
    // Yahan aapka direct QR image link daal diya gaya hai
    const customQrImage = "https://i.ibb.co/994m8R0W/1000276929.png"; 

    const handleCompleteRegistration = async () => {
      setIsSaving(true);
      setErrorMsg("");
      try {
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'players', tempPlayer.id);
        await setDoc(docRef, { ...tempPlayer, paymentStatus: 'Pending', auctionStatus: 'Unsold', paymentScreenshot: screenshotUrl });
        navigate('email');
      } catch (err) { 
        setErrorMsg("Error: " + err.message); 
      }
      setIsSaving(false);
    };

    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-xl shadow-lg text-center">
        <h2 className="text-xl font-bold mb-4">Scan & Pay ₹500</h2>
        
        {errorMsg && <div className="bg-red-100 text-red-600 p-2 mb-4 rounded">{errorMsg}</div>}

        <div className="bg-blue-50 p-4 rounded-xl mb-6 border border-blue-100">
           <img src={customQrImage} alt="QR Code" className="w-56 mx-auto mb-2 rounded-lg shadow-sm" />
           <p className="font-bold text-gray-800">Payee: Bhuvan Jain</p>
           <p className="text-sm text-gray-500">UPI ID: bjain6851-1@okaxis</p>
        </div>
        
        <div className="border-2 border-dashed p-4 mb-4 relative bg-gray-50 cursor-pointer">
          {screenshotUrl ? <img src={screenshotUrl} className="h-32 mx-auto rounded shadow-sm" /> : <Camera size={40} className="text-gray-400 mx-auto" />}
          <p className="text-sm text-gray-500 mt-2">{screenshotUrl ? 'Screenshot Uploaded! (Click to change)' : 'Upload Payment Screenshot'}</p>
          <input type="file" className="absolute inset-0 opacity-0" onChange={async e => setScreenshotUrl(await compressImage(e.target.files[0]))} />
        </div>

        <button onClick={handleCompleteRegistration} disabled={!screenshotUrl || isSaving} className="w-full bg-green-600 text-white py-3 rounded font-bold disabled:bg-gray-400">
          {isSaving ? "Submitting Registration..." : "Submit Registration"}
        </button>
      </div>
    );
  };

  const EmailConfirmation = () => (
    <div className="max-w-md mx-auto mt-20 text-center">
      <CheckCircle size={60} className="text-green-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold">Submitted Successfully!</h2>
      <p className="text-gray-600 mt-2">Admin will verify your payment soon.</p>
      <button onClick={() => navigate('landing')} className="mt-6 text-blue-600 font-bold hover:underline">Go to Home Page</button>
    </div>
  );

  const AdminLogin = () => {
    const [p, setP] = useState('');
    const handle = (e) => { e.preventDefault(); if(p === 'bababhuvandev') { setIsAdmin(true); navigate('admin-dashboard'); } else { alert("Wrong Password!"); } };
    return (
      <form onSubmit={handle} className="max-w-xs mx-auto mt-20 p-6 bg-white shadow-lg rounded-xl">
        <h2 className="text-xl font-bold mb-4">Admin Login</h2>
        <input type="password" placeholder="Password" className="w-full p-2 border rounded mb-4" onChange={e => setP(e.target.value)} />
        <button className="w-full bg-black text-white p-2 rounded font-bold">Enter</button>
      </form>
    );
  };

  const AdminDashboard = () => {
    const [viewScreenshot, setViewScreenshot] = useState(null);

    const updatePlayer = async (id, data) => {
      try {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'players', id), data);
      } catch (error) { console.error("Error updating player:", error); }
    };

    return (
      <div className="max-w-6xl mx-auto mt-8 p-4">
        <h2 className="text-3xl font-bold mb-6">Admin Dashboard</h2>
        <div className="bg-white rounded-xl shadow border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead className="bg-gray-100"><tr><th className="p-4">Player</th><th className="p-4">Payment</th><th className="p-4">Status</th></tr></thead>
              <tbody>
                {players.map(player => (
                  <tr key={player.id} className="border-b">
                    <td className="p-4"><div className="flex items-center gap-3"><img src={player.photoUrl} className="w-10 h-10 rounded-full object-cover border" /><div><div className="font-medium text-gray-800">{player.name}</div><div className="text-xs text-gray-500">{player.category} • {player.contact}</div></div></div></td>
                    <td className="p-4">
                      {player.paymentStatus === 'Pending' ? (
                        <div className="flex flex-col gap-2"><span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded w-max">PENDING</span><button onClick={() => setViewScreenshot(player)} className="text-xs flex items-center gap-1 text-blue-600 border border-blue-200 px-2 py-1 rounded w-max"><Camera size={12}/> View Proof</button></div>
                      ) : (<span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded w-max">VERIFIED</span>)}
                    </td>
                    <td className="p-4"><select disabled={player.paymentStatus !== 'Paid'} className="text-sm border-gray-300 py-1 px-2 rounded" value={player.auctionStatus} onChange={(e) => updatePlayer(player.id, { auctionStatus: e.target.value })}><option value="Unsold">Unsold</option><option value="Sold">Sold</option></select></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {viewScreenshot && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-xl w-full max-w-lg text-center relative">
              <button onClick={() => setViewScreenshot(null)} className="absolute top-4 right-4 text-gray-500 bg-gray-100 rounded-full p-1"><X size={20}/></button>
              <h3 className="text-xl font-bold mb-4">Payment Proof</h3>
              <div className="bg-gray-100 p-2 rounded-lg flex justify-center mb-6">
                {viewScreenshot.paymentScreenshot ? (<img src={viewScreenshot.paymentScreenshot} className="max-h-[50vh] object-contain rounded" />) : (<p>No screenshot.</p>)}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setViewScreenshot(null)} className="flex-1 py-3 bg-gray-200 rounded-lg font-bold">Cancel</button>
                <button onClick={() => { updatePlayer(viewScreenshot.id, { paymentStatus: 'Paid' }); setViewScreenshot(null); }} className="flex-1 py-3 bg-green-600 text-white rounded-lg font-bold">Approve</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center text-[#5c3a21] font-bold">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#f8f5f0] font-sans pb-12">
      <Navbar />
      <main>
        {view === 'landing' && <LandingPage />}
        {view === 'register' && <RegistrationForm />}
        {view === 'payment' && <RealPayment />}
        {view === 'email' && <EmailConfirmation />}
        {view === 'admin-login' && <AdminLogin />}
        {view === 'admin-dashboard' && <AdminDashboard />}
      </main>
    </div>
  );
}


