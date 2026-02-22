import React, { useState, useEffect } from "react";
import { db, storage } from "./firebase";
import { collection, addDoc, getDocs, updateDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function App() {
  const [players, setPlayers] = useState([]);
  const [form, setForm] = useState({
    category:"",
    name:"",
    phone:"",
    email:"",
    native:"",
    dob:"",
    role:"",
    tshirt:"",
    team:"",
    payment:null,
    photo:null,
    approved:false
  });

  const loadPlayers = async () => {
    const snap = await getDocs(collection(db,"players"));
    setPlayers(snap.docs.map(d => ({ id:d.id, ...d.data() })));
  };

  useEffect(()=>{ loadPlayers(); },[]);

  const uploadFile = async(file,path)=>{
    const r = ref(storage,path);
    await uploadBytes(r,file);
    return await getDownloadURL(r);
  };

  const submit = async()=>{
    const paymentURL = await uploadFile(form.payment,"payments/"+Date.now());
    const photoURL = await uploadFile(form.photo,"photos/"+Date.now());

    await addDoc(collection(db,"players"),{
      ...form,
      payment:paymentURL,
      photo:photoURL,
      approved:false
    });

    alert("Submitted! Waiting for approval.");
    setForm({});
    loadPlayers();
  };

  const approve = async(id)=>{
    await updateDoc(doc(db,"players",id),{approved:true});
    loadPlayers();
  };

  return (
    <div style={page}>
      <div style={card}>
        <h2>NPCC Registration</h2>

        <select onChange={e=>setForm({...form,category:e.target.value})}>
          <option>Select Category</option>
          <option>Youth</option>
          <option>40+</option>
        </select>

        <input placeholder="Name" onChange={e=>setForm({...form,name:e.target.value})}/>
        <input placeholder="Phone" onChange={e=>setForm({...form,phone:e.target.value})}/>
        <input placeholder="Email" onChange={e=>setForm({...form,email:e.target.value})}/>
        <input placeholder="Native" onChange={e=>setForm({...form,native:e.target.value})}/>
        <input type="date" onChange={e=>setForm({...form,dob:e.target.value})}/>
        <input placeholder="Role" onChange={e=>setForm({...form,role:e.target.value})}/>
        <input placeholder="T-shirt Size" onChange={e=>setForm({...form,tshirt:e.target.value})}/>
        <input placeholder="Team (optional)" onChange={e=>setForm({...form,team:e.target.value})}/>

        <p>Pay ₹500 → bjain6851-1@okaxis</p>

        Payment Screenshot:
        <input type="file" onChange={e=>setForm({...form,payment:e.target.files[0]})}/>

        Player Photo:
        <input type="file" onChange={e=>setForm({...form,photo:e.target.files[0]})}/>

        <button onClick={submit}>Submit</button>

        <h3>Approved Players</h3>
        {players.filter(p=>p.approved).map(p=>(
          <div key={p.id} style={player}>
            <img src={p.photo} width="60"/>
            {p.name} - {p.role} - {p.team}
          </div>
        ))}

        <h3>Admin Panel</h3>
        {players.filter(p=>!p.approved).map(p=>(
          <div key={p.id} style={adminRow}>
            {p.name}
            <button onClick={()=>approve(p.id)}>Approve</button>
          </div>
        ))}
      </div>
    </div>
  );
}

const page = {
  minHeight:"100vh",
  background:"linear-gradient(#c9f1e6,#e9f7d9)",
  display:"flex",
  justifyContent:"center",
  alignItems:"center"
};

const card = {
  background:"#fff",
  padding:30,
  borderRadius:20,
  width:320,
  boxShadow:"0 10px 30px rgba(0,0,0,.15)",
  display:"flex",
  flexDirection:"column",
  gap:8
};

const player = {
  display:"flex",
  gap:10,
  alignItems:"center"
};

const adminRow = {
  display:"flex",
  justifyContent:"space-between"
};
