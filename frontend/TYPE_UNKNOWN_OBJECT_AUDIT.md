# Type Audit: `unknown` / `object` Remaining

Generated: 2026-04-19T16:56:43.547Z
Scope: `frontend/src` (`.ts`, `.tsx`, `.d.ts`)

## Summary

- Total matches: **335**
- unknown matches: **199**
- object matches: **136**

## Detailed List

| File | Line | Kind | Classification | Snippet |
|---|---:|---|---|---|
| src\components\Common\Controls\TextFieldCustom\index.tsx | 37 | unknown | type-level | const formatDisplay = (value: unknown) => { |
| src\components\Common\DataTable\index.tsx | 31 | unknown | type-level | columns: ColumnDef<TData, unknown>[]; |
| src\components\Common\DataTableCustom\index.tsx | 37 | unknown | type-level | onRequestSort?: (event: React.MouseEvent<unknown>, |
| src\components\Common\DataTableCustom\index.tsx | 44 | unknown | type-level | const createSortHandler = (property: string) => (e |
| src\components\Common\DataTableCustom\index.tsx | 132 | unknown | type-level | rows?: unknown[]; |
| src\components\Common\DataTableCustom\index.tsx | 138 | unknown | type-level | handleRequestSort?: (event: React.MouseEvent<unkno |
| src\components\Common\ImageCropDialog\index.tsx | 6 | object | type-level | // to the module wrapper object instead of the com |
| src\components\Common\ImageCropDialog\index.tsx | 152 | object | type-level | objectFit="contain" |
| src\components\Common\Map\MapContent.tsx | 21 | object | type-level | // Next.js image imports return objects; extract s |
| src\components\Common\ProfileUploadCard\index.tsx | 80 | object | type-level | objectFit: 'cover', |
| src\components\Features\AiElements\message-response.tsx | 79 | unknown | type-level | cjk: unknown; |
| src\components\Features\AiElements\message-response.tsx | 80 | unknown | type-level | code?: unknown; |
| src\components\Features\AiElements\message-response.tsx | 81 | unknown | type-level | math?: unknown; |
| src\components\Features\AiElements\message-response.tsx | 82 | unknown | type-level | mermaid?: unknown; |
| src\components\Features\AIServiceHealthBanner\index.tsx | 54 | unknown | type-level | } catch (err: unknown) { |
| src\components\Features\AIServiceHealthBanner\index.tsx | 70 | unknown | type-level | } catch (err: unknown) { |
| src\components\Features\AIToolsCard\index.tsx | 46 | object | type-level | const objectUrl = URL.createObjectURL(blob); |
| src\components\Features\AIToolsCard\index.tsx | 47 | object | type-level | setTtsAudioUrl(objectUrl); |
| src\components\Features\AIToolsCard\index.tsx | 48 | unknown | type-level | } catch (error: unknown) { |
| src\components\Features\AIToolsCard\index.tsx | 70 | unknown | type-level | } catch (error: unknown) { |
| src\components\Features\AppIntroductionCard\index.tsx | 58 | object | type-level | objectFit: 'cover', |
| src\components\Features\ApplyCard\index.tsx | 45 | unknown | type-level | } catch (error: unknown) { |
| src\components\Features\ApplyForm\index.tsx | 40 | object | type-level | const schema = yup.object().shape({ |
| src\components\Features\Companies\index.tsx | 45 | unknown | type-level | const handleChangePage = (_event: React.ChangeEven |
| src\components\Features\CVDoc\index.tsx | 170 | object | type-level | objectFit: 'cover', |
| src\components\Features\Feedback\index.tsx | 27 | object | type-level | const schema = yup.object().shape({ |
| src\components\Features\Feedback\index.tsx | 66 | unknown | type-level | // We use an explicit cast here because errorHandl |
| src\components\Features\Feedback\index.tsx | 212 | object | type-level | objectFit: 'contain', |
| src\components\Features\FeedbackCard\index.tsx | 39 | object | type-level | objectFit: 'contain', |
| src\components\Features\TopCompanyCarousel\index.tsx | 195 | object | type-level | objectFit: 'contain', |
| src\components\Features\VoiceAssistant\components\app\app.tsx | 27 | unknown | type-level | function AutoConnect({ onError }: { onError?: (err |
| src\components\Features\VoiceAssistant\components\app\tile-layout.tsx | 190 | object | type-level | className={cn(chatOpen && 'size-[90px] object-cove |
| src\components\Features\VoiceAssistant\components\app\tile-layout.tsx | 231 | object | type-level | className="bg-slate-800/60 backdrop-blur-md aspect |
| src\configs\images.ts | 59 | object | type-level | // Next.js static image imports return { src, widt |
| src\configs\images.ts | 63 | object | type-level | if (img && typeof img === 'object' && typeof img.s |
| src\configs\images.ts | 64 | object | type-level | if (img && typeof img === 'object' && typeof img.d |
| src\configs\images.ts | 65 | object | type-level | if (img && typeof img === 'object' && typeof img.d |
| src\configs\__tests__\routing.test.ts | 164 | unknown | type-level | const variants = getLocalizedRouteVariants('some-u |
| src\hooks\AgentsUi\use-agent-audio-visualizer-aura.ts | 43 | unknown | type-level | audioTrack: unknown |
| src\hooks\AgentsUi\use-agent-audio-visualizer-wave.ts | 38 | unknown | type-level | audioTrack?: unknown; |
| src\hooks\AgentsUi\use-agent-control-bar.ts | 19 | unknown | type-level | export type DeviceErrorHandler = (error: { source: |
| src\hooks\AgentsUi\use-agent-control-bar.ts | 85 | unknown | type-level | (error: unknown) => onDeviceError?.({ source: Trac |
| src\hooks\AgentsUi\use-agent-control-bar.ts | 89 | unknown | type-level | (error: unknown) => onDeviceError?.({ source: Trac |
| src\hooks\AgentsUi\use-agent-control-bar.ts | 93 | unknown | type-level | (error: unknown) => onDeviceError?.({ source: Trac |
| src\hooks\AgentsUi\use-agent-control-bar.ts | 186 | unknown | type-level | (error: unknown) => onDeviceError?.({ source: Trac |
| src\hooks\AgentsUi\use-agent-control-bar.ts | 191 | unknown | type-level | (error: unknown) => onDeviceError?.({ source: Trac |
| src\layouts\components\commons\Header\index.tsx | 380 | object | type-level | objectFit: 'contain', |
| src\layouts\components\commons\Header\index.tsx | 381 | object | type-level | objectPosition: 'left center', |
| src\layouts\components\commons\LanguageSwitcher\index.tsx | 263 | object | type-level | <img src={lang.flagUrl} alt={lang.label} width={20 |
| src\layouts\components\commons\SubHeader\index.tsx | 35 | object | type-level | metadata?: object; |
| src\layouts\components\commons\SubHeader\index.tsx | 139 | object | type-level | setTopCareers(resData.map((item: { name: string; m |
| src\layouts\components\commons\TopSlide\index.tsx | 36 | object | type-level | objectFit: 'cover', |
| src\lib\server-fetch.ts | 19 | unknown | type-level | export async function serverFetch<T = unknown>( |
| src\services\adminManagementService.ts | 96 | unknown | type-level | evaluation_rubric_input?: unknown; |
| src\services\adminManagementService.ts | 110 | unknown | type-level | buildMultipartConfig: (data: unknown): { headers:  |
| src\services\adminManagementService.ts | 211 | object | type-level | createCompany: <T extends object | FormData>(data: |
| src\services\adminManagementService.ts | 216 | object | type-level | updateCompany: <T extends object | FormData>(id: I |
| src\services\commonService.ts | 24 | unknown | type-level | const extractResults = <T>(raw: unknown): T[] => { |
| src\services\commonService.ts | 46 | object | type-level | cityId && typeof cityId === 'object' ? cityId.id : |
| src\services\commonService.ts | 62 | object | type-level | districtId && typeof districtId === 'object' ? dis |
| src\services\commonService.ts | 78 | unknown | type-level | const data = (await httpRequest.get(url)) as unkno |
| src\services\contentService.ts | 27 | unknown | type-level | const toListData = <T>(raw: unknown): T[] => { |
| src\services\contentService.ts | 29 | unknown | type-level | const obj = (raw || {}) as { results?: unknown[];  |
| src\services\firebaseService.ts | 35 | unknown | type-level | createdAt?: unknown; |
| src\services\firebaseService.ts | 44 | unknown | type-level | updatedAt?: unknown; |
| src\services\firebaseService.ts | 45 | unknown | type-level | createdAt?: unknown; |
| src\services\interviewService.ts | 99 | object | type-level | typeof roomName === 'object' && roomName ? roomNam |
| src\services\questionGroupService.ts | 18 | unknown | type-level | evaluationRubricInput?: unknown; |
| src\services\resumeService.ts | 78 | unknown | type-level | const data = (await httpRequest.get(url, { params  |
| src\services\resumeService.ts | 84 | unknown | type-level | const data = (await httpRequest.get(url)) as unkno |
| src\services\resumeService.ts | 100 | unknown | type-level | const data = (await httpRequest.get(url)) as unkno |
| src\services\resumeService.ts | 106 | unknown | type-level | const data = (await httpRequest.get(url)) as unkno |
| src\services\resumeService.ts | 114 | unknown | type-level | })) as unknown; |
| src\services\resumeService.ts | 122 | unknown | type-level | })) as unknown; |
| src\services\resumeService.ts | 128 | unknown | type-level | const resData = (await httpRequest.put(url, data)) |
| src\services\resumeService.ts | 139 | unknown | type-level | const data = (await httpRequest.get(url)) as unkno |
| src\shims.d.ts | 42 | object | type-level | italic?: React.CSSProperties | object; |
| src\shims.d.ts | 126 | unknown | type-level | createFromBlockArray(blocks: unknown[]): ContentSt |
| src\shims.d.ts | 128 | unknown | type-level | export function convertFromHTML(html: string): { c |
| src\shims.d.ts | 129 | object | type-level | export function convertToRaw(contentState: Content |
| src\shims.d.ts | 133 | object | type-level | const draftToHtml: (raw: object) => string; |
| src\shims.d.ts | 151 | object | type-level | styles?: object; |
| src\shims.d.ts | 176 | unknown | type-level | editorState?: unknown; |
| src\shims.d.ts | 177 | unknown | type-level | onEditorStateChange?: (state: unknown) => void; |
| src\shims.d.ts | 178 | object | type-level | toolbar?: object; |
| src\types\api.ts | 4 | unknown | type-level | export interface ApiResponse<T = unknown> { |
| src\types\api.ts | 10 | unknown | type-level | export interface PaginatedResponse<T = unknown> { |
| src\types\models.ts | 25 | object | type-level | /** Job seeker profile object returned by backend  |
| src\utils\apiClient.ts | 18 | unknown | type-level | get: <T = unknown>(url: string, config?: AxiosRequ |
| src\utils\apiClient.ts | 21 | unknown | type-level | post: <T = unknown>(url: string, data?: unknown, c |
| src\utils\apiClient.ts | 24 | unknown | type-level | put: <T = unknown>(url: string, data?: unknown, co |
| src\utils\apiClient.ts | 27 | unknown | type-level | patch: <T = unknown>(url: string, data?: unknown,  |
| src\utils\apiClient.ts | 30 | unknown | type-level | delete: <T = unknown>(url: string, config?: AxiosR |
| src\utils\camelCase.ts | 14 | object | type-level | * Recursively convert all keys in an object/array  |
| src\utils\camelCase.ts | 15 | object | type-level | * Handles nested objects, arrays, and null/undefin |
| src\utils\camelCase.ts | 17 | unknown | type-level | export function camelizeKeys<T = unknown>(data: un |
| src\utils\camelCase.ts | 24 | object | type-level | if (typeof data === 'object' && !(data instanceof  |
| src\utils\camelCase.ts | 42 | object | type-level | * Recursively convert all keys in an object/array  |
| src\utils\camelCase.ts | 45 | unknown | type-level | export function snakizeKeys<T = unknown>(data: unk |
| src\utils\camelCase.ts | 52 | object | type-level | if (typeof data === 'object' && !(data instanceof  |
| src\utils\errorHandling.ts | 8 | unknown | type-level | const normalizeErrorsToMessage = (errors: unknown) |
| src\utils\errorHandling.ts | 9 | object | type-level | if (!errors || typeof errors !== 'object') return  |
| src\utils\errorHandling.ts | 30 | unknown | type-level | * Type guard: checks if an unknown value is an Axi |
| src\utils\errorHandling.ts | 32 | unknown | type-level | const isAxiosError = (error: unknown): error is Ax |
| src\utils\errorHandling.ts | 33 | object | type-level | typeof error === 'object' && |
| src\utils\errorHandling.ts | 41 | unknown | type-level | * Accepts `unknown` so callers don't need to cast  |
| src\utils\errorHandling.ts | 47 | unknown | type-level | error: unknown, |
| src\utils\errorHandling.ts | 50 | unknown | type-level | // If it's not an Axios error, show a generic netw |
| src\utils\formHelpers.ts | 13 | object | type-level | * - nested object shapes having slightly different |
| src\utils\httpRequest.ts | 57 | unknown | type-level | const unwrapResponse = (response: { data?: { data? |
| src\utils\httpRequest.ts | 66 | unknown | type-level | type RefreshTokenResponse = AxiosResponse<{ data?: |
| src\utils\httpRequest.ts | 164 | unknown | type-level | refreshResponse as { data?: { data?: unknown } }, |
| src\utils\httpRequest.ts | 191 | unknown | type-level | } catch (refreshError: unknown) { |
| src\utils\httpRequest.ts | 192 | unknown | type-level | const refreshErrorResponse = (refreshError as { re |
| src\utils\imageCompression.ts | 23 | object | type-level | * @param file - The original File object |
| src\utils\params.ts | 2 | object | type-level | export type ParamsValue = ParamsPrimitive | Params |
| src\utils\params.ts | 6 | object | type-level | * Removes null, undefined, empty string, and empty |
| src\utils\params.ts | 7 | object | type-level | * Accepts any object type (including typed DTOs) a |
| src\utils\presignUrl.ts | 32 | unknown | type-level | const unwrapResponse = (response: { data?: { data? |
| src\utils\presignUrl.ts | 70 | object | type-level | * 1. Deep clone the object first (safe — no cache  |
| src\utils\presignUrl.ts | 80 | object | type-level | if (!value || typeof value !== 'object') return va |
| src\utils\presignUrl.ts | 94 | unknown | type-level | const walk = (node: unknown, path: (string | numbe |
| src\utils\presignUrl.ts | 96 | object | type-level | if (typeof node !== 'object') return; |
| src\utils\presignUrl.ts | 97 | object | type-level | if (visited.has(node as object)) return; |
| src\utils\presignUrl.ts | 98 | object | type-level | visited.add(node as object); |
| src\utils\presignUrl.ts | 102 | object | type-level | : Object.entries(node as object); |
| src\utils\presignUrl.ts | 108 | object | type-level | } else if (val && typeof val === 'object') { |
| src\utils\presignUrl.ts | 132 | unknown | type-level | let target: unknown = clone; |
| src\utils\presignUrl.ts | 134 | unknown | type-level | target = (target as Record<string | number, unknow |
| src\utils\presignUrl.ts | 137 | unknown | type-level | (target as Record<string | number, unknown>)[lastK |
| src\utils\sanitizeHtml.ts | 3 | object | type-level | * Strips dangerous elements (script, iframe, objec |
| src\utils\sanitizeHtml.ts | 15 | object | type-level | doc.querySelectorAll('script,style,iframe,object,e |
| src\utils\transformers.ts | 10 | object | type-level | type GenericMap = object; |
| src\utils\transformers.ts | 50 | unknown | type-level | const asMap = (value: unknown): GenericMap | null  |
| src\utils\transformers.ts | 51 | object | type-level | if (!value || typeof value !== 'object') return nu |
| src\utils\transformers.ts | 55 | unknown | type-level | export const transformQuestion = (q: unknown): Que |
| src\utils\transformers.ts | 79 | unknown | type-level | export const transformQuestionGroup = (group: unkn |
| src\utils\transformers.ts | 80 | unknown | type-level | const map = asMap(group) as (Partial<QuestionGroup |
| src\utils\transformers.ts | 93 | unknown | type-level | export const transformInterviewSession = (session: |
| src\utils\transformers.ts | 143 | unknown | type-level | export const transformJobPost = (job: unknown): Jo |
| src\utils\transformers.ts | 163 | unknown | type-level | export const transformAppliedResume = (resume: unk |
| src\utils\__tests__\camelCase.test.ts | 10 | object | type-level | it('converts single object correctly', () => { |
| src\utils\__tests__\camelCase.test.ts | 22 | object | type-level | it('converts nested objects correctly', () => { |
| src\utils\__tests__\camelCase.test.ts | 28 | object | type-level | it('ignores Date, File, and Blob objects', () => { |
| src\utils\__tests__\camelCase.test.ts | 47 | object | type-level | it('converts single object correctly', () => { |
| src\utils\__tests__\camelCase.test.ts | 59 | object | type-level | it('converts nested objects correctly', () => { |
| src\utils\__tests__\camelCase.test.ts | 65 | object | type-level | it('ignores Date, File, Blob, and FormData objects |
| src\utils\__tests__\params.test.ts | 25 | object | type-level | it('handles null/undefined param object gracefully |
| src\utils\__tests__\presignUrl.test.ts | 41 | object | type-level | expect(axios.get).toHaveBeenCalledWith('/api/commo |
| src\utils\__tests__\presignUrl.test.ts | 59 | object | type-level | it('returns non-object values as is', async () =>  |
| src\utils\__tests__\presignUrl.test.ts | 78 | object | type-level | it('presigns urls inside a deep object', async ()  |
| src\views\adminPages\BannersPage\hooks\useBanners.ts | 33 | unknown | type-level | onError: (err: Error | unknown) => { |
| src\views\adminPages\BannersPage\hooks\useBanners.ts | 46 | unknown | type-level | onError: (err: Error | unknown) => { |
| src\views\adminPages\BannersPage\hooks\useBanners.ts | 58 | unknown | type-level | onError: (err: Error | unknown) => { |
| src\views\adminPages\BannersPage\index.tsx | 144 | unknown | type-level | const handleInputChange = (name: keyof BannerFormD |
| src\views\adminPages\BannersPage\index.tsx | 231 | object | type-level | sx={{ width: 120, height: 60, objectFit: 'cover',  |
| src\views\adminPages\BannersPage\index.tsx | 246 | object | type-level | sx={{ width: 60, height: 60, objectFit: 'cover', b |
| src\views\adminPages\BannersPage\index.tsx | 375 | object | type-level | sx={{ width: '100%', maxHeight: 150, objectFit: 'c |
| src\views\adminPages\BannersPage\index.tsx | 402 | object | type-level | sx={{ width: 200, maxHeight: 150, objectFit: 'cont |
| src\views\adminPages\CareersPage\hooks\useCareers.ts | 33 | unknown | type-level | onError: (err: Error | unknown) => { |
| src\views\adminPages\CareersPage\hooks\useCareers.ts | 45 | unknown | type-level | onError: (err: Error | unknown) => { |
| src\views\adminPages\CareersPage\hooks\useCareers.ts | 57 | unknown | type-level | onError: (err: Error | unknown) => { |
| src\views\adminPages\CompaniesPage\hooks\useCompanies.ts | 53 | unknown | type-level | onError: (err: Error | unknown) => { |
| src\views\adminPages\CompaniesPage\hooks\useCompanies.ts | 65 | unknown | type-level | onError: (err: Error | unknown) => { |
| src\views\adminPages\CompaniesPage\hooks\useCompanies.ts | 77 | unknown | type-level | onError: (err: Error | unknown) => { |
| src\views\adminPages\CompaniesPage\index.tsx | 31 | unknown | type-level | const toNumberOrNull = (value: unknown): number |  |
| src\views\adminPages\DistrictsPage\hooks\useDistricts.ts | 34 | unknown | type-level | onError: (err: Error | unknown) => { |
| src\views\adminPages\DistrictsPage\hooks\useDistricts.ts | 46 | unknown | type-level | onError: (err: Error | unknown) => { |
| src\views\adminPages\DistrictsPage\hooks\useDistricts.ts | 58 | unknown | type-level | onError: (err: Error | unknown) => { |
| src\views\adminPages\DistrictsPage\index.tsx | 83 | object | type-level | city: district.city ? Number(typeof district.city  |
| src\views\adminPages\FeedbacksPage\hooks\useFeedbacks.ts | 32 | unknown | type-level | onError: (err: Error | unknown) => { |
| src\views\adminPages\FeedbacksPage\hooks\useFeedbacks.ts | 44 | unknown | type-level | onError: (err: Error | unknown) => { |
| src\views\adminPages\FeedbacksPage\index.tsx | 70 | object | type-level | sx={{ width: 32, height: 32, borderRadius: '50%',  |
| src\views\adminPages\InterviewsPage\components\InterviewTable.tsx | 54 | unknown | type-level | const getStatusChip = useCallback((status: unknown |
| src\views\adminPages\InterviewsPage\components\InterviewTable.tsx | 70 | unknown | type-level | return <Chip label={(status || t('common.status.un |
| src\views\adminPages\InterviewsPage\components\InterviewTable.tsx | 74 | unknown | type-level | const getTypeChip = useCallback((type: unknown) => |
| src\views\adminPages\InterviewsPage\hooks\useInterviews.ts | 17 | unknown | type-level | refetchInterval: (query: { state: { data?: Paginat |
| src\views\adminPages\JobActivityPage\hooks\useJobActivities.ts | 32 | unknown | type-level | onError: (err: Error | unknown) => { |
| src\views\adminPages\JobActivityPage\hooks\useJobActivities.ts | 44 | unknown | type-level | onError: (err: Error | unknown) => { |
| src\views\adminPages\JobNotificationsPage\hooks\useJobNotifications.ts | 33 | unknown | type-level | onError: (err: Error | unknown) => { |
| src\views\adminPages\JobNotificationsPage\hooks\useJobNotifications.ts | 45 | unknown | type-level | onError: (err: Error | unknown) => { |
| src\views\adminPages\JobNotificationsPage\hooks\useJobNotifications.ts | 57 | unknown | type-level | onError: (err: Error | unknown) => { |
| src\views\adminPages\JobsPage\components\JobTable.tsx | 64 | unknown | type-level | return <Chip label={t('pages.jobs.table.status.unk |
| src\views\adminPages\JobsPage\components\JobTable.tsx | 99 | unknown | type-level | cell: (info: ReactTableCellContext<JobPostExt, unk |
| src\views\adminPages\JobsPage\components\JobTable.tsx | 105 | unknown | type-level | cell: (info: ReactTableCellContext<JobPostExt, unk |
| src\views\adminPages\JobsPage\index.tsx | 97 | unknown | type-level | default: return <Chip label={t('pages.jobs.status. |
| src\views\adminPages\ProfilesPage\hooks\useProfiles.ts | 33 | unknown | type-level | onError: (err: Error | unknown) => { |
| src\views\adminPages\ResumesPage\hooks\useResumes.ts | 33 | unknown | type-level | onError: (err: Error | unknown) => { |
| src\views\adminPages\ResumesPage\hooks\useResumes.ts | 45 | unknown | type-level | onError: (err: Error | unknown) => { |
| src\views\adminPages\ResumesPage\hooks\useResumes.ts | 57 | unknown | type-level | onError: (err: Error | unknown) => { |
| src\views\adminPages\UsersPage\hooks\useUsers.ts | 43 | unknown | type-level | onError: (error: unknown) => { |
| src\views\adminPages\UsersPage\hooks\useUsers.ts | 57 | unknown | type-level | onError: (error: unknown) => { |
| src\views\adminPages\UsersPage\hooks\useUsers.ts | 71 | unknown | type-level | onError: (error: unknown) => { |
| src\views\adminPages\WardsPage\hooks\useWards.ts | 35 | unknown | type-level | onError: (err: Error | unknown) => { |
| src\views\adminPages\WardsPage\hooks\useWards.ts | 47 | unknown | type-level | onError: (err: Error | unknown) => { |
| src\views\adminPages\WardsPage\hooks\useWards.ts | 59 | unknown | type-level | onError: (err: Error | unknown) => { |
| src\views\adminPages\WardsPage\index.tsx | 97 | object | type-level | district: typeof ward.district === 'object' ? (war |
| src\views\authPages\AdminLogin\index.tsx | 65 | object | type-level | objectFit: 'cover', |
| src\views\authPages\AdminLogin\index.tsx | 169 | unknown | type-level | } catch (error: unknown) { |
| src\views\components\auths\AccountCard\index.tsx | 51 | unknown | type-level | .catch((error: unknown) => { |
| src\views\components\auths\AccountCard\index.tsx | 71 | unknown | type-level | .catch((err: unknown) => { |
| src\views\components\auths\AccountCard\index.tsx | 74 | unknown | type-level | } catch (error: unknown) { |
| src\views\components\auths\AccountForm\index.tsx | 29 | object | type-level | const schema = yup.object().shape({ |
| src\views\components\auths\AvatarCard\index.tsx | 182 | object | type-level | objectFit: 'cover', |
| src\views\components\auths\EmployerLoginForm\index.tsx | 107 | object | type-level | const schema = yup.object().shape({ |
| src\views\components\auths\EmployerSignUpForm\index.tsx | 94 | object | type-level | const schema = yup.object().shape({ |
| src\views\components\auths\EmployerSignUpForm\index.tsx | 99 | object | type-level | company: yup.object().shape({ |
| src\views\components\auths\EmployerSignUpForm\index.tsx | 108 | object | type-level | location: yup.object().shape({ |
| src\views\components\auths\EmployerSignUpForm\index.tsx | 156 | object | type-level | if (err === 'company' && errValue && typeof errVal |
| src\views\components\auths\EmployerSignUpForm\index.tsx | 159 | object | type-level | if (companyErr === 'location' && typeof companyErr |
| src\views\components\auths\EmployerSignUpForm\index.tsx | 223 | object | type-level | if (!value || typeof value !== 'object' || !value. |
| src\views\components\auths\ForgotPasswordForm\index.tsx | 29 | object | type-level | const schema = yup.object().shape({ |
| src\views\components\auths\JobSeekerLoginForm\index.tsx | 107 | object | type-level | const schema = yup.object().shape({ |
| src\views\components\auths\JobSeekerSignUpForm\index.tsx | 119 | object | type-level | const schema = yup.object().shape({ |
| src\views\components\auths\PhoneOTPLoginForm\index.tsx | 53 | unknown | type-level | } catch (err: unknown) { |
| src\views\components\auths\PhoneOTPLoginForm\index.tsx | 65 | unknown | type-level | } catch (err: unknown) { |
| src\views\components\auths\ResetPasswordForm\index.tsx | 26 | object | type-level | const schema = yup.object().shape({ |
| src\views\components\auths\UpdatePasswordForm\index.tsx | 33 | object | type-level | const schema = yup.object().shape({ |
| src\views\components\defaults\FilterJobPostCard\index.tsx | 79 | unknown | type-level | const handleChangePage = (_event: React.ChangeEven |
| src\views\components\defaults\MainJobPostCard\index.tsx | 24 | unknown | type-level | const handleChangePage = (event: React.ChangeEvent |
| src\views\components\defaults\SuggestedJobPostCard\index.tsx | 57 | unknown | type-level | const handleChangePage = (event: React.ChangeEvent |
| src\views\components\employers\AIAnalysisDrawer\index.tsx | 78 | unknown | type-level | IconComponent: React.ElementType<SvgIconProps> | { |
| src\views\components\employers\AIAnalysisDrawer\index.tsx | 87 | object | type-level | (typeof Component === 'object' && |
| src\views\components\employers\AIAnalysisDrawer\index.tsx | 90 | unknown | type-level | typeof (Component as { render?: unknown }).render  |
| src\views\components\employers\AIAnalysisDrawer\index.tsx | 107 | unknown | type-level | const toSkillArray = (skills: unknown): string[] = |
| src\views\components\employers\AIAnalysisDrawer\index.tsx | 119 | unknown | type-level | const normalizeAiStatus = (status: unknown): JobPo |
| src\views\components\employers\AIAnalysisDrawer\index.tsx | 126 | unknown | type-level | const toStringOrStringArray = (value: unknown): st |
| src\views\components\employers\AIAnalysisDrawer\index.tsx | 268 | unknown | type-level | } catch (err: unknown) { |
| src\views\components\employers\AppliedResumeTable\SendEmailComponent.tsx | 59 | unknown | type-level | } catch (error: unknown) { |
| src\views\components\employers\CompanyCard\index.tsx | 28 | object | type-level | if (value && typeof value === 'object' && 'id' in  |
| src\views\components\employers\CompanyForm\index.tsx | 57 | object | type-level | const schema = yup.object().shape({ |
| src\views\components\employers\CompanyForm\index.tsx | 62 | object | type-level | location: yup.object().shape({ |
| src\views\components\employers\CompanyForm\index.tsx | 155 | object | type-level | if (!value || typeof value !== 'object' || !('plac |
| src\views\components\employers\CompanyImageCard\index.tsx | 144 | object | type-level | sx={{ width: '100%', height: '100%', objectFit: 'c |
| src\views\components\employers\InterviewCreateCard\index.tsx | 69 | object | type-level | /** Extract id from a field that may be a nested o |
| src\views\components\employers\InterviewCreateCard\index.tsx | 70 | unknown | type-level | const extractId = (field: unknown): string | numbe |
| src\views\components\employers\InterviewCreateCard\index.tsx | 71 | object | type-level | if (field != null && typeof field === 'object' &&  |
| src\views\components\employers\InterviewDetailCard\InterviewObserverDialog.tsx | 54 | unknown | type-level | ref: React.Ref<unknown>, |
| src\views\components\employers\InterviewDetailCard\InterviewObserverDialog.tsx | 81 | object | type-level | style={{ width: '100%', height: '100%', objectFit: |
| src\views\components\employers\InterviewDetailCard\InterviewObserverDialog.tsx | 120 | object | type-level | style={{ width: '100%', height: '100%', objectFit: |
| src\views\components\employers\InterviewDetailCard\InterviewRecordingCard.tsx | 64 | object | type-level | objectFit: 'contain' |
| src\views\components\employers\JobPostCard\index.tsx | 88 | object | type-level | city: (typeof resData.location?.city === 'object'  |
| src\views\components\employers\JobPostCard\index.tsx | 89 | object | type-level | district: (typeof resData.location?.district === ' |
| src\views\components\employers\JobPostForm\JobPostFormFields.tsx | 168 | unknown | type-level | <TextFieldAutoCompleteCustom name="location.addres |
| src\views\components\employers\JobPostForm\JobPostSchema.ts | 39 | object | type-level | yup.object().shape({ |
| src\views\components\employers\JobPostForm\JobPostSchema.ts | 56 | object | type-level | location: yup.object().shape({ |
| src\views\components\employers\ProfileCard\index.tsx | 36 | unknown | type-level | const handleChangePage = (_: React.ChangeEvent<unk |
| src\views\components\employers\QuestionBankCard\index.tsx | 129 | unknown | type-level | cell: ({ getValue }: { getValue: () => unknown })  |
| src\views\components\employers\SendMailCard\index.tsx | 44 | object | type-level | const schema = yup.object().shape({ |
| src\views\components\jobSeekers\AdvancedSkillCard\index.tsx | 140 | unknown | type-level | } catch (error: unknown) { |
| src\views\components\jobSeekers\AdvancedSkillCard\index.tsx | 172 | unknown | type-level | } catch (error: unknown) { |
| src\views\components\jobSeekers\AdvancedSkillCard\index.tsx | 214 | unknown | type-level | } catch (error: unknown) { |
| src\views\components\jobSeekers\AdvancedSkillCard\index.tsx | 240 | unknown | type-level | } catch (error: unknown) { |
| src\views\components\jobSeekers\AdvancedSkillCard\index.tsx | 286 | unknown | type-level | } catch (error: unknown) { |
| src\views\components\jobSeekers\AdvancedSkillCard\index.tsx | 397 | unknown | type-level | cell: (info: { getValue: () => unknown }) => ( |
| src\views\components\jobSeekers\AdvancedSkillForm\index.tsx | 43 | object | type-level | const schema = yup.object().shape({ |
| src\views\components\jobSeekers\AppliedJobCard\index.tsx | 71 | object | type-level | city: Number(typeof item.jobPost.location.city === |
| src\views\components\jobSeekers\AppliedJobCard\index.tsx | 93 | unknown | type-level | const handleChangePage = (event: React.ChangeEvent |
| src\views\components\jobSeekers\BoxProfile\index.tsx | 270 | object | type-level | objectFit: "cover", |
| src\views\components\jobSeekers\CertificateCard\index.tsx | 165 | unknown | type-level | } catch (error: unknown) { |
| src\views\components\jobSeekers\CertificateCard\index.tsx | 197 | unknown | type-level | } catch (error: unknown) { |
| src\views\components\jobSeekers\CertificateCard\index.tsx | 239 | unknown | type-level | } catch (error: unknown) { |
| src\views\components\jobSeekers\CertificateCard\index.tsx | 265 | unknown | type-level | } catch (error: unknown) { |
| src\views\components\jobSeekers\CertificateCard\index.tsx | 311 | unknown | type-level | } catch (error: unknown) { |
| src\views\components\jobSeekers\CertificateForm\index.tsx | 32 | object | type-level | const schema = yup.object().shape({ |
| src\views\components\jobSeekers\CompanyFollowedCard\index.tsx | 31 | unknown | type-level | const handleChangePage = (_event: React.ChangeEven |
| src\views\components\jobSeekers\CompanyViewedCard\index.tsx | 23 | unknown | type-level | const handleChangePage = (event: React.ChangeEvent |
| src\views\components\jobSeekers\CVCard\index.tsx | 111 | unknown | type-level | } catch (error: unknown) { |
| src\views\components\jobSeekers\CVCard\index.tsx | 186 | unknown | type-level | } catch (error: unknown) { |
| src\views\components\jobSeekers\CVForm\index.tsx | 32 | object | type-level | const schema = yup.object().shape({ |
| src\views\components\jobSeekers\EducationDetailCard\index.tsx | 165 | unknown | type-level | } catch (error: unknown) { |
| src\views\components\jobSeekers\EducationDetailCard\index.tsx | 195 | unknown | type-level | } catch (error: unknown) { |
| src\views\components\jobSeekers\EducationDetailCard\index.tsx | 235 | unknown | type-level | } catch (error: unknown) { |
| src\views\components\jobSeekers\EducationDetailCard\index.tsx | 261 | unknown | type-level | } catch (error: unknown) { |
| src\views\components\jobSeekers\EducationDetailCard\index.tsx | 307 | unknown | type-level | } catch (error: unknown) { |
| src\views\components\jobSeekers\EducationDetailForm\index.tsx | 45 | object | type-level | const schema = yup.object().shape({ |
| src\views\components\jobSeekers\ExperienceDetailCard\index.tsx | 166 | unknown | type-level | } catch (error: unknown) { |
| src\views\components\jobSeekers\ExperienceDetailCard\index.tsx | 200 | unknown | type-level | } catch (error: unknown) { |
| src\views\components\jobSeekers\ExperienceDetailCard\index.tsx | 240 | unknown | type-level | } catch (error: unknown) { |
| src\views\components\jobSeekers\ExperienceDetailCard\index.tsx | 266 | unknown | type-level | } catch (error: unknown) { |
| src\views\components\jobSeekers\ExperienceDetailCard\index.tsx | 312 | unknown | type-level | } catch (error: unknown) { |
| src\views\components\jobSeekers\ExperienceDetailForm\index.tsx | 45 | object | type-level | const schema = yup.object().shape({ |
| src\views\components\jobSeekers\GeneralInfoCard\index.tsx | 227 | unknown | type-level | } catch (error: unknown) { |
| src\views\components\jobSeekers\GeneralInfoCard\index.tsx | 276 | unknown | type-level | } catch (error: unknown) { |
| src\views\components\jobSeekers\GeneralInfoCard\index.tsx | 394 | object | type-level | {renderItem(t('jobSeeker:profile.fields.objective' |
| src\views\components\jobSeekers\GeneralInfoForm\index.tsx | 51 | object | type-level | const schema = yup.object().shape({ |
| src\views\components\jobSeekers\GeneralInfoForm\index.tsx | 173 | object | type-level | .required(t('jobSeeker:profile.validation.objectiv |
| src\views\components\jobSeekers\GeneralInfoForm\index.tsx | 175 | object | type-level | .max(800, t('jobSeeker:profile.validation.objectiv |
| src\views\components\jobSeekers\GeneralInfoForm\index.tsx | 549 | object | type-level | title={t('jobSeeker:profile.fields.objective')} |
| src\views\components\jobSeekers\GeneralInfoForm\index.tsx | 553 | object | type-level | placeholder={t('jobSeeker:profile.placeholders.obj |
| src\views\components\jobSeekers\hooks\useJobSeekerQueries.ts | 200 | unknown | type-level | onSuccess: (response: unknown) => { |
| src\views\components\jobSeekers\JobPostNotificationCard\index.tsx | 39 | unknown | type-level | const handleChangePage = (event: React.ChangeEvent |
| src\views\components\jobSeekers\JobPostNotificationForm\index.tsx | 49 | object | type-level | const schema = yup.object().shape({ |
| src\views\components\jobSeekers\LanguageSkillCard\index.tsx | 147 | unknown | type-level | } catch (error: unknown) { |
| src\views\components\jobSeekers\LanguageSkillCard\index.tsx | 179 | unknown | type-level | } catch (error: unknown) { |
| src\views\components\jobSeekers\LanguageSkillCard\index.tsx | 221 | unknown | type-level | } catch (error: unknown) { |
| src\views\components\jobSeekers\LanguageSkillCard\index.tsx | 247 | unknown | type-level | } catch (error: unknown) { |
| src\views\components\jobSeekers\LanguageSkillCard\index.tsx | 293 | unknown | type-level | } catch (error: unknown) { |
| src\views\components\jobSeekers\LanguageSkillForm\index.tsx | 47 | object | type-level | const schema = yup.object().shape({ |
| src\views\components\jobSeekers\PersonalInfoCard\index.tsx | 151 | unknown | type-level | } catch (error: unknown) { |
| src\views\components\jobSeekers\PersonalInfoCard\index.tsx | 185 | unknown | type-level | } catch (error: unknown) { |
| src\views\components\jobSeekers\PersonalInfoCard\index.tsx | 422 | object | type-level | city: typeof profile.location?.city === 'object' |
| src\views\components\jobSeekers\PersonalInfoCard\index.tsx | 425 | object | type-level | district: typeof profile.location?.district === 'o |
| src\views\components\jobSeekers\PersonalProfileForm\index.tsx | 65 | object | type-level | const schema = yup.object().shape({ |
| src\views\components\jobSeekers\PersonalProfileForm\index.tsx | 67 | object | type-level | user: yup.object().shape({ |
| src\views\components\jobSeekers\PersonalProfileForm\index.tsx | 127 | object | type-level | location: yup.object().shape({ |
| src\views\components\jobSeekers\PersonalProfileForm\index.tsx | 253 | unknown | type-level | const results = (Array.isArray(resData) ? resData  |
| src\views\components\jobSeekers\ProfileUpload\index.tsx | 105 | unknown | type-level | } catch (error: unknown) { |
| src\views\components\jobSeekers\ProfileUpload\index.tsx | 141 | unknown | type-level | } catch (error: unknown) { |
| src\views\components\jobSeekers\ProfileUpload\index.tsx | 182 | unknown | type-level | } catch (error: unknown) { |
| src\views\components\jobSeekers\ProfileUpload\index.tsx | 222 | unknown | type-level | } catch (error: unknown) { |
| src\views\components\jobSeekers\ProfileUploadForm\index.tsx | 55 | object | type-level | const schema = yup.object().shape({ |
| src\views\components\jobSeekers\ProfileUploadForm\index.tsx | 189 | object | type-level | .required(t('jobSeeker:profile.validation.objectiv |
| src\views\components\jobSeekers\ProfileUploadForm\index.tsx | 191 | object | type-level | .max(800, t('jobSeeker:profile.validation.objectiv |
| src\views\components\jobSeekers\ProfileUploadForm\index.tsx | 545 | object | type-level | title={t('jobSeeker:profile.fields.objective')} |
| src\views\components\jobSeekers\ProfileUploadForm\index.tsx | 549 | object | type-level | placeholder={t('jobSeeker:profile.placeholders.obj |
| src\views\components\jobSeekers\SavedJobCard\index.tsx | 42 | unknown | type-level | const handleChangePage = (event: React.ChangeEvent |
| src\views\components\jobSeekers\SidebarProfile\index.tsx | 36 | object | type-level | objectFit: 'cover', |
| src\views\components\settings\SettingForm\index.tsx | 20 | object | type-level | const schema = yup.object().shape({ |
| src\views\defaultPages\HomePage\index.tsx | 29 | object | type-level | // Next.js image imports return objects; extract s |
| src\views\defaultPages\JobDetailPage\index.tsx | 121 | object | type-level | location: (jobPostDetail.locationName || (typeof j |
| src\views\employerPages\EmployeesPage\index.tsx | 116 | unknown | type-level | onError: (error: unknown) => { |
| src\views\employerPages\EmployeesPage\index.tsx | 128 | unknown | type-level | onError: (error: unknown) => { |
| src\views\employerPages\EmployeesPage\index.tsx | 142 | unknown | type-level | onError: (error: unknown) => { |
| src\views\employerPages\EmployeesPage\index.tsx | 154 | unknown | type-level | onError: (error: unknown) => { |
| src\views\employerPages\EmployeesPage\index.tsx | 166 | unknown | type-level | onError: (error: unknown) => { |
| src\views\employerPages\InterviewPages\InterviewLivePage.tsx | 145 | unknown | type-level | const handleChangePage = (_event: unknown, newPage |
| src\views\employerPages\InterviewPages\InterviewLivePage.tsx | 282 | unknown | type-level | cell: ({ row }: ReactTableCellContext<InterviewSes |
| src\views\employerPages\InterviewPages\InterviewLivePage.tsx | 296 | unknown | type-level | cell: ({ getValue }: ReactTableCellContext<Intervi |
| src\views\employerPages\InterviewPages\InterviewLivePage.tsx | 301 | unknown | type-level | cell: ({ row }: ReactTableCellContext<InterviewSes |
| src\views\employerPages\InterviewPages\InterviewLivePage.tsx | 310 | unknown | type-level | cell: ({ getValue }: ReactTableCellContext<Intervi |
| src\views\employerPages\InterviewPages\InterviewLivePage.tsx | 319 | unknown | type-level | cell: ({ getValue }: ReactTableCellContext<Intervi |
| src\views\employerPages\InterviewPages\InterviewLivePage.tsx | 332 | unknown | type-level | cell: ({ row }: ReactTableCellContext<InterviewSes |
| src\views\interviewPages\InterviewSessionPage.tsx | 67 | unknown | type-level | const getErrorDetail = (err: unknown): string | nu |
| src\views\jobSeekerPages\MyInterviewsPage\hooks\useMyInterviews.ts | 25 | unknown | type-level | retry: (failureCount, error: unknown) => { |