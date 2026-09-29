// On the Shirt: sticky card stack.
// - Sets --pin-offset (how much of the viewport the pinned title covers) so
//   cards stick just below it.
// - As each card slides over the ones before it, those covered cards shrink a
//   little per card on top of them, giving the stack depth.
// - Hides each card's down arrow once the next card touches its bottom edge.
const shirt = document.querySelector(".shirt");
const steps = shirt?.querySelector(".steps");

if (shirt && steps) {
  const intro = shirt.querySelector(".shirt__intro");
  const items = [...steps.querySelectorAll(".step")];
  const cards = items.map((step) => step.querySelector(".step__card"));
  const stacked = window.matchMedia("(max-width: 960px)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const SCALE_STEP = 0.05; // shrink per card stacked on top

  const measure = () => {
    // Desktop: title sits beside the cards, so only its sticky top offset counts.
    // Stacked: the title bar covers the top of the viewport.
    const pinOffset = stacked.matches
      ? intro.offsetHeight
      : parseFloat(getComputedStyle(intro).top) || 0;
    shirt.style.setProperty("--pin-offset", `${pinOffset}px`);
  };

  const update = () => {
    // How far each card has travelled into its stuck position (0 → 1),
    // measured over one card height of scrolling
    const arrived = items.map((step) => {
      const stickTop = parseFloat(getComputedStyle(step).top) || 0;
      const distance = step.getBoundingClientRect().top - stickTop;
      return Math.min(1, Math.max(0, 1 - distance / step.offsetHeight));
    });

    // Hide a card's down arrow as soon as the next card touches its bottom edge
    items.forEach((step, i) => {
      const next = items[i + 1];
      const touching =
        next && next.getBoundingClientRect().top <= cards[i].getBoundingClientRect().bottom;
      step.classList.toggle("is-covered", Boolean(touching));
    });

    if (reducedMotion.matches) {
      cards.forEach((card) => (card.style.transform = ""));
      return;
    }

    cards.forEach((card, i) => {
      const coveredBy = arrived.slice(i + 1).reduce((sum, a) => sum + a, 0);
      card.style.transform = `scale(${1 - coveredBy * SCALE_STEP})`;
    });
  };

  let frame = 0;
  const onScroll = () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      update();
    });
  };

  measure();
  update();

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => {
    measure();
    update();
  });
  new ResizeObserver(measure).observe(intro);
}
