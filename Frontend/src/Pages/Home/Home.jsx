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
import OffersBanner from "../../Components/Banner/OffersBanner";
import ShopTheLook from "../../Components/ShopCard/ShopTheLook";
import Footer from "../Layout/Footer/Footer";
import Header from "../Layout/Header/Header";

const Home = () => {
  return (
    <div>
      <Header/>
      <HomeBanner />
      <ShopByCategory />
      <Offers />
      <OffersBanner />
      <GiftGuide />
      <GiftGuideBanner />
      <ShopCardCategory />
      <NewArrivalsBanner />
      <NewCollections />
      <ShopTheLook/>
      <Footer />
    </div>
  );
};

export default Home;