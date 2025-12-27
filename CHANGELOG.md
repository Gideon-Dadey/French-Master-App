# Changelog

All notable changes to French Master are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.0] - 2025-12-26 🎨

### 🎨 Major UI/UX Redesign & Free Courses Update

#### Added

- **Time-Based Greetings in LearnScreen**
  - Dynamic French greetings based on time of day
  - "Bonjour" (Morning), "Bon après-midi" (Afternoon), "Bonsoir" (Evening)
  - Smooth transitions between greeting states

- **Unified Primary Color Theme**
  - All screens now use consistent primary color throughout
  - Clean, professional, and cohesive design language
  - Removed secondary/accent color inconsistencies

- **Redesigned CourseDetailScreen**
  - Hero section with parallax image and gradient overlay
  - Quick stats card with key course metrics
  - Redesigned enrollment card with prominent pricing
  - Tab navigation for Overview, Curriculum, and Reviews
  - Enhanced curriculum display with lesson cards
  - Lock/unlock states for lessons
  - Free preview badges
  - Sticky enrollment card on scroll
  - Professional typography and spacing

- **Redesigned BlogDetailScreen**
  - Complete redesign with modern, clean layout
  - Hero section with parallax image and gradient
  - Author card with avatar and follow button
  - Action buttons (Like, Save, Download) with visual feedback
  - Enhanced content formatting with typography controls
  - French phrase highlighting with text-to-speech
  - Reading progress bar and completion tracking
  - Font size adjustment panel
  - Tags section with primary color theme
  - Share buttons with social icons
  - Offline download support
  - Completion celebration with XP rewards

#### Changed

- **All Courses Now Free**
  - Updated Course model to set `isFree: true` by default
  - Modified seed script to create all courses with `price: 0`
  - All courses accessible without payment
  - Removed premium badges from course listings

- **LearnScreen Design**
  - Unified color scheme to primary color
  - Removed premium badges
  - Clean, professional appearance
  - Consistent with overall app theme

- **CourseDetailScreen Navigation**
  - Removed custom back button
  - Cleaner header design
  - Improved scroll animations

#### Fixed

- Price display consistency across all screens
- Color theme inconsistencies
- Navigation header duplication

---

## [1.9.0] - 2025-12-25 🎄

### 🔒 Security & Community Update

#### Added - Security

- **Study Group Chat Security**
  - Non-authenticated users see "Login Required" screen
  - Non-members see "Members Only" screen with preview
  - Beautiful gradient overlays with lock icons
  - Sign in / Create account buttons

- **Robust Membership Detection**
  - Enhanced `isMember()` function handles all ID formats
  - ObjectId objects, strings, and nested objects supported
  - Creator vs member distinction
  - Works correctly after logout/login cycles

#### Fixed

- **Member Login Issue**
  - Members now correctly recognized after re-login
  - No more "Join this group" for existing members
  - Quick access to discussions for members

---

## [1.8.0] - 2025-12-23

### 🏠 Home Screen Redesign

#### Added

- **Premium iOS-Style Home Screen**
  - Immersive gradient header with 4 floating orbs
  - Personalized greeting card with avatar
  - Live stats dashboard (streak, XP, level)
  - Word of the Day widget
  - Quick actions grid with gradient icons
  - Continue learning hero card
  - Featured courses carousel
  - Latest stories section
  - Daily goal motivation card

#### Changed

- Staggered entrance animations
- Scroll-driven header transitions
- Pull-to-refresh with haptic feedback

---

## [1.7.0] - 2025-12-22

### 📚 Content & Reading Update

#### Added - Blog Detail Screen

- **Immersive Hero Header**
  - Full-screen parallax image
  - Dynamic gradient overlays
  - Floating decorative orbs
  - Category badge with icon

- **Reading Progress System**
  - Top progress bar (fixed)
  - Auto-completion at 90% scroll
  - Progress card with percentage

- **Smart Reading Tools**
  - Font size control (A-/A+)
  - Text-to-speech (listen to article)
  - Offline download
  - Bookmark and like

- **Rich Content Formatting**
  - Styled headings and quotes
  - French phrase highlighting
  - Speak button for phrases
  - Optimized typography

- **Gamification**
  - +20 XP for completing articles
  - Completion celebration overlay
  - State persistence

#### Added - Blog List Screen

- Premium gradient header
- Smart filtering (6 categories)
- Featured stories carousel
- Beautiful article cards
- Bookmark system

---

## [1.6.0] - 2025-12-21

### 🎯 Leaderboard & Community Update

#### Added - Leaderboard

- **Golden Theme Design**
  - Warm gold/amber gradient header
  - Pulsing trophy animation
  - Live stats cards

- **Premium Podium Section**
  - Animated crown
  - Top 3 with medal badges
  - Staggered entrance animations

- **Your Rank Card**
  - Highlighted if ranked 4+
  - Position badge

- **Filter Chips**
  - 7 categories with unique colors
  - Active chip with glow

#### Added - Community Hub

- **Active Study Groups Section**
  - Full-width gradient container
  - Dynamic gradient cards
  - LIVE badges with pulse
  - Avatar stacks

- **Community Highlights**
  - Clickable cards
  - Dynamic gamification stats
  - Navigation to relevant screens

---

## [1.5.0] - 2025-12-20

### 💬 Forums & Discussions Update

#### Added - Q&A Forum

- Indigo gradient header
- 7 topic categories with icons
- Smart sort options
- Beautiful question cards
- Vote/answer/view counts
- Staggered animations

#### Added - Discussions Screen

- Purple gradient header
- 8 discussion categories
- Trending/Hot badges
- Instructor verification
- Like/Reply/View stats

#### Added - Create Study Group

- Premium form with sections
- 2x4 grid for focus areas
- Animated toggle switch
- Progress bar
- Tags system

---

## [1.4.0] - 2025-12-19

### 📆 Word of the Day Feature

#### Added

- **Daily French Words** (15 curated)
  - Phonetic pronunciation
  - Part of speech
  - Example sentences
  - Usage tips
  - Fun facts
  - Similar words
  - Related vocabulary

- **Streak System**
  - Consecutive days tracking
  - Celebration animation
  - Visual streak counter
  - XP bonuses

- **Premium Design**
  - Dynamic gradient (unique per word)
  - Audio pronunciation
  - Share feature

---

## [1.3.0] - 2025-12-18

### 🎮 Practice Modules Redesign

#### Added - Quick Quiz

- 8 categories, 48 questions
- Timer and streak counter
- Shake animation for wrong
- Detailed results with review
- XP rewards

#### Added - Grammar Drills

- 8 grammar topics, 48 exercises
- Hint system
- Cyan/teal color theme
- Best streak tracking

#### Added - Speaking Practice

- 8 real-life scenarios
- 48 phrases with phonetics
- Animated microphone
- Pulse/wave effects
- Audio playback (TTS)

#### Added - Listening Practice

- 8 audio categories
- 48 comprehension exercises
- Animated waveform visual
- Difficulty badges

#### Added - Flashcards

- 8 vocabulary decks
- 48 cards total
- 3D flip animation
- Known/Review system
- Mastery progress

---

## [1.2.0] - 2025-12-17

### 💬 Messaging Enhancements

#### Added

- **Swipe-to-Reply** on messages
- **Double-Tap to Like** (heart reaction)
- **Message Reactions** display
- **Long-Press Actions** (delete, copy, forward)
- **Backend Reactions API** with persistence

#### Fixed

- Message actions modal on tab change
- Keyboard covering message input
- iOS KeyboardAvoidingView offset

---

## [1.1.0] - 2025-12-16

### 👥 Study Groups Redesign

#### Added

- Premium gradient header
- Smart search bar
- Two-tier filtering (Level + Focus)
- Beautiful group cards
- Member status detection
- Avatar stacks
- Premium join modal

#### Fixed

- isMember function for all ID formats
- Join button visibility for members

---

## [1.0.0] - 2025-12-15

### 🎉 Initial Premium Release

#### Features

- Premium course catalog
- Video lessons with progress
- Practice exercises
- Study groups
- Community features
- Dark/Light themes
- Gamification (XP, levels, streaks)
- Payment integration
- Instructor dashboard

---

## Legend

- 🚀 Performance
- 🔒 Security
- 🏠 Home
- 📚 Content
- 🎯 Leaderboard
- 💬 Community
- 📆 Daily
- 🎮 Practice
- 👥 Groups
- 🎉 Release

---

**Full documentation:** [README.md](README.md)

**Contributing:** [CONTRIBUTING.md](CONTRIBUTING.md)

