import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, searchForWorkspaceRoot } from 'vite';
import wasm from 'vite-plugin-wasm';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), wasm()],
	server: {
		fs: {
			allow: [searchForWorkspaceRoot(process.cwd()), '/crypto/pkg/crypto_wasm.js']
		}
	}
});
