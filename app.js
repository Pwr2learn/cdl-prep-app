// app.js - Application Logic for NYS CDL Pro-Prep Portal

// --- State ---
let state = {
  lang: localStorage.getItem('cdl_lang') || 'en',
  currentView: 'home',
  config: {
    passingScore: parseInt(localStorage.getItem('cdl_passing_score')) || 80
  },
  exam: {
    active: false,
    mode: 'gen',
    sections: [], // { id, questions, answers, currentIndex }
    currentSectionIndex: 0,
    startTime: null,
    timerInterval: null
  },
  history: [],
  pool: new Set(),
  lastRecord: null
};

// --- Initialization ---
function init() {
  // Load Dark Mode
  if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  // Load History
  try {
    const savedHistory = localStorage.getItem('cdl_history');
    if (savedHistory) state.history = JSON.parse(savedHistory);
  } catch(e) { console.error('Failed to load history', e); }

  // Load Pool
  try {
    const savedPool = localStorage.getItem('cdl_pool');
    if (savedPool) state.pool = new Set(JSON.parse(savedPool));
  } catch(e) { console.error('Failed to load pool', e); }

  } catch(e) { console.error('Failed to load pool', e); }

  toggleLanguage(state.lang);
  
  const diffSel = document.getElementById('difficulty-selector');
  if (diffSel) diffSel.value = state.config.passingScore;
  setDifficulty(state.config.passingScore);

  updateDashboardStats();
  nav('home');
  
  // Expose global for debugging if needed
  window.appState = state;
}

// --- Navigation & UI ---
function nav(viewId) {
  if (state.exam.active && viewId !== 'exam') {
    if (!confirm("Quit active practice test?")) return;
    quitExam();
  }

  const views = ['home', 'dashboard', 'practice', 'exam', 'results', 'history', 'help'];
  views.forEach(v => {
    document.getElementById(`view-${v}`).classList.add('hidden');
    if (document.getElementById(`nav-${v}`)) {
      document.getElementById(`nav-${v}`).classList.remove('bg-gray-100', 'dark:bg-gray-700', 'text-brand-600', 'dark:text-brand-400');
    }
  });

  document.getElementById(`view-${viewId}`).classList.remove('hidden');
  if (viewId !== 'exam' && viewId !== 'results') {
    document.getElementById(`view-${viewId}`).classList.add('flex');
    document.getElementById(`view-${viewId}`).classList.add('flex-col'); // for full height
  }
  
  if (document.getElementById(`nav-${viewId}`)) {
    document.getElementById(`nav-${viewId}`).classList.add('bg-gray-100', 'dark:bg-gray-700', 'text-brand-600', 'dark:text-brand-400');
  }

  state.currentView = viewId;

  if (viewId === 'dashboard') updateDashboardStats();
  if (viewId === 'practice') updatePoolStats();
  if (viewId === 'history') renderHistory();
}

function toggleDarkMode() {
  if (document.documentElement.classList.contains('dark')) {
    document.documentElement.classList.remove('dark');
    localStorage.theme = 'light';
  } else {
    document.documentElement.classList.add('dark');
    localStorage.theme = 'dark';
  }
}

function toggleLanguage(lang) {
  state.lang = lang;
  localStorage.setItem('cdl_lang', lang);
  
  const deskSel = document.getElementById('lang-selector-desktop');
  const mobSel = document.getElementById('lang-selector-mobile');
  if (deskSel) deskSel.value = lang;
  if (mobSel) mobSel.value = lang;
  
  if (state.currentView === 'exam' && state.exam.active) {
    renderQuestion();
  } else if (state.currentView === 'results') {
    if (state.lastRecord) {
      renderResultsView(state.lastRecord);
    }
  }
}

function getTranslatedQuestion(q) {
  if (state.lang === 'es' && window.questionBankEs) {
    const esQ = window.questionBankEs.find(eq => eq.id === q.id);
    if (esQ) return esQ;
  }
  return q;
}

function setDifficulty(score) {
  state.config.passingScore = parseInt(score);
  localStorage.setItem('cdl_passing_score', score);
  
  const els = document.querySelectorAll('.pass-req-text');
  els.forEach(el => el.textContent = `${score}%`);
}

function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  if (menu.classList.contains('hidden')) {
    menu.classList.remove('hidden');
  } else {
    menu.classList.add('hidden');
  }
}

// --- Dashboard ---
function updateDashboardStats() {
  const testsTaken = state.history.length;
  document.getElementById('dash-tests-taken').textContent = testsTaken;

  if (testsTaken === 0) {
    document.getElementById('dash-avg-score').textContent = '--%';
    document.getElementById('dash-qs-answered').textContent = '0';
    document.getElementById('dash-category-stats').innerHTML = '<p class="text-gray-500">Take a test to see category performance.</p>';
    return;
  }

  let totalQs = 0;
  let totalCorrect = 0;
  const catStats = {};

  state.history.forEach(test => {
    totalQs += test.total;
    totalCorrect += test.score;
    
    // Aggregating category stats from test object
    if (test.catBreakdown) {
      for (const [cat, data] of Object.entries(test.catBreakdown)) {
        if (!catStats[cat]) catStats[cat] = { total: 0, correct: 0 };
        catStats[cat].total += data.total;
        catStats[cat].correct += data.correct;
      }
    }
  });

  document.getElementById('dash-qs-answered').textContent = totalQs;
  const avg = Math.round((totalCorrect / totalQs) * 100);
  document.getElementById('dash-avg-score').textContent = `${avg}%`;

  let catHtml = '';
  for (const [cat, data] of Object.entries(catStats)) {
    const p = Math.round((data.correct / data.total) * 100);
    const isWeak = p < state.config.passingScore;
    const color = isWeak ? 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400' : 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
    
    catHtml += `
      <div class="flex justify-between items-center p-3 rounded-lg border border-gray-100 dark:border-gray-700">
        <span class="font-medium capitalize">${getCatName(cat)}</span>
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-500">${data.correct}/${data.total}</span>
          <span class="px-2 py-1 rounded font-bold text-sm ${color}">${p}%</span>
        </div>
      </div>
    `;
  }
  document.getElementById('dash-category-stats').innerHTML = catHtml || '<p>No category data.</p>';
}

function getCatName(cat) {
  const map = {
    'gen': 'General Knowledge',
    'pass': 'Passenger Transport',
    'air': 'Air Brakes',
    'pretrip': 'Pre-Trip Inspection',
    'control': 'Basic Vehicle Control',
    'road': 'Road Test',
    'emergency': 'Emergency Procedures',
    'simulator': 'Full Simulator',
    'weak': 'Weak Areas Review'
  };
  return map[cat] || cat;
}

// --- Config & Setup ---
function startSingleTest(mode) {
  let count = 20; // default
  if (mode === 'gen') count = 50;
  else if (mode === 'pass') count = 20;
  else if (mode === 'air') count = 25;
  
  startExam(mode, [{ id: mode, count: count }]);
}

function startMultiTest(mode) {
  if (mode === 'simulator') {
    startExam(mode, [
      { id: 'gen', count: 50 },
      { id: 'pass', count: 20 },
      { id: 'air', count: 25 }
    ]);
  }
}

function updatePoolStats() {
  const total = window.questionBank ? window.questionBank.length : 0;
  const seen = state.pool.size;
  document.getElementById('pool-stats').textContent = `Total unseen questions: ${total - seen} / ${total}`;
}

function resetPool() {
  if (confirm("Reset the tracking of questions you have seen? This will allow questions you've already answered to appear again.")) {
    state.pool.clear();
    savePool();
    updatePoolStats();
    alert("Pool reset.");
  }
}

function savePool() {
  localStorage.setItem('cdl_pool', JSON.stringify(Array.from(state.pool)));
}

// --- Fisher-Yates Shuffle ---
function shuffleArray(array) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

// --- Exam Logic ---
function startExam(mode, sectionsConfig) {
  if (!window.questionBank || window.questionBank.length === 0) {
    alert("Question bank is empty or loading.");
    return;
  }

  const generatedSections = [];

  for (const config of sectionsConfig) {
    let filtered = [];
    if (config.id === 'gen') {
      filtered = window.questionBank.filter(q => ['gen', 'pretrip', 'control', 'road', 'emergency'].includes(q.category));
    } else if (config.id === 'pass') {
      filtered = window.questionBank.filter(q => q.category === 'pass');
    } else if (config.id === 'air') {
      filtered = window.questionBank.filter(q => q.category === 'air');
    }

    if (filtered.length === 0) {
      alert(`No questions found for section ${config.id}.`);
      return;
    }

    let unseen = filtered.filter(q => !state.pool.has(q.id));
    
    if (unseen.length < config.count) {
      if (confirm(`You have only ${unseen.length} unseen questions left for ${config.id}. Reset the pool for this category?`)) {
        filtered.forEach(q => state.pool.delete(q.id));
        savePool();
        unseen = filtered;
      } else {
        const seenFiltered = shuffleArray(filtered.filter(q => state.pool.has(q.id)));
        const needed = config.count - unseen.length;
        unseen = [...unseen, ...seenFiltered.slice(0, needed)];
      }
    }

    let finalQs = shuffleArray([...unseen]).slice(0, config.count);

    if (finalQs.length === 0) {
      alert(`No valid questions found for section ${config.id}.`);
      return;
    }
    
    generatedSections.push({
      id: config.id,
      questions: finalQs,
      answers: new Array(finalQs.length).fill(null),
      currentIndex: 0
    });
  }

  // Setup Exam State
  state.exam = {
    active: true,
    mode: mode,
    sections: generatedSections,
    currentSectionIndex: 0,
    startTime: Date.now(),
    timerInterval: setInterval(updateTimer, 1000)
  };

  // Mark as seen
  generatedSections.forEach(sec => {
    sec.questions.forEach(q => state.pool.add(q.id));
  });
  savePool();

  document.getElementById('exam-title').textContent = mode === 'simulator' ? 'Full Study Simulator' : `${getCatName(mode)} Test`;
  
  if (generatedSections.length > 1) {
    document.getElementById('overall-progress-container').classList.remove('hidden');
  } else {
    document.getElementById('overall-progress-container').classList.add('hidden');
  }
  
  nav('exam');
  renderQuestion();
}

function quitExam() {
  clearInterval(state.exam.timerInterval);
  state.exam.active = false;
  nav('dashboard');
}

function updateTimer() {
  if (!state.exam.active) return;
  const diff = Math.floor((Date.now() - state.exam.startTime) / 1000);
  const m = String(Math.floor(diff / 60)).padStart(2, '0');
  const s = String(diff % 60).padStart(2, '0');
  document.getElementById('exam-timer').textContent = `${m}:${s}`;
}

function renderQuestion() {
  const section = state.exam.sections[state.exam.currentSectionIndex];
  const i = section.currentIndex;
  const originalQ = section.questions[i];
  const q = getTranslatedQuestion(originalQ);
  const ans = section.answers[i];
  
  document.getElementById('exam-subtitle').textContent = state.exam.sections.length > 1 
    ? `Section ${state.exam.currentSectionIndex + 1} of ${state.exam.sections.length}: ${getCatName(section.id)}` 
    : getCatName(section.id);
  
  document.getElementById('exam-q-num-badge').textContent = `Q${i + 1}`;
  document.getElementById('exam-q-category').textContent = q.displayCategory || getCatName(q.category);
  document.getElementById('exam-q-text').textContent = q.q;

  const optionsContainer = document.getElementById('exam-options');
  optionsContainer.innerHTML = '';

  const hasAnswered = ans !== null;

  q.options.forEach((optText, optIndex) => {
    const btn = document.createElement('button');
    btn.className = 'w-full text-left p-4 rounded-lg border-2 transition-colors font-medium flex items-start gap-3';
    
    // Style logic
    if (hasAnswered) {
      btn.disabled = true;
      if (optIndex === q.correct) {
        btn.classList.add('bg-green-50', 'border-green-500', 'text-green-900', 'dark:bg-green-900/30', 'dark:text-green-200');
      } else if (ans === optIndex && ans !== q.correct) {
        btn.classList.add('bg-red-50', 'border-red-500', 'text-red-900', 'dark:bg-red-900/30', 'dark:text-red-200');
      } else {
        btn.classList.add('bg-gray-50', 'border-gray-200', 'text-gray-400', 'dark:bg-gray-800', 'dark:border-gray-700');
      }
    } else {
      btn.classList.add('bg-white', 'border-gray-200', 'hover:border-brand-400', 'dark:bg-gray-800', 'dark:border-gray-600');
    }

    const label = ['A', 'B', 'C', 'D'][optIndex];
    btn.innerHTML = `<span class="inline-flex items-center justify-center w-6 h-6 rounded bg-gray-200 dark:bg-gray-700 text-sm flex-shrink-0">${label}</span><span>${optText}</span>`;
    
    if (!hasAnswered) {
      btn.onclick = () => selectAnswer(optIndex);
    }
    
    optionsContainer.appendChild(btn);
  });

  const expBox = document.getElementById('exam-explanation');
  if (hasAnswered) {
    expBox.classList.remove('hidden');
    document.getElementById('exam-exp-text').textContent = q.exp || "No explanation provided.";
  } else {
    expBox.classList.add('hidden');
  }

  // Buttons
  const nextBtn = document.getElementById('btn-next');
  if (i === section.questions.length - 1 && state.exam.currentSectionIndex === state.exam.sections.length - 1) {
    nextBtn.textContent = 'Finish Test';
  } else {
    nextBtn.textContent = 'Next';
  }
  
  // Force answer to proceed
  nextBtn.disabled = !hasAnswered;

  // Always hide previous button since they can only move forward
  const prevBtn = document.getElementById('btn-prev');
  prevBtn.classList.add('hidden');
  
  updateProgressUI();
}

function selectAnswer(optIndex) {
  const section = state.exam.sections[state.exam.currentSectionIndex];
  if (section.answers[section.currentIndex] !== null) return; // Prevent changing answer
  section.answers[section.currentIndex] = optIndex;
  renderQuestion();
}

function nextQuestion() {
  const section = state.exam.sections[state.exam.currentSectionIndex];
  if (section.currentIndex === section.questions.length - 1) {
    if (state.exam.currentSectionIndex === state.exam.sections.length - 1) {
      finishExam();
    } else {
      state.exam.currentSectionIndex++;
      renderQuestion();
    }
  } else {
    section.currentIndex++;
    renderQuestion();
  }
}

function prevQuestion() {
  const section = state.exam.sections[state.exam.currentSectionIndex];
  if (section.currentIndex > 0) {
    section.currentIndex--;
    renderQuestion();
  } else if (state.exam.currentSectionIndex > 0) {
    state.exam.currentSectionIndex--;
    const prevSection = state.exam.sections[state.exam.currentSectionIndex];
    prevSection.currentIndex = prevSection.questions.length - 1;
    renderQuestion();
  }
}

function updateProgressUI() {
  let overallAnswered = 0;
  let overallTotal = 0;
  
  let sectionCorrect = 0;
  let sectionAnswered = 0;
  
  const section = state.exam.sections[state.exam.currentSectionIndex];
  
  state.exam.sections.forEach((sec, idx) => {
    overallTotal += sec.questions.length;
    let secAns = sec.answers.filter(a => a !== null).length;
    overallAnswered += secAns;
    
    if (idx === state.exam.currentSectionIndex) {
      sectionAnswered = secAns;
      sec.questions.forEach((q, qIdx) => {
        if (sec.answers[qIdx] !== null && sec.answers[qIdx] === q.correct) {
          sectionCorrect++;
        }
      });
    }
  });

  const sectionTotal = section.questions.length;
  const sectionIncorrect = sectionAnswered - sectionCorrect;
  const sectionScore = sectionAnswered > 0 ? Math.round((sectionCorrect / sectionAnswered) * 100) : 0;
  
  document.getElementById('overall-progress-text').textContent = `${overallAnswered} / ${overallTotal} answered`;
  document.getElementById('overall-progress-bar').style.width = `${(overallAnswered / overallTotal) * 100}%`;
  
  document.getElementById('section-progress-title').textContent = state.exam.sections.length > 1 ? `${getCatName(section.id)} Progress` : `Test Progress`;
  document.getElementById('section-progress-text').textContent = `${sectionAnswered} / ${sectionTotal} answered`;
  document.getElementById('section-progress-bar').style.width = `${(sectionAnswered / sectionTotal) * 100}%`;
  
  document.getElementById('prog-correct').textContent = sectionCorrect;
  document.getElementById('prog-incorrect').textContent = sectionIncorrect;
  document.getElementById('prog-score').textContent = `${sectionScore}%`;
  
  const statusEl = document.getElementById('prog-status');
  if (sectionAnswered === 0) {
    statusEl.textContent = '--';
    statusEl.className = 'font-bold text-lg text-gray-500 dark:text-gray-400';
  } else if (sectionScore >= state.config.passingScore) {
    statusEl.textContent = 'Passing';
    statusEl.className = 'font-bold text-lg text-green-600 dark:text-green-400';
  } else {
    statusEl.textContent = 'Failing';
    statusEl.className = 'font-bold text-lg text-red-600 dark:text-red-400';
  }
}

function finishExam() {
  clearInterval(state.exam.timerInterval);
  state.exam.active = false;
  
  let overallCorrect = 0;
  let overallTotal = 0;
  const missed = [];
  const catBreakdown = {};
  
  let anySectionFailed = false;
  const sectionResults = [];

  state.exam.sections.forEach(sec => {
    let secCorrect = 0;
    sec.questions.forEach((q, i) => {
      overallTotal++;
      if (!catBreakdown[q.category]) catBreakdown[q.category] = { total: 0, correct: 0 };
      catBreakdown[q.category].total++;
      
      const userAns = sec.answers[i];
      if (userAns === q.correct) {
        secCorrect++;
        overallCorrect++;
        catBreakdown[q.category].correct++;
      } else {
        missed.push({
          sectionName: getCatName(sec.id),
          q: q,
          userAns: userAns
        });
      }
    });
    
    const secScore = Math.round((secCorrect / sec.questions.length) * 100);
    const secPassed = secScore >= state.config.passingScore;
    if (!secPassed) anySectionFailed = true;
    
    sectionResults.push({
      name: getCatName(sec.id),
      score: secScore,
      passed: secPassed,
      correct: secCorrect,
      total: sec.questions.length
    });
  });

  const overallScore = Math.round((overallCorrect / overallTotal) * 100);
  const passed = overallScore >= state.config.passingScore && !anySectionFailed;

  // Save history
  const record = {
    date: new Date().toISOString(),
    mode: state.exam.mode,
    score: overallCorrect,
    total: overallTotal,
    passed: passed,
    catBreakdown: catBreakdown,
    missed: missed,
    sectionResults: sectionResults,
    overallScore: overallScore,
    anySectionFailed: anySectionFailed
  };
  state.history.unshift(record);
  localStorage.setItem('cdl_history', JSON.stringify(state.history));

  renderResultsView(record);
}

function renderResultsView(record) {
  document.getElementById('res-title').textContent = record.isReview ? "Study Review" : "Test Complete";
  document.getElementById('res-score-text').textContent = record.isReview ? "Review your weak areas" : `You scored ${record.overallScore}% (${record.score}/${record.total})`;
  
  const badge = document.getElementById('res-pass-badge');
  if (record.isReview) {
    badge.style.display = 'none';
  } else {
    badge.style.display = 'inline-block';
    if (record.passed) {
      badge.textContent = 'PASS';
      badge.className = 'mt-4 text-lg font-bold px-4 py-2 inline-block rounded-lg bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
    } else {
      badge.textContent = 'FAIL';
      badge.className = 'mt-4 text-lg font-bold px-4 py-2 inline-block rounded-lg bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
    }
  }

  const breakdownContainer = document.getElementById('res-section-breakdown');
  const warningBox = document.getElementById('res-warning-box');
  
  if (record.sectionResults && record.sectionResults.length > 1 && !record.isReview) {
    breakdownContainer.classList.remove('hidden');
    breakdownContainer.innerHTML = record.sectionResults.map(r => `
      <div class="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
        <h4 class="font-bold text-gray-800 dark:text-gray-200">${r.name}</h4>
        <div class="flex justify-between items-center mt-2">
          <span class="text-sm text-gray-500 dark:text-gray-400">${r.score}% (${r.correct}/${r.total})</span>
          <span class="px-2 py-1 text-xs font-bold rounded ${r.passed ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}">${r.passed ? 'PASS' : 'FAIL'}</span>
        </div>
      </div>
    `).join('');
    
    if (record.overallScore >= state.config.passingScore && record.anySectionFailed) {
      warningBox.classList.remove('hidden');
      const failedNames = record.sectionResults.filter(r => !r.passed).map(r => `<strong>${r.name}</strong>`).join(' and ');
      warningBox.innerHTML = `You passed most sections, but you need to review ${failedNames} before taking the real test.`;
    } else {
      warningBox.classList.add('hidden');
    }
  } else {
    breakdownContainer.classList.add('hidden');
    warningBox.classList.add('hidden');
  }

  const list = document.getElementById('res-missed-list');
  if (!record.missed || record.missed.length === 0) {
    list.innerHTML = '<div class="p-6 text-center text-gray-500">Perfect score! No missed questions (or old test record).</div>';
  } else {
    list.innerHTML = record.missed.map((m, idx) => {
      const q = getTranslatedQuestion(m.q);
      return `
      <div class="p-4 sm:p-6">
        ${m.sectionName ? `<span class="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs font-semibold rounded mb-2 text-gray-600 dark:text-gray-300">${m.sectionName}</span>` : ''}
        <h4 class="font-bold text-gray-800 dark:text-gray-200 mb-2">${idx+1}. ${q.q}</h4>
        ${record.isReview ? '' : `
        <div class="text-sm mb-1 text-red-600 dark:text-red-400">
          <span class="font-semibold">${state.lang === 'es' ? 'Tu respuesta:' : 'You answered:'}</span> ${m.userAns !== null ? q.options[m.userAns] : (state.lang === 'es' ? 'Omitida' : 'Skipped')}
        </div>
        `}
        <div class="text-sm mb-3 text-green-600 dark:text-green-400">
          <span class="font-semibold">${state.lang === 'es' ? 'Respuesta correcta:' : 'Correct Answer:'}</span> ${q.options[q.correct]}
        </div>
        <div class="text-sm p-3 bg-gray-50 dark:bg-gray-700/50 rounded text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600/50">
          <strong>${state.lang === 'es' ? 'Explicación:' : 'Explanation:'}</strong> ${q.exp}
        </div>
      </div>
    `}).join('');
  }

  state.lastRecord = record;
  nav('results');
}

function viewPastAttempt(index) {
  const record = state.history[index];
  if (!record) return;
  // Backwards compatibility
  if (record.overallScore === undefined) {
    record.overallScore = Math.round((record.score / record.total) * 100);
  }
  renderResultsView(record);
}

function reviewWeakAreas() {
  if (!window.questionBank || window.questionBank.length === 0) {
    alert("Question bank is empty or loading.");
    return;
  }

  const catStats = {};
  state.history.forEach(test => {
    if (test.catBreakdown) {
      for (const [cat, data] of Object.entries(test.catBreakdown)) {
        if (!catStats[cat]) catStats[cat] = { total: 0, correct: 0 };
        catStats[cat].total += data.total;
        catStats[cat].correct += data.correct;
      }
    }
  });

  const weakCats = Object.keys(catStats).filter(cat => catStats[cat].total > 0 && (catStats[cat].correct / catStats[cat].total) < (state.config.passingScore / 100));

  if (weakCats.length === 0) {
    alert(`You have no weak areas under ${state.config.passingScore}% yet! Take some practice tests first.`);
    return;
  }

  let qsToReview = window.questionBank.filter(q => weakCats.includes(q.category));
  qsToReview = shuffleArray([...qsToReview]).slice(0, 30); // show up to 30 for study
  
  const missedFormatted = qsToReview.map(q => ({
    sectionName: getCatName(q.category),
    q: q,
    userAns: null
  }));

  const reviewRecord = {
    isReview: true,
    overallScore: '--',
    score: 0,
    total: missedFormatted.length,
    passed: false,
    sectionResults: [],
    anySectionFailed: false,
    missed: missedFormatted
  };

  renderResultsView(reviewRecord);
}


// --- History View ---
function renderHistory() {
  const tbody = document.getElementById('history-table-body');
  if (state.history.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-gray-500">No test history available.</td></tr>';
    return;
  }

  tbody.innerHTML = state.history.map((h, idx) => {
    const d = new Date(h.date).toLocaleDateString();
    const p = Math.round((h.score / h.total) * 100);
    const passClass = h.passed ? 'text-green-600 dark:text-green-400 font-bold' : 'text-red-600 dark:text-red-400 font-bold';
    return `
      <tr class="hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer transition-colors" onclick="viewPastAttempt(${idx})">
        <td class="p-4">${d}</td>
        <td class="p-4 capitalize">${getCatName(h.mode)}</td>
        <td class="p-4">${p}% (${h.score}/${h.total})</td>
        <td class="p-4 ${passClass}">${h.passed ? 'PASS' : 'FAIL'}</td>
      </tr>
    `;
  }).join('');
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);
