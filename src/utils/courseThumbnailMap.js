// Map course thumbnail paths from database to local require() paths
// This allows courses stored in the database to use local images from assets/french and assets/english

const thumbnailMap = {
  
  // Map new French image paths (9 images for 9 French courses)
  'french/1.jpg': require('../../assets/french/1.jpg'),
  'french/2.jpg': require('../../assets/french/2.jpg'),
  'french/3.jpg': require('../../assets/french/3.jpg'),
  'french/4.jpg': require('../../assets/french/4.jpg'),
  'french/5.png': require('../../assets/french/5.png'),
  'french/6.jpg': require('../../assets/french/6.jpg'),
  'french/7.jpg': require('../../assets/french/7.jpg'),
  'french/8.jpg': require('../../assets/french/8.jpg'),
  'french/9.jpg': require('../../assets/french/9.jpg'),
};

/**
 * Get local image source for a course thumbnail
 * @param {string} thumbnailPath - The thumbnail path from the database
 * @returns {number|object|null} - require() path for local image, or null if not found
 */
export function getCourseThumbnail(thumbnailPath) {
  if (!thumbnailPath) return null;
  
  // If it's a URL, return it as-is
  if (thumbnailPath.startsWith('http://') || thumbnailPath.startsWith('https://')) {
    return { uri: thumbnailPath };
  }
  
  // Check if we have a mapped local image
  // Handle both exact match and path variations
  const normalizedPath = thumbnailPath.replace(/^\/+/, ''); // Remove leading slashes
  if (thumbnailMap[thumbnailPath] || thumbnailMap[normalizedPath]) {
    return thumbnailMap[thumbnailPath] || thumbnailMap[normalizedPath];
  }
  
  // Return null if not found (caller should use fallback)
  return null;
}

export default getCourseThumbnail;

