// Utility to map courses to local images from assets
// This provides fallback images for courses

const courseImages = [
  require('../../assets/courses/COURSES-THUMBNAIL-1-768x432.jpg'),
  require('../../assets/courses/COURSES-THUMBNAIL-2-768x432.jpg'),
  require('../../assets/courses/COURSES-THUMBNAIL-3-768x432.jpg'),
  require('../../assets/courses/COURSES-THUMBNAIL-4-768x432.jpg'),
  require('../../assets/courses/CERT-IN-FRENCH-EDUCATION-WEB-BANNER-768x384.png'),
  require('../../assets/courses/10263071.jpg'),
  require('../../assets/courses/5080846.jpg'),
  require('../../assets/courses/francais-lettering-pink-background.jpg'),
  require('../../assets/courses/learn-french-language-online-education-concept.jpg'),
  require('../../assets/courses/medium-shot-smiley-woman-teaching.jpg'),
  require('../../assets/1.jpeg'),
  require('../../assets/2.jpeg'),
  require('../../assets/3.jpeg'),
];

/**
 * Get a local image for a course based on its ID or index
 * @param {string} courseId - The course ID
 * @param {number} index - Optional index if courseId is not available
 * @returns {number} - require() path to the image
 */
export function getCourseImage(courseId, index = 0) {
  // Use courseId to generate a consistent index, or use provided index
  let imageIndex = 0;
  if (courseId) {
    // Convert courseId to a number and use modulo to get consistent image
    const hash = courseId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    imageIndex = hash % courseImages.length;
  } else {
    imageIndex = index % courseImages.length;
  }
  return courseImages[imageIndex];
}

/**
 * Get all available course images
 * @returns {Array} - Array of require() paths
 */
export function getAllCourseImages() {
  return courseImages;
}

