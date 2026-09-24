'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  TextField,
  MenuItem,
  Chip,
  InputAdornment,
  CircularProgress,
  Divider,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import FormatQuoteOutlinedIcon from '@mui/icons-material/FormatQuoteOutlined';
import StarsOutlinedIcon from '@mui/icons-material/StarsOutlined';

import cvBuilderService from '@/services/cvBuilderService';
import { CVSuggestionRecord } from '@/types/cvBuilder';
import toastMessages from '@/utils/toastMessages';

interface AIAssistantTabProps {
  onApplyBio: (text: string) => void;
  onAddSkill?: (skillName: string) => void;
  onAddExperienceBullet?: (bullet: string) => void;
}

const INDUSTRY_OPTIONS = [
  { value: 'all', label: 'Tất cả ngành nghề' },
  { value: 'IT', label: 'Công nghệ thông tin / Phần mềm' },
  { value: 'Marketing', label: 'Marketing & Truyền thông số' },
  { value: 'Sales', label: 'Kinh doanh & B2B Sales' },
  { value: 'Finance', label: 'Tài chính & Kế toán - Kiểm toán' },
  { value: 'HR', label: 'Nhân sự & Tuyển dụng - Đào tạo' },
  { value: 'Design', label: 'Thiết kế UI/UX & Đồ họa' },
  { value: 'ProjectManagement', label: 'Quản lý dự án & Scrum Master' },
  { value: 'Logistics', label: 'Xuất nhập khẩu & Logistics' },
  { value: 'CustomerService', label: 'Chăm sóc khách hàng / CSKH' },
  { value: 'Construction', label: 'Xây dựng & Quản lý dự án' },
  { value: 'RealEstate', label: 'Bất động sản & Phát triển kinh doanh' },
  { value: 'Architecture', label: 'Kiến trúc & Thiết kế nội thất' },
  { value: 'Engineering', label: 'Kỹ thuật & Cơ điện công trình - M&E' },
];

interface GeneratedAICity {
  bio: string;
  bullets: string[];
  skills: string[];
}

export const AIAssistantTab: React.FC<AIAssistantTabProps> = ({
  onApplyBio,
  onAddSkill,
  onAddExperienceBullet,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [addedSkillName, setAddedSkillName] = useState<string | null>(null);
  const [addedBulletIndex, setAddedBulletIndex] = useState<number | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // AI Generator state
  const [targetRole, setTargetRole] = useState<string>('Senior Frontend Developer');
  const [expYears, setExpYears] = useState<string>('3-5 năm');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedAI, setGeneratedAI] = useState<GeneratedAICity | null>(null);

  const { data: rawSuggestions = [], isLoading } = useQuery<CVSuggestionRecord[]>({
    queryKey: ['cv-suggestions', selectedIndustry, searchQuery],
    queryFn: () =>
      cvBuilderService.getSuggestions({
        industry: selectedIndustry === 'all' ? undefined : selectedIndustry,
        search: (searchQuery || '').trim() || undefined,
      }),
    staleTime: 5 * 60 * 1000,
  });

  const suggestions: CVSuggestionRecord[] = Array.isArray(rawSuggestions)
    ? rawSuggestions
    : Array.isArray((rawSuggestions as any)?.results)
    ? (rawSuggestions as any).results
    : [];

  const handleGenerateWithAI = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const role = (targetRole || '').trim() || 'Chuyên viên';
      const isFrontend = /frontend|web developer|react|vue|angular|front-end/i.test(role);
      const isBackend = /backend|back-end|python|java|golang|node\.?js|\.net|c#|kỹ sư backend/i.test(role);
      const isMobile = /mobile|ios|android|flutter|react native|app developer|di động/i.test(role);
      const isMarketing = /marketing|digital marketing|seo|content|growth|quảng cáo|truyền thông|copywriter/i.test(role);
      const isAccounting = /kế toán|kiểm toán|accountant|auditor|thuế|kế toán tổng hợp|kế toán trưởng/i.test(role);
      const isFinance = /tài chính|financial|phân tích tài chính|đầu tư|cfa|analyst/i.test(role);
      const isHR = /hr|nhân sự|tuyển dụng|recruiter|c&b|đào tạo|talent acquisition/i.test(role);
      const isSales = /sales|kinh doanh|bán hàng|b2b|phát triển thị trường|account executive/i.test(role);
      const isPM = /project manager|quản lý dự án|scrum master|pmo|product owner|agile coach/i.test(role);
      const isDesign = /ui|ux|thiết kế|designer|đồ họa|graphic|product design/i.test(role);
      const isConstruction = /xây dựng|kiến trúc|công trình|kỹ sư xây dựng|civil|mep|kết cấu/i.test(role);
      const isLogistics = /logistics|xuất nhập khẩu|xnk|chuỗi cung ứng|supply chain|forwarder|kho bãi/i.test(role);
      const isCSKH = /chăm sóc khách hàng|cskh|customer service|call center|hỗ trợ khách hàng|client support/i.test(role);

      let genBio = `Chuyên viên ${role} với ${expYears} kinh nghiệm chuyên sâu về tối ưu quy trình, quản trị mục tiêu và phát triển hiệu quả công việc. Tinh thần trách nhiệm cao, tư duy phân tích nhạy bén, luôn chủ động giải quyết vấn đề và đóng góp giá trị đo lường được cho tổ chức.`;
      let genBullets = [
        `• Hoạch định và triển khai các hạng mục trọng điểm cho vị trí ${role}, nâng cao hiệu suất làm việc nhóm lên 35%.`,
        `• Trực tiếp quản lý và tối ưu hóa quy trình làm việc, giảm thời gian xử lý thủ công 25% và tiết kiệm chi phí vận hành.`,
        `• Phối hợp liên phòng ban để hoàn thành 100% chỉ tiêu KPI đề ra, nhận đánh giá nhân sự xuất sắc từ cấp quản lý.`,
      ];
      let genSkills = ['Kỹ năng giao tiếp', 'Tư duy chiến lược', 'Giải quyết vấn đề', 'Quản lý thời gian', 'Làm việc nhóm', 'Thích ứng nhanh'];

      if (isFrontend) {
        genBio = `Lập trình viên Frontend với ${expYears} kinh nghiệm phát triển Single Page Applications - SPA, tối ưu giao diện Responsive và trải nghiệm người dùng Web/Mobile. Thành thạo React, Next.js, TypeScript, Tailwind CSS, có kinh nghiệm làm việc với RESTful/GraphQL API và tuân thủ các chuẩn Core Web Vitals khắt khe.`;
        genBullets = [
          `• Tái cấu trúc và tối ưu hóa hiệu năng website thương mại điện tử, cải thiện chỉ số LCP từ 4.2s xuống 1.1s và tăng điểm Google Lighthouse từ 58 lên 96/100.`,
          `• Xây dựng và duy trì thư viện UI Component / Design System dùng chung cho 4 sản phẩm, giảm 35% thời gian phát triển giao diện của toàn bộ team frontend.`,
          `• Tích hợp luồng xác thực OAuth2 và thanh toán trực tuyến xử lý hơn 50.000 giao dịch/ngày với tỷ lệ lỗi frontend dưới 0.05%.`,
        ];
        genSkills = ['React.js / Next.js', 'TypeScript', 'Tailwind CSS / MUI', 'Redux Toolkit / Zustand', 'RESTful API & GraphQL', 'Core Web Vitals', 'HTML5 / CSS3 / SCSS', 'Git & CI/CD'];
      } else if (isBackend) {
        genBio = `Kỹ sư Backend với ${expYears} kinh nghiệm thiết kế kiến trúc vi dịch vụ Microservices, xây dựng hệ thống API chịu tải cao và tối ưu cơ sở dữ liệu quy mô lớn. Nắm vững Clean Architecture, bảo mật dữ liệu OWASP, lập trình song song và tối ưu hóa hiệu năng hệ thống.`;
        genBullets = [
          `• Thiết kế kiến trúc Microservices xử lý lưu lượng đỉnh 12.000 request/giây với độ trễ phản hồi trung bình latency giảm từ 280ms xuống dưới 45ms.`,
          `• Tối ưu hóa các truy vấn CSDL phức tạp và triển khai tầng caching Redis đa lớp, giảm 60% tải CPU cho cụm cơ sở dữ liệu chính.`,
          `• Tự động hóa quy trình triển khai CI/CD với Docker và Kubernetes, rút ngắn chu kỳ release tính năng từ 2 tuần xuống còn 2 ngày.`,
        ];
        genSkills = ['Python / Django / FastAPI', 'Java / Spring Boot', 'Node.js / Express', 'PostgreSQL / MySQL', 'Redis Caching', 'Docker & Kubernetes', 'Kafka / RabbitMQ', 'Microservices Architecture'];
      } else if (isMobile) {
        genBio = `Lập trình viên Mobile với ${expYears} kinh nghiệm phát triển ứng dụng di động đa nền tảng Cross-platform và Native trên iOS/Android. Chú trọng độ mượt mà 60fps của animation, tối ưu mức tiêu thụ pin/bộ nhớ và quản lý vòng đời ứng dụng chuyên nghiệp.`;
        genBullets = [
          `• Phát triển và phát hành ứng dụng di động đạt hơn 250.000 lượt tải trên App Store & Google Play với điểm đánh giá trung bình duy trì ở mức 4.8/5 sao.`,
          `• Tối ưu dung lượng cài đặt ứng dụng từ 85MB xuống còn 28MB và giảm 40% tỷ lệ crash app xuống mức an toàn tuyệt đối dưới 0.1%.`,
          `• Tích hợp hệ thống Push Notification thông minh theo hành vi người dùng, tăng tỷ lệ người dùng hoạt động hàng ngày DAU lên 32%.`,
        ];
        genSkills = ['Flutter / Dart', 'React Native', 'Swift / iOS', 'Kotlin / Android', 'State Management BLoC - Redux', 'Firebase / Push Notification', 'RESTful API / WebSockets', 'App Store / Play Console Deploy'];
      } else if (isMarketing) {
        genBio = `Chuyên viên Digital Marketing với ${expYears} kinh nghiệm thực chiến trong việc lập chiến lược Marketing đa kênh, tối ưu phễu chuyển đổi và phát triển thương hiệu đa nền tảng. Sở hữu tư duy phân tích số liệu Data-Driven, thành thạo công cụ quảng cáo và tối ưu chi phí thu hút khách hàng.`;
        genBullets = [
          `• Quản lý ngân sách quảng cáo hơn 500 triệu đồng/tháng trên Meta Ads, Google Ads và TikTok Ads, mang lại mức ROAS trung bình 4.2x.`,
          `• Tối ưu hóa tỷ lệ chuyển đổi Landing Page CRO qua thử nghiệm A/B Testing, tăng tỷ lệ chuyển đổi từ 2.1% lên 4.8% và giảm chi phí CPA 30%.`,
          `• Xây dựng và thực thi chiến lược SEO Onpage/Offpage cho 150+ từ khóa lọt Top 3 Google, tăng lưu lượng Organic Search lên 180.000 lượt/tháng.`,
        ];
        genSkills = ['Digital Marketing Strategy', 'Google Ads & Meta Ads', 'SEO Onpage & Offpage', 'Content Strategy & Copywriting', 'Google Analytics 4 & Looker Studio', 'A/B Testing & CRO', 'Email Marketing Automation', 'TikTok Marketing'];
      } else if (isAccounting) {
        genBio = `Chuyên viên Kế toán với ${expYears} kinh nghiệm quản lý sổ sách, lập báo cáo tài chính, quyết toán thuế và kiểm soát nội bộ chi phí doanh nghiệp. Cẩn trọng, tỉ mỉ, thành thạo chuẩn mực kế toán VAS/IFRS và sử dụng nhuần nhuyễn các phần mềm kế toán hiện đại.`;
        genBullets = [
          `• Trực tiếp lập và kiểm soát toàn bộ Báo cáo tài chính năm, quyết toán thuế TNDN, TNCN và GTGT đạt độ chính xác 100% không phát sinh phạt thuế.`,
          `• Rà soát định mức chi phí định kỳ và tái cấu trúc quy trình thanh toán nội bộ, giúp doanh nghiệp tiết kiệm 12% chi phí vận hành hàng quý.`,
          `• Triển khai chuyển đổi và số hóa hệ thống hóa đơn điện tử và phần mềm ERP kế toán, rút ngắn 40% thời gian đối soát công nợ cuối tháng.`,
        ];
        genSkills = ['Kế toán tổng hợp', 'Báo cáo tài chính & Thuế', 'Phần mềm MISA / FAST / SAP', 'Chuẩn mực kế toán VAS & IFRS', 'Quyết toán thuế TNCN/TNDN/GTGT', 'Excel tài chính nâng cao', 'Kiểm soát nội bộ', 'Đối soát công nợ'];
      } else if (isFinance) {
        genBio = `Chuyên viên Phân tích Tài chính với ${expYears} kinh nghiệm xây dựng mô hình định giá DCF - Multiples, thẩm định dự án đầu tư và phân tích chỉ số tài chính doanh nghiệp. Khả năng phân tích định lượng xuất sắc, nhạy bén với diễn biến thị trường vốn và quản trị rủi ro.`;
        genBullets = [
          `• Xây dựng mô hình tài chính động Financial Modeling thẩm định 8 dự án M&A quy mô vốn 120 tỷ đồng, hỗ trợ ban lãnh đạo đưa ra quyết định đầu tư chuẩn xác.`,
          `• Hoàn thiện hệ thống báo cáo Dashboard theo dõi dòng tiền lưu chuyển hàng tuần, cải thiện độ chính xác dự báo ngân sách lên 94%.`,
          `• Phân tích cơ cấu chi phí vốn WACC và đề xuất phương án tối ưu nợ vay, giúp giảm chi phí lãi vay cho tập đoàn 1.8 tỷ đồng/năm.`,
        ];
        genSkills = ['Financial Modeling & Valuation', 'Thẩm định dự án đầu tư', 'Phân tích báo cáo tài chính', 'Quản trị dòng tiền & Ngân sách', 'Power BI & Advanced Excel', 'Quản trị rủi ro tài chính', 'Thị trường vốn & M&A', 'Trình bày dữ liệu thuyết trình'];
      } else if (isHR) {
        genBio = `Chuyên viên Nhân sự HR với ${expYears} kinh nghiệm toàn diện về tuyển dụng nhân tài Talent Acquisition, xây dựng chính sách C&B và phát triển văn hóa gắn kết doanh nghiệp. Khéo léo trong giao tiếp, thấu hiểu tâm lý nhân sự và tư duy gắn kết mục tiêu nhân sự với chiến lược kinh doanh.`;
        genBullets = [
          `• Lập kế hoạch và tuyển dụng thành công 120+ nhân sự chất lượng cao cho các khối Tech, Sales và Vận hành, rút ngắn Time-to-Hire từ 45 ngày xuống 22 ngày.`,
          `• Cải tiến quy trình Onboarding và chương trình đào tạo nội bộ, tăng tỷ lệ ứng viên vượt qua thử việc từ 78% lên 93%.`,
          `• Tổ chức khảo sát đo lường mức độ gắn kết eNPS định kỳ, đề xuất chính sách phúc lợi linh hoạt giúp giảm tỷ lệ nhân viên nghỉ việc Turnover Rate 18%.`,
        ];
        genSkills = ['Talent Acquisition & Sourcing', 'Phỏng vấn & Đánh giá năng lực STAR', 'Chính sách C&B & Luật lao động', 'Văn hóa doanh nghiệp & eNPS', 'Onboarding & Đào tạo nội bộ', 'KPIs & OKRs', 'Quản trị phần mềm HRM', 'Quan hệ lao động'];
      } else if (isSales) {
        genBio = `Chuyên viên Phát triển Kinh doanh / B2B Sales với ${expYears} kinh nghiệm mở rộng thị trường, đàm phán hợp đồng thương mại lớn và duy trì quan hệ đối tác chiến lược. Tinh thần chiến binh hướng tới mục tiêu doanh số, kỹ năng chốt sales thuyết phục và giải quyết vấn đề linh hoạt.`;
        genBullets = [
          `• Đạt và vượt chỉ tiêu doanh số liên tục 6 quý với tỷ lệ hoàn thành 125% - 145% KPI, mang lại doanh thu thuần 8.5 tỷ đồng trong năm gần nhất.`,
          `• Thiết lập và phát triển quan hệ với 40+ khách hàng doanh nghiệp B2B lớn, tăng giá trị trung bình mỗi hợp đồng lên 35%.`,
          `• Xây dựng quy trình chăm sóc sau bán hàng chuyên nghiệp, nâng tỷ lệ khách hàng tái ký hợp đồng Retention Rate lên 88%.`,
        ];
        genSkills = ['B2B & B2C Sales', 'Kỹ năng đàm phán thương mại', 'CRM Salesforce - HubSpot', 'Thuyết trình & Pitching giải pháp', 'Khai thác & Tìm kiếm khách hàng Lead Gen', 'Xây dựng mối quan hệ đối tác', 'Chăm sóc khách hàng sau bán', 'Quản lý phễu bán hàng Pipeline'];
      } else if (isPM) {
        genBio = `Quản lý Dự án Project Manager - Scrum Master với ${expYears} kinh nghiệm điều phối các dự án công nghệ và chuyển đổi số theo phương pháp Agile/Scrum và Waterfall. Nắm vững kỹ năng quản trị tiến độ, kiểm soát phạm vi Scope, tối ưu nguồn lực và quản trị rủi ro dự án.`;
        genBullets = [
          `• Quản lý và điều phối 15+ thành viên cross-functional hoàn thành đúng hạn 100% các mốc bàn giao dự án trọng điểm với mức tiết kiệm chi phí 8% so với ngân sách.`,
          `• Áp dụng chuẩn quy trình Scrum Sprint 2 tuần và cải tiến luồng Retro/Planning, giúp nâng cao vận tốc hoàn thành công việc Team Velocity lên 28%.`,
          `• Xây dựng ma trận quản trị rủi ro rà soát định kỳ hàng tuần, chủ động xử lý 100% các điểm nghẽn Blockers phát sinh trước kỳ bàn giao nghiệm thu.`,
        ];
        genSkills = ['Agile & Scrum Framework', 'Quản trị tiến độ & Rủi ro', 'Jira / Confluence / Trello', 'Quản lý ngân sách dự án Budgeting', 'Điều phối nhóm Cross-functional', 'Giao tiếp các bên liên quan Stakeholder Management', 'Chứng chỉ PMP / PMI-ACP / CSM', 'Tối ưu quy trình làm việc'];
      } else if (isDesign) {
        genBio = `Chuyên viên Thiết kế UI/UX & Sản phẩm với ${expYears} kinh nghiệm nghiên cứu người dùng, xây dựng Design System và thiết kế giao diện ứng dụng web/mobile trực quan, hiện đại. Tư duy thiết kế lấy người dùng làm trung tâm User-Centered Design, thẩm mỹ tinh tế và phối hợp nhịp nhàng với đội ngũ phát triển sản phẩm.`;
        genBullets = [
          `• Nghiên cứu và tái thiết kế luồng thanh toán Checkout cho ứng dụng di động, giúp tăng tỷ lệ hoàn tất đơn hàng lên 24% và giảm tỷ lệ bỏ giỏ hàng 18%.`,
          `• Xây dựng Design System toàn diện với 350+ components chuẩn Accessibility WCAG 2.1, tăng tốc độ ra mắt giao diện mới của team lên gấp 2 lần.`,
          `• Thực hiện 30+ buổi Usability Testing và phỏng vấn người dùng thực tế, phát hiện và khắc phục 15 điểm ma sát Pain points lớn trong sản phẩm.`,
        ];
        genSkills = ['Figma & FigJam', 'UI/UX Design Systems', 'User Research & Usability Testing', 'Wireframing & Prototyping', 'Adobe Photoshop & Illustrator', 'Micro-interactions & Animation', 'Chuẩn Accessibility WCAG', 'Thiết kế Responsive Đa nền tảng'];
      } else if (isConstruction) {
        genBio = `Kỹ sư Xây dựng / Kiến trúc sư với ${expYears} kinh nghiệm tham gia thiết kế, giám sát thi công và quản lý chất lượng các công trình dân dụng & thương mại cao tầng. Nắm vững quy chuẩn xây dựng Việt Nam TCVN và quốc tế, thành thạo phần mềm BIM/AutoCAD, cam kết an toàn lao động tuyệt đối.`;
        genBullets = [
          `• Giám sát thi công kết cấu và hoàn thiện gói thầu 80 tỷ đồng, bàn giao đúng tiến độ cam kết và được chủ đầu tư đánh giá đạt chuẩn chất lượng xuất sắc.`,
          `• Rà soát hồ sơ thiết kế kỹ thuật thi công, đề xuất phương án cải tiến biện pháp thi công giúp tiết kiệm 7% tổng chi phí vật tư bê tông cốt thép.`,
          `• Kiểm soát nghiêm ngặt 100% công tác an toàn lao động và vệ sinh môi trường trên đại công trường với hơn 200 công nhân, duy trì kỷ lục Zero Accident.`,
        ];
        genSkills = ['AutoCAD & Revit BIM', 'Bóc tách khối lượng & Dự toán', 'Giám sát thi công công trình', 'Tiêu chuẩn xây dựng TCVN & Eurocodes', 'An toàn lao động HSE', 'Nghiệm thu & Hồ sơ hoàn công', 'Phần mềm MS Project / Primavera', 'Đọc và thẩm tra bản vẽ kết cấu'];
      } else if (isLogistics) {
        genBio = `Chuyên viên Xuất nhập khẩu & Logistics với ${expYears} kinh nghiệm xử lý thủ tục hải quan, điều phối vận tải đa phương thức quốc tế và tối ưu hóa chi phí chuỗi cung ứng. Nắm vững Incoterms 2020, quy định xuất nhập khẩu hiện hành và kỹ năng đàm phán cước tàu, kho bãi hiệu quả.`;
        genBullets = [
          `• Điều phối thành công hơn 400 lô hàng đường biển FCL/LCL và hàng không hàng năm, đảm bảo 98.5% chuyến hàng thông quan đúng hạn.`,
          `• Đàm phán giá cước và phụ phí vận chuyển với các hãng tàu & đại lý Forwarder lớn, giúp doanh nghiệp tiết kiệm 14% chi phí logistics tổng thể.`,
          `• Tối ưu quy trình khai báo hải quan điện tử qua hệ thống VNACCS/VCIS, rút ngắn thời gian giải phóng hàng tại cảng từ 3 ngày xuống còn 24 giờ.`,
        ];
        genSkills = ['Incoterms 2020 & Hợp đồng ngoại thương', 'Thủ tục hải quan & Hệ thống VNACCS/VCIS', 'Chứng từ xuất nhập khẩu B/L, C/O, L/C, Inv, PKL', 'Quản lý kho bãi & Hàng tồn kho', 'Đàm phán cước vận tải Quốc tế', 'Logistics & Chuỗi cung ứng', 'Tiếng Anh thương mại', 'Quản trị rủi ro vận tải'];
      } else if (isCSKH) {
        genBio = `Chuyên viên Chăm sóc Khách hàng CSKH với ${expYears} kinh nghiệm xử lý khiếu nại, tư vấn dịch vụ và nâng cao độ hài lòng của khách hàng CSAT. Giọng nói truyền cảm, kiên nhẫn lắng nghe, xử lý tình huống khéo léo dưới áp lực cao và có tinh thần phụng sự khách hàng vượt trội.`;
        genBullets = [
          `• Tiếp nhận và xử lý trung bình 75+ yêu cầu/khiếu nại mỗi ngày qua đa kênh Hotline, Livechat, Email, duy trì điểm hài lòng khách hàng CSAT ở mức 96%.`,
          `• Giải quyết thành công 92% khiếu nại phát sinh ngay trong lần liên hệ đầu tiên First Contact Resolution - FCR, giảm thời gian xử lý sự vụ 25%.`,
          `• Chủ động khảo sát và thu thập phản hồi của 500+ khách hàng định kỳ, đóng góp 12 sáng kiến cải tiến dịch vụ giúp tăng tỷ lệ khách hàng quay lại 20%.`,
        ];
        genSkills = ['Kỹ năng giao tiếp & Lắng nghe tích cực', 'Xử lý khiếu nại & Khủng hoảng', 'Chỉ số CSAT / NPS / FCR', 'Phần mềm CRM & Tổng đài ảo Zendesk, Freshdesk', 'Tư vấn và Upsell dịch vụ', 'Kiểm soát cảm xúc & Tư duy dịch vụ', 'Làm việc theo ca & Đa nhiệm', 'Kỹ năng viết email CSKH chuyên nghiệp'];
      }

      setGeneratedAI({
        bio: genBio,
        bullets: genBullets,
        skills: genSkills,
      });
      setIsGenerating(false);
      toastMessages.success('AI đã tạo xong gợi ý mục tiêu & kinh nghiệm chuẩn ATS!');
    }, 600);
  };

  const handleCopy = (text: string, index: number) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch((err) => {
        console.warn('Clipboard writeText error:', err);
      });
    }
    setCopiedIndex(index);
    toastMessages.success('Đã sao chép vào bộ nhớ tạm!');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSkillClick = (skillName: string) => {
    const cleanSkill = (skillName || '').replace(/^\+\s*/, '').trim();
    if (!cleanSkill) return;
    if (onAddSkill) {
      onAddSkill(cleanSkill);
      setAddedSkillName(cleanSkill);
      setTimeout(() => setAddedSkillName(null), 2500);
    } else {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(cleanSkill).catch((err) => {
          console.warn('Clipboard writeText error:', err);
        });
      }
      toastMessages.success(`Đã sao chép kỹ năng "${cleanSkill}"!`);
    }
  };

  const handleAddBulletClick = (bullet: string, index: number) => {
    const cleanBullet = (bullet || '').trim();
    if (!cleanBullet) return;
    if (onAddExperienceBullet) {
      onAddExperienceBullet(cleanBullet);
      setAddedBulletIndex(index);
      setTimeout(() => setAddedBulletIndex(null), 2500);
    } else {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(cleanBullet).catch((err) => {
          console.warn('Clipboard writeText error:', err);
        });
      }
      toastMessages.success('Đã sao chép mô tả thành tích!');
    }
  };

  const handleApplySampleItem = (item: CVSuggestionRecord) => {
    const type = item?.suggestion_type || item?.suggestionType;
    const content = (item?.content || '').trim();
    const title = (item?.title || '').toLowerCase();

    if (type === 'experience' || content.startsWith('•') || title.includes('kinh nghiệm') || title.includes('thành tích')) {
      if (onAddExperienceBullet) {
        onAddExperienceBullet(content);
        toastMessages.success('Đã thêm nội dung vào mục Kinh nghiệm!');
      } else {
        onApplyBio(content);
        toastMessages.success('Đã áp dụng vào hồ sơ CV!');
      }
    } else if (type === 'skills' || title.includes('kỹ năng') || title.includes('chuyên môn')) {
      if (Array.isArray(item?.skills_list) && item.skills_list.length > 0) {
        item.skills_list.forEach((sk) => onAddSkill?.(sk));
        toastMessages.success(`Đã thêm ${item.skills_list.length} kỹ năng vào CV!`);
      } else {
        const parsed = content.split(/[,;\n•]+/).map((s) => s.trim()).filter(Boolean);
        parsed.forEach((sk) => onAddSkill?.(sk));
        toastMessages.success(`Đã thêm ${parsed.length} kỹ năng vào CV!`);
      }
    } else {
      // Default: bio / summary
      onApplyBio(content);
      toastMessages.success('Đã áp dụng tóm tắt vào hồ sơ CV!');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* -- AI Generator Interactive Box ------------------------------------ */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: '16px',
          bgcolor: '#f8fafc',
          border: '1.5px solid #cbd5e1',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Box sx={{ p: 0.75, borderRadius: '8px', bgcolor: '#7c3aed', color: '#ffffff', display: 'flex' }}>
            <AutoAwesomeOutlinedIcon sx={{ fontSize: 18 }} />
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.875rem' }}>
              Trợ Lý AI Tạo Tóm Tắt & Mô Tả Công Việc
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.725rem' }}>
              Nhập chức danh của bạn để AI tự động biên soạn đoạn tóm tắt và các thành tích kèm số liệu KPI chuẩn ATS.
            </Typography>
          </Box>
        </Stack>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr' }, gap: 1.5 }}>
          <TextField
            size="small"
            label="Chức danh / Vị trí mục tiêu"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="VD: Senior React Developer, Marketing Manager..."
            fullWidth
            sx={{ bgcolor: '#ffffff' }}
          />
          <TextField
            select
            size="small"
            label="Kinh nghiệm"
            value={expYears}
            onChange={(e) => setExpYears(e.target.value)}
            sx={{ bgcolor: '#ffffff' }}
          >
            <MenuItem value="Chưa có kinh nghiệm">Mới tốt nghiệp / Fresher</MenuItem>
            <MenuItem value="1-2 năm">1 - 2 năm</MenuItem>
            <MenuItem value="3-5 năm">3 - 5 năm</MenuItem>
            <MenuItem value="Trên 5 năm">Trên 5 năm - Cấp độ Senior hoặc Lead</MenuItem>
          </TextField>
        </Box>

        <Button
          variant="contained"
          disabled={isGenerating}
          onClick={handleGenerateWithAI}
          startIcon={<BoltOutlinedIcon sx={{ fontSize: 18 }} />}
          sx={{
            bgcolor: '#7c3aed',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '0.8rem',
            borderRadius: '10px',
            textTransform: 'none',
            py: 1,
            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)',
            '&:hover': { bgcolor: '#6d28d9' },
          }}
        >
          {isGenerating ? 'AI đang biên soạn...' : 'Tạo gợi ý với AI'}
        </Button>

        {/* AI Generated Result Box */}
        {generatedAI && (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: '12px',
              bgcolor: '#ffffff',
              border: '1.5px solid #ddd6fe',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            {/* 1. Bio Generated */}
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <FormatQuoteOutlinedIcon sx={{ fontSize: 16, color: '#7c3aed' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#5b21b6', fontSize: '0.8rem' }}>
                    Tóm tắt nghề nghiệp đề xuất:
                  </Typography>
                </Stack>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => onApplyBio(generatedAI.bio)}
                  startIcon={<CheckCircleOutlineIcon sx={{ fontSize: 14 }} />}
                  sx={{
                    borderRadius: '8px',
                    bgcolor: '#7c3aed',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    textTransform: 'none',
                    py: 0.3,
                    px: 1.25,
                    '&:hover': { bgcolor: '#6d28d9' },
                  }}
                >
                  Áp dụng vào Tóm tắt
                </Button>
              </Stack>
              <Box sx={{ p: 1.5, bgcolor: '#f5f3ff', borderRadius: '8px', border: '1px solid #ede9fe' }}>
                <Typography variant="body2" sx={{ color: '#334155', fontSize: '0.775rem', lineHeight: 1.55 }}>
                  {generatedAI.bio}
                </Typography>
              </Box>
            </Box>

            {/* 2. Bullets Generated */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.8rem', mb: 1 }}>
                Mẫu mô tả thành tích kinh nghiệm (kèm KPI số liệu):
              </Typography>
              <Stack spacing={1}>
                {(generatedAI?.bullets || []).map((b, bIdx) => (
                  <Box
                    key={bIdx}
                    sx={{
                      p: 1.25,
                      bgcolor: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      justifyContent: 'space-between',
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      gap: 1,
                    }}
                  >
                    <Typography variant="body2" sx={{ color: '#334155', fontSize: '0.75rem', lineHeight: 1.45, flex: 1 }}>
                      {b}
                    </Typography>
                    <Stack direction="row" spacing={0.75} sx={{ shrink: 0, alignSelf: { xs: 'flex-end', sm: 'center' } }}>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleAddBulletClick(b, bIdx)}
                        startIcon={
                          addedBulletIndex === bIdx ? (
                            <CheckCircleOutlineIcon sx={{ fontSize: 13 }} />
                          ) : (
                            <AddCircleOutlineIcon sx={{ fontSize: 13 }} />
                          )
                        }
                        sx={{
                          fontSize: '0.675rem',
                          fontWeight: 700,
                          textTransform: 'none',
                          py: 0.3,
                          px: 1,
                          borderRadius: '6px',
                          bgcolor: addedBulletIndex === bIdx ? '#16a34a' : '#7c3aed',
                          color: '#ffffff',
                          boxShadow: '0 2px 4px rgba(124, 58, 237, 0.2)',
                          '&:hover': { bgcolor: addedBulletIndex === bIdx ? '#15803d' : '#6d28d9' },
                        }}
                      >
                        {addedBulletIndex === bIdx ? 'Đã thêm' : 'Thêm vào kinh nghiệm'}
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleCopy(b, 1000 + bIdx)}
                        startIcon={<ContentCopyOutlinedIcon sx={{ fontSize: 12 }} />}
                        sx={{
                          fontSize: '0.675rem',
                          fontWeight: 700,
                          textTransform: 'none',
                          py: 0.3,
                          px: 1,
                          borderRadius: '6px',
                          borderColor: '#cbd5e1',
                          color: '#475569',
                          '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' },
                        }}
                      >
                        {copiedIndex === 1000 + bIdx ? 'Đã chép' : 'Sao chép'}
                      </Button>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Box>

            {/* 3. Core Skills */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.8rem', mb: 0.75 }}>
                Kỹ năng trọng tâm chuẩn ATS (Bấm để thêm ngay vào CV):
              </Typography>
              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                {(generatedAI?.skills || []).map((s, sIdx) => {
                  const isAdded = addedSkillName === s;
                  return (
                    <Chip
                      key={sIdx}
                      label={isAdded ? `✓ Đã thêm: ${s}` : `+ ${s}`}
                      clickable
                      onClick={() => handleSkillClick(s)}
                      size="small"
                      sx={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        bgcolor: isAdded ? '#dcfce7' : '#ede9fe',
                        color: isAdded ? '#15803d' : '#6d28d9',
                        borderColor: isAdded ? '#86efac' : 'transparent',
                        borderRadius: '6px',
                        height: 24,
                        transition: 'all 0.2s',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: isAdded ? '#bbf7d0' : '#ddd6fe' },
                      }}
                    />
                  );
                })}
              </Stack>
            </Box>
          </Paper>
        )}
      </Paper>

      <Divider sx={{ my: 0.5, borderColor: '#e2e8f0' }}>
        <Chip label="Thư viện gợi ý mẫu theo ngành" size="small" sx={{ fontSize: '0.725rem', fontWeight: 600, color: '#64748b' }} />
      </Divider>

      {/* -- Filter & Search Toolbar ------------------------------------------- */}
      <Stack direction="row" spacing={1.5}>
        <TextField
          select
          size="small"
          value={selectedIndustry}
          onChange={(e) => setSelectedIndustry(e.target.value)}
          sx={{ width: 180, bgcolor: '#ffffff' }}
        >
          {INDUSTRY_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: '0.8rem' }}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          size="small"
          fullWidth
          placeholder="Tìm trong thư viện mẫu..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlinedIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
              </InputAdornment>
            ),
          }}
          sx={{ bgcolor: '#ffffff' }}
        />
      </Stack>

      {/* -- Suggestions List ---------------------------------------------- */}
      <Stack spacing={2}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={24} sx={{ color: '#2563eb' }} />
          </Box>
        ) : suggestions.length > 0 ? (
          suggestions.map((item, index) => {
            const isExp =
              item.suggestion_type === 'experience' ||
              item.suggestionType === 'experience' ||
              (item.content || '').startsWith('•') ||
              (item.title || '').toLowerCase().includes('kinh nghiệm');
            const isSkill =
              item.suggestion_type === 'skills' ||
              item.suggestionType === 'skills' ||
              (item.title || '').toLowerCase().includes('kỹ năng');

            return (
              <Paper
                key={item.id}
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  bgcolor: '#ffffff',
                  transition: 'border-color 0.2s',
                  '&:hover': { borderColor: '#93c5fd' },
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                }}
              >
                {/* Card Header & Action Buttons */}
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.85rem' }}>
                      {item.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#2563eb', fontWeight: 700, fontSize: '0.7rem' }}>
                      {item.industry_name}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1} sx={{ shrink: 0 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleCopy(item.content, index)}
                      startIcon={
                        copiedIndex === index ? (
                          <CheckCircleOutlineIcon sx={{ fontSize: 14, color: '#16a34a' }} />
                        ) : (
                          <ContentCopyOutlinedIcon sx={{ fontSize: 14 }} />
                        )
                      }
                      sx={{
                        borderRadius: '8px',
                        borderColor: '#cbd5e1',
                        color: copiedIndex === index ? '#16a34a' : '#475569',
                        fontWeight: 700,
                        fontSize: '0.725rem',
                        textTransform: 'none',
                        px: 1.25,
                        py: 0.4,
                        '&:hover': { bgcolor: '#f8fafc', borderColor: '#94a3b8' },
                      }}
                    >
                      {copiedIndex === index ? 'Đã chép' : 'Sao chép'}
                    </Button>

                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => handleApplySampleItem(item)}
                      startIcon={
                        isExp ? (
                          <AddCircleOutlineIcon sx={{ fontSize: 14 }} />
                        ) : (
                          <CheckCircleOutlineIcon sx={{ fontSize: 14 }} />
                        )
                      }
                      sx={{
                        borderRadius: '8px',
                        bgcolor: isExp ? '#7c3aed' : '#1e40af',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '0.725rem',
                        textTransform: 'none',
                        px: 1.5,
                        py: 0.4,
                        boxShadow: isExp
                          ? '0 2px 6px rgba(124, 58, 237, 0.25)'
                          : '0 2px 6px rgba(30, 64, 175, 0.25)',
                        '&:hover': { bgcolor: isExp ? '#6d28d9' : '#1d4ed8' },
                      }}
                    >
                      {isExp ? 'Thêm vào kinh nghiệm' : isSkill ? 'Thêm kỹ năng' : 'Áp dụng vào Tóm tắt'}
                    </Button>
                  </Stack>
                </Stack>

                {/* Content Body */}
                <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                  <Typography variant="body2" sx={{ color: '#334155', fontSize: '0.775rem', lineHeight: 1.5 }}>
                    {item.content}
                  </Typography>
                </Box>

                {/* Skills Chips */}
                {Array.isArray(item?.skills_list) && item.skills_list.length > 0 && (
                  <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                    {item.skills_list.map((skill, skIdx) => {
                      const isAdded = addedSkillName === skill;
                      return (
                        <Chip
                          key={skIdx}
                          label={isAdded ? `✓ Đã thêm: ${skill}` : `+ ${skill}`}
                          clickable
                          onClick={() => handleSkillClick(skill)}
                          size="small"
                          sx={{
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            bgcolor: isAdded ? '#dcfce7' : '#f1f5f9',
                            color: isAdded ? '#15803d' : '#475569',
                            borderRadius: '6px',
                            height: 22,
                            cursor: 'pointer',
                            '&:hover': { bgcolor: isAdded ? '#bbf7d0' : '#e2e8f0', color: '#1e293b' },
                          }}
                        />
                      );
                    })}
                  </Stack>
                )}
              </Paper>
            );
          })
        ) : (
          <Box sx={{ textAlign: 'center', py: 4, color: '#94a3b8', fontSize: '0.8rem' }}>
            Không tìm thấy gợi ý phù hợp.
          </Box>
        )}
      </Stack>
    </Box>
  );
};
