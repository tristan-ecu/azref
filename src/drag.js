// Lets `.drag-box` elements be dragged around their slide, and resized from a grip in
// the bottom-right corner (the text scales with the box). Positions and sizes are in
// slide pixels, so pointer movement is divided by reveal's current scale; boxes are
// kept inside the viewport so they can't be lost off-screen.
const MIN_FONT_PX = 12;

export function initDragBoxes(deck) {
	document.querySelectorAll('.drag-box').forEach((box) => {
		const handle = box.appendChild(document.createElement('span'));
		handle.className = 'drag-box-resize';

		let start;
		const remember = () =>
			(start = {
				left: box.offsetLeft,
				top: box.offsetTop,
				width: box.offsetWidth,
				height: box.offsetHeight,
				fontSize: parseFloat(getComputedStyle(box).fontSize),
			});

		trackPointer(box, remember, (dx, dy) => {
			const b = bounds(deck, box);
			box.style.left = `${clamp(start.left + dx / b.scale, b.left, b.right - box.offsetWidth)}px`;
			box.style.top = `${clamp(start.top + dy / b.scale, b.top, b.bottom - box.offsetHeight)}px`;
		});

		// Scales the text, and the box with it (it's sized to its text, with padding in em), so
		// nothing rewraps. The corner follows the pointer along the box's diagonal, as in a
		// slide editor, and stops where the box would leave the viewport
		trackPointer(handle, remember, (dx, dy) => {
			const b = bounds(deck, box);
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

// The viewport's edges in the coordinates of the box's slide, plus reveal's scale
function bounds(deck, box) {
	const scale = deck.getScale();
	const slide = box.offsetParent.getBoundingClientRect();
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
