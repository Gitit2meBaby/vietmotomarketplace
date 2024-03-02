import Home from './components/Home'
import Header from './components/Header'
import PostBikeForm from './components/PostBikeForm'
import BikeList from './components/BikeList'
import { Routes, Route } from 'react-router-dom'
import Footer from './components/Footer'
import Cropper from './components/cropper/Cropper'
import { useAppContext } from './context';


function App() {
  const { cropper } = useAppContext()
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path='/post' element={<PostBikeForm />} />
        <Route path="/list" element={<BikeList />} />
      </Routes>
      <Footer />
      {cropper && (
        <Cropper />
      )}
    </>
  )
}

export default App