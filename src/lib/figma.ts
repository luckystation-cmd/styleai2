export function exportToFigmaTokens(tokens: any): string {
  // Converts our parsed token structure into the Tokens Studio for Figma format
  const figmaTokens: any = {
    global: {}
  };

  if (!tokens) return JSON.stringify(figmaTokens, null, 2);

  // Colors
  if (tokens.colors) {
    figmaTokens.global.colors = {};
    Object.entries(tokens.colors).forEach(([key, value]) => {
      figmaTokens.global.colors[key] = {
        value: typeof value === 'string' ? value : (value as any).value || value,
        type: 'color'
      };
    });
  }

  // Typography
  if (tokens.typography) {
    figmaTokens.global.typography = {};
    if (tokens.typography.fontFamily) {
      figmaTokens.global.typography.fontFamilies = {};
      Object.entries(tokens.typography.fontFamily).forEach(([key, value]) => {
        figmaTokens.global.typography.fontFamilies[key] = {
          value: typeof value === 'string' ? value : (value as any).value || value,
          type: 'fontFamilies'
        };
      });
    }
    if (tokens.typography.fontSize) {
      figmaTokens.global.typography.fontSizes = {};
      Object.entries(tokens.typography.fontSize).forEach(([key, value]) => {
        figmaTokens.global.typography.fontSizes[key] = {
          value: typeof value === 'string' ? value : (value as any).value || value,
          type: 'fontSizes'
        };
      });
    }
    if (tokens.typography.fontWeight) {
      figmaTokens.global.typography.fontWeights = {};
      Object.entries(tokens.typography.fontWeight).forEach(([key, value]) => {
        figmaTokens.global.typography.fontWeights[key] = {
          value: typeof value === 'string' ? value : (value as any).value || value,
          type: 'fontWeights'
        };
      });
    }
  }

  // Spacing
  if (tokens.spacing) {
    figmaTokens.global.spacing = {};
    Object.entries(tokens.spacing).forEach(([key, value]) => {
      figmaTokens.global.spacing[key] = {
        value: typeof value === 'string' ? value : (value as any).value || value,
        type: 'spacing'
      };
    });
  }

  // Border Radius (Radii)
  if (tokens.borderRadius || tokens.radii) {
    figmaTokens.global.borderRadius = {};
    const radii = tokens.borderRadius || tokens.radii;
    Object.entries(radii).forEach(([key, value]) => {
      figmaTokens.global.borderRadius[key] = {
        value: typeof value === 'string' ? value : (value as any).value || value,
        type: 'borderRadius'
      };
    });
  }

  // Box Shadow
  if (tokens.boxShadow || tokens.shadows) {
    figmaTokens.global.boxShadow = {};
    const shadows = tokens.boxShadow || tokens.shadows;
    Object.entries(shadows).forEach(([key, value]) => {
      figmaTokens.global.boxShadow[key] = {
        value: typeof value === 'string' ? value : (value as any).value || value,
        type: 'boxShadow'
      };
    });
  }

  return JSON.stringify(figmaTokens, null, 2);
}
