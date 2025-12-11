declare module 'tailwindcss/lib/util/createPlugin' {
  const createPlugin: any;
  export default createPlugin;
}

declare module 'tailwindcss/lib/util/withAlphaVariable' {
  const withAlphaVariable: any;
  export default withAlphaVariable;
}

declare module 'tailwindcss/lib/util/flattenColorPalette' {
  const flattenColorPalette: any;
  export default flattenColorPalette;
}

declare module 'tailwindcss/lib/util/toColorValue' {
  const toColorValue: any;
  export default toColorValue;
}

// Разрешите импорт CSS файлов
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}