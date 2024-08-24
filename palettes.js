document.addEventListener("DOMContentLoaded", () => {
  const colorInputsContainer = document.querySelector(".color-inputs");
  const fixBtn = document.querySelector(".fix-btn");
  const newPaletteDiv = document.querySelector(".new-palette");
  const addColorBtn = document.querySelector(".plus-icon");

  // Funzione per creare un nuovo input di colore
  function createColorInput(selectedColor) {
    const colorDiv = document.createElement("div");
    colorDiv.className = "color";

    const hexCodeInput = document.createElement("span");
    hexCodeInput.className = "hex-code";
    hexCodeInput.contentEditable = true;
    hexCodeInput.textContent = selectedColor.slice(1).toUpperCase();

    const colorInput = document.createElement("input");
    colorInput.type = "color";
    colorInput.value = selectedColor;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "X";

    colorDiv.appendChild(hexCodeInput);
    colorDiv.appendChild(colorInput);
    colorDiv.appendChild(deleteBtn);

    // Aggiorna l'interazione tra il selettore di colori e il codice esadecimale
    colorInput.addEventListener("input", () => {
      hexCodeInput.textContent = colorInput.value.slice(1).toUpperCase();
    });

    hexCodeInput.addEventListener("input", () => {
      let hexValue = hexCodeInput.textContent
        .toUpperCase()
        .replace(/[^0-9A-F]/g, "");

      if (hexCodeInput.textContent.includes("#")) {
        hexCodeInput.textContent = hexValue;
      }

      if (hexValue.length === 6) {
        colorInput.value = `#${hexValue}`;
      } else if (hexValue.length > 6) {
        hexValue = hexValue.slice(0, 6);
        hexCodeInput.textContent = hexValue;
        colorInput.value = `#${hexValue}`;
      }
    });

    // Funzionalità del pulsante di eliminazione
    deleteBtn.addEventListener("click", () => {
      colorDiv.remove();
    });

    return colorDiv;
  }

  // Aggiungi l'evento di clic ai quadrati dei colori
  document.querySelectorAll(".color-square").forEach((square) => {
    square.addEventListener("click", () => {
      const selectedColor = square.getAttribute("data-color");
      const newColorInput = createColorInput(selectedColor);
      colorInputsContainer.appendChild(newColorInput);
      console.log(`Colore selezionato: ${selectedColor}`);
    });
  });

  // Aggiungi eventi per il pulsante di chiusura e il link del menu
  const closeBtn = document.querySelector(".close-btn");
  closeBtn.addEventListener("click", function () {
    document.querySelector(".palettes-menu").style.display = "none";
    closeBtn.style.display = "none";
  });

  const menuLink = document.querySelector(".menu-link");
  menuLink.addEventListener("click", function () {
    document.querySelector(".palettes-menu").style.display = "block";
    closeBtn.style.display = "block";
  });
});
