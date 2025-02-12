import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		persistSession: false, // Since we're just reading data
	},
	global: {
		headers: {
			'Content-Type': 'application/json',
		},
	},
});

// Test the connection
supabase
	.from('songs')
	.select('count')
	.limit(1)
	.single()
	.then(() => console.log('Supabase connection successful'))
	.catch((err) => console.error('Supabase connection failed:', err));

// Add proper error handling
try {
	await supabase.auth.signOut();
} catch (err: unknown) {
	console.error('Error signing out:', err);
}
