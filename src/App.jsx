import React, { useState, useEffect, useMemo } from 'react';
import { 
  User, Phone, Mail, MapPin, CheckCircle, 
  CreditCard, Lock, Shield, Users, BarChart, Download, 
  LogOut, Search, Edit3, Image as ImageIcon,
  Camera, Check, X, Zap, Trophy, ChevronRight
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, setDoc, updateDoc } from 'firebase/firestore';

// PASTE YOUR FIREBASE CONFIG HERE
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = "npcc-portal-v2";

const compressImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 600;
        let width = img.width; let height = img.height;
        if (width > height) { if (width > MAX) { height *= MAX / width; width = MAX; } }
        else { if (height > MAX) { width *= MAX / height; height = MAX; } }
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
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
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    signInAnonymously(auth);
    const unsubscribe = onAuthStateChanged(auth, (u) => { setUser(u); setIsLoading(false); });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'players'), (snapshot) => {
      setPlayers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  const navigate = (v) => { setView(v); window.scrollTo(0, 0); };

  const Landing = () => (
    <div className="max-w-4xl mx-auto mt-20 px-4 text-center">
      <h1 className="text-4xl font-black text-[#5c3a21] mb-8">NPCC Cricket Auction</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <button onClick={() => { setCategory('Youth'); navigate('register'); }} className="bg-white p-8 rounded-2xl shadow-lg border-2 border-transparent hover:border-blue-500 transition">
          <Zap className="mx-auto text-blue-500 mb-4" size={48} />
          <h2 className="text-2xl font-bold mb-2">Youth League</h2>
          <p className="text-gray-500 mb-4">Ages 15 - 35</p>
          <span className="text-blue-600 font-bold">Register Now →</span>
        </button>
        <button onClick={() => { setCategory('40+'); navigate('register'); }} className="bg-white p-8 rounded-2xl shadow-lg border-2 border-transparent hover:border-[#5c3a21] transition">
          <Trophy className="mx-auto text-[#5c3a21] mb-4" size={48} />
          <h2 className="text-2xl font-bold mb-2">40+ League</h2>
          <p className="text-gray-500 mb-4">Ages 40 & Above</p>
          <span className="text-[#5c3a21] font-bold">Register Now →</span>
        </button>
      </div>
    </div>
  );

  const Register = () => {
    const [form, setForm] = useState({ name: '', age: '', contact: '', email: '', native: '' });
    const [photo, setPhoto] = useState(null);
    const [err, setErr] = useState('');

    const handleSub = async (e) => {
      e.preventDefault();
      const age = parseInt(form.age);
      if (category === 'Youth' && (age < 15 || age > 35)) return setErr("Youth age must be 15-35");
      if (category === '40+' && age < 40) return setErr("40+ age must be 40 or above");
      if (!photo) return setErr("Photo required");
      
      setTempPlayer({ ...form, category, id: 'NPCC'+Date.now().toString().slice(-4), photoUrl: photo });
      navigate('payment');
    };

    return (
      <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">{category} Registration</h2>
        {err && <div className="bg-red-100 text-red-600 p-2 rounded mb-4 text-center">{err}</div>}
        <form onSubmit={handleSub} className="space-y-4">
          <input required placeholder="Full Name" className="w-full p-2 border rounded" onChange={e => setForm({...form, name: e.target.value})} />
          <input required type="number" placeholder="Age" className="w-full p-2 border rounded" onChange={e => setForm({...form, age: e.target.value})} />
          <input required placeholder="Contact Number" className="w-full p-2 border rounded" onChange={e => setForm({...form, contact: e.target.value})} />
          <input required type="email" placeholder="Email" className="w-full p-2 border rounded" onChange={e => setForm({...form, email: e.target.value})} />
          <input required placeholder="Native Place" className="w-full p-2 border rounded" onChange={e => setForm({...form, native: e.target.value})} />
          <div className="border-2 border-dashed p-4 text-center cursor-pointer relative bg-gray-50">
            {photo ? <img src={photo} className="h-20 mx-auto" /> : "Click to Upload Photo"}
            <input type="file" accept="image/*" className="absolute inset-0 opacity-0" onChange={async e => setPhoto(await compressImage(e.target.files[0]))} />
          </div>
          <button className="w-full bg-[#5c3a21] text-white py-3 rounded font-bold">Proceed to Payment</button>
        </form>
      </div>
    );
  };

  const Payment = () => {
    const [ss, setSs] = useState(null);
    const [loading, setLoading] = useState(false);
    const upi = "bjain6851-1@okaxis";

    const finish = async () => {
      setLoading(true);
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'players', tempPlayer.id), {
        ...tempPlayer, paymentStatus: 'Pending', auctionStatus: 'Unsold', screenshot: ss, timestamp: new Date().toISOString()
      });
      navigate('landing');
      alert("Registration Submitted!");
    };

    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md text-center">
        <h2 className="text-xl font-bold mb-4">Pay Registration Fee (₹500)</h2>
        <img src={`https://api.qrserver.com/v1/create-qr-code/?data=upi://pay?pa=${upi}&am=500`} className="mx-auto mb-4" />
        <p className="mb-4">UPI: {upi}</p>
        <div className="border p-4 mb-4 relative bg-gray-50">
          {ss ? "Screenshot Added" : "Upload Payment Screenshot"}
          <input type="file" className="absolute inset-0 opacity-0" onChange={async e => setSs(await compressImage(e.target.files[0]))} />
        </div>
        <button disabled={!ss || loading} onClick={finish} className="w-full bg-green-600 text-white py-3 rounded font-bold">Submit Application</button>
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <nav className="bg-[#5c3a21] text-white p-4 flex justify-between font-bold">
        <span onClick={() => navigate('landing')} className="cursor-pointer">NPCC</span>
        <div className="space-x-4 text-sm">
          <button onClick={() => navigate('landing')}>Register</button>
          <button onClick={() => navigate('admin-login')}>Admin</button>
        </div>
      </nav>
      {view === 'landing' && <Landing />}
      {view === 'register' && <Register />}
      {view === 'payment' && <Payment />}
      {view === 'admin-login' && (
        <div className="max-w-sm mx-auto mt-20 p-6 bg-white shadow-lg">
          <h2 className="font-bold mb-4">Admin Access</h2>
          <input id="pw" type="password" placeholder="Password" className="w-full p-2 border mb-4" />
          <button onClick={() => document.getElementById('pw').value === 'bababhuvandev' ? setIsAdmin(true) : alert('Wrong')} className="w-full bg-[#5c3a21] text-white p-2">Login</button>
          {isAdmin && <button onClick={() => navigate('dashboard')} className="mt-4 text-blue-600">Enter Dashboard</button>}
        </div>
      )}
      {view === 'dashboard' && isAdmin && (
        <div className="p-4 max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
          <div className="bg-white overflow-auto shadow rounded">
            <table className="w-full text-left">
              <thead className="bg-gray-100"><tr><th className="p-2">Name</th><th className="p-2">Cat</th><th className="p-2">Age</th><th className="p-2">Status</th></tr></thead>
              <tbody>
                {players.map(p => (
                  <tr key={p.id} className="border-t">
                    <td className="p-2">{p.name}</td>
                    <td className="p-2">{p.category}</td>
                    <td className="p-2">{p.age}</td>
                    <td className="p-2">{p.paymentStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
