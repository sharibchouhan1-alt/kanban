// Authentic GitHub Language Colors Map
const LANGUAGE_COLORS = {
  "JavaScript": "#f1e05a",
  "Python": "#3572A5",
  "HTML": "#e34c26",
  "CSS": "#563d7c",
  "TypeScript": "#3178c6",
  "Java": "#b07219",
  "C++": "#f34b7d",
  "C#": "#178600",
  "C": "#555555",
  "PHP": "#4f5d95",
  "Ruby": "#701516",
  "Go": "#00ADD8",
  "Swift": "#F05138",
  "Kotlin": "#A97BFF",
  "Rust": "#dea584",
  "Shell": "#89e051",
  "PowerShell": "#012456",
  "Vue": "#41b883",
  "Jupyter Notebook": "#DA5B0B"
};

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Global Variables (Simple State)
let gitToken = "";
let userRepos = [];

// Initialize Page
window.addEventListener("DOMContentLoaded", async () => {
  // Load token from local configuration
  await loadEnvToken();
  
  // Add Event Listeners
  document.getElementById("search-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("search-input").value.trim();
    if (username) runSearch(username);
  });

  document.getElementById("error-action-btn").addEventListener("click", () => {
    const username = document.getElementById("search-input").value.trim();
    if (username) runSearch(username);
  });

  // Repos filter & sort listeners
  document.getElementById("repo-search").addEventListener("input", filterAndSortRepos);
  document.getElementById("repo-type-select").addEventListener("change", filterAndSortRepos);
  document.getElementById("repo-sort-select").addEventListener("change", filterAndSortRepos);

  // Check URL parameters manually for instant search on load (e.g. ?user=octocat)
  checkUrlParams();
});

// Fetch local .env file and manually parse the token
async function loadEnvToken() {
  try {
    const res = await fetch(".env");
    if (res.ok) {
      const text = await res.text();
      const lines = text.split("\n");
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith("GITHUB_TOKEN=") || line.startsWith("gitToken=")) {
          const parts = line.split("=");
          if (parts.length > 1) {
            let val = parts.slice(1).join("=").trim();
            // Remove single or double quotes manually if present
            if (val.startsWith('"') || val.startsWith("'")) {
              val = val.substring(1, val.length - 1);
            }
            gitToken = val;
            console.log("Token successfully loaded from .env config.");
          }
          break;
        }
      }
    }
  } catch (err) {
    console.warn("Could not load .env configuration.", err);
  }
}

// Manually extract "?user=username" from URL search query
function checkUrlParams() {
  const searchString = window.location.search;
  let user = "";
  
  if (searchString.indexOf("?user=") !== -1) {
    const parts = searchString.split("?user=");
    if (parts.length > 1) {
      user = parts[1];
      if (user.indexOf("&") !== -1) {
        user = user.split("&")[0];
      }
    }
  } else if (searchString.indexOf("?q=") !== -1) {
    const parts = searchString.split("?q=");
    if (parts.length > 1) {
      user = parts[1];
      if (user.indexOf("&") !== -1) {
        user = user.split("&")[0];
      }
    }
  }

  if (user) {
    // Filter out potential URL encoding for simple alphanumeric usernames
    document.getElementById("search-input").value = user;
    runSearch(user);
  }
}

// GitHub REST API fetch call helper
async function fetchGithub(url) {
  const headers = { "Accept": "application/vnd.github.v3+json" };
  if (gitToken) {
    headers["Authorization"] = `token ${gitToken}`;
  }

  const response = await fetch(url, { headers });
  
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const err = new Error(body.message || "Request failed");
    err.status = response.status;
    throw err;
  }

  return response.json();
}

// Search developer profile and repos
async function runSearch(username) {
  // Toggle View states
  document.getElementById("welcome-view").style.display = "none";
  document.getElementById("error-view").style.display = "none";
  document.getElementById("dashboard-view").style.display = "none";
  document.getElementById("loading-view").style.display = "block";

  try {
    // Get user details
    const profile = await fetchGithub(`https://api.github.com/users/${username}`);
    
    // Get user repos list (up to 100)
    userRepos = await fetchGithub(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`);

    // Render profile card
    document.getElementById("prof-avatar").src = profile.avatar_url;
    document.getElementById("prof-name").textContent = profile.name || profile.login;
    document.getElementById("prof-link").textContent = `@${profile.login}`;
    document.getElementById("prof-link").href = profile.html_url;
    document.getElementById("prof-bio").textContent = profile.bio || "No profile bio available.";
    document.getElementById("prof-repos-count").textContent = profile.public_repos;
    document.getElementById("prof-followers").textContent = profile.followers;
    document.getElementById("prof-following").textContent = profile.following;

    // Optional profile metadata fields
    toggleMeta("meta-location-row", "meta-location", profile.location);
    toggleMeta("meta-blog-row", "meta-blog", profile.blog, true);
    toggleMeta("meta-company-row", "meta-company", profile.company);

    // Render general counters & charts
    renderStatsOverview();
    
    // Reset filters and trigger first draw
    document.getElementById("repo-search").value = "";
    document.getElementById("repo-type-select").value = "all";
    document.getElementById("repo-sort-select").value = "stars";
    
    filterAndSortRepos();

    // Toggle Dashboard active
    document.getElementById("loading-view").style.display = "none";
    document.getElementById("dashboard-view").style.display = "block";

  } catch (error) {
    console.error(error);
    showError(error);
  }
}

// Show/hide profile meta rows
function toggleMeta(rowId, valId, textVal, isLink = false) {
  const row = document.getElementById(rowId);
  const container = document.getElementById(valId);
  if (textVal) {
    row.style.display = "block";
    container.textContent = textVal;
    if (isLink) {
      container.href = textVal.startsWith("http") ? textVal : `https://${textVal}`;
    }
  } else {
    row.style.display = "none";
  }
}

// Calculate total stars, forks, averages, and build custom language bar
function renderStatsOverview() {
  let totalStars = 0;
  let totalForks = 0;
  let totalSize = 0;
  const langCounts = {};
  let reposWithLang = 0;

  userRepos.forEach(repo => {
    totalStars += repo.stargazers_count;
    totalForks += repo.forks_count;
    totalSize += repo.size;

    if (repo.language) {
      langCounts[repo.language] = (langCounts[repo.language] || 0) + 1;
      reposWithLang++;
    }
  });

  // Display counters
  document.getElementById("stat-stars").textContent = totalStars;
  document.getElementById("stat-forks").textContent = totalForks;
  
  const avgKB = userRepos.length > 0 ? Math.round(totalSize / userRepos.length) : 0;
  document.getElementById("stat-avg-size").textContent = avgKB >= 1024
    ? `${(avgKB / 1024).toFixed(1)} MB`
    : `${avgKB} KB`;

  // Draw Horizontal language bar
  const langBar = document.getElementById("lang-bar");
  const langLegend = document.getElementById("lang-legend");
  langBar.innerHTML = "";
  langLegend.innerHTML = "";

  if (reposWithLang === 0) {
    langBar.innerHTML = '<div style="width:100%; text-align:center; font-size:0.75rem; color:#57606a; line-height:8px;">No languages detected</div>';
    return;
  }

  // Compile list and sort descending
  const sortedLangs = Object.keys(langCounts).map(name => {
    const count = langCounts[name];
    const percentage = (count / reposWithLang) * 100;
    return { name, count, percentage, color: LANGUAGE_COLORS[name] || "#8b949e" };
  });
  sortedLangs.sort((a, b) => b.count - a.count);

  // Group rest as Others if over 5 languages
  let finalLangs = [];
  if (sortedLangs.length > 5) {
    finalLangs = sortedLangs.slice(0, 5);
    const otherCount = sortedLangs.slice(5).reduce((sum, item) => sum + item.count, 0);
    const otherPct = (otherCount / reposWithLang) * 100;
    finalLangs.push({ name: "Others", count: otherCount, percentage: otherPct, color: "#8b949e" });
  } else {
    finalLangs = sortedLangs;
  }

  // Append HTML child nodes to bar and legend list
  finalLangs.forEach(lang => {
    const seg = document.createElement("div");
    seg.className = "lang-bar-segment";
    seg.style.width = `${lang.percentage}%`;
    seg.style.backgroundColor = lang.color;
    seg.title = `${lang.name}: ${lang.percentage.toFixed(1)}%`;
    langBar.appendChild(seg);

    const legend = document.createElement("div");
    legend.className = "legend-item";
    legend.innerHTML = `
      <span class="lang-dot" style="background-color: ${lang.color}"></span>
      <span style="font-weight: 500;">${lang.name}</span>
      <span style="color:#57606a; margin-left:2px;">${lang.percentage.toFixed(1)}%</span>
    `;
    langLegend.appendChild(legend);
  });
}

// Client filtering and sorting execution
function filterAndSortRepos() {
  const query = document.getElementById("repo-search").value.trim().toLowerCase();
  const type = document.getElementById("repo-type-select").value;
  const sort = document.getElementById("repo-sort-select").value;

  // Filter repos array
  let filtered = userRepos.filter(repo => {
    const matchName = repo.name.toLowerCase().includes(query);
    const matchType = type === "all" || (type === "fork" ? repo.fork : !repo.fork);
    return matchName && matchType;
  });

  // Sort filtered array
  filtered.sort((a, b) => {
    if (sort === "stars") return b.stargazers_count - a.stargazers_count;
    if (sort === "forks") return b.forks_count - a.forks_count;
    if (sort === "updated") return new Date(b.updated_at) - new Date(a.updated_at);
    if (sort === "name") {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      if (aName < bName) return -1;
      if (aName > bName) return 1;
      return 0;
    }
    return 0;
  });

  // Render cards
  const grid = document.getElementById("repos-grid");
  grid.innerHTML = "";
  document.getElementById("repos-count").textContent = filtered.length;

  if (filtered.length === 0) {
    grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 25px; color: #57606a; font-size: 0.85rem;">No repositories matched filters.</div>';
    return;
  }

  filtered.forEach(repo => {
    const card = document.createElement("div");
    card.className = "repo-card";

    // Format Date manually using taught methods
    const dateObj = new Date(repo.updated_at);
    const m = MONTH_NAMES[dateObj.getMonth()];
    const d = dateObj.getDate();
    const y = dateObj.getFullYear();
    const dateFormatted = m + " " + d + ", " + y;

    const color = LANGUAGE_COLORS[repo.language] || "#8b949e";

    card.innerHTML = `
      <div>
        <div class="repo-card-title">
          <a href="${repo.html_url}" target="_blank">${repo.name}</a>
        </div>
        <p class="repo-card-desc">${repo.description || "No description provided."}</p>
      </div>
      <div class="repo-card-meta">
        <div class="repo-lang">
          ${repo.language ? `
            <span class="lang-dot" style="background-color: ${color}"></span>
            <span>${repo.language}</span>
          ` : '<span>-</span>'}
        </div>
        <div class="repo-stats">
          <span title="Stars">&#9733; ${repo.stargazers_count}</span>
          <span title="Forks">&#9205; ${repo.forks_count}</span>
        </div>
        <span style="font-size: 0.7rem; color:#57606a;">Upd: ${dateFormatted}</span>
      </div>
    `;

    grid.appendChild(card);
  });
}

// Display Fetch Errors
function showError(err) {
  document.getElementById("loading-view").style.display = "none";
  document.getElementById("welcome-view").style.display = "none";
  document.getElementById("dashboard-view").style.display = "none";
  
  const view = document.getElementById("error-view");
  view.style.display = "block";

  if (err.status === 403) {
    document.getElementById("error-title").textContent = "Rate Limit Reached";
    document.getElementById("error-message").textContent = "API rate limit reached. Please verify GITHUB_TOKEN inside your local .env file or wait for the limit reset.";
  } else if (err.status === 404) {
    document.getElementById("error-title").textContent = "User Not Found";
    document.getElementById("error-message").textContent = "Could not find any user with that username. Please verify the spelling.";
  } else {
    document.getElementById("error-title").textContent = "Request Failed";
    document.getElementById("error-message").textContent = err.message || "An unexpected network error occurred.";
  }
}
