import React from "react";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import Home from "./Pages/Home/Home";
import WhyAurevian from "./Pages/About/WhyAurevian";
import Contact from "./Pages/About/Contact";
import Support from "./Pages/About/Support";
import AboutUs from "./Pages/About/AboutUs";



const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/AboutUs" element={<AboutUs />} />
        <Route path="/why-aurevian" element={<WhyAurevian />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/support" element={<Support />} />
      </Routes>
    </div>
  );
};

export default App;
