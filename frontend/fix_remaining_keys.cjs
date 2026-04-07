const fs = require('fs');

// Add remaining common.* keys to admin namespace
function addKeys(filePath, keys) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  // Deep merge
  function merge(target, source) {
    for (const key of Object.keys(source)) {
      if (typeof source[key] === 'object' && source[key] !== null) {
        if (!target[key]) target[key] = {};
        merge(target[key], source[key]);
      } else {
        if (!target[key]) target[key] = source[key];
      }
    }
  }
  
  merge(data, keys);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
}

// EN admin keys
addKeys('./src/i18n/locales/en/admin.json', {
  common: {
    na: "N/A",
    system: "System",
    status: {
      completed: "Completed",
      inProgress: "In Progress",
      scheduled: "Scheduled",
      cancelled: "Cancelled",
      pending: "Pending",
      unknown: "Unknown"
    },
    table: {
      noData: "No data found"
    }
  }
});

// VI admin keys
addKeys('./src/i18n/locales/vi/admin.json', {
  common: {
    na: "N/A",
    system: "Hệ thống",
    status: {
      completed: "Hoàn thành",
      inProgress: "Đang diễn ra",
      scheduled: "Đã lên lịch",
      cancelled: "Đã hủy",
      pending: "Chờ xử lý",
      unknown: "Không xác định"
    },
    table: {
      noData: "Không có dữ liệu"
    }
  }
});

// Also add to interview namespace
addKeys('./src/i18n/locales/en/interview.json', {
  common: {
    na: "N/A",
    status: {
      completed: "Completed",
      inProgress: "In Progress",
      scheduled: "Scheduled",
      cancelled: "Cancelled",
      pending: "Pending",
      unknown: "Unknown"
    },
    table: {
      noData: "No data found"
    }
  }
});

addKeys('./src/i18n/locales/vi/interview.json', {
  common: {
    na: "N/A",
    status: {
      completed: "Hoàn thành",
      inProgress: "Đang diễn ra",
      scheduled: "Đã lên lịch",
      cancelled: "Đã hủy",
      pending: "Chờ xử lý",
      unknown: "Không xác định"
    },
    table: {
      noData: "Không có dữ liệu"
    }
  }
});

// Add common.hot to common.json
addKeys('./src/i18n/locales/en/common.json', {
  common: { hot: "Hot" }
});
addKeys('./src/i18n/locales/vi/common.json', {
  common: { hot: "Nổi bật" }
});

console.log('All remaining missing keys added!');
