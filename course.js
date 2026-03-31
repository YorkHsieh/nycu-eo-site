let data = [];
let subjectName = "";

const params = new URLSearchParams(window.location.search);
subjectName = params.get("subject") || "";

const courseTitle = document.getElementById("courseTitle");
const courseSubtitle = document.getElementById("courseSubtitle");
const resourceList = document.getElementById("resourceList");

const professorFilter = document.getElementById("detailProfessorFilter");
const yearFilter = document.getElementById("detailYearFilter");
const categoryFilter = document.getElementById("detailCategoryFilter");
const typeFilter = document.getElementById("detailTypeFilter");

courseTitle.textContent = subjectName || "未知課程";
courseSubtitle.textContent = `${subjectName || "此課程"} 的所有資源`;

fetch(`data.json?v=${Date.now()}`)
  .then((res) => res.json())
  .then((json) => {
    data = json.filter((item) => item.subject === subjectName);
    populateFilters(data);
    renderResources();
  });

function uniqueValues(list, key) {
  return [...new Set(list.map((item) => item[key]).filter(Boolean))].sort();
}

function populateSelect(selectEl, values, label) {
  selectEl.innerHTML = `<option value="">全部${label}</option>`;
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    selectEl.appendChild(option);
  });
}

function populateFilters(list) {
  populateSelect(professorFilter, uniqueValues(list, "professor"), "教授");
  populateSelect(yearFilter, uniqueValues(list, "year"), "年份");
  populateSelect(categoryFilter, uniqueValues(list, "fileCategory"), "檔案類別");
  populateSelect(typeFilter, uniqueValues(list, "fileType"), "檔案類型");
}

function getFilteredData() {
  const professor = professorFilter.value;
  const year = yearFilter.value;
  const category = categoryFilter.value;
  const type = typeFilter.value;

  return data.filter((item) => {
    const matchProfessor = !professor || item.professor === professor;
    const matchYear = !year || item.year === year;
    const matchCategory = !category || item.fileCategory === category;
    const matchType = !type || item.fileType === type;

    return matchProfessor && matchYear && matchCategory && matchType;
  });
}

function renderResources() {
  const filtered = getFilteredData();
  resourceList.innerHTML = "";

  if (filtered.length === 0) {
    resourceList.innerHTML = `<div class="empty-state">這門課目前沒有符合條件的資料。</div>`;
    return;
  }

  filtered.forEach((item) => {
    const div = document.createElement("div");
    div.className = "resource-item";

    const examBtn = item.examLink
      ? `<a href="${item.examLink}" target="_blank" class="file-btn">📄 考卷</a>`
      : "";

    const solutionBtn = item.solutionLink
      ? `<a href="${item.solutionLink}" target="_blank" class="file-btn secondary">📘 解答</a>`
      : "";

    div.innerHTML = `
      <h3>${item.title}</h3>

      <div class="resource-topline">
        <span class="tag">${item.grade || "未分類"}</span>
        <span class="tag">${item.professor || "不詳"}</span>
        <span class="tag">${item.year || "不詳"}</span>
        <span class="tag">${item.fileCategory || "其他"}</span>
        <span class="tag">${item.fileType || "未知"}</span>
      </div>

      <div style="margin-top:10px; display:flex; gap:10px;">
        ${examBtn}
        ${solutionBtn}
      </div>

      ${item.note ? `<div class="resource-note">備註：${item.note}</div>` : ""}
    `;

    resourceList.appendChild(div);
  });
}

[professorFilter, yearFilter, categoryFilter, typeFilter].forEach((el) => {
  el.addEventListener("change", renderResources);
});