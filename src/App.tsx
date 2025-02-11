import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import AuthComponent from './components/AuthComponent';
import YearInReview from './components/YearInReview/YearInReview';
import { useState, useEffect } from 'react';

function App() {
	const [csvData, setCsvData] = useState<string | null>(() => {
		const saved = localStorage.getItem('pelotonCSVData');
		return saved || null;
	});

	const handleAuth = (userId: string, csvData: string) => {
		// console.log('Auth completed with CSV data:', {
		// 	userId,
		// 	csvLength: csvData.length,
		// 	preview: csvData.slice(0, 100),
		// });
		localStorage.setItem('pelotonCSVData', csvData);
		setCsvData(csvData);
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
					<Route path="/" element={<AuthComponent onAuth={handleAuth} />} />
					<Route path="/year-in-review" element={<YearInReview csvData={csvData} />} />
				</Routes>
			</div>
		</Router>
	);
}

export default App;
