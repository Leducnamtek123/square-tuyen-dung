# -*- coding: utf-8 -*-
import logging
from django.core.management.base import BaseCommand
from apps.interviews.models import Question, QuestionGroup
from apps.common.models import Career

logger = logging.getLogger(__name__)

STANDARD_PACKAGES = [
    {
        "career_id": 41,
        "group_name": "Gói chuẩn Xây dựng: Kỹ sư Giám sát thi công hiện trường",
        "description": "Bộ câu hỏi chuẩn hóa đánh giá năng lực giám sát an toàn lao động, nghiệm thu vật tư, kiểm soát cốt thép và đổ bê tông theo tiêu chuẩn kỹ thuật.",
        "rubric": {
            "target_role": "Kỹ sư Giám sát công trường",
            "star_framework": "Bắt buộc có cấu trúc Tình huống, Nhiệm vụ, Hành động, Kết quả",
            "pass_score": 75,
        },
        "questions": [
            {
                "title": "Văn hóa an toàn lao động tại công trường",
                "text": "Văn hóa an toàn lao động tại công trường cần được xây dựng và duy trì thế nào, biện pháp xử lý sự cố vi phạm quy định an toàn nghiêm trọng?",
                "category": "situational",
                "difficulty": 2,
                "intent": "Đánh giá ý thức tuân thủ pháp luật an toàn lao động và kỹ năng kiên quyết bảo vệ an toàn tính mạng người lao động.",
                "star": {
                    "situation": "Mô tả một tình huống vi phạm an toàn lao động thực tế tại công trường",
                    "task": "Nhiệm vụ đình chỉ thi công nguy hiểm và lập biên bản hiện trường",
                    "action": "Các hành động kiên quyết xử lý, bổ sung rào chắn, tập huấn lại cho công nhân",
                    "result": "Công trường đạt mục tiêu không có tai nạn lao động, nâng cao ý thức tuân thủ",
                },
            },
            {
                "title": "Quy trình kiểm tra và nghiệm thu bê tông thương phẩm",
                "text": "Quy trình kiểm tra và nghiệm thu bê tông thương phẩm trước khi đổ sàn bao gồm những bước cụ thể nào, cách xử lý khi độ sụt không đạt chuẩn?",
                "category": "technical",
                "difficulty": 2,
                "intent": "Đánh giá kiến thức kỹ thuật nghiệm thu vật tư bê tông và độ chặt chẽ trong quản lý chất lượng.",
                "star": {
                    "situation": "Xe bồn bê tông đến hiện trường chậm hoặc trời mưa lớn",
                    "task": "Kiểm tra phiếu xuất xưởng, kẹp chì niêm phong, kiểm tra độ sụt và đúc mẫu lưu",
                    "action": "Từ chối tiếp nhận xe bồn vi phạm hoặc điều chỉnh phụ gia theo đúng chỉ dẫn tư vấn",
                    "result": "Đảm bảo chất lượng cấu kiện bê tông đạt mác thiết kế khi nén mẫu",
                },
            },
            {
                "title": "Biện pháp xử lý hiện tượng nứt sàn bê tông sau tháo khuôn",
                "text": "Biện pháp xử lý hiện tượng nứt sàn bê tông hoặc rỗ tổ ong sau khi tháo dỡ ván khuôn được thực hiện ra sao để bảo đảm kết cấu chịu lực?",
                "category": "problem_solving",
                "difficulty": 3,
                "intent": "Đánh giá tư duy chẩn đoán nguyên nhân khuyết tật bê tông và biện pháp khắc phục kỹ thuật chuẩn mực.",
                "star": {
                    "situation": "Phát hiện vết nứt chân chim hoặc rỗ mặt dầm sàn sau tháo cốp pha",
                    "task": "Khảo sát chiều rộng vết nứt, phân loại nứt co ngót hay nứt kết cấu",
                    "action": "Bơm keo epoxy gia cường kết cấu hoặc trám vữa tự chảy không co ngót SikaGrout",
                    "result": "Khôi phục hoàn toàn khả năng chịu lực và chống thấm của sàn dầm",
                },
            },
            {
                "title": "Phối hợp với tư vấn giám sát khi sai lệch bản vẽ",
                "text": "Kỹ năng phối hợp với tư vấn giám sát và đơn vị thiết kế khi phát hiện sai lệch giữa bản vẽ kỹ thuật và hiện trường thi công?",
                "category": "behavioral",
                "difficulty": 2,
                "intent": "Đánh giá kỹ năng giao tiếp chuyên nghiệp, bảo đảm minh bạch và tuân thủ quy trình nghiệm thu.",
                "star": {
                    "situation": "Bản vẽ thiết kế xung đột với hiện trạng móng công trình ngầm",
                    "task": "Lập phiếu yêu cầu làm rõ thông tin thiết kế RFI gửi tư vấn giám sát",
                    "action": "Tổ chức họp hiện trường ba bên, đưa ra phương án xử lý tối ưu tiến độ và chi phí",
                    "result": "Hồ sơ hoàn công chính xác, không chậm tiến độ và được phê duyệt nhanh chóng",
                },
            },
        ],
    },
    {
        "career_id": 41,
        "group_name": "Gói chuẩn Xây dựng: Kỹ sư Quản lý khối lượng và dự toán QS",
        "description": "Bộ câu hỏi chuẩn đánh giá bóc tách khối lượng, lập hồ sơ thanh quyết toán và kiểm soát phát sinh chi phí gói thầu xây dựng.",
        "rubric": {
            "target_role": "Kỹ sư QS Dự toán",
            "star_framework": "Bắt buộc có cấu trúc Tình huống, Nhiệm vụ, Hành động, Kết quả",
            "pass_score": 75,
        },
        "questions": [
            {
                "title": "Quy trình bóc tách khối lượng từ bản vẽ thi công",
                "text": "Quy trình bóc tách khối lượng từ bản vẽ thi công và phương pháp kiểm tra đối chiếu khối lượng thầu phụ đề nghị thanh toán?",
                "category": "technical",
                "difficulty": 2,
                "intent": "Đánh giá kỹ năng đọc bản vẽ chuyên sâu và sự tỉ mỉ trong tính toán số liệu dự toán.",
                "star": {
                    "situation": "Khối lượng thầu phụ gửi vượt định mức dự toán nội bộ của ban chỉ huy",
                    "task": "Tiến hành đo bóc lại từng trục dầm cột móng theo hồ sơ thiết kế thi công",
                    "action": "Đối chiếu bảng tính chi tiết, cắt giảm khối lượng khống và thống nhất khối lượng thực",
                    "result": "Tiết kiệm chi phí vật tư cho nhà thầu chính, minh bạch tài chính dự án",
                },
            },
            {
                "title": "Phương pháp lập dự toán báo giá gói thầu",
                "text": "Phương pháp lập dự toán báo giá gói thầu thi công xây dựng và phân tích chi phí trực tiếp, chi phí chung, lợi nhuận định mức?",
                "category": "technical",
                "difficulty": 3,
                "intent": "Đánh giá năng lực xây dựng đơn giá cạnh tranh nhằm thắng thầu nhưng vẫn bảo đảm biên độ lợi nhuận.",
                "star": {
                    "situation": "Chuẩn bị hồ sơ dự thầu cho dự án tổ hợp cao tầng tiến độ gấp",
                    "task": "Lập bảng tiên lượng mời thầu BOQ và bảng giá dự thầu chi tiết",
                    "action": "Liên hệ nhà cung cấp vật liệu lớn lấy báo giá tốt nhất, áp dụng định mức tối ưu",
                    "result": "Hồ sơ dự thầu trúng thầu với biên lợi nhuận kỳ vọng đạt trên mười hai phần trăm",
                },
            },
            {
                "title": "Xử lý tranh chấp phát sinh ngoài hợp đồng",
                "text": "Biện pháp xử lý tranh chấp khối lượng phát sinh ngoài phạm vi hợp đồng với chủ đầu tư để bảo đảm thanh toán đúng cam kết?",
                "category": "situational",
                "difficulty": 3,
                "intent": "Đánh giá sự am hiểu hợp đồng xây dựng FIDIC hoặc mẫu hợp đồng xây dựng Việt Nam.",
                "star": {
                    "situation": "Chủ đầu tư thay đổi biện pháp thi công móng nhưng từ chối thanh toán phụ lục phát sinh",
                    "task": "Bảo vệ quyền lợi tài chính chính đáng của nhà thầu thi công",
                    "action": "Thu thập nhật ký công trường, biên bản xác nhận hiện trường và điều khoản hợp đồng",
                    "result": "Chủ đầu tư đồng thuận ký phụ lục bổ sung giá trị phát sinh đầy đủ",
                },
            },
        ],
    },
    {
        "career_id": 41,
        "group_name": "Gói chuẩn Xây dựng: Chỉ huy trưởng công trình xây dựng",
        "description": "Bộ câu hỏi đánh giá năng lực điều phối tổng thể dự án, quản lý tiến độ, quản trị rủi ro và điều hành nhân lực tại công trường.",
        "rubric": {
            "target_role": "Chỉ huy trưởng công trình",
            "star_framework": "Bắt buộc có cấu trúc Tình huống, Nhiệm vụ, Hành động, Kết quả",
            "pass_score": 80,
        },
        "questions": [
            {
                "title": "Quản lý tiến độ tổng thể bằng sơ đồ đường găng",
                "text": "Phương pháp lập và điều hành tiến độ tổng thể dự án bằng sơ đồ đường găng, cách bù tiến độ khi chậm vì thời tiết bất lợi?",
                "category": "technical",
                "difficulty": 3,
                "intent": "Đánh giá tư duy quản trị dự án hiện đại và năng lực ứng biến tình huống cấp bách.",
                "star": {
                    "situation": "Dự án bị chậm hai tuần do mưa bão kéo dài tại giai đoạn thi công hầm",
                    "task": "Tái cấu trúc sơ đồ đường găng để đưa tiến độ trở lại mốc cam kết",
                    "action": "Tăng ca thi công ca đêm, bổ sung máy móc và giải quyết các nút thắt vật tư",
                    "result": "Công trình cất nóc đúng cam kết với chủ đầu tư, được khen thưởng tiến độ",
                },
            },
            {
                "title": "Kiểm soát hao hụt vật tư và dòng tiền công trường",
                "text": "Biện pháp tối ưu hóa dòng tiền và kiểm soát hao hụt vật tư chính thép xi măng trên đại công trường?",
                "category": "problem_solving",
                "difficulty": 3,
                "intent": "Đánh giá năng lực quản trị chi phí và ngăn ngừa thất thoát vật tư dự án.",
                "star": {
                    "situation": "Định mức tiêu hao thép cây bị đội vượt ba phần trăm so với hợp đồng",
                    "task": "Rà soát quy trình gia công uốn cắt thép tại bãi gia công hiện trường",
                    "action": "Áp dụng phần mềm tối ưu sơ đồ cắt thanh thép, tăng cường giám sát bảo vệ kho",
                    "result": "Tỷ lệ hao hụt giảm về mức tiêu chuẩn một phẩy lăm phần trăm, tiết kiệm chi phí lớn",
                },
            },
            {
                "title": "Kỹ năng giải quyết khủng hoảng và tranh chấp công trường",
                "text": "Kỹ năng giải quyết khủng hoảng khi xảy ra tranh chấp quyền lợi thầu phụ hoặc khiếu nại từ cư dân khu vực lân cận?",
                "category": "behavioral",
                "difficulty": 2,
                "intent": "Đánh giá bản lĩnh của người lãnh đạo công trường trong các tình huống nhạy cảm xã hội.",
                "star": {
                    "situation": "Cư dân liền kề khiếu nại công trình gây ồn và bụi bẩn ban đêm",
                    "task": "Xoa dịu bức xúc và tạo môi trường làm việc thuận lợi cho dự án",
                    "action": "Đối thoại trực tiếp với chính quyền địa phương, hỗ trợ lắp màn che bụi và đổi giờ thi công ồn",
                    "result": "Cư dân đồng thuận ký biên bản hòa giải, công trình tiếp tục thi công ổn định",
                },
            },
        ],
    },
    {
        "career_id": 43,
        "group_name": "Gói chuẩn Kiến trúc: Kiến trúc sư Quy hoạch và Ý tưởng",
        "description": "Bộ câu hỏi đánh giá tư duy không gian, khả năng phát triển ý tưởng quy hoạch kiến trúc và bảo vệ đồ án trước hội đồng.",
        "rubric": {
            "target_role": "Kiến trúc sư Ý tưởng và Quy hoạch",
            "star_framework": "Bắt buộc có cấu trúc Tình huống, Nhiệm vụ, Hành động, Kết quả",
            "pass_score": 75,
        },
        "questions": [
            {
                "title": "Quy trình phát triển ý tưởng kiến trúc từ bối cảnh",
                "text": "Quy trình hình thành ý tưởng kiến trúc từ nhiệm vụ thiết kế và bối cảnh khu đất, các yếu tố văn hóa bản địa được khai thác thế nào?",
                "category": "technical",
                "difficulty": 2,
                "intent": "Đánh giá chiều sâu tư duy sáng tạo và khả năng kết nối công trình với môi trường xung quanh.",
                "star": {
                    "situation": "Nhận đề bài thiết kế khu nghỉ dưỡng ven biển tại miền Trung Việt Nam",
                    "task": "Tạo dựng ngôn ngữ kiến trúc độc bản mang đậm hơi thở văn hóa địa phương",
                    "action": "Nghiên cứu hình tượng làng chài, kết hợp vật liệu gỗ đá và cấu trúc mái đón gió tự nhiên",
                    "result": "Đồ án ý tưởng đạt giải nhất vòng tuyển chọn của chủ đầu tư",
                },
            },
            {
                "title": "Tích hợp giải pháp kiến trúc xanh và vi khí hậu",
                "text": "Phương pháp tích hợp giải pháp kiến trúc xanh, tiết kiệm năng lượng và vi khí hậu vào đồ án thiết kế công trình dân dụng?",
                "category": "technical",
                "difficulty": 3,
                "intent": "Đánh giá năng lực thiết kế bền vững đáp ứng các tiêu chuẩn chứng chỉ xanh quốc tế.",
                "star": {
                    "situation": "Tòa nhà văn phòng cao tầng hướng tây chịu bức xạ mặt trời gay gắt",
                    "task": "Giảm tải trọng điều hòa nhiệt độ và chiếu sáng nhân tạo",
                    "action": "Thiết kế hệ lam chắn nắng thông minh hai lớp và khoảng thông tầng lấy sáng gián tiếp",
                    "result": "Giảm lượng điện tiêu thụ hai mươi phần trăm và đạt chứng nhận công trình xanh Lotus",
                },
            },
            {
                "title": "Bảo vệ đồ án kiến trúc trước chủ đầu tư",
                "text": "Kỹ năng thuyết minh và bảo vệ giải pháp kiến trúc khi chủ đầu tư muốn cắt giảm các chi tiết sáng tạo cốt lõi?",
                "category": "behavioral",
                "difficulty": 2,
                "intent": "Đánh giá khả năng thuyết phục, giữ vững bản sắc thiết kế nhưng vẫn tôn trọng bài toán kinh tế của khách hàng.",
                "star": {
                    "situation": "Chủ đầu tư muốn bỏ khoảng giếng trời trung tâm để tăng diện tích sàn kinh doanh",
                    "task": "Thuyết phục chủ đầu tư giữ lại giá trị không gian trải nghiệm",
                    "action": "Phân tích giá trị gia tăng của trải nghiệm ánh sáng giúp tăng giá bán sản phẩm toàn khu",
                    "result": "Chủ đầu tư giữ lại thiết kế giếng trời và dự án bán hết giỏ hàng giai đoạn một",
                },
            },
        ],
    },
    {
        "career_id": 43,
        "group_name": "Gói chuẩn Kiến trúc: Kiến trúc sư Triển khai bản vẽ BIM Revit",
        "description": "Bộ câu hỏi đánh giá kỹ năng phối hợp mô hình BIM, phát hiện va chạm và triển khai hồ sơ thiết kế kỹ thuật thi công chuẩn xác.",
        "rubric": {
            "target_role": "Kiến trúc sư BIM Revit",
            "star_framework": "Bắt buộc có cấu trúc Tình huống, Nhiệm vụ, Hành động, Kết quả",
            "pass_score": 75,
        },
        "questions": [
            {
                "title": "Quy trình phối hợp đa bộ môn trong mô hình BIM",
                "text": "Quy trình triển khai mô hình BIM Revit và quản lý phối hợp đa bộ môn kiến trúc, kết cấu, cơ điện MEP trên nền tảng đám mây?",
                "category": "technical",
                "difficulty": 2,
                "intent": "Đánh giá thành thạo công cụ BIM và khả năng làm việc nhóm kỹ thuật quy mô lớn.",
                "star": {
                    "situation": "Mô hình kiến trúc có nhiều điểm xung đột với hệ thống ống gió cứu hỏa tầng hầm",
                    "task": "Xử lý triệt để các xung đột trước khi xuất hồ sơ bản vẽ thi công",
                    "action": "Chạy báo cáo va chạm Navisworks, tổ chức buổi làm việc trực tiếp để hạ cốt trần hợp lý",
                    "result": "Xóa bỏ một trăm phần trăm va chạm kỹ thuật, tiết kiệm hàng tuần sửa chữa hiện trường",
                },
            },
            {
                "title": "Tiêu chuẩn hóa hồ sơ kỹ thuật thi công",
                "text": "Các tiêu chuẩn cấu trúc hồ sơ bản vẽ kỹ thuật thi công theo quy chuẩn xây dựng Việt Nam và cách kiểm soát mã hiệu cấu kiện?",
                "category": "technical",
                "difficulty": 2,
                "intent": "Đánh giá tính kỷ luật và tính chuẩn xác của hồ sơ phát hành ra công trường.",
                "star": {
                    "situation": "Dự án yêu cầu xuất hơn năm trăm bản vẽ chi tiết cấu tạo kiến trúc",
                    "task": "Đảm bảo tính đồng bộ mã hiệu cửa, hoàn thiện sàn trần và thống kê tự động",
                    "action": "Thiết lập bảng mẫu View Template và Parameter đồng nhất trên toàn dự án",
                    "result": "Hồ sơ bàn giao không có lỗi sai sót số liệu, được ban quản lý dự án thông qua",
                },
            },
            {
                "title": "Quản lý và chuẩn hóa thư viện Family trong Revit",
                "text": "Phương pháp xây dựng và quản lý thư viện cấu kiện Family Revit thông minh nhằm tránh làm phình dung lượng tệp dự án?",
                "category": "problem_solving",
                "difficulty": 3,
                "intent": "Đánh giá năng lực tối ưu hiệu năng hệ thống tệp đồ họa dung lượng lớn.",
                "star": {
                    "situation": "Tệp dự án Revit bị chậm và lag do nhiều thư viện phức tạp tải từ bên ngoài",
                    "task": "Tối ưu hóa và làm nhẹ mô hình để đội ngũ làm việc mượt mà",
                    "action": "Rà soát loại bỏ chi tiết thừa, chuyển đổi Family sang dạng tham số hóa tinh gọn",
                    "result": "Dung lượng tệp giảm bốn mươi phần trăm, tốc độ đồng bộ đám mây tăng gấp đôi",
                },
            },
        ],
    },
    {
        "career_id": 43,
        "group_name": "Gói chuẩn Kiến trúc: Kiến trúc sư Thiết kế nội thất và cảnh quan",
        "description": "Bộ câu hỏi đánh giá năng lực bố trí công năng nội thất, am hiểu vật liệu hoàn thiện và thiết kế cảnh quan sinh thái.",
        "rubric": {
            "target_role": "Kiến trúc sư Nội thất và Cảnh quan",
            "star_framework": "Bắt buộc có cấu trúc Tình huống, Nhiệm vụ, Hành động, Kết quả",
            "pass_score": 75,
        },
        "questions": [
            {
                "title": "Nguyên lý lựa chọn vật liệu nội thất cao cấp",
                "text": "Nguyên lý lựa chọn vật liệu hoàn thiện nội thất đáp ứng đồng thời yêu cầu thẩm mỹ, độ bền sử dụng và khả năng chống ẩm mốc?",
                "category": "technical",
                "difficulty": 2,
                "intent": "Đánh giá kiến thức thực tế về đặc tính cơ lý của vật liệu nội thất hiện đại.",
                "star": {
                    "situation": "Biệt thự cao cấp ven sông có độ ẩm không khí rất cao quanh năm",
                    "task": "Lựa chọn vật liệu nội thất không bị cong vênh hay ẩm mốc theo thời gian",
                    "action": "Tư vấn ứng dụng cốt gỗ chống ẩm An Cường phủ Laminate cao cấp và đá tự nhiên chống thấm",
                    "result": "Công trình sau ba năm sử dụng vẫn giữ nguyên vẻ đẹp ban đầu, gia chủ hài lòng",
                },
            },
            {
                "title": "Nghệ thuật chiếu sáng không gian nội thất",
                "text": "Kỹ thuật phân lớp ánh sáng chiếu sáng chức năng, chiếu sáng môi trường và chiếu sáng điểm nhấn trong không gian sống hiện đại?",
                "category": "technical",
                "difficulty": 2,
                "intent": "Đánh giá cảm thụ không gian và trình độ thẩm mỹ về ánh sáng nội thất.",
                "star": {
                    "situation": "Căn hộ penthouse có trần cao cần tạo không khí ấm cúng và sang trọng",
                    "task": "Thiết kế kịch bản chiếu sáng thông minh theo các thời điểm trong ngày",
                    "action": "Sử dụng đèn rãnh từ tính kết hợp đèn giấu trần ánh sáng vàng ba ngàn Kelvin",
                    "result": "Không gian nội thất đạt hiệu ứng thị giác đẳng cấp, tôn vinh tác phẩm nghệ thuật",
                },
            },
            {
                "title": "Thiết kế cảnh quan sinh thái cho nhà phố hướng tây",
                "text": "Giải pháp xử lý vi khí hậu thông gió và cây xanh cảnh quan cho nhà phố hướng tây bị giới hạn diện tích tiếp xúc thiên nhiên?",
                "category": "problem_solving",
                "difficulty": 2,
                "intent": "Đánh giá tư duy giải pháp cho các bài toán kiến trúc đô thị đặc thù tại Việt Nam.",
                "star": {
                    "situation": "Nhà phố diện tích hẹp chịu nắng nóng hướng chính diện vào buổi chiều",
                    "task": "Hạ nhiệt độ không khí bên trong mà không lạm dụng máy lạnh",
                    "action": "Bố trí vườn tường đứng, hồ nước đối lưu ở sân sau và thảm thực vật cản nhiệt ở ban công",
                    "result": "Nhiệt độ trong nhà giảm bốn độ so với ngoài trời, tạo không gian xanh mát",
                },
            },
        ],
    },
    {
        "career_id": 13,
        "group_name": "Gói chuẩn Bất động sản: Tư vấn và Môi giới phân khúc cao cấp",
        "description": "Bộ câu hỏi đánh giá kỹ năng tiếp cận khách hàng thượng lưu, tư vấn danh mục đầu tư và chốt giao dịch bất động sản hạng sang.",
        "rubric": {
            "target_role": "Chuyên viên Tư vấn Bất động sản cao cấp",
            "star_framework": "Bắt buộc có cấu trúc Tình huống, Nhiệm vụ, Hành động, Kết quả",
            "pass_score": 75,
        },
        "questions": [
            {
                "title": "Phương pháp xây dựng niềm tin với khách hàng VIP",
                "text": "Phương pháp tiếp cận và xây dựng mối quan hệ tin cậy với khách hàng phân khúc bất động sản hạng sang và siêu sang?",
                "category": "behavioral",
                "difficulty": 2,
                "intent": "Đánh giá phong thái chuyên nghiệp, sự am hiểu phong cách sống của tầng lớp thượng lưu.",
                "star": {
                    "situation": "Gặp gỡ khách hàng sở hữu nhiều doanh nghiệp lớn tại sự kiện giao thương",
                    "task": "Tạo ấn tượng ban đầu sâu sắc mà không tạo cảm giác bán hàng thô",
                    "action": "Lắng nghe chia sẻ về phong cách sống, gửi báo cáo phân tích thị trường chuyên sâu theo yêu cầu riêng",
                    "result": "Khách hàng tin tưởng ủy quyền tìm kiếm biệt thự biển giá trị năm mươi tỷ đồng",
                },
            },
            {
                "title": "Phân tích bài toán tài chính đòn bẩy ngân hàng",
                "text": "Cách phân tích bài toán tài chính đòn bẩy ngân hàng và tỷ suất lợi nhuận dòng tiền cho nhà đầu tư căn hộ cao cấp cho thuê?",
                "category": "technical",
                "difficulty": 2,
                "intent": "Đánh giá tư duy tài chính định lượng, giúp khách hàng nhìn thấy rõ bài toán sinh lời và rủi ro.",
                "star": {
                    "situation": "Nhà đầu tư băn khoăn giữa gửi tiết kiệm ngân hàng hay mua căn hộ hạng sang",
                    "task": "Lập bảng mô phỏng dòng tiền vay ưu đãi lãi suất và lợi suất cho thuê dự kiến",
                    "action": "Chứng minh tỷ suất sinh lời tổng hợp gồm tăng giá vốn và dòng tiền thuê vượt lãi tiết kiệm",
                    "result": "Khách hàng quyết định đặt cọc mua hai căn hộ trong tuần đầu mở bán",
                },
            },
            {
                "title": "Xử lý từ chối khi thị trường bất động sản biến động",
                "text": "Kỹ năng xử lý từ chối khi khách hàng lo ngại về pháp lý dự án hoặc tính thanh khoản của thị trường trong giai đoạn trầm lắng?",
                "category": "situational",
                "difficulty": 3,
                "intent": "Đánh giá bản lĩnh vững vàng và sự am hiểu tường tận về hành lang pháp lý luật nhà đất mới.",
                "star": {
                    "situation": "Khách hàng chuẩn bị ký hợp đồng mua bán nhưng lo ngại dự án chậm cấp sổ hồng",
                    "task": "Giải tỏa triệt để băn khoăn pháp lý cho khách hàng",
                    "action": "Cung cấp đầy đủ giấy phép xây dựng, văn bản nghiệm thu và cam kết bảo lãnh ngân hàng",
                    "result": "Khách hàng hoàn toàn yên tâm ký hợp đồng đúng lịch hẹn",
                },
            },
        ],
    },
    {
        "career_id": 13,
        "group_name": "Gói chuẩn Bất động sản: Thẩm định giá và Phân tích đầu tư",
        "description": "Bộ câu hỏi đánh giá phương pháp định giá tài sản, khảo sát thực địa và lập mô hình dòng tiền phân tích tính khả thi dự án.",
        "rubric": {
            "target_role": "Chuyên viên Thẩm định giá Bất động sản",
            "star_framework": "Bắt buộc có cấu trúc Tình huống, Nhiệm vụ, Hành động, Kết quả",
            "pass_score": 80,
        },
        "questions": [
            {
                "title": "Phương pháp so sánh và phương pháp thu nhập trong định giá",
                "text": "Các phương pháp thẩm định giá bất động sản phổ biến và căn cứ lựa chọn giữa phương pháp so sánh trực tiếp và phương pháp chiết khấu dòng tiền DCF?",
                "category": "technical",
                "difficulty": 3,
                "intent": "Đánh giá nền tảng lý thuyết và kỹ năng ứng dụng phương pháp định giá chuẩn quốc tế.",
                "star": {
                    "situation": "Cần định giá một tòa nhà phức hợp thương mại văn phòng đang vận hành khai thác",
                    "task": "Xác định giá trị thị trường khách quan phục vụ quyết định mua bán sáp nhập",
                    "action": "Áp dụng phương pháp dòng tiền chiết khấu DCF kết hợp phương pháp so sánh giao dịch tương đồng",
                    "result": "Báo cáo thẩm định giá được hội đồng đầu tư thông qua với biên độ tin cậy cao",
                },
            },
            {
                "title": "Quy trình khảo sát thực địa và rà soát pháp lý thửa đất",
                "text": "Quy trình điều tra khảo sát thực địa và đánh giá quy hoạch một phần năm trăm, quy hoạch phân khu của khu đất mục tiêu dự án?",
                "category": "technical",
                "difficulty": 2,
                "intent": "Đánh giá sự cẩn trọng và năng lực phát hiện rủi ro pháp lý tiềm ẩn của khu đất.",
                "star": {
                    "situation": "Khu đất mục tiêu có giá hấp dẫn nhưng có dấu hiệu dính hành lang an toàn lưới điện",
                    "task": "Xác định chính xác diện tích đất được phép chuyển đổi mục đích sử dụng",
                    "action": "Trích lục bản đồ địa chính, làm việc với cơ quan quy hoạch đô thị địa phương",
                    "result": "Phát hiện diện tích dính quy hoạch đường mở rộng, giúp công ty thương lượng giảm giá mua mười tỷ",
                },
            },
            {
                "title": "Phân tích kịch bản độ nhạy của dự án đầu tư",
                "text": "Phương pháp phân tích độ nhạy của các chỉ số tài chính NPV, IRR khi lãi suất cho vay tăng hoặc tỷ lệ lấp đầy giảm?",
                "category": "problem_solving",
                "difficulty": 3,
                "intent": "Đánh giá năng lực lượng hóa rủi ro tài chính của chuyên viên phân tích cao cấp.",
                "star": {
                    "situation": "Dự án phát triển khu đô thị đối mặt với biến động lãi suất thị trường tăng cao",
                    "task": "Đo lường sức chịu đựng tài chính của dự án trước các kịch bản xấu",
                    "action": "Xây dựng mô hình tài chính động với ba kịch bản cơ sở, lạc quan và bi quan",
                    "result": "Đề xuất mức vốn vay an toàn không vượt quá bốn mươi phần trăm tổng mức đầu tư",
                },
            },
        ],
    },
    {
        "career_id": 13,
        "group_name": "Gói chuẩn Bất động sản: Quản lý giỏ hàng và Khai thác dự án",
        "description": "Bộ câu hỏi đánh giá năng lực phân bổ rổ hàng, xây dựng chính sách bán hàng và tối ưu hóa doanh thu khai thác dự án.",
        "rubric": {
            "target_role": "Trưởng phòng Quản lý giỏ hàng",
            "star_framework": "Bắt buộc có cấu trúc Tình huống, Nhiệm vụ, Hành động, Kết quả",
            "pass_score": 80,
        },
        "questions": [
            {
                "title": "Chiến lược chia giỏ hàng và định giá từng đợt mở bán",
                "text": "Chiến lược chia bảng hàng và chính sách định giá từng giai đoạn mở bán nhằm tối đa hóa tổng doanh thu toàn dự án?",
                "category": "technical",
                "difficulty": 3,
                "intent": "Đánh giá tầm nhìn chiến lược thương mại và nghệ thuật tạo sức hút thị trường.",
                "star": {
                    "situation": "Dự án quy mô một nghìn căn hộ chuẩn bị ra mắt thị trường trong bối cảnh cạnh tranh",
                    "task": "Tạo hiệu ứng sốt hàng ngay đợt đầu nhưng vẫn giữ lại biên lợi nhuận cho các đợt sau",
                    "action": "Mở bán đợt một hai mươi phần trăm quỹ căn với giá hấp dẫn, tăng giá ba phần trăm ở các đợt tiếp",
                    "result": "Tổng doanh thu dự án vượt sáu phần trăm so với kế hoạch ban đầu",
                },
            },
            {
                "title": "Điều tiết nhịp độ phân phối qua hệ thống đại lý sàn F1",
                "text": "Phương pháp kiểm soát tỷ lệ khớp căn và điều tiết nhịp độ bán hàng công bằng giữa các sàn liên minh đại lý phân phối F1, F2?",
                "category": "behavioral",
                "difficulty": 2,
                "intent": "Đánh giá năng lực quản trị kênh phân phối quy mô lớn và xử lý xung đột quyền lợi giữa các sàn đối tác.",
                "star": {
                    "situation": "Nhiều đại lý cùng lúc tranh chấp một căn góc biệt thự có vị trí đẹp nhất dự án",
                    "task": "Giải quyết tranh chấp minh bạch không làm rạn nứt mối quan hệ hợp tác đại lý",
                    "action": "Áp dụng hệ thống khóa căn điện tử thời gian thực theo thứ tự đóng tiền cọc hợp lệ",
                    "result": "Các đại lý tôn trọng quyết định, toàn bộ giỏ hàng biệt thự được tiêu thụ trong hai ngày",
                },
            },
            {
                "title": "Giải pháp giải phóng hàng tồn kho và căn khó thanh khoản",
                "text": "Giải pháp kích cầu và chính sách tài chính đột phá để giải phóng quỹ căn tầng xấu hoặc vị trí khó thanh khoản ở cuối dự án?",
                "category": "problem_solving",
                "difficulty": 3,
                "intent": "Đánh giá khả năng sáng tạo trong tiếp thị bán lẻ và xử lý hàng tồn bất động sản.",
                "star": {
                    "situation": "Dự án còn tồn năm mươi căn hộ tầng thấp gần bãi đỗ xe",
                    "task": "Thanh lý dứt điểm toàn bộ sản phẩm tồn đọng để kết thúc dự án",
                    "action": "Gói chính sách tặng gói nội thất cao cấp miễn phí kèm chính sách hỗ trợ lãi suất kéo dài hai năm",
                    "result": "Thanh khoản thành công toàn bộ năm mươi căn trong vòng bốn mươi lăm ngày",
                },
            },
        ],
    },
]

class Command(BaseCommand):
    help = "Nap 9 goi cau hoi nghiep vu chuan cho nganh Xay dung, Kien truc va Bat dong san"

    def handle(self, *args, **options):
        self.stdout.write("Bat dau nap 9 goi cau hoi nghiep vu chuan hoa...")

        created_groups = 0
        created_questions = 0

        for pkg in STANDARD_PACKAGES:
            career_id = pkg["career_id"]
            career = Career.objects.filter(id=career_id).first()

            group, g_created = QuestionGroup.objects.get_or_create(
                name=pkg["group_name"],
                defaults={
                    "description": pkg["description"],
                    "is_public": True,
                    "evaluation_rubric": pkg["rubric"],
                }
            )
            if not g_created:
                group.description = pkg["description"]
                group.is_public = True
                group.evaluation_rubric = pkg["rubric"]
                group.save()

            created_groups += 1

            for q_data in pkg["questions"]:
                q, q_created = Question.objects.get_or_create(
                    title=q_data["title"],
                    defaults={
                        "text": q_data["text"],
                        "category": q_data["category"],
                        "difficulty": q_data["difficulty"],
                        "career": career,
                        "interviewer_intent": q_data["intent"],
                        "answer_structure": q_data["star"],
                        "default_duration_seconds": 120,
                    }
                )
                if not q_created:
                    q.text = q_data["text"]
                    q.category = q_data["category"]
                    q.difficulty = q_data["difficulty"]
                    q.career = career
                    q.interviewer_intent = q_data["intent"]
                    q.answer_structure = q_data["star"]
                    q.save()

                group.questions.add(q)
                created_questions += 1

        self.stdout.write(self.style.SUCCESS(
            f"Da hoan tat nap {created_groups} goi cau hoi chuan va {created_questions} cau hoi vao he thong!"
        ))

