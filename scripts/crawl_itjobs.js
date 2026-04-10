const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// Target URL: ITviec (hoặc TopCV)
const TARGET_URL = 'https://itviec.com/it-jobs';

async function crawlJobs() {
    console.log(`🚀 Bắt đầu cào dữ liệu từ: ${TARGET_URL}`);
    
    try {
        // Gọi lên server giả lập trình duyệt để tránh bị block (Anti-bot)
        const { data } = await axios.get(TARGET_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
            }
        });
        
        const $ = cheerio.load(data);
        const jobs = [];
        
        // Lặp qua các thẻ chứa công việc.
        // Lưu ý: Class name có thể thay đổi tùy theo bản cập nhật của ITviec
        $('.job-card').each((index, element) => {
            const title = $(element).find('h3.title a').text().trim() || $(element).find('.title a').text().trim();
            const company = $(element).find('.company').text().trim() || $(element).find('.employer').text().trim();
            const location = $(element).find('.city').text().trim() || $(element).find('.location').text().trim();
            
            const skills = [];
            $(element).find('.skill-tag, .tag').each((i, el) => skills.push($(el).text().trim()));
            
            const url = $(element).find('h3.title a').attr('href') || $(element).find('.title a').attr('href');
            
            if (title) {
                jobs.push({
                    id: `job_${Date.now()}_${index}`,
                    title,
                    company,
                    location: location || 'Hồ Chí Minh',
                    skills,
                    url: url ? `https://itviec.com${url}` : null,
                    salary: 'Thỏa thuận', // Thường lương hay bị ẩn, ta mock default
                    dateCrawled: new Date().toISOString()
                });
            }
        });

        // Nếu selectors '.job-card' bị lỗi (do trang web update), ta tự mock thêm 1 mảng nhỏ
        if (jobs.length === 0) {
            console.log("⚠️ Không tìm thấy class '.job-card'. Có thể DOM của trang web đã thay đổi.");
            console.log("👉 Đang tạo Mock data dự phòng...");
            jobs.push(
                { id: "mock_1", title: "Frontend ReactJS Developer", company: "FPT Software", location: "Hà Nội", skills: ["React", "TypeScript"], salary: "Thỏa thuận", url: "#" },
                { id: "mock_2", title: "Backend Node.js Engineer", company: "VNG Corporation", location: "Hồ Chí Minh", skills: ["Node.js", "MongoDB"], salary: "Thỏa thuận", url: "#" },
                { id: "mock_3", title: "Senior Fullstack Typescript", company: "Momo", location: "Hồ Chí Minh", skills: ["TypeScript", "AWS"], salary: "Thỏa thuận", url: "#" }
            );
        }

        console.log(`✅ Lấy thành công ${jobs.length} công việc.`);
        
        // Lưu ra file JSON
        const outputPath = path.join(__dirname, 'jobs_data.json');
        fs.writeFileSync(outputPath, JSON.stringify(jobs, null, 4), 'utf-8');
        
        console.log(`📁 Đã lưu file tại: ${outputPath}`);
        console.log(`👉 BẠN CÓ THỂ COPY DATA NÀY NHÉT VÀO FRONTEND NGAY!`);
        
    } catch (error) {
        console.error('❌ Lỗi khi crawling (có thể bị chặn bởi Cloudflare Anti-Bot):', error.message);
        console.log("👉 Tự động dùng Data Mẫu (Mock Data) nội địa hóa tiếng Việt...");
        
        const jobs = [
            { id: "mock_1", title: "Frontend ReactJS Developer", company: "FPT Software", location: "Hà Nội", skills: ["React", "TypeScript", "Next.js"], salary: "20 - 30 Triệu", url: "#" },
            { id: "mock_2", title: "Backend Node.js Engineer", company: "VNG Corporation", location: "Hồ Chí Minh", skills: ["Node.js", "MongoDB", "Redis"], salary: "25 - 40 Triệu", url: "#" },
            { id: "mock_3", title: "Senior Fullstack Typescript", company: "Momo", location: "Hồ Chí Minh", skills: ["TypeScript", "AWS", "Docker"], salary: "30 - 50 Triệu", url: "#" },
            { id: "mock_4", title: "Data Analyst", company: "Shopee", location: "Hồ Chí Minh", skills: ["Python", "SQL", "Tableau"], salary: "15 - 25 Triệu", url: "#" },
            { id: "mock_5", title: "Golang Backend Developer", company: "Tiki", location: "Đà Nẵng", skills: ["Golang", "Microservices", "Kafka"], salary: "Lên đến $2000", url: "#" }
        ];

        const outputPath = path.join(__dirname, 'jobs_data.json');
        fs.writeFileSync(outputPath, JSON.stringify(jobs, null, 4), 'utf-8');
        
        console.log(`📁 Đã lưu Mock_Data tại: ${outputPath}`);
        console.log(`👉 BẠN CÓ THỂ COPY FILE 'jobs_data.json' NHÉT VÀO FRONTEND NGAY!`);
    }
}

crawlJobs();
