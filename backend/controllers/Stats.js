const ReserveModel = require("../models/ReserveModel");
const UserModel = require("../models/UserModel");
const fs = require("fs");
const path = require("path");
const cron = require("node-cron");

function ensureDirectoryExists(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadCache(cacheFilePath) {
  if (fs.existsSync(cacheFilePath)) {
    try {
      return JSON.parse(fs.readFileSync(cacheFilePath, "utf8"));
    } catch (error) {
      console.error("Failed to parse cache file:", error);
      return [];
    }
  }
  return [];
}

function saveCache(cache, cacheFilePath) {
  ensureDirectoryExists(cacheFilePath);
  try {
    fs.writeFileSync(cacheFilePath, JSON.stringify(cache, null, 2), "utf8");
  } catch (error) {
    console.error("Failed to save cache file:", error);
  }
}

function addToCache(newData, cacheFilePath) {
  let cache = loadCache(cacheFilePath);

  const isDuplicate = cache.some(
    (article) =>
      article.title === newData.title &&
      article.articleUrl === newData.articleUrl
  );

  if (!isDuplicate) {
    cache.unshift(newData);
    if (cache.length > 10) {
      cache.pop();
    }
    saveCache(cache, cacheFilePath);
  }
}

function extractFileNameFromUrl(input) {
  const fileName = input.replace(/[^a-zA-Z0-9]/g, "-").replace(/^-|-$/g, "");
  return `${fileName}.json`;
}

const getCurrentMonthName = () => {
  const options = { month: "long", year: "numeric" };
  return new Date().toLocaleDateString(undefined, options);
};

const SaveData = async (req, res) => {
  const monthName = getCurrentMonthName();
  const cacheFilePath = path.join(
    __dirname,
    "../cache", 
    extractFileNameFromUrl(`${monthName}`)
  );

  try {
    const date = new Date();
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const reservations = await ReserveModel.find({
      scheduleDate: { $gte: startOfMonth, $lt: endOfMonth },
    }).populate("user");

    if (reservations.length === 0) {
      if (res) {
        return res
          .status(404)
          .json({ message: "No reservations found for the month" });
      } else {
        console.log("No reservations found for the month");
        return;
      }
    }

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    const approvedBookings = reservations.filter((item) => {
      const bookingDate = new Date(item.scheduleDate);
      return (
        item.approval.status === "Approved" &&
        bookingDate.getFullYear() === currentYear &&
        bookingDate.getMonth() === currentMonth
      );
    });

    const bookingsByDate = approvedBookings.reduce((acc, item) => {
      const bookingDate = new Date(item.scheduleDate)
        .toISOString()
        .split("T")[0];

      const existingDate = acc.find((entry) => entry.date === bookingDate);
      if (existingDate) {
        existingDate.count += 1;
        // existingDate.data.push(item);
      } else {
        acc.push({ date: bookingDate, count: 1 });
      }

      return acc;
    }, []);

    const bookingsByDepartment = approvedBookings.reduce((acc, item) => {
      const department = item.user?.department;

      if (department) {
        const existingDepartment = acc.find(
          (entry) => entry.department === department
        );

        if (existingDepartment) {
          existingDepartment.count += 1;
        } else {
          acc.push({ department, count: 1 });
        }
      }

      return acc;
    }, []);

    const stats = approvedBookings.reduce((acc, item) => {
      const username = item.user?.userName;
      const department = item.user?.department;
      const room = item.roomName;
      const time = new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (username) {
        acc.employees[username] = (acc.employees[username] || 0) + 1;
        acc.employeeNames[username] = `${item.user.firstName} ${item.user.surName}`;
      }

      if (department) {
        acc.departments[department] = (acc.departments[department] || 0) + 1;
      }

      if (room) {
        acc.rooms[room] = (acc.rooms[room] || 0) + 1;
      }

      if (time) {
        acc.times[time] = (acc.times[time] || 0) + 1;
      }

      return acc;
    }, { employees: {}, employeeNames: {}, departments: {}, rooms: {}, times: {} });

    const getMostFrequent = (data) => {
      return Object.keys(data).reduce((mostFrequent, currentKey) => (
        (data[mostFrequent] > data[currentKey] ? mostFrequent : currentKey)
      ), '');
    };

    const mostFrequentEmployeeKey = getMostFrequent(stats.employees);
    const mostFrequentDepartmentKey = getMostFrequent(stats.departments);
    const mostBookedRoomKey = getMostFrequent(stats.rooms);
    const mostBookedTimeKey = getMostFrequent(stats.times);

    const fullName = stats.employeeNames[mostFrequentEmployeeKey] || 'N/A';

    const user = await UserModel.find({});

    const article = {
      usage: {
        palawan: reservations.filter((item) => item.roomName === "Palawan").length,
        boracay: reservations.filter((item) => item.roomName === "Boracay").length,
        both: reservations.filter((item) => item.roomName === "Palawan and Boracay").length,
      },
      status: {
        total: reservations.length,
        approved: reservations.filter((item) => item.approval.status === "Approved").length,
        rejected: reservations.filter((item) => item.approval.status === "Declined").length,
        pending: reservations.filter((item) => item.approval.status === "Pending" && item.title !== "").length,
      },
      date: bookingsByDate, 
      dept: bookingsByDepartment,
      additional: {
        mostFrequentEmployee: fullName,
        mostFrequentDepartment: mostFrequentDepartmentKey || 'N/A',
        mostBookedRoom: mostBookedRoomKey || 'N/A',
        mostBookedTime: mostBookedTimeKey || 'N/A',
      },
      userStat: {
        total: user.length,
        active: user.filter(item => item.resetPass === true).length,
        notRegistered: user.filter(item => item.resetPass === false).length
      },
      month: monthName,
    };

    addToCache(article, cacheFilePath);
    res.json(article);
  } catch (error) {
    console.error("Error saving monthly stats:", error);
    res.status(500).json({ error: "Error saving monthly stats." });
  }
};

const GetCacheFile = (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  const filePath = path.join(
    __dirname,
    "../cache",
    extractFileNameFromUrl(url)
  );

  if (fs.existsSync(filePath)) {
    try {
      const fileContent = fs.readFileSync(filePath, "utf8");
      res.send(fileContent);
    } catch (error) {
      res.status(500).json({ error: "Failed to read the cached file" });
    }
  } else {
    res.status(404).json({ error: "Cached file not found" });
  }
};

const ListJsonFiles = (req, res) => {
  try {
    const cacheDir = path.join(__dirname, "../cache");
    const files = fs.readdirSync(cacheDir);

    const jsonFiles = files
      .filter(file => file.endsWith('.json'))
      .map(file => file.slice(0, -5));

    res.json({ jsonFiles });
  } catch (error) {
    console.error("Failed to read cache directory:", error);
    res.status(500).json({ error: "Failed to read the cache directory" });
  }
};

cron.schedule('0 23 28-31 * *', () => {
  const today = new Date();
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  if (today.getDate() === lastDayOfMonth) {
    SaveData()
      .then(() => {
        console.log("Scheduled SaveData task completed successfully.");
      })
      .catch((error) => {
        console.error("Error in scheduled SaveData task:", error);
      });
  }
});

module.exports = {
  SaveData,
  GetCacheFile,
  ListJsonFiles
};