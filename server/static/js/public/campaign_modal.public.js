document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("campaignModal");
  const modalImg = document.getElementById("modalImage");
  const closeBtn = document.querySelector(".campaign-modal-close");
  const campaignImages = document.querySelectorAll(".campaign-col-imagen");

  if (!modal) return; 

  campaignImages.forEach(col => {
    col.addEventListener("click", function () {
      const svgImage = this.querySelector("svg image");
      if (svgImage) {
        const imageUrl = svgImage.getAttribute("href") || svgImage.getAttribute("xlink:href");
        modalImg.src = imageUrl;
        modal.classList.add("active");
        document.body.style.overflow = "hidden"; 
      }
    });
  });

  function closeModal() {
    modal.classList.remove("active");
    document.body.style.overflow = ""; 
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      closeModal();
    }
  });
});