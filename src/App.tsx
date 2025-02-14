import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import YearInReview from './components/YearInReview/YearInReview';
import { useState, useEffect } from 'react';
import Home from './components/Home';
import AuthComponent from './components/AuthComponent';

interface HandleAuthProps {
	userId: string;
	csvData: string;
}

function App() {
	const [csvData, setCsvData] = useState<string | null>(() => {
		try {
			const saved = localStorage.getItem('pelotonCSVData');
			return saved || null;
		} catch (err) {
			console.warn('Failed to read from localStorage:', err);
			return null;
		}
	});

	const handleAuth = (props: HandleAuthProps) => {
		// console.log('Auth completed with CSV data:', {
		// 	userId,
		// 	csvLength: csvData.length,
		// 	preview: csvData.slice(0, 100),
		// });
		try {
			localStorage.setItem('pelotonCSVData', props.csvData);
		} catch (err) {
			console.warn('Failed to save to localStorage:', err);
			// Continue without caching
		}
		setCsvData(props.csvData);
	};

	useEffect(() => {
		// console.log('csvData state updated:', {
		// 	isPresent: csvData !== null,
		// 	length: csvData?.length,
		// 	preview: csvData?.slice(0, 100),
		// });
	}, [csvData]);

	return (
		<Router>
			<div className="app">
				{/* <nav className="app-nav">
					<Link to="/">Home</Link>
					<Link to="/year-in-review">Year in Review</Link>
				</nav> */}

				<Routes>
					<Route path="/" element={<Home onAuth={handleAuth} />} />
					<Route path="/authlogin" element={<AuthComponent onAuth={handleAuth} />} />
					<Route path="/year-in-review" element={<YearInReview csvData={csvData} />} />
				</Routes>
			</div>
		</Router>
	);
}

export default App;
