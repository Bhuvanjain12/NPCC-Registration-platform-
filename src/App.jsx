import { useState } from "react";

export default function App() {
  const [category, setCategory] = useState(null);
  const [dob, setDob] = useState("");
  const [age, setAge] = useState(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    native: ""
  });

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

  const isValidAge =
    category === "youth"
      ? age >= 15 && age <= 35
      : category === "40plus"
      ? age >= 40
      : false;

  return (
    <div style={{ maxWidth: 420, margin: "auto", padding: 20 }}>
      <h2 style={{ textAlign: "center" }}>NPCC Player Registration</h2>

      {!category && (
        <>
          <button onClick={() => setCategory("youth")} style={btn}>Youth League (15–35)</button>
          <button onClick={() => setCategory("40plus")} style={btn}>40+ League</button>
        </>
      )}

      {category && (
        <>
          <input
            type="text"
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={input}
          />

          <input
            type="date"
            value={dob}
            onChange={(e) => {
              setDob(e.target.value);
              calculateAge(e.target.value);
            }}
            style={input}
          />

          {age !== null && <p>Age: {age}</p>}

          {!isValidAge && age !== null && (
            <p style={{ color: "red" }}>Age not valid for selected category</p>
          )}

          {isValidAge && (
            <>
              <input
                type="tel"
                placeholder="Mobile Number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                style={input}
              />

              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                style={input}
              />

              <input
                type="text"
                placeholder="Native Place"
                value={form.native}
                onChange={(e) => setForm({ ...form, native: e.target.value })}
                style={input}
              />

              <button style={btnGreen}>Proceed to Payment ₹500</button>
            </>
          )}
        </>
      )}
    </div>
  );
}

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

const btnGreen = {
  ...btn,
  background: "green",
  color: "white"
};
