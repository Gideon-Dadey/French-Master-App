

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

const defaultCourseImages = frenchCourseImages;

const courseTitleToImageMap = {
  'FRENCH COURSE A1-A2': 0,
  'FRENCH COURSE B1-B2': 2,
  'French Pronunciation and Phonetics Mastery': 3,
};

export function getCourseImage(courseId, index = 0, category = null, courseTitle = null) {

  let imageArray = defaultCourseImages;
  if (category === 'english') {
    imageArray = englishCourseImages;
  } else if (category === 'french') {
    imageArray = frenchCourseImages;
  }

  if (courseTitle && courseTitleToImageMap[courseTitle] !== undefined) {
    const mappedIndex = courseTitleToImageMap[courseTitle];
    return imageArray[mappedIndex];
  }

  let imageIndex = 0;
  if (courseId) {

    const hash = courseId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    imageIndex = hash % imageArray.length;
  } else {
    imageIndex = index % imageArray.length;
  }
  return imageArray[imageIndex];
}

export function getAllCourseImages(category = null) {
  if (category === 'english') {
    return englishCourseImages;
  } else if (category === 'french') {
    return frenchCourseImages;
  }
  return defaultCourseImages;
}

