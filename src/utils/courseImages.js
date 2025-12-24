// Utility to map courses to local images from assets
// This provides fallback images for courses organized by category

// English course images
const englishCourseImages = [
  require('../../assets/english/6693140.jpg'),
  require('../../assets/english/6741505.jpg'),
  require('../../assets/english/6743349.jpg'),
  require('../../assets/english/7324873.jpg'),
  require('../../assets/english/7324874.jpg'),
  require('../../assets/english/7324875.jpg'),
  require('../../assets/english/7352668.jpg'),
  require('../../assets/english/7469136.jpg'),
  require('../../assets/english/8346224.jpg'),
  require('../../assets/english/little-boy-listening-his-teacher-through-headphones.jpg'),
  require('../../assets/english/side-view-little-girl-online-school-with-tablet-headphones.jpg'),
  require('../../assets/english/teenage-girl-using-laptop-headphones-online-school.jpg'),
];

// French course images (9 images for 9 French courses)
const frenchCourseImages = [
  require('../../assets/french/1.jpg'),
  require('../../assets/french/2.jpg'),
  require('../../assets/french/3.jpg'),
  require('../../assets/french/4.jpg'),
  require('../../assets/french/5.png'),
  require('../../assets/french/6.jpg'),
  require('../../assets/french/7.jpg'),
  require('../../assets/french/8.jpg'),
  require('../../assets/french/9.jpg'),
];

// Default/fallback images (uses French images as default)
const defaultCourseImages = frenchCourseImages;

// Map specific course titles to specific images to avoid duplicates
const courseTitleToImageMap = {
  'FRENCH COURSE A1-A2': 0, // Use 1.jpg (index 0)
  'FRENCH COURSE B1-B2': 2, // Use 3.jpg (index 2)
  'French Pronunciation and Phonetics Mastery': 3, // Use 4.jpg (index 3)
};

/**
 * Get a local image for a course based on its ID, index, category, and title
 * @param {string} courseId - The course ID
 * @param {number} index - Optional index if courseId is not available
 * @param {string} category - Optional category ('english', 'french', etc.)
 * @param {string} courseTitle - Optional course title for specific mapping
 * @returns {number} - require() path to the image
 */
export function getCourseImage(courseId, index = 0, category = null, courseTitle = null) {
  // Select image array based on category
  let imageArray = defaultCourseImages;
  if (category === 'english') {
    imageArray = englishCourseImages;
  } else if (category === 'french') {
    imageArray = frenchCourseImages;
  }

  // Check if we have a specific mapping for this course title
  if (courseTitle && courseTitleToImageMap[courseTitle] !== undefined) {
    const mappedIndex = courseTitleToImageMap[courseTitle];
    return imageArray[mappedIndex];
  }

  // Use courseId to generate a consistent index, or use provided index
  let imageIndex = 0;
  if (courseId) {
    // Convert courseId to a number and use modulo to get consistent image
    const hash = courseId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    imageIndex = hash % imageArray.length;
  } else {
    imageIndex = index % imageArray.length;
  }
  return imageArray[imageIndex];
}

/**
 * Get all available course images
 * @param {string} category - Optional category filter
 * @returns {Array} - Array of require() paths
 */
export function getAllCourseImages(category = null) {
  if (category === 'english') {
    return englishCourseImages;
  } else if (category === 'french') {
    return frenchCourseImages;
  }
  return defaultCourseImages;
}

