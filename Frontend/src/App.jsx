import { Routes, Route } from "react-router-dom";
import "./App.css";

import Header from "./Pages/Layout/Header/Header";
import Footer from "./Pages/Layout/Footer/Footer";

import Home from "./Pages/Home/Home";
import Story from "./Pages/AboutUs/Story";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />

      <Route
        path="/stories"
        element={
          <>
            <Header />
            <Story />
            <Footer />
          </>
        }
      />

    </Routes>
  );
}

export default App;
