const $npts = document.querySelectorAll('input[type="file"]');

$npts.forEach($npt => {
  $npt.addEventListener('change', () => {
    const file = $npt.files[0];
  
    if (!file) return;
  
    const MB = 1024 * 1024; // 1MB

    const allowedTypes = Object.keys(allowedTypesByInput[$npt.name]);

    if (!allowedTypes) return;

    if (!allowedTypes.includes(file.type)) {
      alert(`El archivo ${file.name} es de tipo inválido.`);
      $npt.value = "";
      return;
    }
  
    if (file.size > (10 * MB)) { // 10MB máx.
      alert(`El archivo ${file.name} no puede superar los 10MB.`);
      $npt.value = "";
      return;
    }
  });
});
