interface AuthComponentProps {
	onAuth: (props: { userId: string; csvData: string }) => void;
}

declare const AuthComponent: React.FC<AuthComponentProps>;
export default AuthComponent;
