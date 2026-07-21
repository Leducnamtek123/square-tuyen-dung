# Components Directory

This directory contains all shared React components organized by purpose and domain functionality, following Next.js App Router best practices.

## Structure

### `Common/` — Shared UI & Business Components
Reusable across multiple features and layouts. Contains components like:
- **UI Utilities**: `LazyLoadSection`, `ScrollToTop`, `ThemeRegistry`
- **Loading & Empty States**: `Loading/*`, `EmptyCard`, `NoDataCard`
- **Data Display**: `DataTable`, `DataTableCustom`, `TimeAgo`, `NumberCard`
- **Media & Icons**: `ImageGalleryCustom`, `MuiImageCustom`, `SvgIcon`, `Pdf`
- **Interactive**: `ColorPickerDialog`, `DropzoneDialogCustom`, `ImageCropDialog`, `Map`, `QRCodeBox`, `SocialNetworkSharingPopup`
- **Forms**: `Controls/*` (Custom form input components)

### `Features/` — Feature-Specific Components
Domain-driven components partitioned by business logic area:
- **Jobs**: `JobPost`, `JobPostLarge`, `JobPosts`, `JobPostAction`, `ApplyCard`, `ApplyForm`, `MainJobRightBanner`
- **Companies**: `Company`, `Companies`, `CompanyAction`, `TopCompanyCarousel`
- **Chat & Messaging**: `ChatCard`, `ChatBot`, `Chats/*`
- **AI Integration**: `AIToolsCard`, `AIServiceHealthBanner`, `AiElements/*`, `AgentsUi/*`, `InterviewAi/*`
- **Profiles**: `JobSeekerProfile`, `CVDoc`
- **Notifications**: `NotificationCard`
- **Feedback**: `Feedback`, `FeedbackCard`, `FeedbackCarousel`
- **Engagement**: `CareerCarousel`, `AppIntroductionCard`

### `ui/` — UI Primitives
Low-level building blocks: Button, Skeleton, etc. (shadcn-style).

### `ErrorBoundary/` — Error Handling
Application-level error boundaries.

### `ThemeRegistry/` — MUI Theme
MUI ThemeProvider and theme configuration.
