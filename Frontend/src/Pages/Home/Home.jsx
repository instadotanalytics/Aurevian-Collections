import React from "react";

import HomeBanner from "../../Components/Banner/HomeBanner";
import ShopByCategory from "../ShopByCategory/Shopbycategory";
import ShopCardCategory from "../../Components/ShopCard/ShopCardCategory";
import NewArrivalsBanner from "../../Components/Banner/NewArrivalsBanner";
import NewCollections from "../../Components/ShopCard/NewCollections";
import Footer from "../Layout/Footer/Footer";
import GiftGuide from "../../Components/ShopCard/GiftGuide";
import Offers from "../../Components/ShopCard/Offers";

const Home = () => {
  return (
    <div>
      <HomeBanner />
      <ShopByCategory />
      <ShopCardCategory />
      <NewArrivalsBanner />
      <NewCollections />
      <GiftGuide/>
      <Offers/>
      <Footer />
    </div>
  );
};

export default Home;