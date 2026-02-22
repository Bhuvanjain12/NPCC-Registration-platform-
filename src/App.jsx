import { useState } from "react";

export default function App() {
  const [step, setStep] = useState("category");
  const [category, setCategory] = useState("");
  const [dob, setDob] = useState("");
  const [age, setAge] = useState(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    native: ""
  });

  const [proof, setProof] = useState(null);

  const calculateAge = (date) => {
    const birth = new Date(date);
    const today = new Date();
    let years = today.getFullYear() - birth.getFullYear();
    if (
      today.getMonth() < birth.getMonth() ||
      (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
    ) {
      years--;
    }
    setAge(years);
  };

  const validAge =
    category === "youth"
      ? age >= 15 && age <= 35
      : category === "40plus"
      ? age >= 40
      : false;

  if (step === "success") {
    return (
      <div style={box}>
        <h2>Registration Submitted 🎉</h2>
        <p>Payment sent for verification.</p>
        <p>Admin will approve soon.</p>
      </div>
    );
  }

  if (step === "payment") {
    return (
      <div style={box}>
        <h2>Pay Registration Fee ₹500</h2>

        {/* Replace QR image link if you want */}
        <img
          src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=bjain6851-1@okaxis&pn=Bhuvan%20Jain&am=500&cu=INR"
          alt="UPI QR"
          style={{ margin: 20 }}
        />

        <p><b>UPI:</b> bjain6851-1@okaxis</p>

        <input type="file" onChange={(e) => setProof(e.target.files[0])} />

        <button
          style={greenBtn}
          disabled={!proof}
          onClick={() => setStep("success")}
        >
          Submit Payment Proof
        </button>
      </div>
    );
  }

  if (step === "form") {
    return (
      <div style={box}>
        <h2>{category === "youth" ? "Youth Registration" : "40+ Registration"}</h2>

        <input
          style={input}
          placeholder="Full Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          style={input}
          type="date"
          value={dob}
          onChange={(e) => {
            setDob(e.target.value);
            calculateAge(e.target.value);
          }}
        />

        {age !== null && <p>Age: {age}</p>}

        {!validAge && age !== null && (
          <p style={{ color: "red" }}>Age not allowed for this category</p>
        )}

        {validAge && (
          <>
            <input
              style={input}
              placeholder="Mobile Number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />

            <input
              style={input}
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <input
              style={input}
              placeholder="Native Place"
              value={form.native}
              onChange={(e) => setForm({ ...form, native: e.target.value })}
            />

            <button style={greenBtn} onClick={() => setStep("payment")}>
              Proceed to Payment ₹500
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div style={box}>
      <h2>NPCC Player Registration</h2>

      <button style={btn} onClick={() => { setCategory("youth"); setStep("form"); }}>
        Youth League (15–35)
      </button>

      <button style={btn} onClick={() => { setCategory("40plus"); setStep("form"); }}>
        40+ League
      </button>
    </div>
  );
}

const box = {
  maxWidth: 420,
  margin: "auto",
  padding: 20,
  textAlign: "center"
};

const input = {
  width: "100%",
  padding: 10,
  margin: "8px 0",
  fontSize: 16
};

const btn = {
  width: "100%",
  padding: 12,
  margin: "10px 0",
  fontSize: 16
};

const greenBtn = {
  ...btn,
  background: "green",
  color: "white",
  border: "none"
};
