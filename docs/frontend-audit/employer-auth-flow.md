# Employer Authentication & Onboarding Architecture

## 1. Authentication Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Recruiter as Employer / Recruiter
    participant UI as EmployerLogin View
    participant Form as EmployerLoginForm
    participant AuthSvc as authService
    participant Backend as Django Auth API
    participant Redux as Redux (authSlice, userSlice)
    participant Router as Next.js Router

    Recruiter->>UI: Enter email & password
    UI->>Form: Submit credentials
    Form->>AuthSvc: checkCreds(email, 'EMPLOYER')
    AuthSvc->>Backend: POST /api/v1/auth/check-creds/
    Backend-->>AuthSvc: { exists: true, email_verified: true }
    
    AuthSvc->>Backend: POST /api/v1/auth/token/ (grant_type=password, roleName=EMPLOYER)
    Backend-->>AuthSvc: { access_token, refresh_token, backend }
    AuthSvc->>UI: Token payload
    UI->>UI: tokenService.saveAccessTokenAndRefreshTokenToCookie()
    
    UI->>Redux: dispatch(getUserInfo())
    Redux->>Backend: GET /api/v1/auth/user-info/
    Backend-->>Redux: User entity (isOnboarded, workspaces, companyId)
    Redux->>Redux: setActiveWorkspace(companyWorkspace)
    
    alt isOnboarded == false
        UI->>Router: push('/onboarding/employer')
    else isOnboarded == true
        UI->>Router: push(getSafeRedirectPath('/employer/dashboard'))
    end
```

## 2. Employer Registration & Company Provisioning Flow

```mermaid
sequenceDiagram
    autonumber
    actor Recruiter as Recruiter / Founder
    participant View as EmployerSignUp
    participant Form as EmployerSignUpForm (2-Step Wizard)
    participant Goong as Goong Maps API
    participant Backend as Django API (/api/v1/auth/employer/register/)
    participant DB as PostgreSQL
    participant Email as Celery Email Queue

    Note over Form: Step 1: Recruiter Account Credentials
    Recruiter->>Form: Enter Full Name, Email, Password
    Form->>Backend: POST /api/v1/auth/check-creds/
    Backend-->>Form: { exists: false } -> Advance to Step 2

    Note over Form: Step 2: Company Brand & Location
    Recruiter->>Form: Enter Company Name, Tax Code, Employee Size
    Recruiter->>Form: Type Address
    Form->>Goong: Places Autocomplete & Geocoding
    Goong-->>Form: { place_id, lat, lng, formatted_address }
    
    Recruiter->>Form: Submit Form
    Form->>View: handleRegister(formData)
    View->>Backend: POST /api/v1/auth/employer/register/
    
    rect rgb(240, 248, 255)
        Note over Backend, DB: Database Transaction (atomic)
        Backend->>DB: 1. Insert Location (city, district, address, coords)
        Backend->>DB: 2. Insert User (role_name='EMPLOYER', is_active=False, has_company=True)
        Backend->>DB: 3. Insert Company (user_id, location_id, tax_code, employee_size)
        Backend->>DB: 4. Ensure System Company Roles (Owner, Admin, Member)
        Backend->>Email: 5. Queue Email Verification Message
    end
    
    Backend-->>View: HTTP 201 CREATED
    View->>Router: push('/email-verification-required')
```

## 3. Employer Onboarding State Machine & KYC Verification

* **Draft Persistence**: Changes at Step 1 (`StepCompanyProfile`) and Step 2 (`StepRecruiterProfile`) are atomically saved to the server via `PATCH /api/v1/auth/onboarding/employer/step/`.
* **Invited Member Flow**: When a company invites a new recruiter via email, `GetOnboardingStatusView` detects `hasExistingMembership=True` and shows the direct `Accept & Continue` card bypassing new company creation.
* **KYC / GPKD Verification**: Step 3 provides a dual action:
  1. `Hoàn thành thiết lập`: Attaches `gpkdFileId` -> creates `CompanyVerification` record in `PENDING` review state.
  2. `Bỏ qua & Xác thực sau`: Omits GPKD document -> marks user `is_onboarded=True` while allowing verification document upload later in `/employer/verification`.
