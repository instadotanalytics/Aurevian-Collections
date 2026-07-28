import React from 'react'
import HomeBanner from '../../Components/Banner/HomeBanner'
import Footer from '../Layout/Footer/Footer'
import ShopByCategory from '../ShopByCategory/Shopbycategory'
import ShopCardCategory from '../../Components/ShopCard/ShopCardCategory'


const Home = () => {
  return (
    <div>
       <HomeBanner/>
        <ShopByCategory/>
        <ShopCardCategory/>
        <Footer/>
    </div>
  )
}

export default Home;