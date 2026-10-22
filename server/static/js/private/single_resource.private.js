const npt_resource = document.getElementById('resource');

npt_resource.addEventListener('change', () => {
  const file = npt_resource.files[0];

  if (!file) return;

  const maxMB = 10 * 1024 * 1024; // 10MB
  
  if (!allowedTypes.includes(file.type)) {
    alert('Tipo de archivo inválido.');
    npt_resource.value = "";
    return;
  }

  if (file.size > maxMB) {
    alert('El archivo no puede superar los 10MB.');
    npt_resource.value = "";
    return;
  }
});
