// Import all assets using Vite's glob import
const assetModules = import.meta.glob('../assets/images/**/*', { eager: true, as: 'url' });

// Create a case-insensitive lookup map
const assetMap = new Map<string, string>();
Object.keys(assetModules).forEach(key => {
  // Normalize the key to lowercase for case-insensitive lookup
  const normalizedKey = key.toLowerCase();
  const url = assetModules[key];
  if (typeof url === 'string') {
    assetMap.set(normalizedKey, url);
    // Also store the original key
    assetMap.set(key, url);
  }
});

// Helper function to get proper asset paths for Vite
export function getAssetPath(path: string): string {
  // Remove /src prefix if present and normalize path
  let cleanPath = path.replace(/^\/src\/assets\/images\//, '');
  
  // Build the lookup key
  const lookupKey = `../assets/images/${cleanPath}`;
  const normalizedKey = lookupKey.toLowerCase();
  
  // Try to find the asset in the map (case-insensitive)
  const assetUrl = assetMap.get(lookupKey) || assetMap.get(normalizedKey);
  
  if (assetUrl) {
    return assetUrl;
  }
  
  // Fallback: try alternative path formats
  const alternatives = [
    lookupKey,
    normalizedKey,
    `../assets/images/${cleanPath}`,
    path.replace(/^\/src/, '..'),
  ];
  
  for (const alt of alternatives) {
    const found = assetMap.get(alt) || assetMap.get(alt.toLowerCase());
    if (found) {
      return found;
    }
  }
  
  // If still not found, return the original path (might be external URL)
  return path;
}

