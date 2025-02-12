interface HomeProps {
	onAuth: (props: { userId: string; csvData: string }) => void;
}

declare const Home: React.FC<HomeProps>;
export default Home;
