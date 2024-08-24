document.addEventListener("DOMContentLoaded", function () {
  // Aggiungi un listener di click al body o a un container che contiene i tuoi elementi dinamici
  document.body.addEventListener("click", function (event) {
    // Verifica se il target del click ha la classe 'hex-display'
    if (event.target.classList.contains("hex-display")) {
      const hexValue = event.target.textContent;
      navigator.clipboard
        .writeText(hexValue)
        .then(() => {
          console.log(`Testo copiato negli appunti: "${hexValue}"`);
        })
        .catch((err) => {
          console.error("Errore durante la copia del testo: ", err);
        });
    }
  });
});
