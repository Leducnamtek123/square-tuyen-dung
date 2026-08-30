import React, { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BusinessIcon from '@mui/icons-material/Business';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';

export interface EditorTemplateItem {
  id: string;
  category: 'company' | 'job_desc' | 'job_req' | 'benefits' | 'email' | 'article';
  title: string;
  description: string;
  tag: string;
  htmlContent: string;
}

const TEMPLATES: EditorTemplateItem[] = [
  // 1. Giới thiệu doanh nghiệp
  {
    id: 'comp_tech',
    category: 'company',
    title: 'Doanh nghiệp Công nghệ & Startup Đổi mới sáng tạo',
    description: 'Bố cục chuẩn cho công ty Product/Tech: Sứ mệnh, Sản phẩm cốt lõi, Công nghệ & Văn hóa Agile.',
    tag: 'Công nghệ / IT',
    htmlContent: `<h3>1. Về Chúng Tôi</h3>
<p>Chúng tôi là công ty công nghệ tiên phong trong việc phát triển các nền tảng kỹ thuật số và giải pháp phần mềm thông minh. Với sứ mệnh ứng dụng công nghệ để nâng cao chất lượng cuộc sống và hiệu quả kinh doanh của hàng triệu người dùng, chúng tôi không ngừng thúc đẩy ranh giới của sự đổi mới.</p>

<h3>2. Tầm Nhìn & Sứ Mệnh</h3>
<ul>
  <li><strong>Tầm nhìn:</strong> Trở thành hệ sinh thái công nghệ hàng đầu khu vực, được tin cậy bởi các đối tác toàn cầu.</li>
  <li><strong>Sứ mệnh:</strong> Đơn giản hóa các bài toán phức tạp thông qua các sản phẩm công nghệ tinh gọn, tốc độ và an toàn.</li>
</ul>

<h3>3. Giá Trị Cốt Lõi</h3>
<ul>
  <li><strong>Tư duy đột phá (Think Big):</strong> Không ngại thử thách những giới hạn mới.</li>
  <li><strong>Tốc độ & Chất lượng (Speed & Quality):</strong> Ra mắt nhanh, liên tục đo lường và hoàn thiện sản phẩm.</li>
  <li><strong>Minh bạch & Tin cậy (Transparency):</strong> Giao tiếp cởi mở và bảo vệ quyền lợi người dùng tối đa.</li>
</ul>

<h3>4. Môi Trường Làm Việc</h3>
<p>Văn hóa làm việc phẳng (Flat Organization), nơi mọi ý tưởng sáng tạo đều được lắng nghe và tôn trọng. Chúng tôi trao quyền tự chủ tối đa cùng các chương trình đào tạo chuyên sâu và lộ trình thăng tiến rõ ràng.</p>`,
  },
  {
    id: 'comp_corp',
    category: 'company',
    title: 'Tập đoàn Đa ngành / Doanh nghiệp Quy mô lớn',
    description: 'Chuẩn mực, trang trọng: Lịch sử hình thành, Hệ sinh thái hoạt động, Cam kết ESG và Giải thưởng.',
    tag: 'Tập đoàn / Doanh nghiệp',
    htmlContent: `<h3>1. Giới Thiệu Chung</h3>
<p>Được thành lập với bề dày kinh nghiệm và uy tín vững chắc trên thị trường, chúng tôi tự hào là tập đoàn hàng đầu hoạt động đa lĩnh vực. Bằng sự kết hợp giữa nội lực tài chính vững mạnh và đội ngũ nhân sự tinh hoa, chúng tôi liên tục khẳng định vị thế dẫn đầu qua các dự án tầm cỡ.</p>

<h3>2. Hệ Thống Tiêu Chuẩn & Chứng Nhận</h3>
<ul>
  <li>Hệ thống Quản lý Chất lượng đạt chuẩn quốc tế ISO 9001:2015.</li>
  <li>Cam kết phát triển bền vững theo các tiêu chuẩn môi trường - xã hội - quản trị (ESG).</li>
  <li>Được vinh danh trong Top 100 Nơi làm việc tốt nhất Việt Nam liên tiếp nhiều năm.</li>
</ul>

<h3>3. Cam Kết Đồng Hành</h3>
<p>Chúng tôi cam kết mang lại giá trị gia tăng tối đa cho cổ đông, khách hàng và cộng đồng xã hội; đồng thời xây dựng một môi trường làm việc công bằng, văn minh và đãi ngộ xứng tầm cho người lao động.</p>`,
  },
  {
    id: 'comp_agency',
    category: 'company',
    title: 'Công ty Dịch vụ / Agency Sáng tạo & Tư vấn',
    description: 'Năng động, giàu cảm hứng: Triết lý thiết kế/dịch vụ, Quy trình sáng tạo và Thành tựu.',
    tag: 'Agency / Dịch vụ',
    htmlContent: `<h3>1. Câu Chuyện Của Chúng Tôi</h3>
<p>Chúng tôi là ngôi nhà chung của những bộ óc sáng tạo, chiến lược gia tài năng và chuyên gia thiết kế tận tâm. Chúng tôi đồng hành cùng các thương hiệu trong việc kiến tạo những chiến dịch truyền cảm hứng và xây dựng dấu ấn thị giác độc bản.</p>

<h3>2. Triết Lý Làm Việc</h3>
<ul>
  <li><strong>Lắng nghe & Thấu cảm:</strong> Đặt bản thân vào vị trí của khách hàng để tìm ra câu trả lời sâu sắc nhất.</li>
  <li><strong>Dám khác biệt:</strong> Nói không với các khuôn mẫu rập khuôn, mang đến giải pháp độc đáo và hiệu quả thực tế.</li>
  <li><strong>Tận tâm đến từng chi tiết:</strong> Mỗi sản phẩm bàn giao là một tác phẩm được chăm chút tỉ mỉ.</li>
</ul>`,
  },

  // 2. Mô tả công việc (JD)
  {
    id: 'jd_dev',
    category: 'job_desc',
    title: 'Kỹ sư Phần mềm / Lập trình viên Fullstack / Backend / Frontend',
    description: 'Mô tả công việc chuẩn cấu trúc: Kiến trúc hệ thống, phát triển tính năng, tối ưu hóa hiệu năng.',
    tag: 'Kỹ thuật / IT',
    htmlContent: `<h3>Mục Tiêu Công Việc</h3>
<p>Trực tiếp tham gia thiết kế, phát triển và tối ưu hóa hệ thống phần mềm quy mô lớn; đảm bảo tính ổn định, bảo mật và trải nghiệm mượt mà cho người dùng.</p>

<h3>Nhiệm Vụ & Trách Nhiệm Chính</h3>
<ul>
  <li>Tham gia phân tích yêu cầu sản phẩm, thiết kế kiến trúc hệ thống và lập trình các tính năng mới theo quy trình Agile/Scrum.</li>
  <li>Tối ưu hóa hiệu năng ứng dụng (Performance Tuning), giảm độ trễ API và đảm bảo khả năng chịu tải cao (High Concurrency).</li>
  <li>Viết Unit Test, Integration Test và phối hợp cùng đội ngũ QA/QC trong việc kiểm thử và rà soát chất lượng mã nguồn (Code Review).</li>
  <li>Phối hợp cùng DevOps để cấu hình CI/CD pipelines, giám sát hệ thống production và xử lý sự cố nhanh chóng.</li>
  <li>Nghiên cứu áp dụng các công nghệ mới nhằm nâng cao hiệu suất làm việc của toàn đội ngũ.</li>
</ul>`,
  },
  {
    id: 'jd_marketing',
    category: 'job_desc',
    title: 'Chuyên viên Marketing & Truyền thông Kỹ thuật số',
    description: 'Lập kế hoạch chiến dịch, Quản lý ngân sách quảng cáo, Sáng tạo nội dung đa kênh và Đo lường ROI.',
    tag: 'Marketing',
    htmlContent: `<h3>Mục Tiêu Công Việc</h3>
<p>Lên kế hoạch và triển khai các chiến dịch tiếp thị đa kênh (Digital Marketing) nhằm gia tăng độ nhận diện thương hiệu và mang lại tệp khách hàng tiềm năng chất lượng cao.</p>

<h3>Trách Nhiệm Chi Tiết</h3>
<ul>
  <li>Xây dựng và thực thi kế hoạch Marketing đa kênh: SEO, Google Ads, Facebook Ads, TikTok, Email Marketing và Mạng xã hội.</li>
  <li>Sáng tạo nội dung (Content Strategy), kịch bản video và thông điệp truyền thông phù hợp với chân dung khách hàng mục tiêu.</li>
  <li>Quản lý ngân sách quảng cáo, theo dõi và tối ưu hóa các chỉ số hiệu quả: CAC, CPL, CTR, Conversion Rate và ROAS.</li>
  <li>Thu thập và phân tích dữ liệu thị trường, báo cáo hành vi người dùng bằng Google Analytics / Looker Studio để đề xuất cải tiến.</li>
  <li>Phối hợp cùng bộ phận Kinh doanh để tối ưu hóa quy trình nuôi dưỡng Leads (Lead Nurturing).</li>
</ul>`,
  },
  {
    id: 'jd_sales',
    category: 'job_desc',
    title: 'Chuyên viên Kinh doanh / Phát triển Thị trường (Sales B2B / B2C)',
    description: 'Tìm kiếm khách hàng, Đàm phán ký kết hợp đồng, Chăm sóc đối tác và Đạt chỉ tiêu doanh số.',
    tag: 'Kinh doanh / Sales',
    htmlContent: `<h3>Mục Tiêu Công Việc</h3>
<p>Mở rộng mạng lưới khách hàng, xúc tiến đàm phán thương mại và hoàn thành vượt mức các chỉ tiêu doanh số được giao.</p>

<h3>Trách Nhiệm Chính</h3>
<ul>
  <li>Chủ động tìm kiếm, tiếp cận và thiết lập mối quan hệ với các khách hàng tiềm năng qua các kênh trực tiếp và gián tiếp.</li>
  <li>Khảo sát nhu cầu, tư vấn giải pháp phù hợp và xây dựng báo giá / hồ sơ đề xuất (Proposal) chuyên nghiệp.</li>
  <li>Trực tiếp đàm phán điều khoản hợp đồng và theo dõi tiến độ thực hiện đến khi bàn giao và nghiệm thu.</li>
  <li>Chăm sóc khách hàng sau bán, duy trì mối quan hệ đối tác chiến lược và khai thác cơ hội bán gia tăng (Upsell/Cross-sell).</li>
  <li>Báo cáo kết quả kinh doanh định kỳ và đóng góp ý kiến hoàn thiện chính sách sản phẩm/giá bán.</li>
</ul>`,
  },

  // 3. Yêu cầu ứng viên (Requirements)
  {
    id: 'req_standard',
    category: 'job_req',
    title: 'Khung Yêu Cầu Năng Lực Tiêu Chuẩn (Mid / Senior)',
    description: 'Bao quát: Bằng cấp/Kinh nghiệm, Kỹ năng chuyên môn cốt lõi, Kỹ năng mềm và Tư duy làm việc.',
    tag: 'Yêu cầu năng lực',
    htmlContent: `<h3>Yêu Cầu Chuyên Môn (Hard Skills)</h3>
<ul>
  <li>Tốt nghiệp Đại học/Cao đẳng chuyên ngành liên quan hoặc có chứng chỉ nghề nghiệp quốc tế tương đương.</li>
  <li>Tối thiểu từ <strong>2 - 4 năm kinh nghiệm</strong> làm việc thực chiến tại vị trí tương đương.</li>
  <li>Thành thạo các công cụ chuyên môn, phần mềm nghiệp vụ và quy trình làm việc chuẩn mực.</li>
  <li>Khả năng đọc hiểu tài liệu và giao tiếp chuyên ngành bằng Tiếng Anh tốt (TOEIC 650+ hoặc IELTS 6.0+ là lợi thế).</li>
</ul>

<h3>Kỹ Năng Mềm & Tư Duy (Soft Skills)</h3>
<ul>
  <li>Tư duy phản biện (Critical Thinking), khả năng phân tích số liệu và giải quyết vấn đề mạch lạc.</li>
  <li>Kỹ năng giao tiếp, thuyết trình và kỹ năng làm việc nhóm xuất sắc.</li>
  <li>Chủ động, có tinh thần trách nhiệm cao (Ownership Mindset) và khả năng chịu áp lực tiến độ tốt.</li>
</ul>`,
  },

  // 4. Quyền lợi & Phúc lợi (Benefits)
  {
    id: 'ben_top',
    category: 'benefits',
    title: 'Gói Phúc Lợi Toàn Diện & Đãi Ngộ Hấp Dẫn',
    description: 'Lương thưởng cạnh tranh, Bảo hiểm sức khỏe VIP, Du lịch nghỉ dưỡng, Môi trường phát triển.',
    tag: 'Phúc lợi cao cấp',
    htmlContent: `<h3>Thu Nhập & Thưởng</h3>
<ul>
  <li><strong>Mức lương cạnh tranh:</strong> Đàm phán theo năng lực, cam kết review lương định kỳ 1 - 2 lần/năm.</li>
  <li><strong>Thưởng phong phú:</strong> Thưởng tháng 13, thưởng hiệu quả kinh doanh (KPIs/Bonus), thưởng dự án và các dịp Lễ/Tết.</li>
  <li>Hỗ trợ phụ cấp cơm trưa, phụ cấp gửi xe và công tác phí đầy đủ.</li>
</ul>

<h3>Chế Độ Bảo Hiểm & Sức Khỏe</h3>
<ul>
  <li>Đóng đầy đủ BHXH, BHYT, BHTN 100% trên tổng lương thực nhận theo luật.</li>
  <li><strong>Gói bảo hiểm sức khỏe cao cấp (PVI / Bao Viet):</strong> Hạn mức khám chữa bệnh nội/ngoại trú cao cấp.</li>
  <li>Khám sức khỏe tổng quát định kỳ hàng năm tại bệnh viện quốc tế hàng đầu.</li>
</ul>

<h3>Đào Tạo & Đời Sống Tinh Thần</h3>
<ul>
  <li>Tài trợ 100% chi phí tham gia các khóa học nâng cao kỹ năng và thi chứng chỉ quốc tế.</li>
  <li>Du lịch Company Trip nghỉ dưỡng cao cấp (resort 4-5 sao) tối thiểu 1 lần/năm; Teambuilding hàng quý.</li>
  <li>Môi trường làm việc hiện đại, Pantry ngập tràn bánh kẹo, hoa quả và cà phê pha máy miễn phí mỗi ngày.</li>
</ul>`,
  },

  // 5. Thư gửi ứng viên (Email)
  {
    id: 'mail_interview_invite',
    category: 'email',
    title: 'Thư Mời Phỏng Vấn Trang Trọng (Kèm Thông Tin Chi Tiết)',
    description: 'Email chuyên nghiệp gửi ứng viên kèm thời gian, hình thức và người phỏng vấn.',
    tag: 'Email Mời Phỏng Vấn',
    htmlContent: `<p>Kính gửi Anh/Chị <strong>{{Tên_Ứng_Viên}}</strong>,</p>

<p>Lời đầu tiên, Ban Tuyển dụng Công ty xin gửi lời cảm ơn chân thành đến Anh/Chị vì sự quan tâm dành cho vị trí <strong>{{Tên_Vị_Trí}}</strong>.</p>

<p>Chúng tôi rất ấn tượng với hồ sơ năng lực của Anh/Chị và trân trọng kính mời Anh/Chị tham dự buổi phỏng vấn trực tiếp cùng đại diện Ban Giám đốc và Trưởng bộ phận chuyên môn. Thông tin chi tiết như sau:</p>

<ul>
  <li><strong>Thời gian:</strong> {{Thời_Gian_Phỏng_Vấn}}</li>
  <li><strong>Hình thức:</strong> {{Hình_Thức}} (Trực tiếp / Trực tuyến)</li>
  <li><strong>Địa điểm / Link phòng họp:</strong> {{Địa_Điểm_Hoặc_Link}}</li>
  <li><strong>Người phỏng vấn:</strong> {{Người_Phỏng_Vấn}}</li>
</ul>

<p>Để buổi phỏng vấn diễn ra thuận lợi nhất, Anh/Chị vui lòng gửi email phản hồi xác nhận sự tham gia trước <strong>{{Thời_Hạn_Phản_Hồi}}</strong>. Trường hợp cần sắp xếp lại lịch hẹn, Anh/Chị vui lòng thông báo sớm cho chúng tôi.</p>

<p>Chúc Anh/Chị một ngày làm việc hiệu quả và có buổi phỏng vấn thành công!</p>

<p>Trân trọng,<br/>
<strong>Bộ phận Tuyển dụng & Thu hút Nhân tài</strong><br/>
<em>Hotline: {{Số_Điện_Thoại}} | Email: {{Email_Tuyển_Dụng}}</em></p>`,
  },
  {
    id: 'mail_offer',
    category: 'email',
    title: 'Thư Mời Nhận Việc & Chúc Mừng (Job Offer Letter)',
    description: 'Thư mời gia nhập chính thức với mức lương, ngày bắt đầu và hướng dẫn nhận việc.',
    tag: 'Email Mời Nhận Việc',
    htmlContent: `<p>Thân gửi Anh/Chị <strong>{{Tên_Ứng_Viên}}</strong>,</p>

<p>Thay mặt Ban Lãnh đạo Công ty, chúng tôi xin chúc mừng Anh/Chị đã hoàn thành xuất sắc các vòng đánh giá và trân trọng gửi đến Anh/Chị Lời mời nhận việc (Job Offer) cho vị trí <strong>{{Tên_Vị_Trí}}</strong> tại bộ phận <strong>{{Tên_Phòng_Ban}}</strong>.</p>

<h3>Tóm tắt các điều khoản chính:</h3>
<ul>
  <li><strong>Chức danh:</strong> {{Tên_Vị_Trí}}</li>
  <li><strong>Ngày bắt đầu làm việc (Onboarding):</strong> {{Ngày_Bắt_Đầu}}</li>
  <li><strong>Mức lương cơ bản:</strong> {{Mức_Lương}} VNĐ / tháng</li>
  <li><strong>Thời gian thử việc:</strong> 02 tháng (hưởng 85% - 100% lương chính thức theo thỏa thuận)</li>
  <li><strong>Địa điểm làm việc:</strong> {{Địa_Điểm_Làm_Việc}}</li>
</ul>

<p>Anh/Chị vui lòng xem chi tiết Thư mời nhận việc đính kèm, ký xác nhận và gửi lại cho chúng tôi trước ngày <strong>{{Hạn_Xác_Nhận}}</strong>.</p>

<p>Chúng tôi rất mong đợi được chào đón Anh/Chị trở thành một thành viên trong đại gia đình công ty!</p>

<p>Trân trọng,<br/>
<strong>Phòng Nhân sự</strong></p>`,
  },
  {
    id: 'mail_polite_reject',
    category: 'email',
    title: 'Thư Cảm Ơn & Thông Báo Kết Quả Lịch Sự (Lưu Hồ Sơ)',
    description: 'Thư phản hồi tinh tế, giữ hình ảnh nhà tuyển dụng chuyên nghiệp và giữ liên lạc tương lai.',
    tag: 'Email Phản Hồi',
    htmlContent: `<p>Kính gửi Anh/Chị <strong>{{Tên_Ứng_Viên}}</strong>,</p>

<p>Lời đầu tiên, Ban Tuyển dụng xin gửi lời cảm ơn chân thành đến Anh/Chị vì đã dành thời gian quý báu tham gia ứng tuyển và trao đổi cùng chúng tôi cho vị trí <strong>{{Tên_Vị_Trí}}</strong>.</p>

<p>Hội đồng tuyển dụng đánh giá rất cao năng lực chuyên môn, sự chuẩn bị chu đáo cũng như thái độ làm việc chuyên nghiệp của Anh/Chị. Tuy nhiên, sau khi cân nhắc kỹ lưỡng mức độ phù hợp với các tiêu chí đặc thù của dự án ở giai đoạn hiện tại, chúng tôi rất tiếc chưa thể có cơ hội hợp tác cùng Anh/Chị vào lúc này.</p>

<p>Dữ liệu hồ sơ của Anh/Chị đã được lưu trữ trong Mạng lưới Nhân tài (Talent Pool) của chúng tôi. Ngay khi có vị trí mới phù hợp hơn với thế mạnh của Anh/Chị, chúng tôi sẽ chủ động liên hệ trước tiên.</p>

<p>Chúc Anh/Chị luôn dồi dào sức khỏe và gặt hái nhiều thành công rực rỡ trên con đường sự nghiệp!</p>

<p>Trân trọng,<br/>
<strong>Ban Tuyển dụng & Quản trị Nhân tài</strong></p>`,
  },
];

interface TemplatesModalProps {
  open: boolean;
  onClose: () => void;
  onSelectTemplate: (html: string) => void;
  defaultCategory?: 'company' | 'job_desc' | 'job_req' | 'benefits' | 'email' | 'article' | 'all';
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  open,
  onClose,
  onSelectTemplate,
  defaultCategory = 'all',
}) => {
  const [selectedTab, setSelectedTab] = useState<string>(defaultCategory === 'all' ? 'company' : defaultCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTemplateId, setActiveTemplateId] = useState<string>(TEMPLATES[0]?.id || '');

  const filteredTemplates = TEMPLATES.filter((tpl) => {
    const matchesCategory = selectedTab === 'all' || tpl.category === selectedTab;
    const matchesSearch =
      tpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.tag.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const activeTemplate = TEMPLATES.find((t) => t.id === activeTemplateId) || filteredTemplates[0] || TEMPLATES[0];

  const handleApply = () => {
    if (activeTemplate) {
      onSelectTemplate(activeTemplate.htmlContent);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
          minHeight: '620px',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'primary.main',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
            }}
          >
            <AutoAwesomeIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              Kho Mẫu Soạn Thảo Chuẩn Chuyên Nghiệp
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Chọn mẫu có sẵn để tiết kiệm thời gian và đảm bảo đầy đủ cấu trúc chuẩn
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Navigation Tabs */}
        <Box sx={{ px: 3, pt: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Tabs
            value={selectedTab}
            onChange={(_, val) => setSelectedTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 44,
              '& .MuiTab-root': {
                minHeight: 44,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
                gap: 1,
              },
            }}
          >
            <Tab icon={<BusinessIcon fontSize="small" />} iconPosition="start" label="Doanh Nghiệp" value="company" />
            <Tab icon={<WorkOutlineIcon fontSize="small" />} iconPosition="start" label="Mô Tả JD" value="job_desc" />
            <Tab icon={<AssignmentTurnedInOutlinedIcon fontSize="small" />} iconPosition="start" label="Yêu Cầu Ứng Viên" value="job_req" />
            <Tab icon={<CardGiftcardIcon fontSize="small" />} iconPosition="start" label="Phúc Lợi & Đãi Ngộ" value="benefits" />
            <Tab icon={<EmailOutlinedIcon fontSize="small" />} iconPosition="start" label="Thư Gửi Ứng Viên" value="email" />
            <Tab icon={<ArticleOutlinedIcon fontSize="small" />} iconPosition="start" label="Bài Viết / Blog" value="article" />
          </Tabs>
        </Box>

        {/* Main Content Layout */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, height: '500px' }}>
          {/* Left Column: Template List */}
          <Box
            sx={{
              width: { xs: '100%', md: '42%' },
              borderRight: { xs: 'none', md: '1px solid' },
              borderBottom: { xs: '1px solid', md: 'none' },
              borderColor: 'divider',
              p: 2.5,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              overflowY: 'auto',
            }}
          >
            <TextField
              size="small"
              placeholder="Tìm kiếm mẫu soạn thảo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1, overflowY: 'auto' }}>
              {filteredTemplates.map((item) => {
                const isSelected = item.id === (activeTemplate?.id || '');
                return (
                  <Paper
                    key={item.id}
                    elevation={0}
                    onClick={() => setActiveTemplateId(item.id)}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      cursor: 'pointer',
                      border: '1.5px solid',
                      borderColor: isSelected ? 'primary.main' : 'divider',
                      bgcolor: isSelected ? 'rgba(99, 102, 241, 0.05)' : 'background.paper',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: isSelected ? 'primary.main' : 'text.secondary',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                      <Typography variant="subtitle2" fontWeight={700} color={isSelected ? 'primary.main' : 'text.primary'}>
                        {item.title}
                      </Typography>
                      {isSelected && <CheckCircleIcon color="primary" sx={{ fontSize: 18, flexShrink: 0, mt: 0.2 }} />}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.8rem', lineHeight: 1.4 }}>
                      {item.description}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Chip label={item.tag} size="small" variant="outlined" sx={{ fontSize: '0.72rem', height: 20 }} />
                    </Box>
                  </Paper>
                );
              })}

              {filteredTemplates.length === 0 && (
                <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
                  <Typography variant="body2">Không tìm thấy mẫu phù hợp.</Typography>
                </Box>
              )}
            </Box>
          </Box>

          {/* Right Column: Preview of Selected Template */}
          <Box
            sx={{
              flex: 1,
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50'),
              overflowY: 'auto',
            }}
          >
            {activeTemplate ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {activeTemplate.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Xem trước nội dung sẽ chèn vào trình soạn thảo
                    </Typography>
                  </Box>
                  <Chip label={activeTemplate.tag} color="primary" size="small" />
                </Box>
                <Divider sx={{ mb: 2 }} />

                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    flex: 1,
                    overflowY: 'auto',
                    '& h3': { fontSize: '1.05rem', fontWeight: 700, mt: 1.5, mb: 1, color: 'primary.main' },
                    '& p': { fontSize: '0.9rem', lineHeight: 1.6, mb: 1.2 },
                    '& ul, & ol': { pl: 2.5, mb: 1.2 },
                    '& li': { fontSize: '0.9rem', mb: 0.6, lineHeight: 1.5 },
                  }}
                  dangerouslySetInnerHTML={{ __html: activeTemplate.htmlContent }}
                />
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'text.secondary' }}>
                <Typography variant="body2">Chọn một mẫu ở cột bên trái để xem trước</Typography>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider', justifyContent: 'space-between' }}>
        <Typography variant="caption" color="text.secondary">
          💡 Bạn có thể tùy ý chỉnh sửa lại văn bản sau khi áp dụng mẫu
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button onClick={onClose} variant="outlined" color="inherit">
            Hủy
          </Button>
          <Button
            onClick={handleApply}
            variant="contained"
            disabled={!activeTemplate}
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
              fontWeight: 600,
              px: 3,
            }}
          >
            Sử Dụng Mẫu Này
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default TemplatesModal;
