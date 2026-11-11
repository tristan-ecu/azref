import Reveal from 'reveal.js';
import Markdown from 'reveal.js/plugin/markdown';
import Highlight from 'reveal.js/plugin/highlight';
import Notes from 'reveal.js/plugin/notes';

import 'reveal.js/reset.css';
import 'reveal.js/reveal.css';
// Other themes: https://revealjs.com/themes/
import 'reveal.js/theme/black.css';
import 'reveal.js/plugin/highlight/monokai.css';
import './slides.css';

import { initCharts } from './charts.js';
import { initDragBoxes } from './drag.js';
import { keepKeyboardOnDeck } from './iframe-focus.js';

// Before initialize, so it hears every background iframe load
keepKeyboardOnDeck(Reveal);

// Config reference: https://revealjs.com/config/
Reveal.initialize({
	hash: true,
	// The slides.com templates' canvas (16:9, no outer margin); slides get Basel's 80px
	// side margins in slides.css instead
	width: 1280,
	height: 720,
	margin: 0,
	plugins: [Markdown, Highlight, Notes],
}).then(() => {
	initCharts(Reveal);
	initDragBoxes(Reveal);
});
