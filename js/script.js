document.addEventListener("DOMContentLoaded", () => {
  // ── Hamburger Menu Toggle ─────────────────────────────────
  const menuBtn = document.getElementById("menu-btn");
  const navbar  = document.querySelector(".header .navbar");
  if (menuBtn && navbar) {
    menuBtn.addEventListener("click", () => navbar.classList.toggle("active"));
    navbar.querySelectorAll("a").forEach(link =>
      link.addEventListener("click", () => navbar.classList.remove("active"))
    );
  }

  // ── Calendar Setup ─────────────────────────────────────────
  const calendarEl     = document.getElementById("appointmentCalendar");
  const dateInput      = document.getElementById("appointmentDate");
  const prevBtn        = document.getElementById("prevMonth");
  const nextBtn        = document.getElementById("nextMonth");
  const currentMonthEl = document.getElementById("currentMonth");

  if (calendarEl && dateInput && prevBtn && nextBtn && currentMonthEl) {
    const today       = new Date();
    today.setHours(0,0,0,0);
    let activeYear  = today.getFullYear();
    let activeMonth = today.getMonth();

    function buildCalendar(year, month) {
      // header
      currentMonthEl.textContent =
        new Date(year, month).toLocaleString("en-GB", { month: "long", year: "numeric" });

      // table start
      let html = "<table><tr>" +
        ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
          .map(d => `<th>${d}</th>`).join("") +
        "</tr><tr>";

      const firstDay    = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      // leading blanks
      for (let i = 0; i < firstDay; i++) html += "<td></td>";

      // days
      for (let d = 1; d <= daysInMonth; d++) {
        const cellDate = new Date(year, month, d);
        const disabled = cellDate < today ? "disabled" : "";
        html += `<td class="${disabled}" data-date="${year}-${month+1}-${d}">${d}</td>`;
        if ((firstDay + d) % 7 === 0 && d < daysInMonth) html += "</tr><tr>";
      }

      html += "</tr></table>";
      calendarEl.innerHTML = html;

      // day-click
      calendarEl.querySelectorAll("td[data-date]").forEach(td => {
        if (td.classList.contains("disabled")) return;
        td.addEventListener("click", () => {
          calendarEl.querySelectorAll("td.selected").forEach(el => el.classList.remove("selected"));
          td.classList.add("selected");
          dateInput.value = td.dataset.date;
        });
      });

      // nav buttons state
      prevBtn.disabled = (year < today.getFullYear()) ||
                         (year === today.getFullYear() && month <= today.getMonth());

      const oneYearLater = new Date(today);
      oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
      nextBtn.disabled = (year > oneYearLater.getFullYear()) ||
                         (year === oneYearLater.getFullYear() && month >= oneYearLater.getMonth());
    }

    // navigation listeners
    prevBtn.addEventListener("click", () => {
      if (--activeMonth < 0) { activeMonth = 11; activeYear--; }
      buildCalendar(activeYear, activeMonth);
      dateInput.value = "";
    });
    nextBtn.addEventListener("click", () => {
      if (++activeMonth > 11) { activeMonth = 0; activeYear++; }
      buildCalendar(activeYear, activeMonth);
      dateInput.value = "";
    });

    // initial render
    buildCalendar(activeYear, activeMonth);
  }

  // ── File Upload ────────────────────────────────────────────
  const dropZone  = document.getElementById("dropZone");
  const fileInput = document.getElementById("fileInput");
  if (dropZone && fileInput) {
    function updateDrop() {
      dropZone.textContent = fileInput.files[0]
        ? fileInput.files[0].name
        : "Drag & Drop or Click to Upload (PDF/JPG) of your pet";
    }
    dropZone.addEventListener("click", () => fileInput.click());
    dropZone.addEventListener("dragover", e => { e.preventDefault(); dropZone.classList.add("dragover"); });
    dropZone.addEventListener("dragleave", e => { e.preventDefault(); dropZone.classList.remove("dragover"); });
    dropZone.addEventListener("drop", e => {
      e.preventDefault();
      dropZone.classList.remove("dragover");
      if (e.dataTransfer.files.length) {
        fileInput.files = e.dataTransfer.files;
        updateDrop();
      }
    });
    fileInput.addEventListener("change", updateDrop);
  }

  // ── “Other” Pet Type ───────────────────────────────────────
  const petTypeSelect  = document.getElementById("petType");
  const otherTypeGroup = document.getElementById("otherTypeGroup");
  const otherPetInput  = document.getElementById("otherPetType");
  if (petTypeSelect && otherTypeGroup && otherPetInput) {
    otherTypeGroup.style.display = "none";
    petTypeSelect.addEventListener("change", () => {
      const show = petTypeSelect.value === "Other";
      otherTypeGroup.style.display = show ? "flex" : "none";
      otherPetInput.required = show;
    });
  }

  // ── Password Toggle & Requirements ─────────────────────────
  const pass1      = document.getElementById("pass1");
  const pass2      = document.getElementById("pass2");
  const togglePass = document.getElementById("togglePass");
  if (togglePass && pass1 && pass2) {
    togglePass.addEventListener("change", () => {
      const type = togglePass.checked ? "text" : "password";
      pass1.type = pass2.type = type;
    });
  }

  // ── Form Submission & Reset ────────────────────────────────
  const form     = document.getElementById("vetForm");
  const resetBtn = document.getElementById("resetBtn");
  const infoBox  = document.getElementById("submissionInfo");

  if (form) {
    form.addEventListener("submit", e => {
      e.preventDefault();

      // 1) HTML5 validation
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      // 2) Require appointment date
      if (!dateInput.value) {
        alert("Please select an appointment date.");
        dateInput.focus();
        return;
      }

      // 3) Password rules
      const pw  = pass1.value.trim();
      const pw2 = pass2.value.trim();
      if (pw.length < 8) {
        alert("Password must be at least 8 characters.");
        pass1.focus();
        return;
      }
      if (pw !== pw2) {
        alert("Passwords do not match.");
        pass2.focus();
        return;
      }

      // 4) Gather data
      const data = {
        name:   document.getElementById("name")?.value.trim()   || "",
        email:  document.getElementById("email")?.value.trim()  || "",
        phone:  document.getElementById("phone")?.value.trim()  || "",
        gender: Array.from(document.querySelectorAll('input[name="gender"]'))
                     .find(r=>r.checked)?.value || "",
        services: Array.from(document.querySelectorAll('input[name="skills"]'))
                       .filter(cb=>cb.checked).map(cb=>cb.value),
        petType: petTypeSelect?.value === "Other"
                   ? otherPetInput.value.trim()
                   : petTypeSelect?.value || "",
        apptDate: dateInput.value || "",
        fileName: fileInput?.files[0]?.name || ""
      };
      localStorage.setItem("vetFormData", JSON.stringify(data));

      // 5) Reset form 
      form.reset();
      if (calendarEl) {
        const now = new Date(); now.setHours(0,0,0,0);
        buildCalendar(now.getFullYear(), now.getMonth());
      }
      if (dateInput) dateInput.value = "";
      if (dropZone)  dropZone.textContent = "Drag & Drop or Click to Upload (PDF/JPG) of your pet";
      if (otherTypeGroup) otherTypeGroup.style.display = "none";

      // 6) Thank-you message
      if (infoBox) {
        infoBox.innerHTML = `
          <h3>Thank you, ${data.name}!</h3>
          <p>Your appointment is on ${new Date(data.apptDate).toLocaleDateString()}.</p>
        `;
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", e => {
      e.preventDefault();
      form.reset();
      localStorage.removeItem("vetFormData");
      if (infoBox) infoBox.innerHTML = "";
      if (otherTypeGroup) otherTypeGroup.style.display = "none";
      if (dropZone)  dropZone.textContent = "Drag & Drop or Click to Upload (PDF/JPG) of your pet";
      if (calendarEl) {
        const now = new Date(); now.setHours(0,0,0,0);
        buildCalendar(now.getFullYear(), now.getMonth());
        if (dateInput) dateInput.value = "";
      }
    });
  }
});
