document.addEventListener("DOMContentLoaded", () => {
  const colorInputsContainer = document.querySelector(".color-inputs");
  const fixBtn = document.querySelector(".fix-btn");
  const newPaletteDiv = document.querySelector(".new-palette");
  const addColorBtn = document.querySelector(".plus-icon");

  let predefinedColors = []; // This will hold the colors fetched from colors.json
  let recentColors = []; // Array to track recently used colors

  // Function to fetch colors from JSON file
  async function loadColors() {
    try {
      const response = await fetch("colors.json");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      predefinedColors = data;
    } catch (error) {
      console.error("Error fetching colors:", error);
    }
  }

  // Initialize color list
  loadColors();

  // Function to create a new color input element
  function createColorInput() {
    const colorDiv = document.createElement("div");
    colorDiv.className = "color";

    const hexCodeInput = document.createElement("span");
    hexCodeInput.className = "hex-code";
    hexCodeInput.contentEditable = true;

    function validateContent(event) {
      const span = event.target;
      let content = span.textContent || span.innerText;
      content = content.replace(/^#/, "");
      if (content.length > 6) {
        content = content.slice(0, 6);
      }
      span.textContent = "#" + content;
    }

    hexCodeInput.addEventListener("input", validateContent);
    hexCodeInput.textContent = "FFFFFF";

    const colorInput = document.createElement("input");
    colorInput.type = "color";
    colorInput.value = "#FFFFFF";

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "X";

    colorDiv.appendChild(hexCodeInput);
    colorDiv.appendChild(colorInput);
    colorDiv.appendChild(deleteBtn);

    colorInput.addEventListener("input", () => {
      hexCodeInput.textContent = colorInput.value.slice(1).toUpperCase();
    });

    hexCodeInput.addEventListener("input", () => {
      let hexValue = hexCodeInput.textContent
        .toUpperCase()
        .replace(/[^0-9A-F]/g, "");
      if (hexValue.length === 6) {
        colorInput.value = `#${hexValue}`;
      } else if (hexValue.length > 6) {
        hexValue = hexValue.slice(0, 6);
        hexCodeInput.textContent = hexValue;
        colorInput.value = `#${hexValue}`;
      }
    });

    deleteBtn.addEventListener("click", () => {
      colorDiv.remove();
    });

    return colorDiv;
  }

  addColorBtn.addEventListener("click", () => {
    const newColorInput = createColorInput();
    colorInputsContainer.appendChild(newColorInput);
  });

  function getContrast(hex1, hex2) {
    const luminance = (hex) => {
      const rgb = parseInt(hex, 16);
      const r = (rgb >> 16) & 0xff;
      const g = (rgb >> 8) & 0xff;
      const b = rgb & 0xff;
      const a = [r, g, b].map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    };

    const lum1 = luminance(hex1);
    const lum2 = luminance(hex2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  }

  function fixPalette() {
    newPaletteDiv.innerHTML = ""; // Clear previous palette

    const hexCodes = Array.from(
      colorInputsContainer.querySelectorAll('.color input[type="color"]')
    ).map((input) => input.value.slice(1)); // Get current colors

    if (hexCodes.length === 0) {
      alert("Please add at least one color.");
      return;
    }

    const usedColors = new Set(hexCodes);
    const suggestions = [...hexCodes];

    function getRandomColor(colors) {
      return colors[Math.floor(Math.random() * colors.length)];
    }

    function findColorSuggestions() {
      const potentialColors = [];

      predefinedColors.forEach((preHex) => {
        if (!usedColors.has(preHex) && !recentColors.includes(preHex)) {
          let totalContrast = 0;
          hexCodes.forEach((userHex) => {
            totalContrast += getContrast(userHex, preHex);
          });

          potentialColors.push({
            color: preHex,
            contrast: totalContrast / hexCodes.length,
          });
        }
      });

      // Sort colors by contrast score and shuffle them
      potentialColors.sort((a, b) => b.contrast - a.contrast);
      const topColors = potentialColors.map((color) => color.color);

      return topColors;
    }

    // Reset recentColors if the color inputs have changed
    recentColors = [];

    // Add at least 2 new colors with good contrast
    let foundValidExample = false;
    for (let i = 0; i < 2; i++) {
      const newColors = findColorSuggestions();
      if (newColors.length === 0) break;

      // Pick a random color from the available options
      const selectedColor = getRandomColor(newColors);

      if (selectedColor) {
        suggestions.push(selectedColor);
        usedColors.add(selectedColor);
        recentColors.push(selectedColor); // Add to recent colors

        // Limit the size of recentColors array to avoid excessive memory usage
        if (recentColors.length > 20) {
          recentColors.shift(); // Remove the oldest color
        }
      }
    }

    const wrapDiv = document.createElement("div");
    wrapDiv.className = "color-wrap";

    suggestions.forEach((suggestedColor) => {
      const colorDiv = document.createElement("div");
      colorDiv.className = "color";
      colorDiv.style.backgroundColor = `#${suggestedColor}`;

      const hexSpan = document.createElement("span");
      hexSpan.textContent = `#${suggestedColor}`;
      hexSpan.className = "hex-display";

      colorDiv.appendChild(hexSpan);

      wrapDiv.appendChild(colorDiv);
    });

    newPaletteDiv.appendChild(wrapDiv);

    const examplesDiv = document.createElement("div");
    examplesDiv.className = "examples";

    function generateExample(bgColor, textColor) {
      const example = document.createElement("div");
      example.className = "example";
      example.style.backgroundColor = `#${bgColor}`;
      example.style.color = `#${textColor}`;
      example.style.border = `1px solid #${textColor}`;
      example.textContent = `Example: #${bgColor} on #${textColor}`;

      const score = getContrast(bgColor, textColor).toFixed(2);
      const scoreDiv = document.createElement("div");
      scoreDiv.className = "contrast-score";
      scoreDiv.textContent = `Contrast Score: ${score}`;

      example.appendChild(scoreDiv);
      return example;
    }

    const exampleElements = [];
    let exampleAdded = false;

    hexCodes.forEach((userColor) => {
      suggestions.forEach((newColor) => {
        if (userColor !== newColor) {
          const exampleDiv = generateExample(newColor, userColor);
          const contrastScore = getContrast(newColor, userColor).toFixed(2);

          if (!exampleAdded && contrastScore >= 5) {
            exampleDiv.style.border = "2px solid red"; // Highlight example with high contrast
            exampleAdded = true;
          }

          exampleElements.push({
            element: exampleDiv,
            score: contrastScore,
          });
        }
      });
    });

    exampleElements.sort((a, b) => b.score - a.score);

    exampleElements.forEach((example) => {
      examplesDiv.appendChild(example.element);
    });

    newPaletteDiv.appendChild(examplesDiv);
  }

  fixBtn.addEventListener("click", fixPalette);
});
