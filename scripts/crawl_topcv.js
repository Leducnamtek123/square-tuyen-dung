const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// Target URL: Trang tìm việc Mới Nhất Tổng Hợp (Gồm Kiến trúc, Xây dựng, Kế toán, Kinh doanh, vv..)
const TARGET_URL = 'https://www.topcv.vn/tim-viec-lam-moi-nhat';

// Header học theo repo "TopCV-scraper" (Python) để không bị block
const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8"
};

async function crawlTopCV() {
    console.log(`🚀 Đang cào dữ liệu thực tế từ: ${TARGET_URL}`);
    
    try {
        const { data } = await axios.get(TARGET_URL, { headers, timeout: 15000 });
        const $ = cheerio.load(data);
        
        const jobs = [];
        
        // CSS classes của Web TopCV mới nhất
        const jobItems = $('.job-item-default, .job-item-2, .job-item-search-result');
        
        console.log(`👉 Tìm thấy khoảng ${jobItems.length} thẻ việc làm. Đang trích xuất...`);
        
        jobItems.each((index, element) => {
            const title = $(element).find('h3.title a span').text().trim() || $(element).find('h3.title a').text().trim();
            const company = $(element).find('.company-name').text().trim() || $(element).find('.company').text().trim();
            const salary = $(element).find('label.salary span').text().trim() || $(element).find('.title-salary').text().trim() || 'Thỏa thuận';
            const location = $(element).find('.city-text').text().trim() || $(element).find('label.address').text().trim();
            const url = $(element).find('h3.title a').attr('href');
            
            // Xóa rác string
            const cleanTitle = title.replace(/\ng/, '').trim();
            const cleanCompany = company.replace(/\ng/, '').trim();

            if (cleanTitle && url) {
                jobs.push({
                    id: `job_real_topcv_${index}`,
                    title: cleanTitle,
                    company: cleanCompany,
                    location: location,
                    salary: salary.replace(/\n| /g, ' ').replace(/\s+/g, ' ').trim(),
                    skills: ["Tùy vị trí", "Kỹ năng chuyên môn"], // Bỏ fix cứng skill IT
                    url: url.startsWith('http') ? url : `https://www.topcv.vn${url}`,
                    dateCrawled: new Date().toISOString()
                });
            }
        });

        if (jobs.length > 0) {
            console.log(`✅ Lấy thành công ${jobs.length} công việc thực tế từ TopCV!`);
            
            // Lưu đè ra file JSON
            const outputPath = path.join(__dirname, 'jobs_data.json');
            fs.writeFileSync(outputPath, JSON.stringify(jobs, null, 4), 'utf-8');
            
            console.log(`📁 Đã cập nhật file: ${outputPath} chứa data thật.`);
        } else {
            console.log(`⚠️ Không parse được DOM, website có thể đã đổi CSS Classes ngẫu nhiên.`);
        }

    } catch (error) {
        console.error('❌ Lỗi khi crawling TopCV:', error.message);
    }
}

crawlTopCV();
