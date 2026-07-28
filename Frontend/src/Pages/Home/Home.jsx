import React from 'react'
import HomeBanner from '../../Components/Banner/HomeBanner'
import Footer from '../Layout/Footer/Footer'
import ShopByCategory from '../ShopByCategory/Shopbycategory'
import ShopCardCategory from '../../Components/ShopCard/ShopCardCategory'
import NewCollections from '../../Components/ShopCard/NewCollections'


const Home = () => {
  return (
    <div>
       <HomeBanner/>
        <ShopByCategory/>
        <ShopCardCategory/>
        <NewCollections/>
        <Footer/>
    </div>
  )
}

export default Home;