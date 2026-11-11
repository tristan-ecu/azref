// Lets `.drag-box` elements be dragged around their slide, and resized from a grip in
// the bottom-right corner (the text scales with the box). Positions and sizes are in
// slide pixels, so pointer movement is divided by reveal's current scale; boxes are
// kept inside the viewport so they can't be lost off-screen.
const MIN_FONT_PX = 12;

// Each box waits for its slide's page to finish loading, then fades in (.page-loaded in
// slides.css), so it doesn't sit over a blank page; if the page is slow or never loads,
// the box shows anyway after a few seconds on the slide. Call before Reveal.initialize,
// so no page load is missed.
const PAGE_WAIT_MS = 5000;

export function boxesWaitForPages(deck) {
	const loaded = new WeakSet();
	const update = () => {
		if (!deck.isReady()) return;
		document.querySelectorAll('.drag-slide').forEach((slide) => {
			const frame = deck.getSlideBackground(slide)?.querySelector('iframe');
			slide.classList.toggle('page-loaded', Boolean(frame && loaded.has(frame)));
		});
	};

	// load doesn't bubble, so listen in the capture phase. reveal empties a page (removes
	// its src) when the slide is far away, which loads about:blank: that's not loaded
	document.addEventListener(
		'load',
		(event) => {
			const frame = event.target;
			if (!(frame instanceof HTMLIFrameElement)) return;
			if (frame.getAttribute('src')) loaded.add(frame);
			else loaded.delete(frame);
			update();
		},
		true
	);

	const waitOn = (slide) => {
		if (slide?.classList.contains('drag-slide')) {
			setTimeout(() => slide.classList.add('page-waited'), PAGE_WAIT_MS);
		}
	};
	deck.on('ready', ({ currentSlide }) => {
		update();
		waitOn(currentSlide);
	});
	deck.on('slidechanged', ({ currentSlide }) => waitOn(currentSlide));
}

export function initDragBoxes(deck) {
	// Reveal lays the slide out again on a window resize before this listener runs
	measureWindow(deck);
	window.addEventListener('resize', () => measureWindow(deck));

	document.querySelectorAll('.drag-box').forEach((box) => {
		const handle = box.appendChild(document.createElement('span'));
		handle.className = 'drag-box-resize';

		let start;
		const remember = () => {
			// Boxes start anchored to the window's bottom-left corner (slides.css); once moved
			// or resized, a box is held by its top-left corner and stays where it's put
			box.style.left = `${box.offsetLeft}px`;
			box.style.top = `${box.offsetTop}px`;
			box.style.bottom = 'auto';
			start = {
				left: box.offsetLeft,
				top: box.offsetTop,
				width: box.offsetWidth,
				height: box.offsetHeight,
				fontSize: parseFloat(getComputedStyle(box).fontSize),
			};
		};

		trackPointer(box, remember, (dx, dy) => {
			const b = bounds(deck, box.offsetParent);
			box.style.left = `${clamp(start.left + dx / b.scale, b.left, b.right - box.offsetWidth)}px`;
			box.style.top = `${clamp(start.top + dy / b.scale, b.top, b.bottom - box.offsetHeight)}px`;
		});

		// Scales the text, and the box with it (it's sized to its text, with padding in em), so
		// nothing rewraps. The corner follows the pointer along the box's diagonal, as in a
		// slide editor, and stops where the box would leave the viewport
		trackPointer(handle, remember, (dx, dy) => {
			const b = bounds(deck, box.offsetParent);
			const { width: w, height: h } = start;
			const grow = 1 + (dx * w + dy * h) / b.scale / (w * w + h * h);
			const most = Math.min((b.right - start.left) / w, (b.bottom - start.top) / h);
			const least = MIN_FONT_PX / start.fontSize;
			box.style.fontSize = `${start.fontSize * clamp(grow, least, most)}px`;
		});
	});
}

// Calls onStart on a left-button press, then onMove with the distance moved (in screen
// pixels) until release.
function trackPointer(element, onStart, onMove) {
	let origin = null;
	const stop = () => {
		origin = null;
		document.documentElement.classList.remove('drag-box-active');
	};
	element.addEventListener('pointerdown', (event) => {
		if (event.button !== 0) return;
		// Stop a press on the resize grip from also dragging the box
		event.stopPropagation();
		// Take keyboard focus back from an iframe so the arrow keys change slides again
		if (document.activeElement instanceof HTMLIFrameElement) document.activeElement.blur();
		origin = { x: event.clientX, y: event.clientY };
		// Pointer capture only takes hold at the next event this document receives; if the
		// first move lands on the iframe the iframe gets the rest of the drag, so iframes
		// ignore the pointer until release (see .drag-box-active in slides.css)
		document.documentElement.classList.add('drag-box-active');
		element.setPointerCapture(event.pointerId);
		onStart();
	});
	element.addEventListener('pointermove', (event) => {
		if (!origin) return;
		// The release happened somewhere we didn't hear about
		if (!(event.buttons & 1)) return stop();
		onMove(event.clientX - origin.x, event.clientY - origin.y);
	});
	element.addEventListener('pointerup', stop);
	element.addEventListener('pointercancel', stop);
}

// How far the browser window reaches past the slide's left and bottom edges, in slide
// pixels, for the boxes' starting position in slides.css. Zero in a 16:9 window
function measureWindow(deck) {
	const slides = deck.getSlidesElement();
	const b = bounds(deck, slides);
	slides.style.setProperty('--window-past-left', `${-b.left}px`);
	slides.style.setProperty('--window-past-bottom', `${b.bottom - slides.offsetHeight}px`);
}

// The viewport's edges in the coordinates of a slide, plus reveal's scale
function bounds(deck, slideElement) {
	const scale = deck.getScale();
	const slide = slideElement.getBoundingClientRect();
	const view = deck.getViewportElement().getBoundingClientRect();
	return {
		scale,
		left: (view.left - slide.left) / scale,
		top: (view.top - slide.top) / scale,
		right: (view.right - slide.left) / scale,
		bottom: (view.bottom - slide.top) / scale,
	};
}

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
