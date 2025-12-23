// Map course thumbnail paths from database to local require() paths
// This allows courses stored in the database to use local images from assets/courses

const thumbnailMap = {
  'courses/COURSES-THUMBNAIL-1-768x432.jpg': require('../../assets/courses/COURSES-THUMBNAIL-1-768x432.jpg'),
  'courses/COURSES-THUMBNAIL-2-768x432.jpg': require('../../assets/courses/COURSES-THUMBNAIL-2-768x432.jpg'),
  'courses/COURSES-THUMBNAIL-3-768x432.jpg': require('../../assets/courses/COURSES-THUMBNAIL-3-768x432.jpg'),
  'courses/COURSES-THUMBNAIL-4-768x432.jpg': require('../../assets/courses/COURSES-THUMBNAIL-4-768x432.jpg'),
  'courses/CERT-IN-FRENCH-EDUCATION-WEB-BANNER-768x384.png': require('../../assets/courses/CERT-IN-FRENCH-EDUCATION-WEB-BANNER-768x384.png'),
  'courses/10263071.jpg': require('../../assets/courses/10263071.jpg'),
  'courses/5080846.jpg': require('../../assets/courses/5080846.jpg'),
  'courses/francais-lettering-pink-background.jpg': require('../../assets/courses/francais-lettering-pink-background.jpg'),
  'courses/learn-french-language-online-education-concept.jpg': require('../../assets/courses/learn-french-language-online-education-concept.jpg'),
  'courses/medium-shot-smiley-woman-teaching.jpg': require('../../assets/courses/medium-shot-smiley-woman-teaching.jpg'),
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

