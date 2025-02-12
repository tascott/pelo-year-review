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
new Promise<void>((resolve) => {
	supabase
		.from('songs')
		.select('count')
		.limit(1)
		.single()
		.then(() => {
			console.log('Supabase connection successful');
			resolve();
		})
		// @ts-ignore - Promise chain works despite type error
		.catch((error: unknown) => {
			console.error('Supabase connection failed:', error);
			resolve(); // Still resolve to avoid unhandled promise
		});
});
