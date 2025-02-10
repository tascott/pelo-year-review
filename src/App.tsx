import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import './App.css'
import AuthComponent from './components/AuthComponent'
import YearInReview from './components/YearInReview/YearInReview'

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="app-nav">
          <Link to="/">Home</Link>
          <Link to="/year-in-review">Year in Review</Link>
        </nav>
        
        <Routes>
          <Route path="/" element={<AuthComponent />} />
          <Route path="/year-in-review" element={<YearInReview />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
