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
  IconButton,
  InputAdornment,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
  Stack,
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
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import { useTranslation } from 'react-i18next';

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
    id: 'jd_tech_senior',
    category: 'job_desc',
    title: 'Senior Software Engineer / Tech Lead',
    description: 'Mô tả chuyên sâu cho kỹ sư phần mềm: Trách nhiệm kỹ thuật, Thiết kế kiến trúc & Mentor.',
    tag: 'Công nghệ / Phần mềm',
    htmlContent: `<h3>1. Tổng Quan Vị Trí</h3>
<p>Chúng tôi đang tìm kiếm một <strong>Senior Software Engineer</strong> tài năng để đồng hành xây dựng hệ thống nền tảng phục vụ hàng triệu người dùng. Bạn sẽ giữ vai trò then chốt trong việc thiết kế kiến trúc hệ thống phân tán, tối ưu hiệu năng và dẫn dắt đội ngũ kỹ sư trẻ.</p>

<h3>2. Trách Nhiệm Chính</h3>
<ul>
  <li>Tham gia thiết kế, phát triển và tối ưu hóa các dịch vụ backend/frontend hiệu năng cao theo mô hình Microservices.</li>
  <li>Đảm bảo chất lượng mã nguồn thông qua Code Review nghiêm ngặt, Unit Test và áp dụng các Best Practices về Clean Architecture.</li>
  <li>Cộng tác chặt chẽ với Product Owner, Designer và QA để hiện thực hóa các tính năng sản phẩm với tốc độ nhanh và độ ổn định cao.</li>
  <li>Tham gia nghiên cứu, ứng dụng công nghệ mới và đề xuất các giải pháp nâng cao hiệu suất cũng như tính bảo mật của toàn bộ hệ thống.</li>
  <li>Đào tạo, hướng dẫn và truyền cảm hứng (Mentoring) cho các kỹ sư Junior và Mid trong nhóm.</li>
</ul>`,
  },
  {
    id: 'jd_marketing_lead',
    category: 'job_desc',
    title: 'Marketing Manager / Digital Growth Lead',
    description: 'Bản mô tả vị trí Marketing: Hoạch định chiến lược tăng trưởng, Quản lý ngân sách & Đo lường ROI.',
    tag: 'Marketing / Tăng trưởng',
    htmlContent: `<h3>1. Tổng Quan Vị Trí</h3>
<p>Vị trí <strong>Marketing Manager</strong> chịu trách nhiệm hoạch định và thực thi toàn bộ chiến lược tiếp thị đa kênh, gia tăng độ nhận diện thương hiệu và thúc đẩy tăng trưởng người dùng cũng như doanh thu bền vững.</p>

<h3>2. Trách Nhiệm Chính</h3>
<ul>
  <li>Xây dựng và quản lý ngân sách tiếp thị tổng thể; theo dõi và tối ưu hóa các chỉ số hiệu quả chuyển đổi (CAC, LTV, ROAS, ROI).</li>
  <li>Dẫn dắt các chiến dịch tích hợp (Integrated Marketing Campaigns) trên các kênh Digital (SEO/SEM, Performance Ads, Social Media, Content, Email Automation).</li>
  <li>Phân tích dữ liệu hành vi người tiêu dùng, xu hướng thị trường và hoạt động đối thủ để kịp thời đưa ra các đề xuất chiến lược sắc bén.</li>
  <li>Phối hợp cùng bộ phận Kinh doanh và Phát triển Sản phẩm nhằm định vị thông điệp sản phẩm thu hút và nhất quán.</li>
  <li>Xây dựng, đào tạo và phát triển đội ngũ nhân sự tiếp thị nội bộ vững chuyên môn và tinh thần gắn kết.</li>
</ul>`,
  },
  {
    id: 'jd_sales_b2b',
    category: 'job_desc',
    title: 'B2B Sales Executive / Account Manager',
    description: 'Bản mô tả vị trí Kinh doanh B2B: Khai thác khách hàng doanh nghiệp, Đàm phán và Chốt hợp đồng.',
    tag: 'Kinh doanh / B2B',
    htmlContent: `<h3>1. Tổng Quan Vị Trí</h3>
<p>Là <strong>Chuyên viên Kinh doanh Doanh nghiệp (B2B)</strong>, bạn sẽ là cầu nối đưa các giải pháp dịch vụ chất lượng cao của chúng tôi đến với các khách hàng doanh nghiệp lớn, trực tiếp đóng góp vào doanh thu bứt phá của công ty.</p>

<h3>2. Trách Nhiệm Chính</h3>
<ul>
  <li>Tìm kiếm, tiếp cận và mở rộng tệp khách hàng doanh nghiệp tiềm năng thuộc danh mục mục tiêu.</li>
  <li>Tư vấn giải pháp, thuyết trình đề xuất dự án (Pitching) và thương lượng các điều khoản hợp đồng thương mại.</li>
  <li>Chăm sóc và duy trì mối quan hệ đối tác bền vững với khách hàng hiện hữu nhằm tối đa hóa cơ hội tái ký và Up-sell/Cross-sell.</li>
  <li>Theo dõi tiến độ thanh toán, nghiệm thu hợp đồng và phối hợp xử lý kịp thời các yêu cầu phát sinh từ khách hàng.</li>
  <li>Báo cáo kết quả kinh doanh và dự báo doanh thu định kỳ cho Trưởng bộ phận.</li>
</ul>`,
  },

  // 3. Yêu cầu ứng viên
  {
    id: 'req_tech_senior',
    category: 'job_req',
    title: 'Khung Yêu Cầu Kỹ Thuật (Senior Tech Spec)',
    description: 'Khung tiêu chuẩn: Nền tảng chuyên môn vững, Tư duy giải quyết vấn đề và Kỹ năng mềm.',
    tag: 'Yêu cầu tuyển dụng',
    htmlContent: `<h3>1. Yêu Cầu Chuyên Môn</h3>
<ul>
  <li>Có ít nhất <strong>3-5 năm kinh nghiệm</strong> thực chiến ở vị trí tương đương tại các công ty công nghệ / Product.</li>
  <li>Thành thạo một hoặc nhiều ngôn ngữ/framework: TypeScript/JavaScript (React, Next.js, Node.js), Java/Golang/Python.</li>
  <li>Hiểu biết sâu sắc về cơ sở dữ liệu (PostgreSQL, MongoDB, Redis), Message Queue (Kafka, RabbitMQ) và kiến trúc Microservices.</li>
  <li>Kinh nghiệm làm việc thực tế với Docker, Kubernetes và các dịch vụ đám mây (AWS, GCP, Azure).</li>
  <li>Nắm vững các nguyên lý CI/CD, Git workflows, Automated Testing và bảo mật ứng dụng web.</li>
</ul>

<h3>2. Kỹ Năng & Phẩm Chất</h3>
<ul>
  <li>Tư duy giải quyết vấn đề mạch lạc, khả năng tự nghiên cứu và thích ứng nhanh với công nghệ mới.</li>
  <li>Kỹ năng giao tiếp xuất sắc, có tinh thần làm việc nhóm và trách nhiệm cao với sản phẩm mình làm ra.</li>
  <li>Khả năng đọc hiểu tài liệu chuyên ngành và giao tiếp tiếng Anh tốt là một lợi thế lớn.</li>
</ul>`,
  },

  // 4. Quyền lợi & Phúc lợi
  {
    id: 'ben_standard_tech',
    category: 'benefits',
    title: 'Gói Đãi Ngộ Tiêu Chuẩn Công Nghệ (Tech Perks Package)',
    description: 'Chính sách toàn diện: Thu nhập cạnh tranh, Trang thiết bị hiện đại, Chăm sóc sức khỏe và Đào tạo.',
    tag: 'Quyền lợi / Phúc lợi',
    htmlContent: `<h3>1. Thu Nhập & Thưởng</h3>
<ul>
  <li>Mức lương cạnh tranh theo năng lực (Review lương định kỳ 2 lần/năm).</li>
  <li>Thưởng tháng lương thứ 13, thưởng hiệu quả kinh doanh và thưởng các dịp lễ, Tết.</li>
  <li>Gói cổ phần thưởng (ESOP) dành cho nhân sự có đóng góp xuất sắc.</li>
</ul>

<h3>2. Chăm Sóc Sức Khỏe & Đời Sống</h3>
<ul>
  <li>Bảo hiểm Xã hội, Y tế, Thất nghiệp theo đúng luật định.</li>
  <li>Gói <strong>Bảo hiểm Sức khỏe Cao cấp (VIP Healthcare)</strong> cho nhân viên và ưu đãi cho người thân.</li>
  <li>Khám sức khỏe tổng quát định kỳ hàng năm tại các bệnh viện quốc tế hàng đầu.</li>
  <li>Phụ cấp ăn trưa, gửi xe miễn phí và teabreak/hoa quả miễn phí mỗi ngày tại văn phòng.</li>
</ul>

<h3>3. Môi Trường & Phát Triển Bản Thân</h3>
<ul>
  <li>Trang bị máy tính làm việc cấu hình cao (MacBook Pro / Dell XPS) và màn hình 4K.</li>
  <li>Chính sách làm việc kết hợp linh hoạt (Hybrid Working / Remote-friendly).</li>
  <li>Ngân sách đào tạo cá nhân hàng năm (hỗ trợ mua sách, khóa học Udemy/Coursera và thi chứng chỉ quốc tế).</li>
  <li>Du lịch nghỉ dưỡng 5 sao hàng năm và các hoạt động thể thao, Team Building sôi nổi.</li>
</ul>`,
  },

  // 5. Thư gửi ứng viên
  {
    id: 'mail_interview_invite',
    category: 'email',
    title: 'Thư Mời Tham Gia Phỏng Vấn (Interview Invitation)',
    description: 'Mẫu email lịch thiệp, chuyên nghiệp: Thời gian, Địa điểm/Link họp và Hướng dẫn chuẩn bị.',
    tag: 'Email Mẫu',
    htmlContent: `<p>Thân gửi <strong>[Họ và tên Ứng viên]</strong>,</p>

<p>Lời đầu tiên, Ban Tuyển dụng <strong>[Tên Doanh Nghiệp]</strong> xin gửi lời cảm ơn chân thành vì sự quan tâm của bạn dành cho vị trí <strong>[Tên Vị Trí Ứng Tuyển]</strong>.</p>

<p>Sau khi xem xét kỹ lưỡng hồ sơ của bạn, chúng tôi rất ấn tượng với những kinh nghiệm và thành tựu mà bạn đã đạt được. Chúng tôi trân trọng kính mời bạn tham gia buổi phỏng vấn trực tiếp cùng Hội đồng Tuyển dụng với thông tin chi tiết như sau:</p>

<ul>
  <li><strong>Thời gian:</strong> [Giờ] - [Thứ, Ngày/Tháng/Năm]</li>
  <li><strong>Hình thức:</strong> Phỏng vấn Trực tuyến (Online qua Google Meet) / Phỏng vấn Trực tiếp</li>
  <li><strong>Địa điểm / Đường link họp:</strong> [Link Google Meet hoặc Địa chỉ văn phòng]</li>
  <li><strong>Người phỏng vấn:</strong> [Tên & Chức vụ người phỏng vấn]</li>
  <li><strong>Nội dung:</strong> Trao đổi chi tiết về kinh nghiệm chuyên môn và định hướng phát triển công việc.</li>
</ul>

<p>Vui lòng phản hồi lại email này trước <strong>[Hạn phản hồi]</strong> để xác nhận sự tham gia của bạn. Nếu thời gian trên chưa thuận tiện, bạn có thể đề xuất khung giờ phù hợp hơn để chúng tôi hỗ trợ sắp xếp.</p>

<p>Chúc bạn có một buổi phỏng vấn thật thành công!</p>

<p>Trân trọng,<br />
<strong>[Họ tên Người liên hệ]</strong><br />
Bộ phận Tuyển dụng | [Tên Doanh Nghiệp]<br />
Hotline: [Số điện thoại] | Email: [Địa chỉ Email]</p>`,
  },
  {
    id: 'mail_offer_letter',
    category: 'email',
    title: 'Thư Chúc Mừng & Đề Nghị Nhận Việc (Job Offer Letter)',
    description: 'Trang trọng, ấm áp: Mức lương, Ngày bắt đầu làm việc, Quy trình tiếp nhận và Xác nhận.',
    tag: 'Email Mẫu',
    htmlContent: `<p>Thân gửi <strong>[Họ và tên Ứng viên]</strong>,</p>

<p>Thay mặt Ban Lãnh đạo và toàn thể đội ngũ <strong>[Tên Doanh Nghiệp]</strong>, chúng tôi xin chúc mừng bạn đã xuất sắc vượt qua các vòng phỏng vấn và chính thức được lựa chọn cho vị trí <strong>[Tên Vị Trí Tiếp Nhận]</strong>.</p>

<p>Chúng tôi tin tưởng rằng với tài năng, sự nhiệt huyết và kinh nghiệm của bạn, bạn sẽ là một mảnh ghép tuyệt vời giúp công ty tiếp tục gặt hái thêm nhiều thành công mới. Dưới đây là các thông tin tóm tắt về đề nghị tiếp nhận:</p>

<ul>
  <li><strong>Vị trí công tác:</strong> [Tên Vị Trí]</li>
  <li><strong>Bộ phận:</strong> [Tên Phòng Ban]</li>
  <li><strong>Ngày bắt đầu làm việc (Onboarding):</strong> [Ngày/Tháng/Năm]</li>
  <li><strong>Mức lương gộp (Gross):</strong> [Số tiền] VNĐ/tháng</li>
  <li><strong>Thời gian thử việc:</strong> 02 tháng (hưởng [85% - 100%] lương chính thức)</li>
  <li><strong>Địa điểm làm việc:</strong> [Địa chỉ văn phòng công ty]</li>
</ul>

<p>Chi tiết đầy đủ về bản thỏa thuận công việc và các chính sách phúc lợi đính kèm trong thư này. Vui lòng xác nhận sự đồng ý bằng cách phản hồi lại email này trước <strong>[Hạn xác nhận]</strong>.</p>

<p>Chúng tôi rất hào hứng được chào đón bạn gia nhập đại gia đình [Tên Doanh Nghiệp]!</p>

<p>Trân trọng,<br />
<strong>[Họ tên Trưởng bộ phận Nhân sự]</strong><br />
Giám đốc Nhân sự | [Tên Doanh Nghiệp]</p>`,
  },

  // 6. Bài viết / Blog
  {
    id: 'article_career_guide',
    category: 'article',
    title: 'Bài Viết Hướng Dẫn & Cẩm Nang Tuyển Dụng (Editorial Guide)',
    description: 'Bố cục bài viết chuyên sâu: Đặt vấn đề, Luận điểm chính, Lời khuyên thực tế & Kết luận.',
    tag: 'Cẩm nang / Blog',
    htmlContent: `<h2>Bí Quyết Chuẩn Bị Hồ Sơ Tuyển Dụng Thu Hút Mọi Nhà Tuyển Dụng</h2>
<p>Trong thị trường lao động cạnh tranh ngày nay, việc sở hữu một bộ hồ sơ ấn tượng là tấm vé vàng đầu tiên mở ra cánh cửa phỏng vấn tại các doanh nghiệp hàng đầu.</p>

<h3>1. Tối Ưu Hóa Cấu Trúc Hồ Sơ</h3>
<p>Một bản CV chuẩn mực cần đảm bảo tính súc tích, làm nổi bật được các con số và thành tích cụ thể (Impact-driven) thay vì chỉ liệt kê danh sách nhiệm vụ thông thường.</p>
<ul>
  <li>Sử dụng các động từ hành động mạnh mẽ (Led, Architected, Optimized, Increased).</li>
  <li>Trình bày các chứng chỉ nghề nghiệp và kỹ năng công nghệ liên quan trực tiếp đến vị trí ứng tuyển.</li>
</ul>

<h3>2. Chú Trọng Đến Văn Hóa Doanh Nghiệp</h3>
<p>Bên cạnh năng lực chuyên môn, sự phù hợp về mặt giá trị cốt lõi và phong cách làm việc là yếu tố mang tính quyết định trong các buổi phỏng vấn chuyên sâu.</p>

<h3>3. Lời Kết</h3>
<p>Hãy luôn chủ động chuẩn bị kỹ lưỡng, tự tin thể hiện bản thân và không ngừng nâng cấp kỹ năng mỗi ngày để nắm bắt những cơ hội nghề nghiệp bứt phá.</p>`,
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
  defaultCategory = 'company',
}) => {
  const { t } = useTranslation('common');
  const [selectedTab, setSelectedTab] = useState<string>(
    defaultCategory === 'all' ? 'company' : defaultCategory
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTemplateId, setActiveTemplateId] = useState<string>(TEMPLATES[0].id);

  // Filter templates
  const filteredTemplates = TEMPLATES.filter((item) => {
    const matchesCategory = selectedTab === 'all' || item.category === selectedTab;
    const matchesSearch =
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tag.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const activeTemplate = TEMPLATES.find((t) => t.id === activeTemplateId) || filteredTemplates[0];

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
      {/* Header */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
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
            }}
          >
            <AutoAwesomeIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              {t('editor.templates.modalTitle', 'Thư Viện Mẫu Bài Viết & Tuyển Dụng Chuẩn')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('editor.templates.subtitle', 'Khởi tạo nhanh nội dung chuyên nghiệp với cấu trúc chuẩn hóa cho từng ngành nghề')}
            </Typography>
          </Box>
        </Box>

        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Navigation Category Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, bgcolor: 'background.paper' }}>
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
            <Tab icon={<BusinessIcon fontSize="small" />} iconPosition="start" label={t('editor.templates.categories.company', 'Doanh Nghiệp')} value="company" />
            <Tab icon={<WorkOutlineIcon fontSize="small" />} iconPosition="start" label={t('editor.templates.categories.job', 'Mô Tả JD')} value="job_desc" />
            <Tab icon={<AssignmentTurnedInOutlinedIcon fontSize="small" />} iconPosition="start" label={t('editor.templates.categories.jobReq', 'Yêu Cầu Ứng Viên')} value="job_req" />
            <Tab icon={<CardGiftcardIcon fontSize="small" />} iconPosition="start" label={t('editor.templates.categories.policy', 'Phúc Lợi & Đãi Ngộ')} value="benefits" />
            <Tab icon={<EmailOutlinedIcon fontSize="small" />} iconPosition="start" label={t('editor.templates.categories.email', 'Thư Gửi Ứng Viên')} value="email" />
            <Tab icon={<ArticleOutlinedIcon fontSize="small" />} iconPosition="start" label={t('editor.templates.categories.article', 'Bài Viết / Blog')} value="article" />
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
              placeholder={t('editor.templates.searchPlaceholder', 'Tìm kiếm mẫu soạn thảo...')}
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
                  <Typography variant="body2">{t('common.noResults', 'Không tìm thấy mẫu phù hợp.')}</Typography>
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
                      {t('editor.templates.previewSubtitle', 'Xem trước nội dung sẽ chèn vào trình soạn thảo')}
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
                <Typography variant="body2">{t('editor.templates.selectToPreview', 'Chọn một mẫu ở cột bên trái để xem trước')}</Typography>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider', justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={0.75} alignItems="center">
          <LightbulbOutlinedIcon sx={{ fontSize: 16, color: '#f59e0b' }} />
          <Typography variant="caption" color="text.secondary">
            {t('editor.templates.bottomHint', 'Bạn có thể tùy ý chỉnh sửa lại văn bản sau khi áp dụng mẫu')}
          </Typography>
        </Stack>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button onClick={onClose} variant="outlined" color="inherit">
            {t('common.actions.cancel', 'Hủy')}
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
            {t('editor.templates.useTemplate', 'Sử Dụng Mẫu Này')}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default TemplatesModal;
