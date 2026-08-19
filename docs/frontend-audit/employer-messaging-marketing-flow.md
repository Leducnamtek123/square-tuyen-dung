# Employer Real-time Messaging & Marketing Public Pages Architecture

## 1. Real-time Candidate Messaging & Inbox
- **Firebase Firestore Multi-Channel Streaming**:
  - `ChatPage` connects to Firestore collections (`chats`) scoped by `members` array containing recruiter and candidate IDs (`firebaseService.ts`).
  - Implements sub-100ms real-time delivery, instant unread message counters, typing indicators, and file/audio attachments.

## 2. Employer Subscription Plans & Service Tiers
- **Tier Configuration**:
  - `PricingPage` showcases transparent service packages: Free Starter (1 tin miễn phí), Professional (5 tin tuyển dụng + lọc hồ sơ AI), and Enterprise Custom (Không giới hạn tin + phỏng vấn AI LiveKit).
  - Integrates with checkout workflow for service add-on activation.

## 3. Marketing Solution Showcase & FAQ Hub
- **Responsive Interactive FAQ**:
  - `StaticInfoPage` renders categorized FAQ accordion items with search filtering.
  - Multi-language parity (VI/EN) guaranteed across all marketing copy.
