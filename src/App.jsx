import { useState, useEffect } from "react";
import { db, storage } from "./firebase";
import { collection, addDoc, onSnapshot } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function App() {
  const [players, setPlayers] = useState([]);
  const [form, setForm] = useState({});
  const [payment, setPayment] = useState(null);

  useEffect(() => {
    return onSnapshot(collection(db, "players"), snap =>
      setPlayers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
  }, []);

  const submit = async () => {
    let proof = "";

    if (payment) {
      const r = ref(storage, "payments/" + Date.now());
      await uploadBytes(r, payment);
      proof = await getDownloadURL(r);
    }

    await addDoc(collection(db, "players"), {
      ...form,
      payment: proof,
      approved: false,
      auctionStatus: "Unsold",
      team: ""
    });

    alert("Registration submitted!");
  };

  return (
    <div style={page}>
      <div style={card}>
        <h2>NPCC Registration</h2>

        <select style={field} onChange={e=>setForm({...form,category:e.target.value})}>
          <option>Select Category</option>
          <option>Youth (15–35)</option>
          <option>40+</option>
        </select>

        <input style={field} placeholder="Name" onChange={e=>setForm({...form,name:e.target.value})}/>
        <input style={field} placeholder="Phone" onChange={e=>setForm({...form,phone:e.target.value})}/>
        <input style={field} placeholder="Email" onChange={e=>setForm({...form,email:e.target.value})}/>
        <input style={field} placeholder="Native Place" onChange={e=>setForm({...form,native:e.target.value})}/>
        <input style={field} type="date" onChange={e=>setForm({...form,dob:e.target.value})}/>

        <select style={field} onChange={e=>setForm({...form,role:e.target.value})}>
          <option>Select Role</option>
          <option>Batsman</option>
          <option>Bowler</option>
          <option>All-rounder</option>
          <option>Wicketkeeper</option>
        </select>

        <select style={field} onChange={e=>setForm({...form,tshirt:e.target.value})}>
          <option>T-Shirt Size</option>
          <option>S</option><option>M</option><option>L</option>
          <option>XL</option><option>XXL</option>
        </select>

        <p>Pay ₹500 → bjain6851-1@okaxis</p>

        <input type="file" style={field} onChange={e=>setPayment(e.target.files[0])} />

        <button style={btn} onClick={submit}>Submit</button>

        <h3 style={{marginTop:20}}>Approved Players</h3>
        {players.filter(p=>p.approved).map(p=>(
          <div key={p.id}>{p.name} — {p.team || "Unsold"}</div>
        ))}
      </div>
    </div>
  );
}

/* UI */

const page = {
  minHeight:"100vh",
  display:"flex",
  justifyContent:"center",
  alignItems:"center",
  background:"linear-gradient(135deg,#b8e1dc,#e6f0c8)"
};

const card = {
  width:360,
  padding:28,
  borderRadius:22,
  background:"#fff",
  boxShadow:"0 20px 40px rgba(0,0,0,.15)",
  textAlign:"center"
};

const field = {
  width:"100%",
  padding:14,
  margin:"8px 0",
  borderRadius:12,
  border:"1px solid #ccc"
};

const btn = {
  width:"100%",
  padding:14,
  marginTop:10,
  borderRadius:30,
  border:"none",
  background:"linear-gradient(135deg,#1ec98b,#16a085)",
  color:"white",
  fontSize:16,
  cursor:"pointer"
};
