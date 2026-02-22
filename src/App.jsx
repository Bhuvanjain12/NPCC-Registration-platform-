import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAH1uDW3MJ29NzkmGL9A_sZk1k2j4e-PWQ",
  authDomain: "npcc-registration-platform.firebaseapp.com",
  projectId: "npcc-registration-platform",
  storageBucket: "npcc-registration-platform.appspot.com",
  messagingSenderId: "778084490263",
  appId: "1:778084490263:web:b61cdc54c5912fc35e5052",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export default function App() {
  const [players, setPlayers] = useState([]);
  const [form, setForm] = useState({});
  const [file, setFile] = useState(null);

  useEffect(() => {
    return onSnapshot(collection(db, "players"), snap =>
      setPlayers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
  }, []);

  const submit = async () => {
    let url = "";
    if (file) {
      const r = ref(storage, "payments/" + Date.now());
      await uploadBytes(r, file);
      url = await getDownloadURL(r);
    }

    await addDoc(collection(db, "players"), {
      ...form,
      payment: url,
      approved: false,
      auctionStatus: "Unsold",
      team: ""
    });

    alert("Registration submitted!");
  };

  return (
    <div style={page}>
      <div style={cardUI}>
        <h2>NPCC Registration</h2>

        <input style={field} placeholder="Name" onChange={e=>setForm({...form,name:e.target.value})}/>
        <input style={field} placeholder="Phone" onChange={e=>setForm({...form,phone:e.target.value})}/>
        <input style={field} placeholder="Email" onChange={e=>setForm({...form,email:e.target.value})}/>
        <input style={field} placeholder="Native" onChange={e=>setForm({...form,native:e.target.value})}/>
        <input style={field} type="date" onChange={e=>setForm({...form,dob:e.target.value})}/>

        <select style={field} onChange={e=>setForm({...form,role:e.target.value})}>
          <option>Role</option>
          <option>Batsman</option>
          <option>Bowler</option>
          <option>All Rounder</option>
          <option>Wicketkeeper</option>
        </select>

        <input type="file" style={field} onChange={e=>setFile(e.target.files[0])}/>

        <button style={registerBtn} onClick={submit}>Submit</button>

        <h3 style={{marginTop:20}}>Approved Players</h3>
        {players.filter(p=>p.approved).map(p=>(
          <div key={p.id}>{p.name} — {p.team || "Not Sold"}</div>
        ))}
      </div>
    </div>
  );
}
