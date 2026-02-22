import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";

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
const storage = getStorage(app);

export default function App() {
  const [page, setPage] = useState("home");
  const [players, setPlayers] = useState([]);
  const [filter, setFilter] = useState("All");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    native: "",
    dob: "",
    role: "",
    tshirt: "",
    category: "",
    status: "Pending",
    auctionStatus: "Not Auctioned",
    team: ""
  });

  const [photo, setPhoto] = useState(null);
  const [paymentProof, setPaymentProof] = useState(null);
  const [age, setAge] = useState(null);

  const [adminUser, setAdminUser] = useState("");
  const [adminPass, setAdminPass] = useState("");

  const calculateAge = (date) => {
    const birth = new Date(date);
    const today = new Date();
    let years = today.getFullYear() - birth.getFullYear();
    if (
      today.getMonth() < birth.getMonth() ||
      (today.getMonth() === birth.getMonth() &&
        today.getDate() < birth.getDate())
    ) {
      years--;
    }
    setAge(years);
  };

  const loadPlayers = async () => {
    const snap = await getDocs(collection(db, "players"));
    setPlayers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    loadPlayers();
  }, []);

  const registerPlayer = async () => {
    if (!photo || !paymentProof) {
      alert("Upload photo & payment proof");
      return;
    }

    const photoRef = ref(storage, "photos/" + photo.name);
    await uploadBytes(photoRef, photo);
    const photoURL = await getDownloadURL(photoRef);

    const proofRef = ref(storage, "payments/" + paymentProof.name);
    await uploadBytes(proofRef, paymentProof);
    const proofURL = await getDownloadURL(proofRef);

    await addDoc(collection(db, "players"), {
      ...form,
      age,
      photoURL,
      proofURL
    });

    alert("Submitted for admin approval!");
    setPage("home");
  };

  const approve = async (id) => {
    await updateDoc(doc(db, "players", id), { status: "Approved" });
    loadPlayers();
  };

  const updateAuction = async (id, status, team) => {
    await updateDoc(doc(db, "players", id), {
      auctionStatus: status,
      team: team
    });
    loadPlayers();
  };

  if (page === "admin") {
    return (
      <div style={box}>
        <h2>Admin Dashboard</h2>
        {players.map((p) => (
          <div key={p.id} style={card}>
            <img src={p.photoURL} width="80" />
            <p><b>{p.name}</b> ({p.category})</p>
            <p>Status: {p.status}</p>

            {p.status === "Pending" && (
              <button onClick={() => approve(p.id)}>Approve</button>
            )}

            {p.status === "Approved" && (
              <>
                <select
                  onChange={(e) =>
                    updateAuction(p.id, e.target.value, p.team)
                  }
                >
                  <option>Not Auctioned</option>
                  <option>Sold</option>
                  <option>Unsold</option>
                </select>

                <input
                  placeholder="Team name"
                  onBlur={(e) =>
                    updateAuction(p.id, p.auctionStatus, e.target.value)
                  }
                />
              </>
            )}
          </div>
        ))}
        <button onClick={() => setPage("home")}>Back</button>
      </div>
    );
  }

  if (page === "register") {
    return (
      <div style={box}>
        <h2>NPCC Registration</h2>

        <select onChange={(e) => setForm({ ...form, category: e.target.value })}>
          <option>Select Category</option>
          <option>Youth</option>
          <option>40+</option>
        </select>

        <input placeholder="Full Name" onChange={(e)=>setForm({...form,name:e.target.value})}/>
        <input type="date" onChange={(e)=>{setForm({...form,dob:e.target.value});calculateAge(e.target.value)}}/>
        {age && <p>Age: {age}</p>}

        <input placeholder="Phone" onChange={(e)=>setForm({...form,phone:e.target.value})}/>
        <input placeholder="Email" onChange={(e)=>setForm({...form,email:e.target.value})}/>
        <input placeholder="Native" onChange={(e)=>setForm({...form,native:e.target.value})}/>

        <select onChange={(e)=>setForm({...form,role:e.target.value})}>
          <option>Select Role</option>
          <option>Batsman</option>
          <option>Bowler</option>
          <option>All-rounder</option>
          <option>Wicketkeeper</option>
        </select>

        <select onChange={(e)=>setForm({...form,tshirt:e.target.value})}>
          <option>T-shirt Size</option>
          <option>S</option>
          <option>M</option>
          <option>L</option>
          <option>XL</option>
        </select>

        <input type="file" onChange={(e)=>setPhoto(e.target.files[0])}/>
        <p>Pay ₹500 to UPI: bjain6851-1@okaxis</p>
        <input type="file" onChange={(e)=>setPaymentProof(e.target.files[0])}/>

        <button onClick={registerPlayer}>Submit</button>
      </div>
    );
  }

  return (
    <div style={box}>
      <h2>NPCC Player Directory</h2>

      <button onClick={()=>setPage("register")}>Register</button>
      <button onClick={()=>setPage("login")}>Admin</button>

      <select onChange={(e)=>setFilter(e.target.value)}>
        <option>All</option>
        <option>Youth</option>
        <option>40+</option>
      </select>

      {players
        .filter(p => p.status === "Approved")
        .filter(p => filter==="All" ? true : p.category===filter)
        .map(p => (
          <div key={p.id} style={card}>
            <img src={p.photoURL} width="80"/>
            <p><b>{p.name}</b></p>
            <p>{p.category} | {p.role}</p>
            <p>Auction: {p.auctionStatus}</p>
            {p.team && <p>Team: {p.team}</p>}
          </div>
        ))}
    </div>
  );
}

const box={maxWidth:500,margin:"auto",padding:20,textAlign:"center"};
const card={border:"1px solid #ccc",padding:10,margin:10};
