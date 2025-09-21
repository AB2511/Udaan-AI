# Frontend Test Suite

This directory contains comprehensive tests for the Udaan AI frontend application, covering all new career platform features.

## Test Structure

```
src/tests/
├── setup.js                           # Test setup and global mocks
├── components/                         # Component unit tests
│   ├── CareerRecommendationsWidget.test.jsx
│   ├── SkillAssessmentWidget.test.jsx
│   └── AssessmentInterface.test.jsx
├── services/                          # Service layer tests
│   └── careerService.test.js
├── integration/                       # Integration tests
│   └── dashboard-workflow.test.jsx
├── e2e/                              # End-to-end tests
│   └── complete-user-journey.test.jsx
├── accessibility/                     # Accessibility tests
│   └── dashboard-accessibility.test.jsx
└── README.md                         # This file
```

## Testing Framework

- **Vitest**: Fast unit test runner built for Vite
- **React Testing Library**: Component testing utilities
- **Jest-DOM**: Custom Jest matchers for DOM testing
- **Jest-Axe**: Accessibility testing
- **JSDOM**: DOM environment for Node.js

## Test Categories

### 1. Component Tests
Tests individual React components in isolation:
- **CareerRecommendationsWidget**: Tests recommendation display, modal interactions, error states
- **SkillAssessmentWidget**: Tests assessment history, type selection, progress indicators
- **AssessmentInterface**: Tests question navigation, timer, form interactions

### 2. Service Tests
Tests API service modules:
- **careerService**: Tests API calls, caching, error handling, retry logic
- **assessmentService**: Tests assessment workflow APIs
- **resumeService**: Tests file upload and analysis APIs

### 3. Integration Tests
Tests component interactions and workflows:
- **dashboard-workflow**: Tests complete dashboard functionality and cross-widget interactions
- Tests data flow between components
- Tests error recovery scenarios

### 4. End-to-End Tests
Tests complete user journeys:
- **complete-user-journey**: Tests full onboarding and feature usage workflows
- Tests authentication flows
- Tests data persistence across sessions

### 5. Accessibility Tests
Tests compliance with WCAG guidelines:
- **dashboard-accessibility**: Tests keyboard navigation, screen reader support, color contrast
- Tests ARIA attributes and landmarks
- Tests mobile accessibility

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test

# Run tests with UI
npm run test:ui

# Run tests once (CI mode)
npm run test:run

# Run tests with coverage
npm run test:coverage
```

## Test Configuration

Tests are configured in `vitest.config.js`:
- Uses JSDOM environment for DOM testing
- Includes setup file for global mocks
- Configured for CSS and module resolution
- Coverage reporting enabled

## Mocking Strategy

### Service Mocks
All API services are mocked using Vitest's `vi.mock()`:
- Consistent mock data across tests
- Configurable responses for different scenarios
- Error simulation for testing error handling

### Browser APIs
Global browser APIs are mocked in `setup.js`:
- localStorage/sessionStorage
- fetch API
- matchMedia for responsive testing
- IntersectionObserver/ResizeObserver

### Component Dependencies
External dependencies are mocked:
- React Router for navigation testing
- Toast context for notification testing
- Authentication context for user state

## Test Data

Test data is centralized and reusable:
- Mock user profiles with different completion states
- Sample API responses for all services
- Error scenarios for testing edge cases

## Coverage Goals

Target coverage metrics:
- **Statements**: >90%
- **Branches**: >85%
- **Functions**: >90%
- **Lines**: >90%

## Best Practices

### Writing Tests
1. **Arrange-Act-Assert**: Clear test structure
2. **User-centric**: Test from user perspective
3. **Isolated**: Each test is independent
4. **Descriptive**: Clear test names and descriptions

### Component Testing
1. **Render with providers**: Always wrap with necessary contexts
2. **Wait for async**: Use `waitFor` for async operations
3. **Query by role**: Prefer accessibility-friendly queries
4. **Test behavior**: Focus on user interactions, not implementation

### Service Testing
1. **Mock fetch**: Use consistent fetch mocking
2. **Test error cases**: Include network and API errors
3. **Verify calls**: Check API calls are made correctly
4. **Test caching**: Verify caching behavior

### Accessibility Testing
1. **Automated checks**: Use jest-axe for WCAG compliance
2. **Keyboard testing**: Test all keyboard interactions
3. **Screen reader**: Test ARIA attributes and announcements
4. **Color contrast**: Verify sufficient contrast ratios

## Continuous Integration

Tests are designed to run in CI environments:
- No external dependencies
- Deterministic results
- Fast execution
- Comprehensive coverage

## Debugging Tests

### Common Issues
1. **Async timing**: Use `waitFor` for async operations
2. **Mock cleanup**: Ensure mocks are cleared between tests
3. **DOM queries**: Use appropriate queries for elements
4. **Context providers**: Ensure all required providers are included

### Debug Tools
1. **screen.debug()**: Print current DOM state
2. **--ui flag**: Visual test runner interface
3. **Coverage reports**: Identify untested code paths
4. **Console logs**: Add temporary logging for debugging

## Future Enhancements

Planned test improvements:
1. **Visual regression testing**: Screenshot comparison
2. **Performance testing**: Bundle size and runtime performance
3. **Cross-browser testing**: Automated browser compatibility
4. **Mobile testing**: Device-specific testing scenarios