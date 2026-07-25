function fix_icon_size(element) {
  const img = new Image();

  const apply = () => {
    const h = element.getBoundingClientRect().height;
    element.style.width = `${h}px`;
    element.style.height = `${h}px`;
  };

  img.onload = apply;
  img.src = element.getAttribute('data-src');

  if (img.complete) {
    apply();
  }
}

function process_card_generated_front(container = document) {
  container.querySelectorAll('[data-onload="fix-icon-size"]').forEach(fix_icon_size);
}