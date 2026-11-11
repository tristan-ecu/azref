// The web pages behind the slides (data-background-iframe) zoom with the slides. reveal
// enlarges the slides to fit the window but leaves background pages at the window's real
// size, so a page looked different on every screen (small on a big screen, its mobile
// layout in a small window) and a box covered a different part of it. Here each page is
// laid out at PAGE_WIDTH and enlarged by the same factor as the slides, so every screen
// shows it as a window that wide would (slides.css applies --page-zoom).
//
// To roll back, remove the call in src/main.js; the CSS then has no effect.
const PAGE_WIDTH = 1280; // the slide's width; raise it to show the pages smaller

export function zoomPagesWithSlides(deck) {
	const update = () => {
		const zoom = (deck.getScale() * deck.getConfig().width) / PAGE_WIDTH;
		deck.getRevealElement().style.setProperty('--page-zoom', String(zoom));
	};
	// reveal's resize event fires whenever its scale changes, including the first layout
	deck.on('ready', update);
	deck.on('resize', update);
}
