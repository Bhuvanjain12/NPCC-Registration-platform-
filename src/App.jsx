import React, { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs
} from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

/* 🔥 FIREBASE CONFIG */
const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_BUCKET",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const playersRef = collection(db, "players");
const PAGE_SIZE = 20;

export default function App() {
  const [players, setPlayers] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    signInAnonymously(auth);
    loadPlayers();
  }, []);

  /* 📦 FETCH PLAYERS WITH PAGINATION */
  const loadPlayers = async () => {
    if (loading) return;

    setLoading(true);

    const q = lastDoc
      ? query(playersRef, orderBy("timestamp", "desc"), startAfter(lastDoc), limit(PAGE_SIZE))
      : query(playersRef, orderBy("timestamp", "desc"), limit(PAGE_SIZE));

    const snap = await getDocs(q);

    const newPlayers = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    setPlayers(prev => [...prev, ...newPlayers]);
    setLastDoc(snap.docs[snap.docs.length - 1]);
    setLoading(false);
  };

  /* 🚀 NO LIBRARY INFINITE SCROLL */
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 300
      ) {
        loadPlayers();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastDoc, loading]);

  return (
    <div className="min-h-screen bg-[#f8f5f0] px-6 py-12">

      <h1 className="text-4xl font-black text-center mb-12 text-[#5c3a21] italic">
        NPCC Auction Pool
      </h1>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">

        {players.map(p => (
          <div
            key={p.id}
            className="
              bg-white rounded-[40px] overflow-hidden
              shadow-xl hover:-translate-y-3
              hover:shadow-[0_30px_80px_rgba(0,0,0,0.15)]
              transition-all duration-500
            "
          >
            <div className="h-64 relative">
              <img
                src={p.photoUrl}
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
              />

              <div className="absolute top-4 left-4 space-y-2">
                <span className={`text-[10px] px-3 py-1 rounded-full text-white font-black ${
                  p.category === "Youth" ? "bg-blue-600" : "bg-orange-600"
                }`}>
                  {p.category}
                </span>

                <span className={`text-[10px] px-3 py-1 rounded-full text-white font-black ${
                  p.paymentStatus === "Paid" ? "bg-green-600" : "bg-red-500"
                }`}>
                  {p.paymentStatus}
                </span>
              </div>
            </div>

            <div className="p-8 text-center">
              <h3 className="text-2xl font-black text-[#5c3a21] italic">
                {p.name}
              </h3>

              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                {p.native} • {p.age} yrs
              </p>

              <div className={`mt-4 p-3 rounded-2xl text-[10px] font-black uppercase ${
                p.auctionStatus === "Sold"
                  ? "bg-green-50 text-green-700 border-2 border-green-200"
                  : "bg-gray-50 text-gray-400 border-2 border-gray-100"
              }`}>
                {p.auctionStatus === "Sold"
                  ? `TEAM: ${p.team}`
                  : "UNSOLD"}
              </div>
            </div>
          </div>
        ))}

      </div>

      {loading && (
        <p className="text-center mt-10 text-gray-400 font-black tracking-widest">
          LOADING MORE...
        </p>
      )}

    </div>
  );
}
