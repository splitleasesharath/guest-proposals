# Roadmap: Guest Proposals Page - Path Ahead

**Current Version**: 2.0.0
**Last Updated**: 2025-11-22
**Status**: ✅ Phase A-E Complete | 🚧 Phase F-J Planned

---

## 📍 Current State

### ✅ Completed (v2.0.0)
All foundation and core workflow modules are complete and committed:

- **Phase A**: Foundation Fixes (Status & Stage Management)
- **Phase B**: Dynamic Data Integration (House Rules & Virtual Meetings)
- **Phase C**: Workflow Modules (Cancel, VM, Navigation, Counteroffer)
- **Phase D**: Dashboard Configuration (Filtering, Sorting, Persistence)
- **Phase E**: Component Integration (ProposalCard, ProposalsIsland, Modals)

**Implementation Status**: 82 Bubble.io workflows → Centralized modular system ✅

---

## 🎯 Path Ahead: Phases F-J

### Phase F: Testing & Quality Assurance
**Priority**: 🔴 Critical
**Timeline**: 1-2 weeks
**Status**: Not Started

#### Objectives
1. **Unit Testing**
   - Test all workflow modules (cancel, VM, navigation, counteroffer)
   - Test query modules (house rules, virtual meetings)
   - Test utility modules (dashboardConfig, dataTransformers)
   - Target coverage: 80%+

2. **Integration Testing**
   - Test ProposalCard with all workflow states
   - Test ProposalsIsland filtering and sorting
   - Test modal interactions (Compare Terms, Host Profile, Maps)
   - Test navigation flows end-to-end

3. **E2E Testing with Playwright**
   - User journey: Guest views proposals → Cancels proposal
   - User journey: Guest reviews counteroffer → Accepts
   - User journey: Guest requests VM → Responds to VM
   - User journey: Guest filters proposals → Changes config
   - User journey: Full proposal lifecycle (submit → rental app → documents → payment)

4. **Performance Testing**
   - Test with 1 proposal (baseline)
   - Test with 10 proposals (typical user)
   - Test with 50 proposals (power user)
   - Test with 100+ proposals (edge case)
   - Measure load times, filtering speed, memory usage

5. **Browser Compatibility**
   - Chrome/Edge (Chromium)
   - Firefox
   - Safari
   - Mobile browsers (iOS Safari, Chrome Mobile)

#### Deliverables
- [ ] Jest test suite for all modules
- [ ] React Testing Library tests for components
- [ ] Playwright E2E test suite (5+ user journeys)
- [ ] Performance benchmarks document
- [ ] Browser compatibility matrix
- [ ] Test coverage report (target: 80%+)

#### Blockers
- None (all dependencies exist)

---

### Phase G: Missing Components Implementation
**Priority**: 🟡 High
**Timeline**: 1 week
**Status**: Not Started

#### Objectives
1. **RespondVirtualMeetingModal.jsx**
   - Date/time picker for booking virtual meetings
   - Integration with virtualMeetings.js workflow
   - Show meeting details when booked
   - Display confirmation status

2. **MapsModal.jsx Enhancement**
   - Google Maps integration (API key required)
   - Show listing location with marker
   - Display nearby amenities
   - Street view option
   - Directions link

3. **HostProfileModal.jsx Enhancement**
   - Display full host profile data
   - Show verification badges
   - List host's other properties
   - Display response rate/time
   - Link to message host

4. **SuggestedProposalsSection.jsx**
   - ML-based recommendation engine (future)
   - For now: Show similar proposals by location
   - Show similar proposals by price range
   - "You might also like" section

5. **CalendarWidget.jsx**
   - Interactive calendar for move-in date selection
   - Show availability periods
   - Highlight booked dates
   - Quick date range selection

6. **DashboardConfigPanel.jsx Enhancement**
   - Current version is basic
   - Add visual filter toggles
   - Add sort direction indicators
   - Add view mode selector (card/list/table)
   - Add notification preferences UI

#### Deliverables
- [ ] RespondVirtualMeetingModal component
- [ ] Enhanced MapsModal with Google Maps
- [ ] Enhanced HostProfileModal with full data
- [ ] SuggestedProposalsSection component
- [ ] CalendarWidget component
- [ ] Enhanced DashboardConfigPanel UI

#### Blockers
- Google Maps API key needed for MapsModal
- ML recommendation engine not yet designed (can defer)

---

### Phase H: Additional Workflows Implementation
**Priority**: 🟡 High
**Timeline**: 1-2 weeks
**Status**: Not Started

Based on the 82 Bubble.io workflows, these are still missing:

#### 1. Rental Application Workflow
**Bubble.io Workflows**: crkas5, ctiEr, cursi4, cuvOe1, curtB4
- Submit rental application
- Navigate to rental application page
- Auto-fill known user data
- Validation before submission

**Implementation**:
```javascript
// src/lib/workflows/rentalApplication.js
- submitRentalApplication(proposalId, applicationData)
- validateApplicationData(data)
- autoFillApplicationFromUser(user)
- handleRentalApplicationSubmission()
```

#### 2. Document Review Workflow
**Bubble.io Workflows**: crkbj5, ctiFI, curtB4, croxV2
- Review lease documents
- View house manual
- Toggle document sections
- Track document review status

**Implementation**:
```javascript
// src/lib/workflows/documentReview.js
- fetchProposalDocuments(proposalId)
- markDocumentAsReviewed(documentId)
- toggleDocumentSection(sectionId)
- getDocumentReviewProgress(proposalId)
```

#### 3. Identity Verification Workflow
**Bubble.io Workflows**: crkbo5
- Navigate to verification page
- Track verification status
- Update user profile with verified status

**Implementation**:
```javascript
// src/lib/workflows/identityVerification.js
- navigateToVerification(returnUrl)
- checkVerificationStatus(userId)
- updateVerificationStatus(userId, verified)
```

#### 4. Lease Activation Workflow
**Bubble.io Workflows**: crkbe5, crpMU2
- Submit initial payment
- Activate lease
- Navigate to active leases page
- Send confirmation notifications

**Implementation**:
```javascript
// src/lib/workflows/leaseActivation.js
- submitInitialPayment(proposalId, paymentData)
- activateLease(proposalId)
- handlePaymentSuccess(result)
- handlePaymentFailure(error)
```

#### 5. Messaging Workflow
**Bubble.io Workflows**: crkgi5
- Send message to host
- Pre-fill message context (proposal ID)
- Message templates for common scenarios

**Implementation**:
```javascript
// src/lib/workflows/messaging.js
- sendMessage(recipientId, message, proposalId)
- getMessageTemplates(scenario)
- precomposeMessage(template, proposalData)
```

#### 6. Proposal Editing Workflow
**Bubble.io Workflows**: crkay5, ctGGm2
- Edit draft proposal
- Update proposal terms
- Validation before submission

**Implementation**:
```javascript
// src/lib/workflows/proposalEditing.js
- updateProposal(proposalId, changes)
- validateProposalData(data)
- submitProposalEdits(proposalId)
```

#### 7. Reminder & Notification Workflow
**Bubble.io Workflows**: crkaV5, ctgJw
- Remind Split Lease about pending items
- General alerts system
- Notification preferences

**Implementation**:
```javascript
// src/lib/workflows/notifications.js
- sendReminder(proposalId, type)
- getAlerts(userId)
- markAlertAsRead(alertId)
- updateNotificationPreferences(userId, prefs)
```

#### Deliverables
- [ ] rentalApplication.js workflow module
- [ ] documentReview.js workflow module
- [ ] identityVerification.js workflow module
- [ ] leaseActivation.js workflow module
- [ ] messaging.js workflow module
- [ ] proposalEditing.js workflow module
- [ ] notifications.js workflow module
- [ ] Integration tests for each workflow

#### Blockers
- Payment processing integration (Stripe/other) needed for lease activation
- Email/SMS notification system needed for reminders

---

### Phase I: UI/UX Enhancements
**Priority**: 🟢 Medium
**Timeline**: 1-2 weeks
**Status**: Not Started

#### Objectives
1. **Responsive Design Improvements**
   - Mobile-first redesign of ProposalCard
   - Tablet layout optimizations
   - Desktop multi-column layout
   - Touch-friendly controls for mobile

2. **Animation & Transitions**
   - Smooth page transitions
   - Modal enter/exit animations
   - Loading skeleton screens
   - Progress bar animations

3. **Accessibility (A11y)**
   - ARIA labels on all interactive elements
   - Keyboard navigation support
   - Screen reader compatibility
   - Color contrast compliance (WCAG AA)
   - Focus indicators

4. **Dark Mode Support**
   - Dark theme color palette
   - Toggle in DashboardConfigPanel
   - Persist preference in localStorage
   - Smooth theme transitions

5. **Error Handling UX**
   - User-friendly error messages
   - Retry mechanisms
   - Offline state handling
   - Network error recovery

6. **Loading States**
   - Skeleton screens for data loading
   - Progressive disclosure
   - Optimistic UI updates
   - Loading indicators

#### Deliverables
- [ ] Responsive CSS for mobile/tablet/desktop
- [ ] Animation library integration (Framer Motion or CSS transitions)
- [ ] A11y audit and fixes
- [ ] Dark mode implementation
- [ ] Error boundary components
- [ ] Loading state components

#### Blockers
- Design system/brand guidelines needed for consistency

---

### Phase J: DevOps & Deployment
**Priority**: 🟢 Medium
**Timeline**: 1 week
**Status**: Not Started

#### Objectives
1. **Build Optimization**
   - Code splitting by route
   - Lazy loading for modals
   - Tree shaking optimization
   - Bundle size analysis

2. **Environment Configuration**
   - Development environment setup
   - Staging environment setup
   - Production environment setup
   - Environment-specific configs

3. **CI/CD Pipeline**
   - GitHub Actions workflow
   - Automated testing on PR
   - Automated deployment to staging
   - Manual approval for production

4. **Monitoring & Analytics**
   - Error tracking (Sentry or similar)
   - Performance monitoring (Web Vitals)
   - User analytics (privacy-respecting)
   - Logging aggregation

5. **Documentation**
   - API documentation
   - Component documentation (Storybook)
   - Developer onboarding guide
   - Architecture decision records (ADRs)

#### Deliverables
- [ ] Optimized production build configuration
- [ ] Environment configuration files
- [ ] GitHub Actions CI/CD workflow
- [ ] Monitoring dashboard setup
- [ ] Storybook component documentation
- [ ] Developer documentation site

#### Blockers
- Deployment infrastructure setup needed
- Monitoring service accounts needed

---

## 🔄 Workflow Coverage Status

### Implemented (42/82 workflows)
Based on COMPREHENSIVE_IMPLEMENTATION_PLAN.md implementation:

**Cancel Proposal** (7/7 workflows) ✅
- crkec5, crswt2, crtCg2, curuC4, curuK4, curua4, crkZs5

**Virtual Meetings** (5/5 workflows) ✅
- crkdt5, crpWM2, crpVt2, cuvLq5, crkfZ5

**Navigation** (6/6 workflows) ✅
- crkhG5, crkgi5, crkeo5, ctdDG, crpMU2, crkca5

**Counteroffer** (3/3 workflows) ✅
- crkaD5, crkai5, crkcx5

**Hide Element** (5/5 workflows) ✅
- crkcs5, crkcO5, crkdP5, crkZy5, crkdK5

**Show Element** (4/4 workflows) ✅
- crkgI5, crkfG5, crpDh2, ctYQi0

**Proposal Updates** (3/3 workflows) ✅
- crkcx5, crkeA5, curuu4

**Page Load** (5/5 workflows) ✅
- csFEY0, ctbDt0, curqA4, crkda5, crkcl5

**Navigation In Page** (4/4 workflows) ✅
- crkcY5, crkcT5, crkfm5, crkfw5

### Partially Implemented (10/82 workflows)
**Custom Flows** (10/17 workflows) 🟡
- crkaD5 ✅ Accept counteroffer
- crkbE5 ⚠️ Delete Proposal (cancel workflow covers this)
- crkay5 ❌ Edit Proposal
- crkbe5 ❌ Go to Leases
- crkbj5 ❌ Review Documents
- crkbq5 ❌ See Details
- crkas5 ❌ Submit Rental Application
- crkbo5 ❌ Verify Identity
- crkaV5 ❌ Remind Split Lease
- crkac5 ❌ Resend Lease Documents
- ctGGm2 ❌ Own Proposal
- crkcf5 ❌ Google calendar sending
- Others partially covered

### Not Yet Implemented (30/82 workflows)
**Uncategorized** (6/14 workflows) ❌
- ctbJE0, ctbIe0, ctbIw0, cursq4, cursi4, cuvOe1, curtB4, ctPyA0, curxI4

**Actions On Click** (2/2 workflows) ❌
- crkfk5, crosY2

**Copy to Clipboard** (1/1 workflow) ⚠️
- crkfT5 (partially implemented in navigation.js)

**Crisp Chat** (2/2 workflows) ❌
- crliz0, curwG4, crljQ0

**Do When Condition** (2/2 workflows) ❌
- crkdU5, curHa4

**Offer & Counteroffer** (0/3 workflows) ❌
- crkeS5, curuh4, crpMD2

**Text Actions** (1/1 workflow) ❌
- ctYPC0

---

## 📊 Priority Matrix

### Must Have (Before Production)
1. ✅ Core workflow modules (Phase A-E) - COMPLETE
2. 🔴 Testing & QA (Phase F) - CRITICAL
3. 🟡 Missing components (Phase G) - HIGH
4. 🟡 Additional workflows (Phase H) - HIGH

### Should Have (v2.1)
1. 🟢 UI/UX enhancements (Phase I) - MEDIUM
2. 🟢 DevOps & deployment (Phase J) - MEDIUM
3. 🟢 Documentation improvements
4. 🟢 Performance optimizations

### Nice to Have (v2.2+)
1. 🔵 ML-based recommendations
2. 🔵 Advanced analytics
3. 🔵 Batch operations
4. 🔵 Internationalization (i18n)
5. 🔵 TypeScript migration

---

## 🚀 Recommended Next Steps

### Week 1-2: Testing Foundation
1. Set up Jest and React Testing Library
2. Write unit tests for workflow modules
3. Achieve 80%+ code coverage
4. Set up Playwright for E2E tests

### Week 3: Missing Components
1. Implement RespondVirtualMeetingModal
2. Enhance MapsModal with Google Maps
3. Enhance HostProfileModal
4. Basic CalendarWidget

### Week 4-5: Additional Workflows
1. Implement rental application workflow
2. Implement document review workflow
3. Implement identity verification workflow
4. Implement lease activation workflow

### Week 6: UI/UX Polish
1. Responsive design improvements
2. Add animations and transitions
3. Accessibility audit and fixes
4. Dark mode support

### Week 7: DevOps
1. Optimize build configuration
2. Set up CI/CD pipeline
3. Configure monitoring
4. Deploy to staging

### Week 8: Launch
1. Final QA testing
2. Performance testing
3. Security audit
4. Production deployment

---

## 🎯 Success Metrics

### Technical Metrics
- [ ] Test coverage ≥ 80%
- [ ] All 82 workflows implemented or justified as unnecessary
- [ ] Page load time < 2 seconds
- [ ] Bundle size < 500KB (gzipped)
- [ ] Lighthouse score ≥ 90 (Performance, A11y, Best Practices, SEO)

### User Experience Metrics
- [ ] Time to complete rental application < 5 minutes
- [ ] Time to review counteroffer < 30 seconds
- [ ] Error rate < 1%
- [ ] User satisfaction score ≥ 4.5/5

### Business Metrics
- [ ] Proposal conversion rate increase
- [ ] Reduced support tickets related to proposals
- [ ] Faster proposal-to-lease time
- [ ] Increased user engagement

---

## 📝 Notes

### Dependencies to Acquire
1. **Google Maps API Key** (for MapsModal)
2. **Payment Processor Integration** (Stripe or similar)
3. **Email Service** (SendGrid, AWS SES, or similar)
4. **SMS Service** (Twilio or similar)
5. **Error Tracking Service** (Sentry or similar)
6. **Analytics Service** (Privacy-respecting alternative to Google Analytics)

### Technical Decisions Pending
1. **State Management**: Continue with React useState or migrate to Zustand/Redux?
2. **Form Validation**: Use Formik, React Hook Form, or custom?
3. **Animation Library**: Framer Motion, React Spring, or CSS-only?
4. **Testing Strategy**: Jest + RTL + Playwright or add Cypress?
5. **Type Safety**: Continue with JSDoc or migrate to TypeScript?

### Open Questions
1. Should we implement all 82 workflows or prioritize based on user analytics?
2. Is the ML recommendation engine in scope for v2.x or defer to v3.0?
3. What is the target browser support matrix? (IE11? Safari 12+?)
4. What is the internationalization priority? (English-only for now?)
5. What is the mobile app strategy? (PWA or native apps?)

---

## 🔗 Related Documents

- **Implementation Plan**: `COMPREHENSIVE_IMPLEMENTATION_PLAN.md`
- **Changelog**: `CHANGELOG.md`
- **Workflow Documentation**: `Context/gp-2/stage*.md`
- **Database Schema**: `DATABASE_PHOTO_STRUCTURE.md`, `DATABASE_VALIDATION_REPORT.md`

---

**Last Updated**: 2025-11-22
**Maintained By**: Development Team
**Review Frequency**: Weekly

---

*This roadmap is a living document and will be updated as priorities shift and new requirements emerge.*
