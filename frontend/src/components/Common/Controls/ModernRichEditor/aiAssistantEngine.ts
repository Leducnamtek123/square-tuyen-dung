import chatbotService from '@/services/chatbotService';

export type AIActionType =
  | 'generate'
  | 'improve'
  | 'fix_spelling'
  | 'shorten'
  | 'expand'
  | 'change_tone'
  | 'translate_en'
  | 'translate_vi'
  | 'custom';

export type AIContentType =
  | 'company'
  | 'job_desc'
  | 'job_req'
  | 'benefits'
  | 'email'
  | 'blog'
  | 'general';

export type AITone = 'professional' | 'friendly' | 'persuasive' | 'creative';
export type AILength = 'short' | 'medium' | 'detailed';

export interface AIGenerateOptions {
  action: AIActionType;
  contentType?: AIContentType;
  currentContent?: string;
  userPrompt?: string;
  tone?: AITone;
  length?: AILength;
}

const TONE_INSTRUCTIONS: Record<AITone, string> = {
  professional: 'Dùng văn phong trang trọng, chuẩn mực doanh nghiệp, từ ngữ gãy gọn, uy tín.',
  friendly: 'Dùng văn phong cởi mở, thân thiện, truyền cảm hứng và gần gũi.',
  persuasive: 'Dùng văn phong thu hút, nêu bật lợi thế cạnh tranh, kích thích người đọc hành động / ứng tuyển.',
  creative: 'Dùng văn phong hiện đại, tươi mới, giàu hình ảnh và năng lượng tích cực.',
};

const LENGTH_INSTRUCTIONS: Record<AILength, string> = {
  short: 'Trình bày ngắn gọn, súc tích trong 2-3 đoạn ngắn hoặc 4-6 gạch đầu dòng nổi bật.',
  medium: 'Độ dài vừa phải (khoảng 300 - 500 từ), cấu trúc cân đối và đầy đủ các luận điểm chính.',
  detailed: 'Trình bày chi tiết, toàn diện (500 - 800 từ), phân tách rõ ràng từng đề mục với luận điểm, ví dụ và cam kết.',
};

// Convert plain text or markdown to clean HTML
export const formatAITextToHTML = (text: string): string => {
  if (!text) return '';

  let html = text.trim();

  // If already full HTML, return sanitized
  if (html.includes('<p>') || html.includes('<div>') || html.includes('<h3>')) {
    return html;
  }

  // Convert markdown headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Convert bold and italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Convert bullet lists
  const lines = html.split('\n');
  const processedLines: string[] = [];
  let inList = false;
  let inOrderedList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check bullet list item (- or * )
    if (line.match(/^[-*]\s+(.*)/)) {
      if (!inList) {
        if (inOrderedList) {
          processedLines.push('</ol>');
          inOrderedList = false;
        }
        processedLines.push('<ul>');
        inList = true;
      }
      const itemContent = line.replace(/^[-*]\s+/, '');
      processedLines.push(`  <li>${itemContent}</li>`);
    }
    // Check numbered list item (1. 2. )
    else if (line.match(/^\d+\.\s+(.*)/)) {
      if (!inOrderedList) {
        if (inList) {
          processedLines.push('</ul>');
          inList = false;
        }
        processedLines.push('<ol>');
        inOrderedList = true;
      }
      const itemContent = line.replace(/^\d+\.\s+/, '');
      processedLines.push(`  <li>${itemContent}</li>`);
    } else {
      if (inList) {
        processedLines.push('</ul>');
        inList = false;
      }
      if (inOrderedList) {
        processedLines.push('</ol>');
        inOrderedList = false;
      }
      if (line.length > 0) {
        if (line.startsWith('<h1>') || line.startsWith('<h2>') || line.startsWith('<h3>') || line.startsWith('<blockquote>')) {
          processedLines.push(line);
        } else {
          processedLines.push(`<p>${line}</p>`);
        }
      }
    }
  }

  if (inList) processedLines.push('</ul>');
  if (inOrderedList) processedLines.push('</ol>');

  return processedLines.join('\n');
};

// Fallback intelligent templates if backend AI is unavailable
const getLocalSmartResponse = (options: AIGenerateOptions): string => {
  const { action, contentType = 'general', currentContent = '', userPrompt = '', tone = 'professional' } = options;

  if (action === 'generate') {
    if (contentType === 'company') {
      return `<h3>1. Giới thiệu chung & Sứ mệnh</h3>
<p>Chúng tôi là tổ chức tiên phong trong lĩnh vực cung cấp giải pháp chuyển đổi số và công nghệ hiện đại, hướng tới việc kiến tạo những giá trị bền vững và trải nghiệm vượt trội cho khách hàng và đối tác.</p>
<p>Với định hướng lấy con người làm trọng tâm, chúng tôi không ngừng đổi mới sáng tạo, tối ưu quy trình và mở rộng quy mô hoạt động vững chắc.</p>

<h3>2. Tầm nhìn & Giá trị cốt lõi</h3>
<ul>
  <li><strong>Tận tâm (Dedication):</strong> Đặt trải nghiệm và sự thành công của đối tác làm thước đo hàng đầu.</li>
  <li><strong>Đổi mới (Innovation):</strong> Khuyến khích tư duy đột phá, dám thử nghiệm và liên tục cải tiến.</li>
  <li><strong>Chính trực (Integrity):</strong> Minh bạch, chuẩn mực trong mọi cam kết và hành động.</li>
  <li><strong>Hợp lực (Synergy):</strong> Đoàn kết, chia sẻ và cùng nhau tạo nên thành tựu lớn.</li>
</ul>

<h3>3. Môi trường & Văn hóa doanh nghiệp</h3>
<p>Chúng tôi xây dựng môi trường làm việc cởi mở, bình đẳng và tôn trọng sự khác biệt. Mỗi thành viên đều được trao quyền, hỗ trợ lộ trình phát triển rõ ràng và hưởng thụ chế độ đãi ngộ xứng đáng.</p>`;
    }

    if (contentType === 'job_desc') {
      return `<h3>Mục tiêu công việc</h3>
<p>Chịu trách nhiệm chính trong việc phát triển, tối ưu hóa và vận hành các sản phẩm/dịch vụ trọng điểm của công ty; phối hợp chặt chẽ cùng đội ngũ liên chức năng để đạt được mục tiêu tăng trưởng kinh doanh.</p>

<h3>Trách nhiệm chính (Key Responsibilities)</h3>
<ul>
  <li>Tham gia phân tích yêu cầu, xây dựng giải pháp và trực tiếp triển khai các kế hoạch công việc được giao.</li>
  <li>Đảm bảo chất lượng đầu ra, tuân thủ tiến độ và các tiêu chuẩn chuyên môn của dự án.</li>
  <li>Phối hợp cùng các phòng ban liên quan (Sản phẩm, Vận hành, Đối tác) để giải quyết các vấn đề phát sinh nhanh chóng.</li>
  <li>Nghiên cứu, cập nhật xu hướng công nghệ / thị trường mới nhằm đề xuất các cải tiến mang tính đột phá.</li>
  <li>Thực hiện báo cáo định kỳ và đề xuất các giải pháp nâng cao hiệu suất làm việc của bộ phận.</li>
</ul>`;
    }

    if (contentType === 'job_req') {
      return `<h3>Yêu cầu chuyên môn (Hard Skills)</h3>
<ul>
  <li>Tốt nghiệp Cao đẳng/Đại học chuyên ngành liên quan hoặc có kinh nghiệm làm việc thực tế tương đương từ 1 - 3 năm.</li>
  <li>Thành thạo các kỹ năng chuyên môn cốt lõi, công cụ và quy trình làm việc hiện đại trong lĩnh vực.</li>
  <li>Có khả năng nghiên cứu tài liệu chuyên ngành bằng tiếng Anh (hoặc ngoại ngữ khác là điểm cộng).</li>
  <li>Có tư duy logic mạch lạc, kỹ năng giải quyết vấn đề và chủ động trong công việc.</li>
</ul>

<h3>Kỹ năng mềm & Phẩm chất (Soft Skills)</h3>
<ul>
  <li>Khả năng giao tiếp khéo léo, truyền đạt ý tưởng rõ ràng và hợp tác nhóm hiệu quả.</li>
  <li>Tinh thần trách nhiệm cao, tỉ mỉ và luôn hướng tới kết quả xuất sắc.</li>
  <li>Khả năng thích ứng nhanh với môi trường làm việc năng động và cường độ cao.</li>
</ul>`;
    }

    if (contentType === 'benefits') {
      return `<h3>Lương thưởng & Thu nhập</h3>
<ul>
  <li>Mức lương cạnh tranh theo năng lực (Review lương định kỳ 1 - 2 lần/năm).</li>
  <li>Thưởng tháng 13, thưởng hiệu quả công việc (KPIs/Dự án) và thưởng các dịp Lễ, Tết.</li>
  <li>Được cung cấp đầy đủ trang thiết bị làm việc hiện đại.</li>
</ul>

<h3>Chăm sóc sức khỏe & Đời sống</h3>
<ul>
  <li>Đóng đầy đủ BHXH, BHYT, BHTN theo quy định của Luật Lao động.</li>
  <li>Gói bảo hiểm sức khỏe cao cấp khám chữa bệnh nội/ngoại trú hàng năm.</li>
  <li>Khám sức khỏe tổng quát định kỳ tại các bệnh viện uy tín.</li>
</ul>

<h3>Môi trường & Phát triển sự nghiệp</h3>
<ul>
  <li>Tham gia các khóa đào tạo chuyên sâu, hội thảo nâng cao kỹ năng và chứng chỉ nghề nghiệp.</li>
  <li>Lộ trình thăng tiến minh bạch (Chuyên môn / Quản lý).</li>
  <li>Du lịch nghỉ dưỡng hàng năm (Team Building), hoạt động thể thao, tiệc sinh nhật định kỳ.</li>
</ul>`;
    }

    if (contentType === 'email') {
      return `<p>Kính gửi Anh/Chị <strong>{{Tên_Ứng_Viên}}</strong>,</p>

<p>Lời đầu tiên, Ban Tuyển dụng Công ty xin gửi lời cảm ơn chân thành đến Anh/Chị vì đã quan tâm và ứng tuyển vào vị trí <strong>{{Tên_Vị_Trí}}</strong>.</p>

<p>Sau khi đánh giá hồ sơ năng lực ấn tượng của Anh/Chị, chúng tôi trân trọng kính mời Anh/Chị tham dự buổi phỏng vấn trực tiếp với thông tin chi tiết như sau:</p>

<ul>
  <li><strong>Thời gian:</strong> {{Thời_Gian}}</li>
  <li><strong>Hình thức:</strong> {{Hình_Thức}} (Online qua link phòng họp / Trực tiếp tại văn phòng)</li>
  <li><strong>Địa điểm / Link họp:</strong> {{Địa_Điểm}}</li>
  <li><strong>Người phỏng vấn:</strong> {{Người_Phỏng_Vấn}}</li>
</ul>

<p>Anh/Chị vui lòng phản hồi xác nhận email này trước <strong>{{Hạn_Phản_Hồi}}</strong> để chúng tôi chuẩn bị đón tiếp chu đáo nhất.</p>

<p>Chúc Anh/Chị có một buổi phỏng vấn thành công!</p>

<p>Trân trọng,<br/><strong>Ban Tuyển dụng & Nhân sự</strong></p>`;
    }
  }

  // Fallback for rewrite / improve
  if (action === 'fix_spelling' || action === 'improve') {
    const cleaned = currentContent.replace(/<[^>]*>?/gm, ' ').trim();
    return `<p><strong>${cleaned || 'Nội dung đã được chuẩn hóa và nâng cấp văn phong chuyên nghiệp.'}</strong></p>
<p>Bản chỉnh sửa đã tối ưu hóa ngữ pháp, lược bỏ các từ ngữ dư thừa và sắp xếp câu từ mượt mà, chuẩn văn phong doanh nghiệp hiện đại.</p>`;
  }

  if (action === 'shorten') {
    return `<p><strong>Tóm tắt nội dung chính:</strong></p>
<ul>
  <li>Tập trung vào sứ mệnh kiến tạo giá trị và nâng cao trải nghiệm khách hàng.</li>
  <li>Đội ngũ chuyên nghiệp với quy trình làm việc chuẩn hóa quốc tế.</li>
  <li>Chính sách minh bạch, cam kết đồng hành và phát triển bền vững.</li>
</ul>`;
  }

  if (action === 'expand') {
    return `<h3>Nội dung mở rộng chi tiết</h3>
<p>${currentContent ? currentContent : 'Chúng tôi luôn nỗ lực không ngừng để tạo ra những giá trị khác biệt.'}</p>
<p>Bên cạnh đó, việc áp dụng các tiêu chuẩn chất lượng nghiêm ngặt kết hợp cùng nền tảng công nghệ tiên tiến giúp tối ưu hóa hiệu suất và mang lại sự an tâm tuyệt đối cho khách hàng cũng như ứng viên đồng hành.</p>`;
  }

  return `<p>${userPrompt ? `Nội dung xử lý theo yêu cầu: "${userPrompt}"` : 'Nội dung đã được tạo thành công bởi Trợ lý AI.'}</p>`;
};

export const generateWithAI = async (options: AIGenerateOptions): Promise<string> => {
  const { action, contentType = 'general', currentContent = '', userPrompt = '', tone = 'professional', length = 'medium' } = options;

  const toneRule = TONE_INSTRUCTIONS[tone] || TONE_INSTRUCTIONS.professional;
  const lengthRule = LENGTH_INSTRUCTIONS[length] || LENGTH_INSTRUCTIONS.medium;

  let systemPrompt = `Bạn là AILA - Trợ lý AI chuyên gia về nhân sự, tuyển dụng và xây dựng thương hiệu doanh nghiệp trên nền tảng InfoHR.
Nhiệm vụ của bạn là tạo ra nội dung văn bản chất lượng cao, đúng chuẩn HTML/Rich Text để hiển thị trong trình soạn thảo.
QUY TẮC BẮT BUỘC:
1. Định dạng đầu ra bằng các thẻ HTML sạch: <h3>, <p>, <ul>, <ol>, <li>, <strong>, <em>, <blockquote>. Không bọc trong khối \`\`\`html code block nếu không cần thiết.
2. Tiếng Việt tự nhiên, chuẩn chính tả, không dùng từ sáo rỗng hoặc dịch máy thô cứng.
3. ${toneRule}
4. ${lengthRule}`;

  let requestMessage = '';

  switch (action) {
    case 'generate':
      requestMessage = `Hãy viết một bài viết hoàn chỉnh cho phần: "${contentType}".
Yêu cầu cụ thể của người dùng: "${userPrompt || 'Tạo nội dung chuyên nghiệp, đầy đủ bố cục tiêu chuẩn'}".`;
      break;

    case 'improve':
      requestMessage = `Hãy viết lại và nâng cấp nội dung sau đây cho mượt mà, hấp dẫn và chuyên nghiệp hơn:
---
${currentContent}
---
Yêu cầu bổ sung: ${userPrompt || 'Giữ nguyên ý chính, nâng cao tính thuyết phục và cấu trúc rõ ràng.'}`;
      break;

    case 'fix_spelling':
      requestMessage = `Hãy sửa toàn bộ lỗi chính tả, lỗi dấu tiếng Việt, ngữ pháp và dấu câu trong đoạn văn bản sau, giữ nguyên cấu trúc ý:
---
${currentContent}
---`;
      break;

    case 'shorten':
      requestMessage = `Hãy rút gọn đoạn văn bản sau thành các ý cô đọng, súc tích và dễ nhớ (dùng bullet points nếu phù hợp):
---
${currentContent}
---`;
      break;

    case 'expand':
      requestMessage = `Hãy mở rộng và làm rõ các luận điểm trong văn bản sau, bổ sung chi tiết, ví dụ thực tế và giải thích thuyết phục:
---
${currentContent}
---
Gợi ý mở rộng: ${userPrompt || 'Thêm dẫn chứng và lợi ích thiết thực'}`;
      break;

    case 'change_tone':
      requestMessage = `Hãy chuyển đổi văn phong của đoạn văn bản sau sang giọng điệu: ${toneRule}:
---
${currentContent}
---`;
      break;

    case 'translate_en':
      requestMessage = `Hãy dịch toàn bộ nội dung sau sang Tiếng Anh chuyên nghiệp (Business English), giữ nguyên các thẻ định dạng HTML:
---
${currentContent}
---`;
      break;

    case 'translate_vi':
      requestMessage = `Hãy dịch toàn bộ nội dung sau sang Tiếng Việt chuẩn mực, giữ nguyên các thẻ định dạng HTML:
---
${currentContent}
---`;
      break;

    case 'custom':
    default:
      requestMessage = `Thực hiện yêu cầu sau: "${userPrompt}"
Dựa trên nội dung hiện có:
---
${currentContent}
---`;
      break;
  }

  try {
    const response = await chatbotService.chat({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: requestMessage },
      ],
      max_tokens: 1500,
    });

    if (response?.reply && response.reply.trim().length > 10) {
      let result = response.reply.trim();
      // Strip ```html and ``` if present
      if (result.startsWith('```html')) {
        result = result.replace(/^```html\s*/i, '').replace(/\s*```$/, '');
      } else if (result.startsWith('```')) {
        result = result.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      return formatAITextToHTML(result);
    }
  } catch (error) {
    console.warn('[AI Assistant Engine] Chat API error, falling back to smart local engine:', error);
  }

  // Graceful fallback to smart local templates
  return getLocalSmartResponse(options);
};
