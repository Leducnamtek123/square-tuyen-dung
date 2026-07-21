const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// ============ CẤU HÌNH ============
const TOTAL_PAGES = 5;           // Số trang danh sách cần cào (mỗi trang ~50 job)
const DELAY_MS = 800;            // Delay giữa mỗi request (tránh bị block)
const DETAIL_DELAY_MS = 500;     // Delay khi vào trang chi tiết
const BASE_URL = 'https://www.topcv.vn/tim-viec-lam-moi-nhat';

const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Parse salary string thành min/max
function parseSalary(salaryStr) {
    if (!salaryStr || salaryStr.includes('Thoả thuận') || salaryStr.includes('Thỏa thuận')) {
        return { salaryMin: 0, salaryMax: 0, salaryText: salaryStr || 'Thỏa thuận' };
    }
    
    const cleaned = salaryStr.replace(/,/g, '').replace(/\s+/g, ' ').trim();
    
    // "10 - 50 triệu" 
    const rangeMatch = cleaned.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*triệu/i);
    if (rangeMatch) {
        return {
            salaryMin: Math.round(parseFloat(rangeMatch[1]) * 1000000),
            salaryMax: Math.round(parseFloat(rangeMatch[2]) * 1000000),
            salaryText: cleaned
        };
    }
    
    // "Từ 15 triệu" 
    const fromMatch = cleaned.match(/[Tt]ừ\s*(\d+(?:\.\d+)?)\s*triệu/i);
    if (fromMatch) {
        const val = Math.round(parseFloat(fromMatch[1]) * 1000000);
        return { salaryMin: val, salaryMax: val * 2, salaryText: cleaned };
    }
    
    // "Tới 25 triệu"
    const toMatch = cleaned.match(/[Tt]ới\s*(\d+(?:\.\d+)?)\s*triệu/i);
    if (toMatch) {
        const val = Math.round(parseFloat(toMatch[1]) * 1000000);
        return { salaryMin: Math.round(val * 0.5), salaryMax: val, salaryText: cleaned };
    }
    
    return { salaryMin: 10000000, salaryMax: 20000000, salaryText: cleaned };
}

// Cào chi tiết từ 1 trang job
async function crawlJobDetail(url) {
    try {
        const { data } = await axios.get(url, { headers, timeout: 15000 });
        const $ = cheerio.load(data);
        
        // Mô tả công việc
        const description = $('.job-description__item').eq(0).find('.job-description__item--content').html()?.trim() || '';
        
        // Yêu cầu công việc
        const requirement = $('.job-description__item').eq(1).find('.job-description__item--content').html()?.trim() || '';
        
        // Quyền lợi
        const benefits = $('.job-description__item').eq(2).find('.job-description__item--content').html()?.trim() || '';
        
        // Deadline
        let deadline = '';
        $('[class*="job-detail"]').find('div, span, p').each((_, el) => {
            const text = $(el).text().trim();
            const deadlineMatch = text.match(/(\d{2}\/\d{2}\/\d{4})/);
            if (deadlineMatch && !deadline) {
                deadline = deadlineMatch[1];
            }
        });
        
        // Nếu không tìm thấy qua class, tìm theo pattern trong toàn page
        if (!deadline) {
            const bodyText = $('body').text();
            const match = bodyText.match(/Hạn nộp[:\s]*(\d{2}\/\d{2}\/\d{4})/);
            if (match) deadline = match[1];
        }

        // Thông tin sidebar
        const infoItems = {};
        $('.box-general-group .box-general-group-info').each((_, el) => {
            const label = $(el).find('.box-general-group-info-title, strong').first().text().trim();
            const value = $(el).find('.box-general-group-info-value, span').last().text().trim();
            if (label && value) {
                infoItems[label] = value;
            }
        });
        
        // Lấy experience từ sidebar
        let experience = '';
        $('div').each((_, el) => {
            const text = $(el).text().trim();
            if (text.includes('Kinh nghiệm') && text.length < 200) {
                const match = text.match(/Kinh nghiệm[:\s]*(.*?)(?:\n|$)/);
                if (match) experience = match[1].trim();
            }
        });

        return {
            description: description || '',
            requirement: requirement || '',
            benefits: benefits || '',
            deadline: deadline || '',
            experience: experience || '',
            infoItems
        };
    } catch (err) {
        console.log(`   ⚠️ Lỗi khi lấy chi tiết: ${err.message}`);
        return { description: '', requirement: '', benefits: '', deadline: '', experience: '', infoItems: {} };
    }
}

// Cào 1 trang danh sách
async function crawlListPage(pageNum) {
    const url = pageNum === 1 ? BASE_URL : `${BASE_URL}?page=${pageNum}`;
    console.log(`\n📄 Đang cào trang ${pageNum}: ${url}`);
    
    try {
        const { data } = await axios.get(url, { headers, timeout: 15000 });
        const $ = cheerio.load(data);
        
        const jobs = [];
        const jobItems = $('.job-item-default, .job-item-2, .job-item-search-result');
        
        console.log(`   👉 Tìm thấy ${jobItems.length} thẻ việc làm trên trang ${pageNum}`);
        
        jobItems.each((index, element) => {
            const title = $(element).find('h3.title a span').text().trim() || $(element).find('h3.title a').text().trim();
            const company = $(element).find('.company-name').text().trim() || $(element).find('.company').text().trim();
            const salary = $(element).find('label.salary span').text().trim() || $(element).find('.title-salary').text().trim() || 'Thỏa thuận';
            const location = $(element).find('.city-text').text().trim() || $(element).find('label.address').text().trim();
            const url = $(element).find('h3.title a').attr('href');
            
            const cleanTitle = title.replace(/\n/g, '').trim();
            const cleanCompany = company.replace(/\n/g, '').trim();

            if (cleanTitle && url) {
                const fullUrl = url.startsWith('http') ? url : `https://www.topcv.vn${url}`;
                const salaryParsed = parseSalary(salary.replace(/\n| /g, ' ').replace(/\s+/g, ' ').trim());
                
                jobs.push({
                    title: cleanTitle,
                    company: cleanCompany,
                    location: location,
                    salary: salaryParsed.salaryText,
                    salaryMin: salaryParsed.salaryMin,
                    salaryMax: salaryParsed.salaryMax,
                    url: fullUrl,
                });
            }
        });
        
        return jobs;
    } catch (error) {
        console.error(`   ❌ Lỗi trang ${pageNum}:`, error.message);
        return [];
    }
}

async function main() {
    console.log('🚀 BẮT ĐẦU CÀO DỮ LIỆU TOPCV (Nâng cấp - nhiều trang + chi tiết)');
    console.log(`📋 Cấu hình: ${TOTAL_PAGES} trang, delay ${DELAY_MS}ms/trang, ${DETAIL_DELAY_MS}ms/chi tiết`);
    
    let allJobs = [];
    
    // Bước 1: Cào danh sách tất cả các trang
    for (let page = 1; page <= TOTAL_PAGES; page++) {
        const jobs = await crawlListPage(page);
        allJobs = allJobs.concat(jobs);
        if (page < TOTAL_PAGES) await sleep(DELAY_MS);
    }
    
    console.log(`\n✅ Tổng cộng lấy được ${allJobs.length} job từ ${TOTAL_PAGES} trang danh sách.`);
    
    // Bước 2: Vào từng trang chi tiết lấy mô tả đầy đủ
    console.log(`\n🔍 Bắt đầu cào chi tiết từng job (${allJobs.length} jobs)...`);
    
    let detailCount = 0;
    for (let i = 0; i < allJobs.length; i++) {
        const job = allJobs[i];
        detailCount++;
        
        process.stdout.write(`   [${detailCount}/${allJobs.length}] ${job.title.substring(0, 60)}...`);
        
        const detail = await crawlJobDetail(job.url);
        
        job.id = `job_topcv_${i}`;
        job.description = detail.description;
        job.requirement = detail.requirement;
        job.benefits = detail.benefits;
        job.deadline = detail.deadline;
        job.experience = detail.experience;
        job.dateCrawled = new Date().toISOString();
        
        const hasDetail = detail.description ? '✅' : '⚠️';
        console.log(` ${hasDetail}`);
        
        await sleep(DETAIL_DELAY_MS);
    }
    
    // Deduplicate bằng URL
    const seen = new Set();
    const uniqueJobs = allJobs.filter(job => {
        const key = job.url.split('?')[0]; // bỏ query params
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
    
    console.log(`\n📊 Sau khi loại trùng: ${uniqueJobs.length} jobs (bỏ ${allJobs.length - uniqueJobs.length} trùng lặp)`);
    
    // Lưu file
    const outputPath = path.join(__dirname, 'jobs_data.json');
    fs.writeFileSync(outputPath, JSON.stringify(uniqueJobs, null, 4), 'utf-8');
    
    console.log(`📁 Đã lưu ${uniqueJobs.length} jobs vào: ${outputPath}`);
    console.log(`\n🎉 HOÀN TẤT! Dữ liệu sẵn sàng để import vào database.`);
    
    // Thống kê
    const withDesc = uniqueJobs.filter(j => j.description).length;
    const withDeadline = uniqueJobs.filter(j => j.deadline).length;
    const withSalary = uniqueJobs.filter(j => j.salaryMin > 0).length;
    console.log(`\n📈 Thống kê:`);
    console.log(`   - Có mô tả chi tiết: ${withDesc}/${uniqueJobs.length}`);
    console.log(`   - Có deadline: ${withDeadline}/${uniqueJobs.length}`);
    console.log(`   - Có lương cụ thể: ${withSalary}/${uniqueJobs.length}`);
}

main().catch(console.error);
