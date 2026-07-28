import React from 'react'
import HomeBanner from '../../Components/Banner/HomeBanner'
import Footer from '../Layout/Footer/Footer'
import ShopByCategory from '../ShopByCategory/Shopbycategory'
import ShopCardCategory from '../../Components/ShopCard/ShopCardCategory'
import NewCollections from '../../Components/ShopCard/NewCollections'
import GiftGuide from '../../Components/ShopCard/GiftGuide'
import Offers from '../../Components/ShopCard/Offers'


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
    </div>
  )
}

export default Home;