import json
from django.core.management.base import BaseCommand
from apps.cv_builder.models import CVTemplate, CVSuggestion

TEMPLATES_DATA = [
    {
        "code": "modern-navy",
        "name": "Modern Navy (Đảo Phú Quốc)",
        "description": "Bố cục 2 cột hiện đại, thanh lịch với sidebar nổi bật và thanh đo lường năng lực chuyên nghiệp.",
        "category": "modern",
        "category_name": "Hiện đại",
        "thumbnail_url": "/images/cv-templates/modern-navy.png",
        "color_palettes": ["#1e3a8a", "#0f766e", "#374151", "#b91c1c", "#6d28d9", "#0369a1"],
        "default_theme": {
            "primaryColor": "#1e3a8a",
            "secondaryColor": "#f8fafc",
            "fontFamily": "Inter, sans-serif",
            "fontSize": "medium",
            "spacing": "normal",
            "showAvatar": True,
            "avatarShape": "rounded"
        },
        "sample_data": {
            "personalInfo": {
                "fullName": "NGUYỄN TRÚC QUỲNH MY",
                "title": "Chuyên viên Marketing & Truyền thông",
                "email": "quynhmy.nguyen@example.com",
                "phoneNumber": "0912 345 678",
                "address": "Quận 1, TP. Hồ Chí Minh",
                "dob": "15/08/1998",
                "gender": "Nữ",
                "avatarUrl": "/images/cv-avatars/avatar-modern.jpg",
                "website": "quynhmy.portfolio.me",
                "linkedin": "linkedin.com/in/quynhmy-nguyen",
                "bio": "Chuyên viên Marketing với hơn 4 năm kinh nghiệm trong việc xây dựng chiến dịch Performance & Brand Awareness cho các doanh nghiệp TMĐT và Công nghệ. Tư duy phân tích số liệu nhạy bén và quản trị ngân sách hiệu quả."
            },
            "experiences": [
                {
                    "id": "exp-1",
                    "position": "Senior Marketing Executive",
                    "company": "Công ty Cổ phần Công nghệ ABC",
                    "startDate": "03/2022",
                    "endDate": "Hiện tại",
                    "isCurrent": True,
                    "description": "• Hoạch định và thực thi các chiến dịch Digital Marketing đa kênh (Google Ads, Meta Ads, TikTok), quản lý ngân sách 200M+/tháng.\n• Tăng trưởng lượng truy cập tự nhiên (Organic Traffic) lên 45% và tỉ lệ chuyển đổi khách hàng tiềm năng tăng 28% sau 6 tháng.\n• Phối hợp chặt chẽ cùng đội ngũ Design và Content để sản xuất các ấn phẩm truyền thông chất lượng cao."
                },
                {
                    "id": "exp-2",
                    "position": "Digital Marketing Specialist",
                    "company": "Tập đoàn Bán lẻ XYZ",
                    "startDate": "06/2020",
                    "endDate": "02/2022",
                    "isCurrent": False,
                    "description": "• Xây dựng và quản lý các kênh Social Media đạt mốc 150K followers với chỉ số tương tác (ER) đạt trung bình 6.8%.\n• Lập kế hoạch Email Marketing tự động hóa qua HubSpot, nâng tỷ lệ mở mail (Open Rate) đạt 32%.\n• Theo dõi và phân tích báo cáo hiệu suất hàng tuần bằng Google Analytics và Looker Studio."
                }
            ],
            "educations": [
                {
                    "id": "edu-1",
                    "school": "Đại học Kinh Tế TP. Hồ Chí Minh (UEH)",
                    "major": "Quản trị Marketing",
                    "degree": "Cử nhân Giỏi",
                    "startDate": "2016",
                    "endDate": "2020",
                    "gpa": "3.6/4.0",
                    "description": "Đạt học bổng Khuyến khích học tập 3 kỳ liên tiếp. Trưởng ban đối ngoại CLB Marketing UEH."
                }
            ],
            "skills": [
                {"id": "sk-1", "name": "Digital Advertising (Meta/Google)", "level": 5},
                {"id": "sk-2", "name": "Content & Copywriting", "level": 5},
                {"id": "sk-3", "name": "Data Analysis (GA4, Looker Studio)", "level": 4},
                {"id": "sk-4", "name": "SEO & Performance Optimization", "level": 4},
                {"id": "sk-5", "name": "Kỹ năng thuyết trình & Đàm phán", "level": 5}
            ],
            "languages": [
                {"id": "lang-1", "name": "Tiếng Việt", "proficiency": "Bản ngữ"},
                {"id": "lang-2", "name": "Tiếng Anh", "proficiency": "IELTS 7.5"}
            ],
            "certificates": [
                {"id": "cert-1", "name": "Google Ads Search & Measurement Certification", "organization": "Google Skillshop", "issueDate": "2023"},
                {"id": "cert-2", "name": "Inbound Marketing Certified", "organization": "HubSpot Academy", "issueDate": "2022"}
            ]
        },
        "is_active": True,
        "is_popular": True,
        "sort_order": 1,
        "use_count": 1420,
    },
    {
        "code": "minimal-clean",
        "name": "Minimal Clean (Đảo Nam Du)",
        "description": "Phong cách tối giản chuẩn ATS quốc tế, tập trung tối đa vào cấu trúc nội dung và kinh nghiệm làm việc.",
        "category": "simple",
        "category_name": "Đơn giản",
        "thumbnail_url": "/images/cv-templates/minimal-clean.png",
        "color_palettes": ["#0f172a", "#1e293b", "#334155", "#047857", "#1d4ed8", "#4338ca"],
        "default_theme": {
            "primaryColor": "#0f172a",
            "secondaryColor": "#ffffff",
            "fontFamily": "Inter, sans-serif",
            "fontSize": "medium",
            "spacing": "compact",
            "showAvatar": True,
            "avatarShape": "circle"
        },
        "sample_data": {
            "personalInfo": {
                "fullName": "TRẦN HOÀNG NAM",
                "title": "Chuyên viên Tài chính & Kiểm toán",
                "email": "hoangnam.tran@example.com",
                "phoneNumber": "0938 123 456",
                "address": "Cầu Giấy, Hà Nội",
                "dob": "22/04/1996",
                "gender": "Nam",
                "avatarUrl": "/images/cv-avatars/avatar-minimal.jpg",
                "website": "hoangnam-finance.com",
                "linkedin": "linkedin.com/in/hoangnam-tran",
                "bio": "Chuyên viên Tài chính với hơn 5 năm kinh nghiệm phân tích báo cáo tài chính, thẩm định dự án đầu tư và tối ưu hóa chi phí vận hành cho các tập đoàn đa quốc gia. Chứng chỉ CFA Level 2."
            },
            "experiences": [
                {
                    "id": "exp-1",
                    "position": "Senior Financial Analyst",
                    "company": "Tập đoàn Đầu tư VinaCapital",
                    "startDate": "2022-04",
                    "endDate": "Hiện tại",
                    "isCurrent": True,
                    "description": "• Xây dựng mô hình tài chính định giá danh mục đầu tư trị giá hơn $50M với độ chính xác cao.\n• Rà soát và thẩm định chi tiết (Financial Due Diligence) cho 8 thương vụ M&A trong lĩnh vực công nghệ và bán lẻ.\n• Đề xuất giải pháp tái cấu trúc dòng tiền giúp tiết kiệm 12% chi phí lãi vay hàng năm."
                },
                {
                    "id": "exp-2",
                    "position": "Audit Associate",
                    "company": "PwC Vietnam",
                    "startDate": "2019-08",
                    "endDate": "2022-03",
                    "isCurrent": False,
                    "description": "• Thực hiện kiểm toán độc lập báo cáo tài chính chuẩn VAS/IFRS cho hơn 20 doanh nghiệp niêm yết.\n• Đánh giá hệ thống kiểm soát nội bộ và đề xuất cải tiến quy trình quản trị rủi ro doanh nghiệp."
                }
            ],
            "educations": [
                {
                    "id": "edu-1",
                    "school": "Học viện Tài Chính (AOF)",
                    "major": "Tài chính - Ngân hàng",
                    "degree": "Cử nhân Xuất sắc",
                    "startDate": "2015",
                    "endDate": "2019",
                    "gpa": "3.8/4.0",
                    "description": "Thủ khoa đầu ra chuyên ngành Tài chính doanh nghiệp khóa 53."
                }
            ],
            "skills": [
                {"id": "sk-1", "name": "Financial Modeling & Valuation (DCF, Multiples)", "level": 5},
                {"id": "sk-2", "name": "IFRS / VAS Accounting Standards", "level": 5},
                {"id": "sk-3", "name": "Power BI & Advanced Excel VBA", "level": 4},
                {"id": "sk-4", "name": "Risk Management & Due Diligence", "level": 4}
            ],
            "languages": [
                {"id": "lang-1", "name": "Tiếng Việt", "proficiency": "Bản ngữ"},
                {"id": "lang-2", "name": "Tiếng Anh", "proficiency": "IELTS 8.0 (Thương mại)"}
            ],
            "certificates": [
                {"id": "cert-1", "name": "CFA Level II Passed", "organization": "CFA Institute", "issueDate": "2023"},
                {"id": "cert-2", "name": "ACCA Financial Accounting", "organization": "ACCA Global", "issueDate": "2021"}
            ]
        },
        "is_active": True,
        "is_popular": True,
        "sort_order": 2,
        "use_count": 980,
    },
    {
        "code": "executive-emerald",
        "name": "Executive Emerald (Đảo Phú Quý)",
        "description": "Dành riêng cho cấp Quản lý, Trưởng phòng và Giám đốc với khối tóm tắt năng lực lãnh đạo sắc sảo.",
        "category": "executive",
        "category_name": "Quản lý",
        "thumbnail_url": "/images/cv-templates/executive-emerald.png",
        "color_palettes": ["#065f46", "#1e3a8a", "#4c1d95", "#831843", "#78350f", "#0f172a"],
        "default_theme": {
            "primaryColor": "#065f46",
            "secondaryColor": "#f0fdf4",
            "fontFamily": "Inter, sans-serif",
            "fontSize": "medium",
            "spacing": "normal",
            "showAvatar": True,
            "avatarShape": "rounded"
        },
        "sample_data": {
            "personalInfo": {
                "fullName": "LÊ ĐỨC MINH",
                "title": "Giám đốc Vận hành & Dự án (COO)",
                "email": "ducminh.le@example.com",
                "phoneNumber": "0903 888 999",
                "address": "Quận 7, TP. Hồ Chí Minh",
                "dob": "10/11/1988",
                "gender": "Nam",
                "avatarUrl": "/images/cv-avatars/avatar-executive.jpg",
                "website": "ducminh.lead.vn",
                "linkedin": "linkedin.com/in/ducminh-le-coo",
                "bio": "Hơn 10 năm kinh nghiệm lãnh đạo và vận hành chuỗi cung ứng, mở rộng quy mô kinh doanh từ 50 lên 500 nhân sự. Kỹ năng quản trị chiến lược, chuyển đổi số và nâng cao biên lợi nhuận doanh nghiệp."
            },
            "experiences": [
                {
                    "id": "exp-1",
                    "position": "Chief Operating Officer (COO)",
                    "company": "Tập đoàn Vận tải & Logistics LogiTech",
                    "startDate": "2020-03",
                    "endDate": "Hiện tại",
                    "isCurrent": True,
                    "description": "• Chỉ đạo toàn diện hoạt động vận hành 12 trung tâm phân phối trên toàn quốc với hơn 350 nhân sự.\n• Tái cấu trúc chuỗi cung ứng thông qua ứng dụng ERP & tự động hóa kho bãi, giảm 22% thời gian giao hàng (Lead Time).\n• Tăng trưởng doanh thu toàn khối 40% liên tục trong 3 năm liên tiếp."
                },
                {
                    "id": "exp-2",
                    "position": "Operations Director",
                    "company": "MegaRetail Corporation",
                    "startDate": "2015-06",
                    "endDate": "2020-02",
                    "isCurrent": False,
                    "description": "• Quản lý ngân sách vận hành $15M/năm, triển khai mở rộng 45 chuỗi cửa hàng tiện lợi mới tại miền Nam.\n• Xây dựng hệ thống KPI và văn hóa làm việc theo mục tiêu OKR cho toàn bộ nhân sự khối vận hành."
                }
            ],
            "educations": [
                {
                    "id": "edu-1",
                    "school": "Đại học Quốc Tế - ĐHQG TP.HCM",
                    "major": "Quản trị Kinh doanh Quốc tế (MBA)",
                    "degree": "Thạc sĩ Quản trị Kinh doanh",
                    "startDate": "2012",
                    "endDate": "2014",
                    "gpa": "3.7/4.0",
                    "description": "Tốt nghiệp Thủ khoa chương trình liên kết Đại học Houston."
                }
            ],
            "skills": [
                {"id": "sk-1", "name": "Strategic Planning & Executive Leadership", "level": 5},
                {"id": "sk-2", "name": "Supply Chain & Operations Optimization", "level": 5},
                {"id": "sk-3", "name": "P&L Management & Budget Control", "level": 5},
                {"id": "sk-4", "name": "Change Management & Digital Transformation", "level": 4}
            ],
            "languages": [
                {"id": "lang-1", "name": "Tiếng Việt", "proficiency": "Bản ngữ"},
                {"id": "lang-2", "name": "Tiếng Anh", "proficiency": "Fluent (Làm việc cấp điều hành)"}
            ],
            "certificates": [
                {"id": "cert-1", "name": "Project Management Professional (PMP)", "organization": "PMI", "issueDate": "2018"},
                {"id": "cert-2", "name": "Lean Six Sigma Black Belt", "organization": "SSMI", "issueDate": "2019"}
            ]
        },
        "is_active": True,
        "is_popular": False,
        "sort_order": 3,
        "use_count": 640,
    },
    {
        "code": "creative-coral",
        "name": "Creative Coral (Đảo Bình Ba)",
        "description": "Bảng màu Gradient nổi bật, tối ưu cho Designer, Marketing, Content Creator và ngành Sáng tạo.",
        "category": "creative",
        "category_name": "Sáng tạo",
        "thumbnail_url": "/images/cv-templates/creative-coral.png",
        "color_palettes": ["#e11d48", "#f43f5e", "#ec4899", "#8b5cf6", "#3b82f6", "#10b981"],
        "default_theme": {
            "primaryColor": "#e11d48",
            "secondaryColor": "#fff1f2",
            "fontFamily": "Inter, sans-serif",
            "fontSize": "medium",
            "spacing": "normal",
            "showAvatar": True,
            "avatarShape": "circle"
        },
        "sample_data": {
            "personalInfo": {
                "fullName": "VŨ THẢO LINH",
                "title": "Senior UI/UX & Brand Designer",
                "email": "thaolinh.design@example.com",
                "phoneNumber": "0977 654 321",
                "address": "Bình Thạnh, TP. Hồ Chí Minh",
                "dob": "05/09/1999",
                "gender": "Nữ",
                "avatarUrl": "/images/cv-avatars/avatar-creative.jpg",
                "website": "behance.net/thaolinhart",
                "linkedin": "linkedin.com/in/thaolinh-uiux",
                "bio": "Nhà thiết kế sản phẩm kỹ thuật số với đam mê tạo ra trải nghiệm người dùng trực quan, thẩm mỹ cao và tăng trưởng chuyển đổi cho các sản phẩm Fintech, E-commerce và SaaS."
            },
            "experiences": [
                {
                    "id": "exp-1",
                    "position": "Lead Product Designer",
                    "company": "Fintech Innovation Lab",
                    "startDate": "2022-01",
                    "endDate": "Hiện tại",
                    "isCurrent": True,
                    "description": "• Thiết kế toàn bộ giao diện và luồng thanh toán ứng dụng ví điện tử với hơn 1.5 triệu người dùng.\n• Tăng tỉ lệ hoàn thành đăng ký (Onboarding Completion Rate) lên 34% sau khi tái thiết kế luồng xác thực eKYC.\n• Xây dựng và quản lý Design System hoàn chỉnh trên Figma với hơn 200+ components tái sử dụng."
                },
                {
                    "id": "exp-2",
                    "position": "UI/UX Designer",
                    "company": "Creative Studio Zebra",
                    "startDate": "2020-03",
                    "endDate": "2021-12",
                    "isCurrent": False,
                    "description": "• Phụ trách thiết kế giao diện web responsive và ứng dụng di động cho hơn 15 khách hàng doanh nghiệp quốc tế.\n• Tiến hành nghiên cứu người dùng, phỏng vấn chuyên sâu và kiểm thử trải nghiệm sản phẩm (Usability Testing)."
                }
            ],
            "educations": [
                {
                    "id": "edu-1",
                    "school": "Đại học Kiến Trúc TP.HCM (UAH)",
                    "major": "Thiết kế Đồ họa & Truyền thông Đa phương tiện",
                    "degree": "Cử nhân Mỹ thuật Công nghiệp",
                    "startDate": "2017",
                    "endDate": "2021",
                    "gpa": "3.6/4.0",
                    "description": "Giải Nhất đồ án tốt nghiệp xuất sắc ngành Thiết kế Sản phẩm số."
                }
            ],
            "skills": [
                {"id": "sk-1", "name": "Figma / FigJam / Auto Layout", "level": 5},
                {"id": "sk-2", "name": "Design Systems & Component Architecture", "level": 5},
                {"id": "sk-3", "name": "User Research & Usability Testing", "level": 4},
                {"id": "sk-4", "name": "Prototyping & Micro-interactions", "level": 4}
            ],
            "languages": [
                {"id": "lang-1", "name": "Tiếng Việt", "proficiency": "Bản ngữ"},
                {"id": "lang-2", "name": "Tiếng Anh", "proficiency": "IELTS 7.0"}
            ],
            "certificates": [
                {"id": "cert-1", "name": "Google UX Design Professional Certificate", "organization": "Coursera", "issueDate": "2022"},
                {"id": "cert-2", "name": "Interaction Design Foundation (IxDF) Certified", "organization": "IxDF", "issueDate": "2021"}
            ]
        },
        "is_active": True,
        "is_popular": True,
        "sort_order": 4,
        "use_count": 1150,
    },
    {
        "code": "tech-dark",
        "name": "Tech Dark (Thung Lũng Silicon)",
        "description": "Tối ưu cho Kỹ sư phần mềm, DevOps, AI Engineer với giao diện Terminal code và tag stack công nghệ.",
        "category": "tech",
        "category_name": "Công nghệ",
        "thumbnail_url": "/images/cv-templates/tech-dark.png",
        "color_palettes": ["#2563eb", "#06b6d4", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444"],
        "default_theme": {
            "primaryColor": "#2563eb",
            "secondaryColor": "#0f172a",
            "fontFamily": "Inter, sans-serif",
            "fontSize": "medium",
            "spacing": "normal",
            "showAvatar": True,
            "avatarShape": "square"
        },
        "sample_data": {
            "personalInfo": {
                "fullName": "ĐỖ MINH TUẤN",
                "title": "Senior Fullstack Software Engineer",
                "email": "minhtuan.dev@example.com",
                "phoneNumber": "0982 999 111",
                "address": "Thanh Xuân, Hà Nội",
                "dob": "19/03/1995",
                "gender": "Nam",
                "avatarUrl": "/images/cv-avatars/avatar-tech.jpg",
                "website": "minhtuan.tech",
                "linkedin": "linkedin.com/in/minhtuan-se",
                "github": "github.com/minhtuan-dev",
                "bio": "Kỹ sư phần mềm 6+ năm kinh nghiệm xây dựng hệ thống phân tán microservices (Golang, Node.js, React/Next.js) phục vụ hơn 2 triệu người dùng thực tế. Đam mê mã nguồn mở và kiến trúc đám mây AWS."
            },
            "experiences": [
                {
                    "id": "exp-1",
                    "position": "Tech Lead / Senior Fullstack Engineer",
                    "company": "VNG Corporation",
                    "startDate": "2021-08",
                    "endDate": "Hiện tại",
                    "isCurrent": True,
                    "description": "• Thiết kế và triển khai kiến trúc Microservices xử lý 25,000+ RPS vào các khung giờ cao điểm với độ sẵn sàng 99.99%.\n• Tối ưu hóa truy vấn cơ sở dữ liệu PostgreSQL & Redis Caching, giảm thời gian phản hồi API từ 350ms xuống dưới 45ms.\n• Thiết lập đường ống tự động hóa CI/CD với Docker, Kubernetes và GitHub Actions."
                },
                {
                    "id": "exp-2",
                    "position": "Software Engineer",
                    "company": "FPT Software",
                    "startDate": "2018-06",
                    "endDate": "2021-07",
                    "isCurrent": False,
                    "description": "• Phát triển các dịch vụ backend cốt lõi bằng Golang và Node.js cho dự án ngân hàng điện tử tại thị trường Nhật Bản.\n• Viết Unit Test và Integration Test với độ bao phủ (Code Coverage) đạt trên 85%."
                }
            ],
            "educations": [
                {
                    "id": "edu-1",
                    "school": "Đại học Bách Khoa Hà Nội (HUST)",
                    "major": "Công nghệ Thông tin",
                    "degree": "Kỹ sư Công nghệ Thông tin",
                    "startDate": "2013",
                    "endDate": "2018",
                    "gpa": "3.55/4.0",
                    "description": "Đạt Giải Ba cuộc thi Lập trình sinh viên Olympic Tin học toàn quốc 2017."
                }
            ],
            "skills": [
                {"id": "sk-1", "name": "Golang / Node.js / TypeScript", "level": 5},
                {"id": "sk-2", "name": "React / Next.js / Tailwind", "level": 5},
                {"id": "sk-3", "name": "Docker / Kubernetes / AWS", "level": 4},
                {"id": "sk-4", "name": "PostgreSQL / Redis / Kafka", "level": 5}
            ],
            "languages": [
                {"id": "lang-1", "name": "Tiếng Việt", "proficiency": "Bản ngữ"},
                {"id": "lang-2", "name": "Tiếng Anh", "proficiency": "TOEIC 850"}
            ],
            "certificates": [
                {"id": "cert-1", "name": "AWS Certified Solutions Architect - Associate", "organization": "Amazon Web Services", "issueDate": "2023"},
                {"id": "cert-2", "name": "Certified Kubernetes Administrator (CKA)", "organization": "Cloud Native Computing Foundation", "issueDate": "2022"}
            ]
        },
        "is_active": True,
        "is_popular": True,
        "sort_order": 5,
        "use_count": 1820,
    },
    {
        "code": "classic-serif",
        "name": "Classic Elegant (Cố Đô Tràng An)",
        "description": "Kiểu chữ Serif sang trọng, phù hợp khối học thuật, tài chính, kiểm toán, luật và hành chính.",
        "category": "professional",
        "category_name": "Chuyên nghiệp",
        "thumbnail_url": "/images/cv-templates/classic-serif.png",
        "color_palettes": ["#334155", "#1e293b", "#78350f", "#14532d", "#4c1d95"],
        "default_theme": {
            "primaryColor": "#334155",
            "secondaryColor": "#f8fafc",
            "fontFamily": "Inter, sans-serif",
            "fontSize": "medium",
            "spacing": "comfortable",
            "showAvatar": True,
            "avatarShape": "circle"
        },
        "sample_data": {
            "personalInfo": {
                "fullName": "PHAN THỊ NGỌC ANH",
                "title": "Chuyên viên Pháp chế & Quản trị Nhân sự",
                "email": "ngocanh.phan@example.com",
                "phoneNumber": "0918 333 444",
                "address": "Ba Đình, Hà Nội",
                "dob": "12/12/1992",
                "gender": "Nữ",
                "avatarUrl": "/images/cv-avatars/avatar-classic.jpg",
                "website": "ngocanh-legal.vn",
                "linkedin": "linkedin.com/in/ngocanh-phan-hr",
                "bio": "Chuyên gia pháp chế doanh nghiệp với hơn 7 năm tư vấn luật thương mại, hợp đồng đầu tư và xây dựng chính sách nhân sự cho các tập đoàn FDI tại Việt Nam."
            },
            "experiences": [
                {
                    "id": "exp-1",
                    "position": "Trưởng phòng Pháp chế & Tuân thủ",
                    "company": "Tập đoàn Xây dựng & Bất động sản Vinaconex",
                    "startDate": "2021-05",
                    "endDate": "Hiện tại",
                    "isCurrent": True,
                    "description": "• Soạn thảo và thẩm định hơn 250+ hợp đồng kinh tế, gói thầu xây dựng và thỏa thuận hợp tác đầu tư trị giá hàng ngàn tỷ đồng.\n• Đại diện doanh nghiệp làm việc với các cơ quan quản lý nhà nước và giải quyết tranh chấp thương mại.\n• Xây dựng bộ quy chế nội bộ và chính sách bảo vệ dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP."
                }
            ],
            "educations": [
                {
                    "id": "edu-1",
                    "school": "Đại học Luật Hà Nội (HLU)",
                    "major": "Luật Kinh tế & Thương mại Quốc tế",
                    "degree": "Thạc sĩ Luật học",
                    "startDate": "2010",
                    "endDate": "2015",
                    "gpa": "3.65/4.0",
                    "description": "Tốt nghiệp Thạc sĩ Luật Kinh tế loại Giỏi."
                }
            ],
            "skills": [
                {"id": "sk-1", "name": "Contract Drafting & Negotiation", "level": 5},
                {"id": "sk-2", "name": "Corporate Law & Compliance Governance", "level": 5},
                {"id": "sk-3", "name": "Labor Relations & Dispute Resolution", "level": 4}
            ],
            "languages": [
                {"id": "lang-1", "name": "Tiếng Việt", "proficiency": "Bản ngữ"},
                {"id": "lang-2", "name": "Tiếng Anh", "proficiency": "IELTS 7.5 (Pháp lý)"}
            ]
        },
        "is_active": True,
        "is_popular": False,
        "sort_order": 6,
        "use_count": 520,
    },
    {
        "code": "nordic-minimal",
        "name": "Nordic Minimal (Bắc Âu Tối Giản)",
        "description": "Đường nét tinh giản, typography phong cách Thụy Điển, tối ưu hóa cho Product Manager, UI/UX Designer và Tech Lead.",
        "category": "simple",
        "category_name": "Tối giản",
        "thumbnail_url": "/images/cv-templates/nordic-minimal.png",
        "color_palettes": ["#0f172a", "#334155", "#047857", "#4338ca", "#b45309"],
        "default_theme": {
            "primaryColor": "#0f172a",
            "secondaryColor": "#ffffff",
            "fontFamily": "Inter, sans-serif",
            "fontSize": "medium",
            "spacing": "comfortable",
            "showAvatar": True,
            "avatarShape": "rounded"
        },
        "sample_data": {
            "personalInfo": {
                "fullName": "BÙI QUỐC HUY",
                "title": "Lead Product Manager",
                "email": "quochuy.pm@example.com",
                "phoneNumber": "0909 555 777",
                "address": "Quận 2, TP. Thủ Đức",
                "dob": "28/06/1994",
                "gender": "Nam",
                "avatarUrl": "/images/cv-avatars/avatar-nordic.jpg",
                "website": "quochuy.io",
                "linkedin": "linkedin.com/in/quochuy-pm",
                "bio": "Product Manager dẫn dắt phát triển sản phẩm B2B SaaS từ giai đoạn MVP đến khi đạt 50.000 người dùng trả phí. Định hướng theo dữ liệu (Data-driven) và phương pháp Agile/Scrum linh hoạt."
            },
            "experiences": [
                {
                    "id": "exp-1",
                    "position": "Lead Product Manager",
                    "company": "KiotViet Software",
                    "startDate": "2021-03",
                    "endDate": "Hiện tại",
                    "isCurrent": True,
                    "description": "• Quản lý vòng đời sản phẩm giải pháp quản lý bán hàng đa kênh Omni-channel phục vụ 150,000+ cửa hàng bán lẻ.\n• Nâng chỉ số giữ chân khách hàng (Net Retention Rate) từ 85% lên 108% thông qua tối ưu tính năng tự động hóa đơn hàng.\n• Phối hợp chặt chẽ cùng 4 Scrum teams (30+ kỹ sư và designers) để liên tục release tính năng mỗi 2 tuần."
                }
            ],
            "educations": [
                {
                    "id": "edu-1",
                    "school": "RMIT University Vietnam",
                    "major": "Information Technology & Management",
                    "degree": "Bachelor of Information Technology",
                    "startDate": "2013",
                    "endDate": "2017",
                    "gpa": "3.5/4.0",
                    "description": "Vice President of RMIT Tech Club 2016."
                }
            ],
            "skills": [
                {"id": "sk-1", "name": "Product Strategy & Roadmapping", "level": 5},
                {"id": "sk-2", "name": "Data Analytics & Experimentation (A/B Testing)", "level": 5},
                {"id": "sk-3", "name": "Agile / Scrum Product Ownership", "level": 5}
            ],
            "languages": [
                {"id": "lang-1", "name": "Tiếng Việt", "proficiency": "Bản ngữ"},
                {"id": "lang-2", "name": "Tiếng Anh", "proficiency": "IELTS 8.0"}
            ]
        },
        "is_active": True,
        "is_popular": True,
        "sort_order": 7,
        "use_count": 980,
    },
    {
        "code": "corporate-compact",
        "name": "Corporate Compact (Doanh Nghiệp 1 Trang)",
        "description": "Bố cục 1 trang cô đọng, tối ưu quét mắt trong 6 giây, phù hợp Tài chính, Ngân hàng, Big4, Kiểm toán & Logistics.",
        "category": "professional",
        "category_name": "Chuyên nghiệp",
        "thumbnail_url": "/images/cv-templates/corporate-compact.png",
        "color_palettes": ["#1e293b", "#1e3a8a", "#065f46", "#831843", "#78350f"],
        "default_theme": {
            "primaryColor": "#1e293b",
            "secondaryColor": "#f8fafc",
            "fontFamily": "Inter, sans-serif",
            "fontSize": "small",
            "spacing": "compact",
            "showAvatar": True,
            "avatarShape": "square"
        },
        "sample_data": {
            "personalInfo": {
                "fullName": "HOÀNG THU TRANG",
                "title": "Chuyên viên Phân tích Đầu tư & Ngân hàng",
                "email": "thutrang.hoang@example.com",
                "phoneNumber": "0934 777 888",
                "address": "Quận 3, TP. Hồ Chí Minh",
                "dob": "14/02/1997",
                "gender": "Nữ",
                "avatarUrl": "/images/cv-avatars/avatar-corporate.jpg",
                "website": "thutrang-finance.me",
                "linkedin": "linkedin.com/in/thutrang-hoang",
                "bio": "Chuyên viên phân tích đầu tư với kinh nghiệm định giá doanh nghiệp, thẩm định M&A và quản lý danh mục tài sản tại công ty chứng khoán Top 5 Việt Nam."
            },
            "experiences": [
                {
                    "id": "exp-1",
                    "position": "Investment Banking Analyst",
                    "company": "SSI Securities Corporation",
                    "startDate": "2021-06",
                    "endDate": "Hiện tại",
                    "isCurrent": True,
                    "description": "• Tham gia tư vấn phát hành trái phiếu và niêm yết cổ phiếu (IPO) cho các doanh nghiệp quy mô vốn hóa lớn.\n• Soạn thảo bản cáo bạch, tài liệu chào bán đầu tư (Pitch Book) và phân tích định giá so sánh (Comps Analysis)."
                }
            ],
            "educations": [
                {
                    "id": "edu-1",
                    "school": "Đại học Ngoại Thương Cơ sở 2 (FTU2)",
                    "major": "Tài chính Quốc tế",
                    "degree": "Cử nhân Xuất sắc",
                    "startDate": "2015",
                    "endDate": "2019",
                    "gpa": "3.82/4.0",
                    "description": "GPA Top 5 toàn khóa ngành Tài chính Quốc tế."
                }
            ],
            "skills": [
                {"id": "sk-1", "name": "DCF / Comparable Company Analysis", "level": 5},
                {"id": "sk-2", "name": "Financial Pitch Books & Memorandums", "level": 5},
                {"id": "sk-3", "name": "Bloomberg Terminal & Capital IQ", "level": 4}
            ],
            "languages": [
                {"id": "lang-1", "name": "Tiếng Việt", "proficiency": "Bản ngữ"},
                {"id": "lang-2", "name": "Tiếng Anh", "proficiency": "IELTS 8.0"}
            ]
        },
        "is_active": True,
        "is_popular": True,
        "sort_order": 8,
        "use_count": 1340,
    },
]

SUGGESTIONS_DATA = [
    {
        "industry": "IT",
        "industry_name": "Công nghệ thông tin / Phần mềm",
        "suggestion_type": "summary",
        "title": "Mục tiêu nghề nghiệp Senior Fullstack / Frontend",
        "content": "Kỹ sư lập trình với hơn 5 năm kinh nghiệm phát triển các hệ thống web quy mô lớn sử dụng React/Next.js, Node.js và kiến trúc Microservices. Đam mê tối ưu hóa hiệu năng tải trang, cải thiện chỉ số Core Web Vitals và thiết kế trải nghiệm người dùng mượt mà. Mong muốn đóng góp năng lực kỹ thuật và kỹ năng dẫn dắt đội ngũ kỹ sư giải quyết các bài toán sản phẩm đột phá.",
        "skills_list": ["React.js", "TypeScript", "Next.js", "Node.js", "PostgreSQL", "Docker", "AWS"],
        "sort_order": 1,
    },
    {
        "industry": "Marketing",
        "industry_name": "Marketing & Truyền thông số",
        "suggestion_type": "summary",
        "title": "Mục tiêu nghề nghiệp Digital Marketing Specialist",
        "content": "Chuyên viên Digital Marketing 4+ năm kinh nghiệm trong việc hoạch định và thực thi các chiến dịch Performance Marketing đa kênh (Google Ads, Facebook, TikTok Ads). Có tư duy phân tích dữ liệu sâu sắc (Data-driven mindset), thành thạo Google Analytics 4 và tối ưu tỷ lệ chuyển đổi (CRO) với mục tiêu tối ưu hóa chi phí CAC và nâng cao chỉ số ROAS.",
        "skills_list": ["Performance Marketing", "Google Ads", "Meta Ads", "SEO/SEM", "Google Analytics 4", "CRO"],
        "sort_order": 2,
    },
]

class Command(BaseCommand):
    help = "Seed database with high-quality CV Templates and Suggestions"

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding CV Templates with rich realistic photo sample data..."))

        for item in TEMPLATES_DATA:
            template, created = CVTemplate.objects.update_or_create(
                code=item["code"],
                defaults={
                    "name": item["name"],
                    "description": item["description"],
                    "category": item["category"],
                    "category_name": item["category_name"],
                    "thumbnail_url": item["thumbnail_url"],
                    "color_palettes": item["color_palettes"],
                    "default_theme": item["default_theme"],
                    "sample_data": item.get("sample_data", {}),
                    "is_active": item.get("is_active", True),
                    "is_popular": item.get("is_popular", False),
                    "sort_order": item.get("sort_order", 0),
                    "use_count": item.get("use_count", 0),
                }
            )
            status = "Created" if created else "Updated"
            self.stdout.write(self.style.SUCCESS(f"  [+] {status} template: {template.name} ({template.code})"))

        self.stdout.write(self.style.NOTICE("Seeding CV Suggestions..."))
        for sug in SUGGESTIONS_DATA:
            CVSuggestion.objects.update_or_create(
                industry=sug["industry"],
                suggestion_type=sug["suggestion_type"],
                title=sug["title"],
                defaults={
                    "industry_name": sug["industry_name"],
                    "content": sug["content"],
                    "skills_list": sug["skills_list"],
                    "sort_order": sug["sort_order"],
                }
            )

        self.stdout.write(self.style.SUCCESS("All CV data seeded successfully with realistic portrait data!"))
