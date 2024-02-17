import { useState } from 'react'
import './App.css'
import Home from './components/Home'
import Header from './components/Header'
import PostBikeForm from './components/PostBikeForm'
import SellBikeForm from './components/SellBikeForm'
import RentBikeForm from './components/RentBikeForm'
import BikeList from './components/BikeList'
import Authentication from './components/Authentication'

function App() {

  return (
    <>
      <Authentication />
      <Header />
      <SellBikeForm />
      <RentBikeForm />
      {/* <BikeList /> */}
      <Home />
    </>
  )
}

export default App
