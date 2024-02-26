import Home from './components/Home'
import Header from './components/Header'
import PostBikeForm from './components/PostBikeForm'
import BikeList from './components/BikeList'
import { Routes, Route } from 'react-router-dom'
import Footer from './components/Footer'
import CropperWindow from './components/CropperWindow'
import { useAppContext } from './context';

function App() {
  const { cropper, setCropper } = useAppContext()
  return (
    <>
      <Header />
      {cropper && (
        <CropperWindow />
      )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path='/post' element={<PostBikeForm />} />
        <Route path="/list" element={<BikeList />} />
      </Routes>
      <Footer />

    </>
  )
}

export default App