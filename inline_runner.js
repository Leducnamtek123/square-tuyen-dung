const fs = require('fs');

const jobsData = fs.readFileSync('./scripts/jobs_data.json', 'utf8');
let pyScript = fs.readFileSync('./api/map_scraped_jobs.py', 'utf8');

// Chèn data trực tiếp vào python thay vì đọc file
const replacement = `
    jobs_data = json.loads(r"""${jobsData.replace(/\\/g, '\\\\')}""")
`;

pyScript = pyScript.replace(
    /file_path = '\/app\/jobs_data.json'[\s\S]*?jobs_data = json.load\(f\)/,
    replacement
);


// Thêm flush=True vào print để Windows pipe không bị giấu log
pyScript = pyScript.replace(/print\(/g, "print(flush=True, ");

fs.writeFileSync('./api/runner.py', pyScript);
console.log("✅ Đã chuấn bị mã nguồn python hoàn tất!");
