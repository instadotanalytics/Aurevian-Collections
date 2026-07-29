// src/Pages/Home/Home.jsx

import React from "react";
import HomeBanner from "../../Components/Banner/HomeBanner";
import ShopByCategory from "../ShopByCategory/Shopbycategory";
import ShopCardCategory from "../../Components/ShopCard/ShopCardCategory";
import NewArrivalsBanner from "../../Components/Banner/NewArrivalsBanner";
import GiftGuideBanner from "../../Components/Banner/GiftGuideBanner";
import NewCollections from "../../Components/ShopCard/NewCollections";
import GiftGuide from "../../Components/ShopCard/GiftGuide";
import Offers from "../../Components/ShopCard/Offers";
import Footer from "../Layout/Footer/Footer";

const Home = () => {
  return (
    <div>
      <HomeBanner />
      <ShopByCategory />
      <ShopCardCategory />
      <NewArrivalsBanner />
      <NewCollections />
      <GiftGuideBanner />
      <GiftGuide />
      <Offers />
      <Footer />
    </div>
  );
};

export default Home;
