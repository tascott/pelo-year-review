import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import YearInReview from './components/YearInReview/YearInReview.jsx';
import Home from './components/Home';

function App() {
	return (
		<Router>
			<div className="app">
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/year-in-review" element={<YearInReview />} />
				</Routes>
			</div>
		</Router>
	);
}

export default App;
