import { Routes, Route } from 'react-router-dom'
import AdminPanel from './components/AdminPanel'
import PreviewPage from './components/PreviewPage'
import './App.css'

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<AdminPanel />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/preview" element={<PreviewPage />} />
      </Routes>
    </div>
  )
}

export default App
