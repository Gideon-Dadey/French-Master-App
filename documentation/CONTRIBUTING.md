# Contributing to French Master GH

Thank you for your interest in contributing to French Master GH! This document provides guidelines and instructions for contributing.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Commit Guidelines](#commit-guidelines)
6. [Pull Request Process](#pull-request-process)
7. [Testing](#testing)
8. [Documentation](#documentation)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors. Please:

- Be respectful and considerate
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect different viewpoints and experiences

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Personal or political attacks
- Publishing others' private information

---

## Getting Started

### Prerequisites

- Node.js 18+
- Git
- MongoDB (local or Atlas)
- Expo CLI
- Code editor (VS Code recommended)

### Setup Development Environment

1. **Fork the Repository**
   - Click "Fork" button on GitHub
   - Clone your fork:
   ```bash
   git clone https://github.com/your-username/french-master.git
   cd "FRENCH MASTER"
   ```

2. **Add Upstream Remote**
   ```bash
   git remote add upstream https://github.com/original-owner/french-master.git
   ```

3. **Install Dependencies**
   ```bash
   # Frontend
   npm install
   
   # Backend
   cd backend
   npm install
   ```

4. **Set Up Environment**
   - Copy `.env.example` to `.env` in backend
   - Configure environment variables
   - See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for details

5. **Start Development Servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   npm start
   ```

---

## Development Workflow

### Branch Naming

Use descriptive branch names:

- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `docs/documentation-update` - Documentation
- `refactor/code-improvement` - Code refactoring
- `test/test-addition` - Test additions
- `style/formatting` - Code formatting

**Examples:**
```bash
feature/premium-course-card
fix/login-authentication-issue
docs/api-documentation-update
refactor/theme-context-optimization
```

### Workflow Steps

1. **Update Your Fork**
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Changes**
   - Write clean, readable code
   - Follow coding standards
   - Add tests if applicable
   - Update documentation

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add premium course card component"
   ```

5. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**
   - Go to GitHub
   - Click "New Pull Request"
   - Fill out PR template
   - Request review

---

## Coding Standards

### JavaScript/React Native

**General:**
- Use ES6+ features
- Prefer functional components with hooks
- Use meaningful variable and function names
- Keep functions small and focused
- Add comments for complex logic

**Example:**
```javascript
// Good
const handleCoursePress = (courseId) => {
  navigation.navigate('CourseDetail', { courseId });
};

// Bad
const hcp = (id) => {
  nav.navigate('CD', { id });
};
```

**Component Structure:**
```javascript
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function MyComponent({ prop1, prop2 }) {
  const { colors } = useTheme();
  const [state, setState] = useState(null);

  useEffect(() => {
    // Effect logic
  }, []);

  const handleAction = () => {
    // Handler logic
  };

  return (
    <View style={styles.container}>
      <Text>Content</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

### Styling

- Use StyleSheet.create() for styles
- Support both light and dark themes
- Use theme colors from ThemeContext
- Apply premium shadows and borders
- Use responsive spacing

**Example:**
```javascript
import { useTheme } from '../context/ThemeContext';
import { premiumShadows, premiumBorderRadius } from '../utils/premiumDesign';

const { colors } = useTheme();

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: premiumBorderRadius.lg,
    padding: spacing.md,
    ...premiumShadows.md,
  },
});
```

### File Organization

- One component per file
- Use PascalCase for component files
- Use camelCase for utility files
- Group related files in folders

**Structure:**
```
src/
├── components/
│   ├── CourseCard.js
│   └── PremiumButton.js
├── screens/
│   ├── HomeScreen.js
│   └── ProfileScreen.js
└── utils/
    ├── helpers.js
    └── premiumDesign.js
```

---

## Commit Guidelines

### Commit Message Format

Use conventional commits format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(courses): add premium course card component

Add new CourseCard component with gradient overlays,
ratings display, and premium styling.

Closes #123

fix(auth): resolve login navigation issue

The login screen now correctly navigates to main tabs
after successful authentication.

docs(api): update payment endpoints documentation

style: format code with prettier

refactor(theme): optimize theme context performance
```

### Commit Best Practices

- Write clear, descriptive messages
- Use present tense ("add" not "added")
- Keep first line under 50 characters
- Reference issues in footer
- One logical change per commit

---

## Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] Documentation updated
- [ ] No console errors or warnings
- [ ] Tested on iOS and Android
- [ ] Tested in light and dark mode
- [ ] No breaking changes (or documented)

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested on iOS
- [ ] Tested on Android
- [ ] Tested in light mode
- [ ] Tested in dark mode
- [ ] Unit tests added/updated

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests added/updated
```

### Review Process

1. **Automated Checks**
   - Linting passes
   - Tests pass
   - Build succeeds

2. **Code Review**
   - At least one approval required
   - Address review comments
   - Update PR if needed

3. **Merge**
   - Squash and merge (preferred)
   - Delete branch after merge

---

## Testing

### Frontend Testing

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm test -- --coverage
```

### Manual Testing Checklist

- [ ] Test on iOS device/simulator
- [ ] Test on Android device/emulator
- [ ] Test in light mode
- [ ] Test in dark mode
- [ ] Test with slow network
- [ ] Test offline functionality
- [ ] Test error scenarios
- [ ] Test edge cases

### Test Structure

```javascript
import { render, fireEvent } from '@testing-library/react-native';
import CourseCard from '../components/CourseCard';

describe('CourseCard', () => {
  it('renders correctly', () => {
    const { getByText } = render(<CourseCard course={mockCourse} />);
    expect(getByText('Course Title')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <CourseCard course={mockCourse} onPress={onPress} />
    );
    fireEvent.press(getByTestId('course-card'));
    expect(onPress).toHaveBeenCalled();
  });
});
```

---

## Documentation

### Code Documentation

- Add JSDoc comments for functions:
```javascript
/**
 * Formats currency amount with currency symbol
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: 'GHS')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'GHS') => {
  // Implementation
};
```

### Update Documentation

When adding features:
- Update [DOCUMENTATION.md](./DOCUMENTATION.md)
- Update [API_REFERENCE.md](./API_REFERENCE.md) if API changes
- Update [COMPONENTS_GUIDE.md](./COMPONENTS_GUIDE.md) if new components
- Update README.md if needed

---

## Areas for Contribution

### High Priority

- [ ] Accessibility improvements
- [ ] Test coverage
- [ ] Documentation improvements
- [ ] Bug fixes

### Feature Ideas

- [ ] Offline mode enhancements
- [ ] Social features
- [ ] Advanced analytics
- [ ] AI-powered recommendations
- [ ] Multi-language support expansion

### Good First Issues

Look for issues labeled:
- `good first issue`
- `help wanted`
- `documentation`

---

## Getting Help

### Resources

- [Documentation](./DOCUMENTATION.md)
- [API Reference](./API_REFERENCE.md)
- [Setup Guide](./SETUP_GUIDE.md)

### Communication

- **GitHub Issues**: For bugs and feature requests
- **Discussions**: For questions and ideas
- **Email**: info@frenchmastergh.com

---

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Credited in release notes
- Acknowledged in documentation

---

Thank you for contributing to French Master GH! 🎉

**Last Updated:** December 2025

---

## Version History

See [CHANGELOG.md](./CHANGELOG.md) for detailed version history.

