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
import { boxesWaitForPages, initDragBoxes } from './drag.js';
import { keepKeyboardOnDeck } from './iframe-focus.js';

// Before initialize, so they hear every background iframe load
keepKeyboardOnDeck(Reveal);
boxesWaitForPages(Reveal);

// Config reference: https://revealjs.com/config/
Reveal.initialize({
	hash: true,
	// The slides.com templates' canvas (16:9, no outer margin); slides get Basel's 80px
	// side margins in slides.css instead
	width: 1280,
	height: 720,
	margin: 0,
	// Slides that step through their fragments on their own (data-autoslide) keep going
	// after a key press, instead of pausing until A is pressed
	autoSlideStoppable: false,
	// Load iframe backgrounds while their slide is a few slides away (viewDistance), not
	// only once it's shown, so the page is usually ready on arrival
	preloadIframes: true,
	plugins: [Markdown, Highlight, Notes],
}).then(() => {
	initCharts(Reveal);
	initDragBoxes(Reveal);
});
