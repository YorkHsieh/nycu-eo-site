let data = [];
let currentGrade = "全部";

const searchInput = document.getElementById("search");
const subjectFilter = document.getElementById("subjectFilter");
const professorFilter = document.getElementById("professorFilter");
const yearFilter = document.getElementById("yearFilter");
const categoryFilter = document.getElementById("categoryFilter");
const typeFilter = document.getElementById("typeFilter");

fetch("data.json")
  .then((res) => res.json())
  .then((json) => {
    data = json;
    populateFilters(data);
    renderCourses();
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
  populateSelect(subjectFilter, uniqueValues(list, "subject"), "科目");
  populateSelect(professorFilter, uniqueValues(list, "professor"), "教授");
  populateSelect(yearFilter, uniqueValues(list, "year"), "年份");
  populateSelect(categoryFilter, uniqueValues(list, "fileCategory"), "檔案類別");
  populateSelect(typeFilter, uniqueValues(list, "fileType"), "檔案類型");
}

function filterGrade(grade) {
  currentGrade = grade;

  document.querySelectorAll(".sidebar button").forEach((btn) => {
    btn.classList.toggle("active", btn.textContent === grade);
  });

  renderCourses();
}

window.filterGrade = filterGrade;

function getFilteredData() {
  const keyword = searchInput.value.trim().toLowerCase();
  const subject = subjectFilter.value;
  const professor = professorFilter.value;
  const year = yearFilter.value;
  const category = categoryFilter.value;
  const type = typeFilter.value;

  return data.filter((item) => {
    const matchGrade = currentGrade === "全部" || item.grade === currentGrade;
    const matchSubject = !subject || item.subject === subject;
    const matchProfessor = !professor || item.professor === professor;
    const matchYear = !year || item.year === year;
    const matchCategory = !category || item.fileCategory === category;
    const matchType = !type || item.fileType === type;

    const text = [
      item.subject,
      item.professor,
      item.year,
      item.fileCategory,
      item.fileType,
      item.title,
      item.note || ""
    ]
      .join(" ")
      .toLowerCase();

    const matchKeyword = !keyword || text.includes(keyword);

    return (
      matchGrade &&
      matchSubject &&
      matchProfessor &&
      matchYear &&
      matchCategory &&
      matchType &&
      matchKeyword
    );
  });
}

function renderCourses() {
  const filtered = getFilteredData();
  const container = document.getElementById("courseCards");
  container.innerHTML = "";

  const grouped = {};

  filtered.forEach((item) => {
    if (!grouped[item.subject]) {
      grouped[item.subject] = [];
    }
    grouped[item.subject].push(item);
  });

  const subjects = Object.keys(grouped).sort((a, b) => a.localeCompare(b, "zh-Hant"));

  if (subjects.length === 0) {
    container.innerHTML = `<div class="empty-state">目前沒有符合條件的課程。</div>`;
    return;
  }

  subjects.forEach((subject) => {
    const items = grouped[subject];
    const professors = [...new Set(items.map((i) => i.professor).filter(Boolean))];
    const years = [...new Set(items.map((i) => i.year).filter(Boolean))];

    const card = document.createElement("a");
    card.className = "course-card";
    card.href = `course.html?subject=${encodeURIComponent(subject)}`;

    card.innerHTML = `
      <h3>${subject}</h3>
      <div class="course-meta">
        教授：${professors.join("、") || "不詳"}<br>
        年份：${years.join("、") || "不詳"}
      </div>
      <span class="course-count">共 ${items.length} 份資料</span>
    `;

    container.appendChild(card);
  });
}

[
  searchInput,
  subjectFilter,
  professorFilter,
  yearFilter,
  categoryFilter,
  typeFilter
].forEach((el) => {
  el.addEventListener("input", renderCourses);
  el.addEventListener("change", renderCourses);
});