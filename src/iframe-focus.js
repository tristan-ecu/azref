// An interactive iframe background can take keyboard focus without being clicked: the
// Google homepage puts the cursor in its search box when it loads or comes on screen,
// even when reveal is only preloading it for a nearby slide. Keys then go to the page and
// the arrow keys stop changing slides. Focus is taken back unless it went to the current
// slide's page while things were quiet, which is when the presenter clicked into it: not
// while the page was loading, and not just after a key press or click in the deck (such
// as the one that brought the slide up).
const SETTLE_MS = 2000;

export function keepKeyboardOnDeck(deck) {
	// load doesn't bubble, so listen in the capture phase to hear it from every iframe
	const loadedAt = new WeakMap();
	document.addEventListener(
		'load',
		(event) => {
			if (event.target instanceof HTMLIFrameElement) loadedAt.set(event.target, performance.now());
		},
		true
	);

	// Input in the deck itself; clicks inside an iframe never reach this document
	let lastInput = -Infinity;
	const markInput = () => (lastInput = performance.now());
	document.addEventListener('keydown', markInput, true);
	document.addEventListener('pointerdown', markInput, true);

	const since = (time) => performance.now() - time;

	window.addEventListener('blur', () => {
		// activeElement only points at the iframe once the blur has finished
		setTimeout(() => {
			const frame = document.activeElement;
			if (!(frame instanceof HTMLIFrameElement)) return;
			// Before reveal is ready there's no current slide (or API to ask), so any iframe
			// counts as not on it
			const onCurrentSlide =
				deck.isReady() && deck.getSlideBackground(deck.getCurrentSlide())?.contains(frame);
			const loaded = loadedAt.get(frame);
			const quiet = loaded !== undefined && since(loaded) > SETTLE_MS && since(lastInput) > SETTLE_MS;
			if (!onCurrentSlide || !quiet) takeFocusBack();
		});
	});
}

// Blurring the iframe can leave focus nowhere in some browsers, so focus the deck itself;
// reveal hears keys anywhere in the document
function takeFocusBack() {
	const root = document.querySelector('.reveal');
	root.tabIndex = -1; // focusable from script, but not a tab stop
	root.focus({ preventScroll: true });
}
