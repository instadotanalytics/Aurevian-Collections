import React from 'react'
import HomeBanner from '../../Components/Banner/HomeBanner'
import Footer from '../Layout/Footer/Footer'
import ShopByCategory from '../ShopByCategory/Shopbycategory'


const Home = () => {
  return (
    <div>
       <HomeBanner/>
        <ShopByCategory/>
        
        <Footer/>
    </div>
  )
}

export default Home;