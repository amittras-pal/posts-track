import { createTheme } from "@mantine/core";

export const theme = createTheme({
  /** Your theme override here */
  primaryColor: "violet",
  defaultRadius: "md",
  fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  headings: {
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  colors: {
    // Instagram-inspired color palette
    instagram: [
      "#fdf4ff",
      "#fae8ff",
      "#f3e8ff",
      "#e9d5ff",
      "#d946ef",
      "#c026d3",
      "#a21caf",
      "#86198f",
      "#701a75",
      "#581c87",
    ],
  },
});
