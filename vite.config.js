import { defineConfig } from 'vite';

export default defineConfig({
	// Relative asset paths so the built deck works from any folder or subpath
	base: './',
	build: {
		// reveal.js themes embed their fonts and highlight.js is bundled in, so one large chunk is expected
		chunkSizeWarningLimit: 2000,
	},
});
