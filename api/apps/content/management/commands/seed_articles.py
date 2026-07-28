from datetime import timedelta
from pathlib import Path

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from apps.accounts.models import User
from apps.content.models import Article, slugify_vi
from apps.files.models import File
from shared.configs import variable_system as var_sys
from shared.helpers.cloudinary_service import CloudinaryService


ARTICLE_ROOT = Path(__file__).resolve().parents[4] / "data" / "seed_images" / "articles"
AUTHOR_EMAIL = "ceohub.hostmaster@gmail.com"


def _upload_thumbnail(image_path: Path, public_id: str) -> File | None:
    if not image_path.exists():
        return None

    result = CloudinaryService.upload_image(str(image_path), "articles", public_id=public_id)
    if not result:
        return None

    thumbnail, _ = File.objects.update_or_create(
        public_id=result["public_id"],
        defaults={
            "version": result.get("version", ""),
            "format": result.get("format", "webp"),
            "resource_type": result.get("resource_type", "image"),
            "file_type": File.OTHER_TYPE,
            "uploaded_at": result.get("created_at") or timezone.now(),
            "metadata": result,
        },
    )
    return thumbnail


ARTICLE_SEEDS = [
    # ─── Category: cam-nang (Cẩm nang nghề nghiệp) ───────────────────────────
    {
        "title": "Cẩm nang phát triển sự nghiệp Chuyên viên Kinh doanh Bất động sản từ Junior đến Giám đốc Sàn",
        "category": Article.CATEGORY_CAM_NANG,
        "thumbnail": ARTICLE_ROOT / "real_estate.jpg",
        "tags": "cam-nang,bất động sản,career,kinh nghiệm,sales,sự nghiệp",
        "excerpt": "Lộ trình thăng tiến, các mốc kỹ năng cần tích lũy và bí quyết xây dựng mạng lưới khách hàng cao cấp trong ngành Bất động sản.",
        "content": """
            <p>Thị trường bất động sản cần đội ngũ tư vấn viên biết đọc nhu cầu, hiểu sản phẩm và giữ nhịp chăm sóc khách hàng dài hơi. Để phát triển từ một chuyên viên kinh doanh mới vào nghề (Junior) lên quản lý và Giám đốc sàn, ứng viên cần làm chủ các khối năng lực cốt lõi.</p>
            <h2>1. Giai đoạn Junior (0 - 2 năm kinh nghiệm)</h2>
            <p>Tập trung nắm vững kiến thức quy hoạch, pháp lý dự án, chính sách ngân hàng và kỹ năng tìm kiếm khách hàng tiềm năng. Kỷ luật follow-up trên hệ thống CRM là yếu tố quyết định sự thành bại.</p>
            <h2>2. Giai đoạn Senior & Trưởng nhóm (2 - 5 năm kinh nghiệm)</h2>
            <p>Tích lũy kỹ năng xử lý từ chối chuyên sâu, đàm phán hợp đồng giá trị cao và dẫn dắt đội nhóm kinh doanh. Thành thạo phân tích dòng tiền đầu tư giúp gia tăng tỷ lệ chốt deal.</p>
            <h2>3. Định hướng Giám đốc Sàn / Giám đốc Kinh doanh</h2>
            <p>Hoạch định chiến lược phân phối dự án, quản trị rủi ro pháp lý và xây dựng văn hóa đội ngũ bán hàng bứt phá doanh số.</p>
        """,
    },
    {
        "title": "Lộ trình thăng tiến của Kỹ sư Xây dựng công trường: Từ Giám sát đến Chỉ huy trưởng",
        "category": Article.CATEGORY_CAM_NANG,
        "thumbnail": ARTICLE_ROOT / "construction.jpg",
        "tags": "cam-nang,xây dựng,kỹ sư,công trường,chỉ huy trưởng,dự án",
        "excerpt": "Phân tích chi tiết các giai đoạn phát triển sự nghiệp kỹ sư xây dựng, năng lực quản lý dự án và quản trị an toàn thi công.",
        "content": """
            <p>Tuyển dụng và phát triển nhân sự công trường xây dựng đòi hỏi sự kết hợp giữa bằng cấp chuyên môn và bản lĩnh thực chiến. Dưới đây là lộ trình thăng tiến chuẩn trong ngành xây dựng công trình.</p>
            <h2>1. Kỹ sư giám sát thi công (Site Engineer)</h2>
            <p>Phụ trách đọc bản vẽ, bóc tách khối lượng, kiểm tra chất lượng vật tư đầu vào và trực tiếp giám sát đội thợ tại hiện trường theo đúng thiết kế được duyệt.</p>
            <h2>2. Kỹ sư QS & QA/QC (Quantity Surveyor & Quality Control)</h2>
            <p>Kiểm soát hồ sơ thanh quyết toán, quản lý khối lượng phát sinh và thiết lập hệ thống tiêu chuẩn chất lượng công trình.</p>
            <h2>3. Chỉ huy trưởng công trình (Project Manager / Site Manager)</h2>
            <p>Chịu trách nhiệm toàn bộ về tiến độ, an toàn lao động, ngân sách và đối ứng với Chủ đầu tư, Tư vấn giám sát và chính quyền địa phương.</p>
        """,
    },
    {
        "title": "Cẩm nang toàn tập cho Nhà thiết kế Nội thất: Từ bản vẽ 3D đến Quản lý công trình",
        "category": Article.CATEGORY_CAM_NANG,
        "thumbnail": ARTICLE_ROOT / "interior.jpg",
        "tags": "cam-nang,nội thất,designer,thiết kế,dự án,thi công",
        "excerpt": "Những kỹ năng thực tế thiết yếu giúp Designer Nội thất bứt phá từ vẽ rendering sang chủ động quản lý dự án và làm việc với xưởng sản xuất.",
        "content": """
            <p>Trong ngành thiết kế nội thất, portfolio đẹp chỉ là điểm bắt đầu. Sự nghiệp bền vững của một Designer phụ thuộc vào khả năng hiện thực hóa bản vẽ thành công trình thực tế.</p>
            <h2>Năng lực hiểu vật liệu & Xưởng sản xuất</h2>
            <p>Kiến thức về gỗ công nghiệp, gỗ tự nhiên, đá, kim loại và phụ kiện bếp giúp nhà thiết kế tối ưu hóa chi phí sản xuất mà vẫn đảm bảo tính thẩm mỹ.</p>
            <h2>Kỹ năng quản lý kỳ vọng khách hàng</h2>
            <p>Giải thích rõ ràng sự khác biệt giữa ảnh phối cảnh 3D và vật liệu thực tế, giúp khách hàng đưa ra quyết định phù hợp với ngân sách đầu tư.</p>
        """,
    },
    {
        "title": "Định hướng sự nghiệp Kiến trúc sư: Phát triển theo hướng Chuyên gia thiết kế hay Quản lý đồ án",
        "category": Article.CATEGORY_CAM_NANG,
        "thumbnail": ARTICLE_ROOT / "architecture.jpg",
        "tags": "cam-nang,kiến trúc,kiến trúc sư,thiết kế,quản lý,studio",
        "excerpt": "So sánh 2 con đường sự nghiệp phổ biến của Kiến trúc sư tại Việt Nam và cách chuẩn bị bộ hồ sơ năng lực để gia nhập các tập đoàn lớn.",
        "content": """
            <p>Kiến trúc sư sau 3-5 năm làm việc thường đứng trước hai lựa chọn quan trọng: đi sâu vào nghiên cứu ý tưởng kiến trúc (Design Architect) hay phát triển thành Quản lý đồ án (Project Architect).</p>
            <h2>1. Con đường Design Lead / Concept Architect</h2>
            <p>Tập trung nghiên cứu hình khối, không gian, bối cảnh đô thị và tạo ra các phương án kiến trúc độc đáo cho dự án.</p>
            <h2>2. Con đường Project Manager / Technical Lead</h2>
            <p>Chịu trách nhiệm phối hợp bộ môn (Kết cấu, ME), giải quyết bài toán quy chuẩn PCCC, cấp phép xây dựng và hồ sơ thi công chi tiết.</p>
        """,
    },

    # ─── Category: thu-tuc-lao-dong (Thủ tục & Quyền lợi lao động) ───────────
    {
        "title": "Quy định an toàn lao động và chế độ phụ cấp độc hại cho nhân sự công trường Xây dựng",
        "category": Article.CATEGORY_THU_TUC,
        "thumbnail": ARTICLE_ROOT / "construction.jpg",
        "tags": "thu-tuc-lao-dong,xây dựng,an toàn lao động,bhxh,quyền lợi,luật lao động",
        "excerpt": "Tổng hợp quy định pháp luật về bảo hộ lao động, phụ cấp nặng nhọc độc hại và chế độ bảo hiểm tai nạn công trường năm 2026.",
        "content": """
            <p>Làm việc tại công trường xây dựng luôn tiềm ẩn nhiều rủi ro. Người lao động và doanh nghiệp xây dựng cần nắm rõ các quy định pháp lý để bảo vệ quyền lợi chính đáng.</p>
            <h2>Bảo hộ lao động bắt buộc</h2>
            <p>Doanh nghiệp phải trang bị đầy đủ mũ bảo hiểm, giày chống đinh, dây an toàn làm việc trên cao và thực hiện huấn luyện an toàn lao động định kỳ.</p>
            <h2>Chế độ phụ cấp nặng nhọc, độc hại</h2>
            <p>Mức phụ cấp được tính theo quy định của Bộ LĐTB&XH dựa trên môi trường làm việc thực tế, tiếng ồn, bụi bẩn và độ cao công trình.</p>
        """,
    },
    {
        "title": "Cơ chế hợp đồng lao động & Hoa hồng cho nhân sự Kinh doanh Bất động sản",
        "category": Article.CATEGORY_THU_TUC,
        "thumbnail": ARTICLE_ROOT / "real_estate.jpg",
        "tags": "thu-tuc-lao-dong,bất động sản,hợp đồng lao động,hoa hồng,quyền lợi,bhxh",
        "excerpt": "Giải mã các điều khoản hợp đồng lao động, lương cứng, chiết khấu doanh số và đóng BHXH cho nhân viên sàn giao dịch Bất động sản.",
        "content": """
            <p>Hợp đồng lao động ngành Bất động sản thường có cấu trúc đặc thù kết hợp giữa lương cơ bản và hoa hồng doanh số theo dự án.</p>
            <h2>Điều khoản hoa hồng và thời điểm chi trả</h2>
            <p>Hợp đồng cần ghi rõ tỷ lệ % hoa hồng, điều kiện giải ngân (khi khách ký hợp đồng mua bán hay khi hoàn thành thanh toán) để tránh tranh chấp.</p>
            <h2>Quyền lợi BHXH và phúc lợi</h2>
            <p>Đảm bảo doanh nghiệp đóng BHXH, BHYT theo mức lương ký kết trong hợp đồng lao động đúng quy định pháp luật.</p>
        """,
    },
    {
        "title": "Chế độ công tác phí & Quy định thử việc đối với Kỹ sư & Thiết kế Nội thất",
        "category": Article.CATEGORY_THU_TUC,
        "thumbnail": ARTICLE_ROOT / "interior.jpg",
        "tags": "thu-tuc-lao-dong,nội thất,kỹ sư,thử việc,chế độ,công tác phí",
        "excerpt": "Hướng dẫn xây dựng hợp đồng thử việc, bảo hộ quyền sáng tạo và tính chi phí đi công trình xa cho nhân sự ngành thiết kế & thi công nội thất.",
        "content": """
            <p>Nhân sự ngành nội thất thường xuyên di chuyển giữa văn phòng thiết kế, xưởng sản xuất và công trình thi công thực tế.</p>
            <h2>Thời gian thử việc & Mức lương thử việc</h2>
            <p>Thời gian thử việc tối đa 60 ngày đối với vị trí trình độ cao đẳng/đại học, mức lương thử việc ít nhất bằng 85% lương chính thức.</p>
            <h2>Quy định công tác phí</h2>
            <p>Chi phí đi lại, ăn ở và phụ cấp khảo sát công trình ngoài tỉnh cần được quy định rõ ràng trong quy chế tài chính công ty.</p>
        """,
    },
    {
        "title": "Thủ tục đăng ký chứng chỉ hành nghề Kiến trúc sư và quyền bảo hộ tác phẩm thiết kế",
        "category": Article.CATEGORY_THU_TUC,
        "thumbnail": ARTICLE_ROOT / "architecture.jpg",
        "tags": "thu-tuc-lao-dong,kiến trúc,chứng chỉ hành nghề,bản quyền,luật lao động",
        "excerpt": "Điều kiện thi cấp chứng chỉ hành nghề kiến trúc Hạng I, II, III và các điều khoản bảo hộ sở hữu trí tuệ hồ sơ bản vẽ.",
        "content": """
            <p>Chứng chỉ hành nghề là điều kiện bắt buộc để Kiến trúc sư ký tên trên hồ sơ xin phép xây dựng và chủ trì đồ án kiến trúc.</p>
            <h2>Điều kiện xét cấp chứng chỉ</h2>
            <p>Tốt nghiệp đại học chuyên ngành Kiến trúc, có thâm niên công tác từ 3-5 năm và đạt kỳ thi sát hạch cấp chứng chỉ hành nghề.</p>
            <h2>Bảo hộ bản quyền bản vẽ</h2>
            <p>Tác quyền bản vẽ kiến trúc thuộc về tác giả hoặc đơn vị chủ quản theo thỏa thuận trong hợp đồng giao việc.</p>
        """,
    },

    # ─── Category: thue-tncn (Thuế & Quyết toán TNCN) ─────────────────────────
    {
        "title": "Hướng dẫn kê khai và quyết toán Thuế TNCN cho Môi giới & Chuyên viên Bất động sản",
        "category": Article.CATEGORY_THUE,
        "thumbnail": ARTICLE_ROOT / "real_estate.jpg",
        "tags": "thue-tncn,bất động sản,quyết toán thuế,thuế thu nhập,môi giới,giảm trừ",
        "excerpt": "Cách giảm trừ gia cảnh, kê khai thu nhập từ hoa hồng và hoàn thuế TNCN chi tiết cho nhân sự ngành Bất động sản.",
        "content": """
            <p>Nhân sự kinh doanh Bất động sản thường có thu nhập biến động lớn theo từng tháng do các khoản thưởng và hoa hồng dự án.</p>
            <h2>Khấu trừ thuế 10% tại nguồn</h2>
            <p>Các khoản thu nhập chi trả cho nhân viên môi giới tự do hoặc cộng tác viên thường bị khấu trừ 10% trước khi chi trả.</p>
            <h2>Thủ tục quyết toán và hoàn thuế</h2>
            <p>Cuối năm tài chính, người lao động gom chứng từ khấu trừ thuế để làm thủ tục quyết toán trực tiếp với cơ quan thuế để nhận hoàn thuế nếu nộp thừa.</p>
        """,
    },
    {
        "title": "Cách tính thuế TNCN đối với phụ cấp công tác xa nhà và thưởng tiến độ dự án Xây dựng",
        "category": Article.CATEGORY_THUE,
        "thumbnail": ARTICLE_ROOT / "construction.jpg",
        "tags": "thue-tncn,xây dựng,phụ cấp,thưởng tiến độ,quyết toán thuế,kỹ sư",
        "excerpt": "Phân biệt các khoản phụ cấp chịu thuế và miễn thuế đối với Kỹ sư, Chỉ huy trưởng thi công dự án xây dựng ngoài tỉnh.",
        "content": """
            <p>Các khoản phụ cấp lưu động, phụ cấp vé máy bay công tác công trường xây dựng có những quy định riêng về tính thuế TNCN.</p>
            <h2>Các khoản phụ cấp được miễn thuế</h2>
            <p>Phụ cấp tiền ăn trưa, tiền trang phục công trường, công tác phí theo quy chế nội bộ công ty nằm trong định mức không chịu thuế TNCN.</p>
            <h2>Tiền thưởng tiến độ công trình</h2>
            <p>Các khoản thưởng hoàn thành mốc tiến độ dự án được tính cộng chung vào thu nhập chịu thuế từ tiền lương, tiền công trong kỳ.</p>
        """,
    },
    {
        "title": "Hướng dẫn quyết toán Thuế TNCN cho Kiến trúc sư & Designer làm Freelance kết hợp",
        "category": Article.CATEGORY_THUE,
        "thumbnail": ARTICLE_ROOT / "architecture.jpg",
        "tags": "thue-tncn,kiến trúc,nội thất,freelance,quyết toán thuế,hoàn thuế",
        "excerpt": "Giải pháp quản lý thu nhập từ nhiều nguồn, kê khai thuế vãng lai và các chứng từ khấu trừ thuế TNCN cần lưu giữ.",
        "content": """
            <p>Nhiều Kiến trúc sư và Nhà thiết kế Nội thất vừa nhận lương cố định tại công ty vừa nhận thiết kế công trình tự do bên ngoài.</p>
            <h2>Tổng hợp thu nhập từ nhiều nơi</h2>
            <p>Người lao động có thu nhập từ 2 nơi trở lên bắt buộc phải tự ủy quyền hoặc trực tiếp quyết toán thuế TNCN với Chi cục Thuế quản lý.</p>
            <h2>Lưu giữ chứng từ khấu trừ thuế</h2>
            <p>Yêu cầu các bên thuê thiết kế cấp chứng từ khấu trừ thuế TNCN (điện tử) để làm căn cứ đối trừ khi kê khai quyết toán năm.</p>
        """,
    },

    # ─── Category: bi-quyet-cv (Bí quyết viết CV & Phỏng vấn) ─────────────────
    {
        "title": "Cách sắp xếp Portfolio Kiến trúc & Viết CV chuẩn chinh phục các Studio hàng đầu",
        "category": Article.CATEGORY_CV,
        "thumbnail": ARTICLE_ROOT / "architecture.jpg",
        "tags": "bi-quyet-cv,kiến trúc,portfolio,mẫu cv,phỏng vấn,thiết kế",
        "excerpt": "Bí quyết bố cục bản vẽ, diễn họa 3D và trình bày tư duy thiết kế trong Portfolio để ấn tượng mạnh với Giám đốc sáng tạo.",
        "content": """
            <p>Bộ hồ sơ ứng tuyển của Kiến trúc sư gồm 2 thành phần không thể tách rời: CV tóm tắt năng lực và Portfolio trình diễn đồ án.</p>
            <h2>1. Cấu trúc Portfolio ấn tượng</h2>
            <p>Lựa chọn 3-5 dự án tiêu biểu nhất. Mỗi dự án cần thể hiện từ Concept, sơ đồ phân tích không gian (Diagram), bản vẽ kỹ thuật đến phối cảnh 3D.</p>
            <h2>2. Trình bày vai trò cá nhân rõ ràng</h2>
            <p>Ghi rõ phạm vi công việc bạn đảm nhận trong đồ án nhóm: chủ trì thiết kế, vẽ dựng hình 3D hay khai triển hồ sơ kỹ thuật thi công.</p>
        """,
    },
    {
        "title": "Bí quyết trình bày kinh nghiệm dự án trong CV Kỹ sư Xây dựng & Phỏng vấn Chỉ huy trưởng",
        "category": Article.CATEGORY_CV,
        "thumbnail": ARTICLE_ROOT / "construction.jpg",
        "tags": "bi-quyet-cv,xây dựng,kỹ sư,phỏng vấn,dự án,kinh nghiệm",
        "excerpt": "Cách đưa quy mô công trình, chỉ số an toàn và ngân sách dự án vào CV cùng bộ 10 câu hỏi phỏng vấn chuyên sâu cho Kỹ sư.",
        "content": """
            <p>CV của Kỹ sư Xây dựng sẽ vượt trội hơn nếu được định lượng bằng các con số cụ thể từ các dự án đã tham gia.</p>
            <h2>Con số biết nói trong CV</h2>
            <p>Đưa thông tin chi tiết: Diện tích sàn (GFA), số tầng hầm, cấp công trình, tổng vốn đầu tư và số lượng công nhân quản lý trực tiếp.</p>
            <h2>Bộ câu hỏi phỏng vấn thực tế</h2>
            <p>Chuẩn bị kỹ các tình huống xử lý sự cố công trường: sạt lở móng, xung đột tiến độ giữa các nhà thầu phụ và xử lý thay đổi thiết kế từ Chủ đầu tư.</p>
        """,
    },
    {
        "title": "Mẫu CV & Bộ hồ sơ năng lực dành riêng cho Designer & Kỹ sư Giám sát Nội thất",
        "category": Article.CATEGORY_CV,
        "thumbnail": ARTICLE_ROOT / "interior.jpg",
        "tags": "bi-quyet-cv,nội thất,cv đẹp,phỏng vấn,hồ sơ năng lực,designer",
        "excerpt": "Hướng dẫn chọn lọc công trình tiêu biểu, thể hiện khả năng bổ chi tiết kỹ thuật và làm việc với xưởng trong hồ sơ ứng tuyển.",
        "content": """
            <p>Tuyển dụng vị trí Thiết kế Nội thất đòi hỏi sự cân bằng giữa tư duy thẩm mỹ và tính khả thi trong sản xuất lắp đặt.</p>
            <h2>Trình bày bản vẽ chi tiết cấu tạo</h2>
            <p>Bên cạnh hình phối cảnh 3D đẹp mắt, hãy kèm theo 1-2 bản vẽ bổ chi tiết đồ gỗ (Cabinetry detail) để thể hiện sự am hiểu kỹ thuật.</p>
            <h2>Kỹ năng trình bày phương án (Pitching)</h2>
            <p>Trong buổi phỏng vấn, hãy chuẩn bị bài thuyết trình ngắn 5 phút về một dự án bạn tự hào nhất: từ bài toán của khách hàng đến giải pháp thiết kế.</p>
        """,
    },
    {
        "title": "Bộ 15 câu hỏi phỏng vấn tuyển dụng Quản lý Kinh doanh Bất động sản và cách chốt deal thành công",
        "category": Article.CATEGORY_CV,
        "thumbnail": ARTICLE_ROOT / "real_estate.jpg",
        "tags": "bi-quyet-cv,bất động sản,phỏng vấn,câu hỏi phỏng vấn,sales manager,chốt deal",
        "excerpt": "Các tình huống phỏng vấn thực tế đánh giá tư duy phân tích thị trường, kỹ năng xử lý từ chối và quản lý đội nhóm sales.",
        "content": """
            <p>Phỏng vấn vị trí quản lý sales Bất động sản tập trung vào năng lực hoạch định thị trường và dẫn dắt đội ngũ chốt mục tiêu doanh số.</p>
            <h2>1. Câu hỏi về chiến lược tiếp cận thị trường</h2>
            <p>"Bạn sẽ phân bổ ngân sách marketing và nguồn lead như thế nào cho một dự án căn hộ cao cấp mới ra mắt?"</p>
            <h2>2. Câu hỏi về giải quyết khủng hoảng niềm tin khách hàng</h2>
            <p>"Cách bạn hỗ trợ chuyên viên xử lý khi dự án gặp thay đổi về tiến độ bàn giao hoặc chính sách tín dụng ngân hàng?"</p>
        """,
    },

    # ─── Category: xu-huong (Báo cáo & Xu hướng tuyển dụng) ───────────────────
    {
        "title": "Báo cáo thị trường nhân sự & Bảng lương ngành Xây dựng, Bất động sản, Nội thất & Kiến trúc 2026",
        "category": Article.CATEGORY_XU_HUONG,
        "thumbnail": ARTICLE_ROOT / "construction.jpg",
        "tags": "xu-huong,xây dựng,bất động sản,nội thất,kiến trúc,bảng lương,báo cáo",
        "excerpt": "Phân tích nhu cầu tuyển dụng, mức lương trung bình theo từng năm kinh nghiệm và xu hướng đãi ngộ trong 4 ngành trọng điểm.",
        "content": """
            <p>Báo cáo nhân sự thường niên của Info HR cập nhật bức tranh toàn cảnh về nhu cầu tuyển dụng và khoảng lương thưởng năm 2026.</p>
            <h2>Ngành Xây dựng & Kiến trúc</h2>
            <p>Nhu cầu tuyển dụng Kỹ sư BIM, Kỹ sư MEP và Kiến trúc sư có chứng chỉ công trình xanh tăng 25% so với cùng kỳ.</p>
            <h2>Ngành Bất động sản & Nội thất</h2>
            <p>Thị trường chứng kiến sự phục hồi mạnh mẽ ở phân khúc nhà ở thực và bất động sản công nghiệp, thúc đẩy nhu cầu nhân sự kinh doanh và quản lý thi công nội thất hoàn thiện.</p>
        """,
    },
    {
        "title": "Xu hướng ứng dụng AI & Mô hình BIM (Building Information Modeling) trong tuyển dụng Xây dựng & Kiến trúc",
        "category": Article.CATEGORY_XU_HUONG,
        "thumbnail": ARTICLE_ROOT / "architecture.jpg",
        "tags": "xu-huong,xây dựng,kiến trúc,bim,ai,tuyển dụng,công nghệ",
        "excerpt": "Tác động của công nghệ BIM, AI phỏng vấn tự động và tự động hóa bản vẽ đến tiêu chí chọn lọc nhân sự của các tập đoàn xây dựng.",
        "content": """
            <p>Công nghệ đang tái định hình tiêu chuẩn tuyển dụng nhân sự cho các dự án xây dựng và quy hoạch hạ tầng hiện đại.</p>
            <h2>BIM Coordinator & BIM Manager lên ngôi</h2>
            <p>Các nhà thầu và đơn vị tư vấn ưu tiên ứng viên thành thạo Revit, Navisworks và các công cụ phát hiện xung đột thi công tự động.</p>
            <h2>AI trong đánh giá năng lực ứng viên</h2>
            <p>Ứng dụng AI phỏng vấn tự động giúp doanh nghiệp sàng lọc nhanh hàng ngàn hồ sơ kỹ sư và kiểm chứng kỹ năng chuyên môn trước vòng phỏng vấn trực tiếp.</p>
        """,
    },
    {
        "title": "Xu hướng chuyển dịch nhân sự Bất động sản sang phân khúc Bất động sản Công nghiệp & Xanh",
        "category": Article.CATEGORY_XU_HUONG,
        "thumbnail": ARTICLE_ROOT / "real_estate.jpg",
        "tags": "xu-huong,bất động sản,bất động sản xanh,công nghiệp,tuyển dụng,fdi",
        "excerpt": "Cơ hội việc làm mới, tiêu chuẩn chứng chỉ xanh (LEED, LOTUS) và kỹ năng thu hút nhà đầu tư FDI trong ngành Bất động sản.",
        "content": """
            <p>Làn sóng đầu tư FDI thúc đẩy sự tăng trưởng của Bất động sản công nghiệp, kho vận nhà xưởng xây sẵn và văn phòng đạt chuẩn ESG.</p>
            <h2>Nhu cầu nhân sự am hiểu tiếng Anh & Pháp lý FDI</h2>
            <p>Các tập đoàn phát triển hạ tầng KCN tích cực săn đón chuyên viên phát triển quỹ đất và tư vấn cho thuê có năng lực ngoại ngữ tốt.</p>
            <h2>Tiêu chuẩn công trình xanh</h2>
            <p>Kiến thức về chứng chỉ LEED, EDGE, LOTUS trở thành điểm cộng lớn cho cả nhân sự thiết kế lẫn tư vấn kinh doanh dự án.</p>
        """,
    },
    {
        "title": "Báo cáo nhu cầu tuyển dụng Thiết kế Nội thất tích hợp vật liệu sinh thái & Đô thị thông minh",
        "category": Article.CATEGORY_XU_HUONG,
        "thumbnail": ARTICLE_ROOT / "interior.jpg",
        "tags": "xu-huong,nội thất,vật liệu xanh,nhà thông minh,báo cáo nhân sự,thiết kế",
        "excerpt": "Những kỹ năng mới được các côngty thiết kế thi công nội thất săn đón: Đèn chiếu sáng thông minh, tự động hóa và vật liệu tái chế.",
        "content": """
            <p>Xu hướng không gian sống thông minh (Smart Home) và vật liệu thân thiện môi trường mở ra nhiều vị trí việc làm mới trong ngành nội thất.</p>
            <h2>Tích hợp công nghệ vào thiết kế nội thất</h2>
            <p>Designer không chỉ tạo ra không gian đẹp mà còn kết hợp giải pháp điều khiển ánh sáng, thông gió tự nhiên và thiết bị IoT.</p>
            <h2>Ưu tiên vật liệu tái chế & An toàn sức khỏe</h2>
            <p>Nhu cầu sử dụng sơn không VOC, gỗ chuẩn E0/E1 và vật liệu tái sinh gia tăng mạnh mẽ tại các dự án căn hộ và văn phòng cao cấp.</p>
        """,
    },
]


class Command(BaseCommand):
    help = "Seed full recruitment articles for 5 categories & 4 construction industries."

    @transaction.atomic
    def handle(self, *args, **options):
        seed_articles(stdout=self.stdout, stderr=self.stderr)


@transaction.atomic
def seed_articles(stdout=None, stderr=None):
    def write(message):
        if stdout is not None:
            stdout.write(message)
        else:
            print(message)

    def write_error(message):
        if stderr is not None:
            stderr.write(message)
        else:
            print(message)

    author = (
        User.objects.filter(email=AUTHOR_EMAIL).first()
        or User.objects.filter(role_name=var_sys.EMPLOYER).order_by("id").first()
        or User.objects.filter(is_superuser=True).order_by("id").first()
    )

    if not author:
        write_error("Không tìm thấy tác giả phù hợp. Hãy chạy seed_accounts trước.")
        return

    now = timezone.now()
    created = 0
    updated = 0

    for index, item in enumerate(ARTICLE_SEEDS):
        slug = slugify_vi(item["title"])
        thumbnail = _upload_thumbnail(
            item["thumbnail"],
            public_id=f"square-editorial/{slug}",
        )

        defaults = {
            "title": item["title"],
            "excerpt": item["excerpt"],
            "content": item["content"].strip(),
            "category": item["category"],
            "status": Article.STATUS_PUBLISHED,
            "author": author,
            "tags": item["tags"],
            "published_at": now - timedelta(days=index * 2),
        }
        if thumbnail:
            defaults["thumbnail"] = thumbnail

        article, was_created = Article.objects.update_or_create(
            slug=slug,
            defaults=defaults,
        )

        created += int(was_created)
        updated += int(not was_created)
        action = "created" if was_created else "updated"
        write(f"{action}: {article.title}")

    write(f"Done. Created {created}, updated {updated} public articles.")
