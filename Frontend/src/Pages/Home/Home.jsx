
import React from 'react'
import HomeBanner from '../../Components/Banner/HomeBanner'
import Footer from '../Layout/Footer/Footer'
import ShopByCategory from '../ShopByCategory/Shopbycategory'
import ShopCardCategory from '../../Components/ShopCard/ShopCardCategory'
import NewCollections from '../../Components/ShopCard/NewCollections'
import GiftGuide from '../../Components/ShopCard/GiftGuide'
import Offers from '../../Components/ShopCard/Offers'
// src/Pages/Home/Home.jsx

import React from "react";
import HomeBanner from "../../Components/Banner/HomeBanner";
import Footer from "../Layout/Footer/Footer";
import ShopByCategory from "../ShopByCategory/Shopbycategory";
import ShopCardCategory from "../../Components/ShopCard/ShopCardCategory";
import NewArrivalsBanner from "../../Components/Banner/NewArrivalsBanner";
import NewCollections from "../../Components/ShopCard/NewCollections";

const Home = () => {
  return (
    <div>
       <HomeBanner/>
        <ShopByCategory/>
        <ShopCardCategory/>
        <NewCollections/>
        <GiftGuide/>
        <Offers/>
        <Footer/>
      <HomeBanner />
      <ShopByCategory />
      <ShopCardCategory />
      <NewArrivalsBanner />
      <NewCollections />
      <Footer />
    </div>
  );
};

export default Home;
