import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAH1uDW3MJ29NzkmGL9A_sZk1k2j4e-PWQ",
  authDomain: "npcc-registration-platform.firebaseapp.com",
  projectId: "npcc-registration-platform",
  storageBucket: "npcc-registration-platform.firebasestorage.app",
  messagingSenderId: "778084490263",
  appId: "1:778084490263:web:b61cdc54c5912fc35e5052"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function App() {
  const [step, setStep] = useState("register");
  const [players, setPlayers] = useState([]);
  const [admin, setAdmin] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    native: "",
    category: "",
    status: "Pending"
  });

  const loadPlayers = async () => {
    const snap = await getDocs(collection(db, "players"));
    setPlayers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => { loadPlayers(); }, []);

  const register = async () => {
    await addDoc(collection(db, "players"), form);
    setStep("done");
  };

  const approve = async (id) => {
    await updateDoc(doc(db, "players", id), { status: "Approved" });
    loadPlayers();
  };

  if (step === "done")
    return <h2 style={{textAlign:"center"}}>Submitted for Admin Approval ✅</h2>;

  if (step === "admin") {
    return (
      <div style={box}>
        <h2>Admin Panel</h2>
        {players.map(p => (
          <div key={p.id} style={card}>
            <b>{p.name}</b> — {p.category} — {p.status}
            {p.status === "Pending" && (
              <button onClick={() => approve(p.id)}>Approve</button>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={box}>
      <h2>NPCC Registration</h2>

      <input style={input} placeholder="Name" onChange={e=>setForm({...form,name:e.target.value})}/>
      <input style={input} placeholder="Phone" onChange={e=>setForm({...form,phone:e.target.value})}/>
      <input style={input} placeholder="Email" onChange={e=>setForm({...form,email:e.target.value})}/>
      <input style={input} placeholder="Native" onChange={e=>setForm({...form,native:e.target.value})}/>

      <select style={input} onChange={e=>setForm({...form,category:e.target.value})}>
        <option value="">Select Category</option>
        <option value="Youth">Youth</option>
        <option value="40+">40+</option>
      </select>

      <button style={greenBtn} onClick={register}>Submit Registration</button>

      <button style={btn} onClick={()=>{
        const u=prompt("Username");
        const p=prompt("Password");
        if(u==="Bhuvan" && p==="bababhuvandev") setStep("admin");
      }}>
        Admin Login
      </button>
    </div>
  );
}

const box={maxWidth:420,margin:"auto",padding:20,textAlign:"center"};
const input={width:"100%",padding:10,margin:"6px 0"};
const btn={padding:10,marginTop:10};
const greenBtn={...btn,background:"green",color:"white"};
const card={border:"1px solid #ccc",padding:10,margin:8};
