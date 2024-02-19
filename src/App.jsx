import { useState } from 'react'
import './App.css'
import Home from './components/Home'
import Header from './components/Header'
import PostBikeForm from './components/PostBikeForm'
import BikeList from './components/BikeList'
import Authentication from './components/Authentication'

function App() {

  return (
    <>
      <Authentication />
      <Header />
      <PostBikeForm />
      <BikeList />
      <Home />
    </>
  )
}

export default App
