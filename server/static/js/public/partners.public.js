document.addEventListener('DOMContentLoaded', () => {
  const track = document.getElementById('partners-track');
  const prevBtn = document.getElementById('partners-prev');
  const nextBtn = document.getElementById('partners-next');
  const paginationContainer = document.getElementById('partners-pagination');

  if (!track || !prevBtn || !nextBtn) return;

  const cards = Array.from(track.children);
  let currentIndex = 0;

  const getVisibleCardsCount = () => {
    const width = window.innerWidth;
    if (width <= 600) return 1;
    if (width <= 992) return 2;
    return 3;
  };

  const getMaxIndex = () => {
    return Math.max(0, cards.length - getVisibleCardsCount());
  };

  const createPaginationDots = () => {
    paginationContainer.innerHTML = '';
    const totalDots = getMaxIndex() + 1;

    for (let i = 0; i < totalDots; i++) {
      const dot = document.createElement('div');
      dot.classList.add('dot');
      if (i === currentIndex) dot.classList.add('active');
      dot.addEventListener('click', () => goToSlide(i));
      paginationContainer.appendChild(dot);
    }
  };

  const updateCarousel = () => {
    const visibleCards = getVisibleCardsCount();
    const cardWidth = cards[0].getBoundingClientRect().width;
    const gap = 25; 
    
    const moveAmount = (cardWidth + gap) * currentIndex;
    track.style.transform = `translateX(-${moveAmount}px)`;

    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= getMaxIndex();

    const dots = Array.from(paginationContainer.children);
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentIndex);
    });
  };

  const goToSlide = (index) => {
    currentIndex = Math.min(Math.max(0, index), getMaxIndex());
    updateCarousel();
  };

  nextBtn.addEventListener('click', () => {
    if (currentIndex < getMaxIndex()) {
      currentIndex++;
      updateCarousel();
    }
  });

  prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
      updateCarousel();
    }
  });

  window.addEventListener('resize', () => {
    if (currentIndex > getMaxIndex()) {
      currentIndex = getMaxIndex();
    }
    createPaginationDots();
    updateCarousel();
  });

  createPaginationDots();
  updateCarousel();
});