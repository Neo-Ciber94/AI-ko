import plugin from "tailwindcss/plugin";

export const rainbowBorder = plugin(({ addComponents }) => {
  addComponents({
    ".rainbow-border-bottom": {
      "border-image-source":
        "linear-gradient(to bottom, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #8b00ff)",
      "border-image-slice": "1",
    },
    ".rainbow-border-right": {
      "border-image-source":
        "linear-gradient(to right, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #8b00ff)",
      "border-image-slice": "1",
    },
  });
});

export const customShadows = plugin(({ addUtilities }) => {
  addUtilities({
    ".shadow-inset": {
      "box-shadow": "inset 0px 0px 5px var(--tw-shadow-color)",
    },
  });
});
