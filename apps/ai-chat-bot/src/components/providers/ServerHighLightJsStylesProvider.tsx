import fs from "fs/promises";
import path from "path";
import React from "react";
import { HighLightJsStylesProvider } from "./HighLightJsStylesProvider";

export default async function ServerHighLightJsStylesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const highLightJsStyles = await loadHighLightJsThemeStyles();

  return (
    <HighLightJsStylesProvider styles={highLightJsStyles}>
      {children}
    </HighLightJsStylesProvider>
  );
}


// FIXME: We should look a way to directly import the css and inline it,
// instead of directly read them from the fs.
async function loadHighLightJsThemeStyles() {
  const publicDir = path.join(process.cwd(), "public");
  const darkThemeStylesPromise = fs.readFile(
    path.join(publicDir, "styles", "highlight.js", "github-dark.min.css"),
    "utf-8",
  );

  const lightThemeStylesPromise = fs.readFile(
    path.join(publicDir, "styles", "highlight.js", "github.min.css"),
    "utf-8",
  );

  const [darkThemeStyles, lightThemeStyles] = await Promise.all([
    darkThemeStylesPromise,
    lightThemeStylesPromise,
  ]);

  return {
    darkThemeStyles,
    lightThemeStyles,
  };
}
