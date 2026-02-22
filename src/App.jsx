import React, { useState, useEffect, useMemo } from 'react';
import { 
  User, Phone, Mail, MapPin, CheckCircle, 
  CreditCard, Lock, Shield, Users, BarChart, Download, 
  LogOut, Search, Edit3, Image as ImageIcon,
  Camera, Check, X, Zap, Trophy, ChevronRight, ExternalLink
} from 'lucide-react';

// --- REAL FIREBASE INITIALIZATION ---
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, setDoc, updateDoc } from 'firebase/firestore';

// Your Official Firebase Configuration
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

// Utility to compress images so they fit in Firestore (1MB limit)
const compressImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
        } else {
          if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
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

  const theme = {
    bg: 'bg-[#f8f5f0]',
    primary: 'bg-[#5c3a21]',
    primaryText: 'text-[#5c3a21]',
    primaryHover: 'hover:bg-[#4a2e1a]',
    secondary: 'bg-[#d4b895]'
  };

  // Authenticate user anonymously on load
  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (error) {
        console.error("Auth Error:", error);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch real-time data from Firestore
  useEffect(() => {
    if (!user) return;
    const playersRef = collection(db, 'artifacts', appId, 'public', 'data', 'players');
    const unsubscribe = onSnapshot(playersRef, (snapshot) => {
      const playersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      playersList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setPlayers(playersList);
    }, (error) => {
      console.error("Firestore Sync Error:", error);
    });
    return () => unsubscribe();
  }, [user]);

  const navigate = (newView) => {
    setView(newView);
    window.scrollTo(0, 0);
  };

  // --- UI Components ---

  const Navbar = () => (
    <nav className={`${theme.primary} text-white p-4 shadow-md sticky top-0 z-50`}>
      <div className="max-w-6xl mx-auto flex justify-between items-center flex-wrap gap-2">
        <div className="flex items-center gap-2 font-bold text-xl cursor-pointer" onClick={() => navigate(isAdmin ? 'admin-dashboard' : (currentUser ? 'directory' : 'landing'))}>
          <div className="w-8 h-8 rounded-full bg-white text-[#5c3a21] flex items-center justify-center font-black">N</div>
          NPCC Cricket Club
        </div>
        <div className="flex gap-4 text-sm font-medium items-center">
          {!isAdmin && !currentUser && (
            <>
              <button onClick={() => navigate('landing')} className="hover:text-[#d4b895] transition">Register</button>
              <button onClick={() => navigate('login')} className="hover:text-[#d4b895] transition">Player Login</button>
              <button onClick={() => navigate('admin-login')} className="flex items-center gap-1 text-[#d4b895] hover:text-white transition"><Shield size={16} /> Admin</button>
            </>
          )}
          {currentUser && !isAdmin && (
            <>
              <span className="text-[#d4b895]">Hi, {currentUser.name.split(' ')[0]}</span>
              <button onClick={() => navigate('directory')} className="hover:text-[#d4b895] transition">Directory</button>
              <button onClick={() => setCurrentUser(null)} className="flex items-center gap-1 hover:text-red-300 transition"><LogOut size={16} /> Logout</button>
            </>
          )}
          {isAdmin && (
            <>
              <span className="text-[#d4b895] flex items-center gap-1"><Shield size={16}/> Admin Mode</span>
              <button onClick={() => { setIsAdmin(false); navigate('landing'); }} className="flex items-center gap-1 hover:text-red-300 transition"><LogOut size={16} /> Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );

  const LandingPage = () => (
    <div className="max-w-4xl mx-auto mt-12 px-4">
      <div className="text-center mb-12">
        <div className="w-20 h-20 rounded-full bg-white shadow-lg mx-auto flex items-center justify-center mb-6 border-4 border-[#5c3a21]">
          <span className="text-3xl font-black text-[#5c3a21]">N</span>
        </div>
        <h1 className={`text-4xl md:text-5xl font-black ${theme.primaryText} mb-4 tracking-tight`}>NPCC Auction Portal</h1>
        <p className="text-xl text-gray-600">Select your league category to begin registration</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        <button onClick={() => { setRegistrationCategory('Youth'); navigate('register'); }} className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-500 text-left overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6"><Zap size={28} /></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Youth League</h2>
          <div className="inline-block bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full text-sm mb-4">Ages 15 to 35</div>
          <p className="text-gray-500 mb-6">Register for the upcoming youth category auction. Showcase your talent on the big stage.</p>
          <div className="flex items-center text-blue-600 font-bold group-hover:translate-x-2 transition-transform">Register Now <ChevronRight size={20} className="ml-1" /></div>
        </button>

        <button onClick={() => { setRegistrationCategory('40+'); navigate('register'); }} className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-[#5c3a21] text-left overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#f8f5f0] rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="w-14 h-14 bg-[#f8f5f0] text-[#5c3a21] rounded-xl flex items-center justify-center mb-6"><Trophy size={28} /></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">40+ League</h2>
          <div className="inline-block bg-[#e6dcc8] text-[#5c3a21] font-bold px-3 py-1 rounded-full text-sm mb-4">Age 40 & Above</div>
          <p className="text-gray-500 mb-6">Join the legends pool. Register for the veteran category auction and experience the thrill again.</p>
          <div className="flex items-center text-[#5c3a21] font-bold group-hover:translate-x-2 transition-transform">Register Now <ChevronRight size={20} className="ml-1" /></div>
        </button>
      </div>
    </div>
  );

  const RegistrationForm = () => {
    const [formData, setFormData] = useState({ name: '', age: '', contact: '', email: '', native: '' });
    const [photoDataUrl, setPhotoDataUrl] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    if (!registrationCategory) { navigate('landing'); return null; }

    const handlePhotoChange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        setIsProcessing(true);
        setPhotoDataUrl(await compressImage(file));
        setIsProcessing(false);
      }
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      const ageNum = parseInt(formData.age);
      if (registrationCategory === 'Youth' && (ageNum < 15 || ageNum > 35)) return setError('Youth League age must be between 15 and 35.');
      if (registrationCategory === '40+' && ageNum < 40) return setError('40+ League age must be 40 or above.');
      if (!photoDataUrl) return setError('Please upload a player photo.');
      
      const exists = players.find(p => p.contact === formData.contact);
      if (exists) return setError('A player with this contact number is already registered.');

      setError('');
      setTempPlayer({
        ...formData,
        category: registrationCategory,
        id: 'NPCC' + Math.floor(1000 + Math.random() * 9000),
        photoUrl: photoDataUrl,
        timestamp: new Date().toISOString()
      });
      navigate('payment');
    };

    return (
      <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-xl shadow-lg border border-[#e6dcc8]">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate('landing')} className="text-sm text-gray-500 hover:text-black">← Back</button>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${registrationCategory === 'Youth' ? 'bg-blue-100 text-blue-700' : 'bg-[#e6dcc8] text-[#5c3a21]'}`}>{registrationCategory} Category</span>
        </div>
        <h2 className={`text-3xl font-bold text-center ${theme.primaryText} mb-2`}>{registrationCategory} Player Registration</h2>
        <p className="text-center text-gray-500 mb-8">Join the NPCC Auction Pool</p>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm border border-red-200 text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label><div className="relative"><User className="absolute left-3 top-3 text-gray-400" size={18} /><input required type="text" className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5c3a21] outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Age ({registrationCategory === 'Youth' ? '15 to 35' : '40+'})</label><div className="relative"><input required type="number" min={registrationCategory === 'Youth' ? "15" : "40"} max={registrationCategory === 'Youth' ? "35" : undefined} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5c3a21] outline-none" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} /></div></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Contact Number</label><div className="relative"><Phone className="absolute left-3 top-3 text-gray-400" size={18} /><input required type="tel" className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5c3a21] outline-none" value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} /></div></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label><div className="relative"><Mail className="absolute left-3 top-3 text-gray-400" size={18} /><input required type="email" className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5c3a21] outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div></div>
            <div className="md:col-span-2"><label className="block text-sm font-semibold text-gray-700 mb-1">Native Place</label><div className="relative"><MapPin className="absolute left-3 top-3 text-gray-400" size={18} /><input required type="text" className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5c3a21] outline-none" value={formData.native} onChange={e => setFormData({...formData, native: e.target.value})} /></div></div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Upload Player Photo</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 relative">
                {isProcessing ? (<div className="text-gray-500">Processing image...</div>) : photoDataUrl ? (<img src={photoDataUrl} alt="Preview" className="h-32 w-32 object-cover rounded-full border-4 border-white shadow-md mb-2" />) : (<ImageIcon size={40} className="text-gray-400 mb-2" />)}
                <span className="text-sm text-gray-500 mt-2">{photoDataUrl ? 'Click to change photo' : 'Click to upload a clear face photo'}</span>
                <input required={!photoDataUrl} type="file" accept="image/*" onChange={handlePhotoChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              </div>
            </div>
          </div>
          <button type="submit" disabled={isProcessing} className={`w-full ${theme.primary} text-white font-bold py-3 rounded-lg mt-6 hover:bg-[#4a2e1a] transition flex justify-center items-center gap-2 disabled:opacity-50`}>
            Proceed to Payment <CreditCard size={20} />
          </button>
        </form>
      </div>
    );
  };

  const RealPayment = () => {
    const [screenshotUrl, setScreenshotUrl] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    
    // Direct link to the image you provided
    const userImgBbLink = "https://ibb.co/gFRrwZ8z";
    
    // Dynamic QR generation matching your details precisely
    const upiId = "bjain6851-1@okaxis";
    const amount = "500.00";
    const payeeName = "Bhuvan Jain";
    const upiUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiUri)}&margin=10`;

    const handleScreenshotChange = async (e) => {
      const file = e.target.files[0];
      if (file) { setScreenshotUrl(await compressImage(file)); }
    };

    const handleCompleteRegistration = async () => {
      if (!user) {
        alert("Authentication error. Please refresh the page and try again.");
        return;
      }
      setIsSaving(true);
      
      const finalPlayer = {
        ...tempPlayer,
        paymentStatus: 'Verification Pending',
        auctionStatus: 'Unsold',
        team: '-',
        paymentScreenshot: screenshotUrl
      };

      try {
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'players', tempPlayer.id);
        await setDoc(docRef, finalPlayer);
        
        setIsSaving(false);
        navigate('email');
      } catch (error) {
        console.error("Submission Error:", error);
        setIsSaving(false);
        alert(`Database Error: ${error.message}. Please check your Firebase rules.`);
      }
    };

    if (!tempPlayer) return <div className="text-center mt-10">Invalid flow. <button onClick={()=>navigate('landing')} className="text-blue-500">Go back</button></div>;

    return (
      <div className="max-w-lg mx-auto mt-8 p-6 bg-white rounded-xl shadow-lg border border-[#e6dcc8] text-center">
        <h2 className={`text-2xl font-bold ${theme.primaryText} mb-2`}>Complete Registration Payment</h2>
        <p className="text-gray-600 mb-6">Scan the QR code below using any UPI app to pay the ₹500 entry fee.</p>
        
        <div className="bg-[#f4f7fe] p-6 rounded-2xl inline-block shadow-inner mb-4 border border-blue-100">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">B</div>
            <span className="font-semibold text-gray-800 text-lg">{payeeName}</span>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm inline-block"><img src={qrCodeUrl} alt="UPI QR Code" className="w-48 h-48 mx-auto" /></div>
          <div className="mt-4 space-y-1">
            <p className="text-gray-500 text-sm">UPI ID: <span className="font-medium text-gray-800">{upiId}</span></p>
            <p className="text-gray-500 text-sm">Amount: <span className="font-bold text-gray-900">₹{amount}</span></p>
          </div>
        </div>
        
        <div className="mb-6">
          <a href={userImgBbLink} target="_blank" rel="noreferrer" className="text-blue-600 text-sm flex items-center justify-center gap-1 hover:underline">
            View Alternate QR Code Image <ExternalLink size={14} />
          </a>
        </div>

        <div className="text-left mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2 text-center">Step 2: Upload Payment Screenshot</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 relative cursor-pointer">
            {screenshotUrl ? (<img src={screenshotUrl} alt="Screenshot Preview" className="max-h-40 object-contain rounded border border-gray-200 shadow-sm mb-2" />) : (<Camera size={40} className="text-gray-400 mb-2" />)}
            <span className="text-sm text-gray-500 mt-2 text-center">{screenshotUrl ? 'Click to change screenshot' : 'Attach proof of successful transaction'}</span>
            <input type="file" accept="image/*" onChange={handleScreenshotChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          </div>
        </div>

        <button onClick={handleCompleteRegistration} disabled={!screenshotUrl || isSaving} className={`w-full ${(!screenshotUrl || isSaving) ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} text-white font-bold py-3 rounded-lg transition flex justify-center items-center gap-2`}>
          {isSaving ? 'Submitting Registration...' : 'Submit Registration'}
          {!isSaving && <CheckCircle size={20} />}
        </button>
      </div>
    );
  };

  const EmailConfirmation = () => {
    if (!tempPlayer) return null;
    return (
      <div className="max-w-2xl mx-auto mt-12">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle size={32} className="text-blue-600" /></div>
          <h2 className="text-2xl font-bold text-gray-800">Registration Submitted!</h2>
          <p className="text-gray-500"
