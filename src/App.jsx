import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./assets/components/Login.jsx"; // From src/App.jsx, go into ./components/Login.jsx
import Register from "./assets/components/Register.jsx"; // Same for Register
import Voting from "./assets/components/Voting.jsx"; // And Voting

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/vote" element={<Voting />} />
      </Routes>
    </Router>
  );
}

export default App;
