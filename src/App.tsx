import { Routes, Route } from 'react-router-dom'
import AdminPanel from './components/AdminPanel'
import PreviewPage from './components/PreviewPage'

function App() {
  return (
    <div className="w-full h-screen">
      <Routes>
        <Route path="/" element={<AdminPanel />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/preview" element={<PreviewPage />} />
      </Routes>
    </div>
  )
}

export default App
