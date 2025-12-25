

const thumbnailMap = {

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

export function getCourseThumbnail(thumbnailPath) {
  if (!thumbnailPath) return null;

  if (thumbnailPath.startsWith('http://') || thumbnailPath.startsWith('https://')) {
    return { uri: thumbnailPath };
  }

  const normalizedPath = thumbnailPath.replace(/^\/+/, '');
  if (thumbnailMap[thumbnailPath] || thumbnailMap[normalizedPath]) {
    return thumbnailMap[thumbnailPath] || thumbnailMap[normalizedPath];
  }

  return null;
}

export default getCourseThumbnail;

