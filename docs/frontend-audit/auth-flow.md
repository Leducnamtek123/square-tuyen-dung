# Frontend Authentication & Account Lifecycle Map

## 1. Candidate Registration Flow
```text
User enters /register
  │
  ├── Form Validation (React Hook Form + Yup)
  │     ├── fullName, email, password, confirmPassword
  │     └── terms acceptance
  │
  ├── Submit to API (authService.jobSeekerRegister)
  │     ├── [HTTP 201] Account Created
  │     │     ├── Update Redux authSlice (email, roleName, isAllowVerifyEmail: true)
  │     │     └── Redirect to /email-verification-required
  │     │
  │     ├── [HTTP 400 - Email Exists & Unverified]
  │     │     ├── Check creds via authService.checkCreds
  │     │     ├── Update Redux authSlice
  │     │     └── Seamless transition to /email-verification-required
  │     │
  │     └── [HTTP 400 - Validation / Duplicate Email]
  │           └── Surface inline field error messages
```

---

## 2. Email Verification Gate Flow
```text
User on /email-verification-required
  │
  ├── Auto-Check (Poll on Mount, Window Focus & 4s Interval)
  │     ├── Calls authService.sendVerifyEmail(email)
  │     └── If isVerified === true:
  │           ├── Show Toast ("verification.activatedSuccess")
  │           └── Redirect to /login
  │
  └── Manual Resend Action
        ├── Cooldown Gate (2500ms minimum threshold)
        ├── In-flight request throttling
        └── Calls authService.sendVerifyEmail
```

---

## 3. Login & Portal Resolution Flow
```text
User enters /login (Unified / Candidate)
  │
  ├── Option A: Email + Password Credentials
  │     ├── Step 1: Pre-flight authService.checkCreds(email, "JOB_SEEKER")
  │     │     ├── exists === true & emailVerified === false:
  │     │     │     └── Update Redux & redirect to /email-verification-required
  │     │     ├── exists === false:
  │     │     │     └── Surface "messages.noCandidateAccount" error
  │     │     └── exists === true & emailVerified === true:
  │     │           └── Proceed to Step 2
  │     │
  │     ├── Step 2: Request Token (authService.getToken)
  │     │     ├── [HTTP 200]: Save accessToken & refreshToken to cookies (tokenService)
  │     │     ├── Dispatch getUserInfo()
  │     │     └── Onboarding Resolution:
  │     │           ├── user.isOnboarded === false ──> /onboarding/candidate
  │     │           └── user.isOnboarded === true  ──> /
  │     │
  │     └── [HTTP 400/401]: Render inline authentication error
  │
  ├── Option B: Social Authentication (Google OAuth 2.0 / Facebook / Firebase Phone OTP)
  │     ├── Cooldown throttle (2500ms)
  │     ├── Token conversion (authService.convertToken)
  │     ├── Save tokens to cookies & dispatch getUserInfo()
  │     └── Redirect to /onboarding/candidate or /
```

---

## 4. Password Reset Lifecycle Flow
```text
Forgot Password Flow:
  /forgot-password
    │
    ├── Input Email -> authService.forgotPassword({ email, platform: "WEB" })
    ├── [Success]: Render localized Alert with spam folder reminder
    └── [Error]: Display retry alert

Reset Password Confirmation Flow:
  /reset-password/[token]
    │
    ├── Input New Password + Confirm Password
    ├── Submit -> authService.resetPassword({ token, newPassword, confirmPassword, platform: "WEB" })
    ├── [Success]: Redirect to /login?successMessageKey=passwordResetSuccess
    └── [Error / Expired Token]: Display error alert
```

---

## 5. Route Guard & Session Protection Matrix
| User Role | Target Route | Guard Behavior | Destination |
| :--- | :--- | :--- | :--- |
| **Guest** | `/dashboard`, `/profile`, `/account` | `CandidateSectionClient` intercepts missing cookie token | Redirect to `/login` |
| **Guest** | `/employer/*` (private portal) | `EmployerSectionClient` intercepts missing token | Redirect to `/employer/login` |
| **Guest** | `/admin/*` (private portal) | `AdminSectionClient` intercepts missing token | Redirect to `/admin/login` |
| **Candidate** | `/employer/*` (private portal) | Role check in `EmployerSectionClient` | Redirect to `/forbidden` |
| **Employer** | `/admin/*` | Role check in `AdminSectionClient` | Redirect to `/forbidden` |
| **Authenticated** | `/login` | `ClientAppRoot` & layout auth checks | Navigate to respective home/dashboard |