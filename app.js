// Fill these values only when the public channels are ready. Social values are full https:// URLs.
const CONFIG = { whatsapp: '', email: 'chinamedicalconcierge@gmail.com', tiktok: '', instagram: '', xiaohongshu: '' };

const PAGE_LANG = document.documentElement.lang === 'zh-Hant' ? 'zh-Hant' : 'en';
const I18N = {
  en: {
    soon: "Coming soon — please use the assessment form and we'll reply within 24h",
    emailInvalid: 'Please enter a valid email address.',
    phoneInvalid: 'Please enter a fuller phone / WhatsApp number (include country code).',
    contactRequired: 'Please enter the contact value we should use to reply.',
    fixFields: 'Please fix the highlighted fields and try again.',
    submitting: 'Submitting…', sending: 'Sending your request…', submit: 'Submit assessment request',
    submissionFailed: 'Submission failed', webhookFailed: 'Webhook submit failed', saved: 'saved', networkError: 'network error',
    success: 'Thank you. Your assessment request was received (ref {ref}). We aim to reply within 24 hours on business days via the contact method you provided.',
    requestFailed: 'We could not save your request right now. Please try again in a moment.'
  },
  'zh-Hant': {
    soon: '即將開通——請先填寫評估表單，我們將在 24 小時內回復',
    emailInvalid: '請填寫有效的郵箱地址。',
    phoneInvalid: '請填寫完整的電話或 WhatsApp 號碼（含國際區號）。',
    contactRequired: '請填寫我們可以用來回復您的聯繫信息。',
    fixFields: '請按提示修改標出的填寫項，然後重新提交。',
    submitting: '正在提交…', sending: '正在發送您的申請…', submit: '提交評估申請',
    submissionFailed: '申請提交失敗', webhookFailed: '數據接收失敗', saved: '已保存', networkError: '網絡連接錯誤',
    success: '感謝您！我們已收到您的評估申請（參考編號：{ref}）。工作日內，我們力爭在 24 小時內通過您提供的聯繫方式回復。',
    requestFailed: '暫時無法保存您的申請，請稍後再試。'
  }
};
function t(key) { return I18N[PAGE_LANG][key]; }

(function setupChannels() {
  const toast = document.getElementById('channel-toast');
  toast.querySelector('span').textContent = t('soon');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let toastTimer;
  function showComingSoon(event) {
    event.preventDefault();
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.hidden = true; }, 8000);
    document.getElementById('assess').scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
  }
  document.querySelectorAll('[data-channel]').forEach(link => {
    const channel = link.dataset.channel;
    const value = String(CONFIG[channel] || '').trim();
    let href = '';
    if (value && channel === 'whatsapp') {
      const digits = value.replace(/\D/g, '');
      if (digits) href = 'https://wa.me/' + digits;
    } else if (value && channel === 'email') {
      href = 'mailto:' + value.replace(/^mailto:/i, '');
    } else if (value) {
      try { const url = new URL(value); if (url.protocol === 'https:') href = url.href; } catch (_) {}
    }
    if (href) {
      link.href = href;
      link.setAttribute('aria-label', link.textContent.trim());
      if (channel !== 'email') { link.target = '_blank'; link.rel = 'noopener noreferrer'; }
    } else {
      link.addEventListener('click', showComingSoon);
    }
  });
  toast.querySelector('button').addEventListener('click', () => { toast.hidden = true; });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') toast.hidden = true; });
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('revealed'); observer.unobserve(entry.target); }
    }), { threshold: 0.07 });
    document.querySelectorAll('.section .card, .cities, .faq details, .assessment-layout').forEach(el => {
      el.classList.add('reveal'); observer.observe(el);
    });
  }
})();

(function () {
  const form = document.getElementById("lead-form");
  const statusEl = document.getElementById("form-status");
  const submitBtn = document.getElementById("submit-btn");
  if (!form) return;

  // Free shareable dump used when no same-host /api/leads server is available.
  // Inbox: https://webhook.site/#!/view/b044420a-e14f-4d6d-8ae1-3a5262be27e2
  const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSeRpvLr1iXjGIqNAO_4a0YglrQ27HE92sJ8XX-yawwBXP_Siw/formResponse";
  const FORM_ENTRIES = {full_name:"entry.172972456",country:"entry.530629257",contact_method:"entry.1467589717",contact_value:"entry.986588075",condition:"entry.1209816164",preferred_city:"entry.830305598",timeline:"entry.1223589012",budget_range:"entry.1969512921",notes:"entry.2147406081",consent:"entry.1268131464",source:"entry.1476123850",page_url:"entry.1994301008",submitted_at:"entry.1240095215"};

  const requiredFields = [
    "full_name",
    "country",
    "contact_method",
    "contact_value",
    "condition",
    "preferred_city",
    "timeline",
    "consent",
  ];

  function clearErrors() {
    form.querySelectorAll(".field.error").forEach((el) => el.classList.remove("error"));
    form.querySelector('[data-field="contact_value"] .error-msg').textContent = t('contactRequired');
  }

  function setStatus(type, message) {
    statusEl.className = "status show " + type;
    statusEl.textContent = message;
  }

  function validate() {
    clearErrors();
    let ok = true;
    requiredFields.forEach((name) => {
      const field = form.querySelector('[data-field="' + name + '"]');
      const input = form.elements[name];
      if (!field || !input) return;
      let valid = true;
      if (input.type === "checkbox") {
        valid = input.checked;
      } else {
        valid = String(input.value || "").trim().length > 0;
      }
      if (!valid) {
        field.classList.add("error");
        ok = false;
      }
    });

    const method = String(form.elements.contact_method.value || "");
    const value = String(form.elements.contact_value.value || "").trim();
    const contactField = form.querySelector('[data-field="contact_value"]');
    if (method === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      contactField.classList.add("error");
      contactField.querySelector(".error-msg").textContent = t('emailInvalid');
      ok = false;
    } else if ((method === "whatsapp" || method === "phone") && value && value.replace(/\D/g, "").length < 7) {
      contactField.classList.add("error");
      contactField.querySelector(".error-msg").textContent =
        t('phoneInvalid');
      ok = false;
    }
    return ok;
  }

  function payloadFromForm() {
    return {
      full_name: form.elements.full_name.value.trim(),
      country: form.elements.country.value.trim(),
      contact_method: form.elements.contact_method.value,
      contact_value: form.elements.contact_value.value.trim(),
      condition: form.elements.condition.value.trim(),
      preferred_city: form.elements.preferred_city.value,
      timeline: form.elements.timeline.value.trim(),
      budget_range: form.elements.budget_range.value || "",
      notes: form.elements.notes.value.trim(),
      consent: form.elements.consent.checked ? "yes" : "no",
      source: "landing_page",
      page_url: window.location.href,
      submitted_at: new Date().toISOString(),
    };
  }

  async function apiAvailable() {
    try {
      const res = await fetch("/api/health", { method: "GET", cache: "no-store" });
      if (!res.ok) return false;
      const data = await res.json();
      return !!(data && data.ok);
    } catch (_) {
      return false;
    }
  }

  async function submitLocalApi(payload) {
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(function () {
      return {};
    });
    if (!res.ok || !data.ok) {
      throw new Error((PAGE_LANG === 'en' && data && data.error) || t('submissionFailed') + ' (' + res.status + ')' );
    }
    return data;
  }

  async function submitWebhook(payload) {
    const body = new URLSearchParams();
    Object.keys(FORM_ENTRIES).forEach(function (k) { body.append(FORM_ENTRIES[k], payload[k] == null ? "" : String(payload[k])); });
    // Google Forms does not send CORS headers; no-cors posts still record the row (response is opaque).
    await fetch(FORM_URL, { method: "POST", mode: "no-cors", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: body.toString() });
    return { ok: true, lead_id: "CMC-" + String(Date.now()).slice(-8), backend: "google_form" };
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (!validate()) {
      setStatus("err", t('fixFields'));
      const firstError = form.querySelector(".field.error");
      if (firstError) firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const payload = payloadFromForm();
    submitBtn.disabled = true;
    submitBtn.textContent = t('submitting');
    setStatus("ok", t('sending'));

    try {
      const hasApi = await apiAvailable();
      const data = hasApi ? await submitLocalApi(payload) : await submitWebhook(payload);
      form.reset();
      form.elements.preferred_city.value = "Shanghai";
      clearErrors();
      setStatus(
        "ok",
        t('success').replace('{ref}', data.lead_id || t('saved'))
      );
    } catch (err) {
      setStatus(
        "err",
        t('requestFailed') + (PAGE_LANG === 'en' ? ' (' + (err && err.message ? err.message : t('networkError')) + ')' : '')
      );
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = t('submit');
    }
  });
})();


(function setupFacilitiesCarousel() {
  const root = document.querySelector(".facilities-carousel");
  if (!root) return;

  const viewport = root.querySelector(".carousel-viewport");
  const track = root.querySelector(".carousel-track");
  const originalSlides = Array.from(track.querySelectorAll(".carousel-slide"));
  const prevBtn = root.querySelector(".carousel-btn.prev");
  const nextBtn = root.querySelector(".carousel-btn.next");
  const dotsWrap = root.querySelector(".carousel-dots");
  const statusEl = root.querySelector(".carousel-status");
  const count = originalSlides.length;
  if (!count || !viewport || !track) return;

  const PAGE_LANG = document.documentElement.lang === "zh-Hant" ? "zh-Hant" : "en";
  const copy = PAGE_LANG === "zh-Hant"
    ? { status: "第 {n} 張，共 {total} 張。{caption}", goto: "顯示第 {n} 張照片" }
    : { status: "Photograph {n} of {total}. {caption}", goto: "Show photograph {n} of " + count };

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const INTERVAL = 5000;
  let index = 0;
  let position = 1; // position on the track including clones
  let timer = null;
  let isAnimating = false;
  let paused = false;

  const firstClone = originalSlides[0].cloneNode(true);
  const lastClone = originalSlides[count - 1].cloneNode(true);
  firstClone.setAttribute("aria-hidden", "true");
  lastClone.setAttribute("aria-hidden", "true");
  firstClone.removeAttribute("data-slide");
  lastClone.removeAttribute("data-slide");
  track.insertBefore(lastClone, originalSlides[0]);
  track.appendChild(firstClone);

  const dots = originalSlides.map(function (slide, i) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.setAttribute("aria-label", copy.goto.replace("{n}", String(i + 1)));
    btn.addEventListener("click", function () { goTo(i); });
    dotsWrap.appendChild(btn);
    return btn;
  });

  function captionFor(i) {
    const cap = originalSlides[i].querySelector("figcaption");
    return cap ? cap.textContent.trim() : "";
  }

  function setTransition(on) {
    track.style.transition = on && !reduceMotion.matches ? "transform .6s ease" : "none";
  }

  function translate(pos, animate) {
    setTransition(animate);
    track.style.transform = "translateX(" + (-pos * 100) + "%)";
  }

  function updateChrome() {
    originalSlides.forEach(function (slide, i) {
      const active = i === index;
      slide.setAttribute("aria-hidden", active ? "false" : "true");
    });
    dots.forEach(function (dot, i) {
      if (i === index) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });
    if (statusEl) {
      statusEl.textContent = copy.status
        .replace("{n}", String(index + 1))
        .replace("{total}", String(count))
        .replace("{caption}", captionFor(index));
    }
  }

  function goTo(nextIndex, direction) {
    if (isAnimating) return;
    const wrapped = ((nextIndex % count) + count) % count;
    if (wrapped === index && direction == null) return;

    if (reduceMotion.matches) {
      index = wrapped;
      position = index + 1;
      translate(position, false);
      updateChrome();
      return;
    }

    let nextPos;
    if (direction === "next" && index === count - 1 && wrapped === 0) {
      nextPos = count + 1; // first clone at the end
    } else if (direction === "prev" && index === 0 && wrapped === count - 1) {
      nextPos = 0; // last clone at the start
    } else {
      nextPos = wrapped + 1;
    }

    isAnimating = true;
    index = wrapped;
    position = nextPos;
    translate(position, true);
    updateChrome();
  }

  track.addEventListener("transitionend", function (event) {
    if (event.target !== track || event.propertyName !== "transform") return;
    if (position === 0) {
      position = count;
      translate(position, false);
    } else if (position === count + 1) {
      position = 1;
      translate(position, false);
    }
    isAnimating = false;
  });

  function next() { goTo(index + 1, "next"); }
  function prev() { goTo(index - 1, "prev"); }

  function stop() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function play() {
    stop();
    if (reduceMotion.matches || paused) return;
    timer = setInterval(next, INTERVAL);
  }

  function setPaused(value) {
    paused = value;
    if (paused) stop();
    else play();
  }

  prevBtn.addEventListener("click", function () { prev(); play(); });
  nextBtn.addEventListener("click", function () { next(); play(); });

  root.addEventListener("mouseenter", function () { setPaused(true); });
  root.addEventListener("mouseleave", function () { setPaused(false); });
  root.addEventListener("focusin", function () { setPaused(true); });
  root.addEventListener("focusout", function (event) {
    if (!root.contains(event.relatedTarget)) setPaused(false);
  });

  root.addEventListener("keydown", function (event) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      prev();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      next();
    }
  });

  let pointerId = null;
  let startX = 0;
  let startY = 0;
  let lastX = 0;
  let dragging = false;
  const THRESHOLD = 40;

  viewport.addEventListener("pointerdown", function (event) {
    if (event.button != null && event.button !== 0) return;
    pointerId = event.pointerId;
    startX = lastX = event.clientX;
    startY = event.clientY;
    dragging = false;
    try { viewport.setPointerCapture(pointerId); } catch (_) {}
    stop();
  });

  viewport.addEventListener("pointermove", function (event) {
    if (pointerId == null || event.pointerId !== pointerId) return;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    lastX = event.clientX;
    if (!dragging) {
      if (Math.abs(dx) < 8) return;
      if (Math.abs(dx) < Math.abs(dy)) {
        pointerId = null;
        play();
        return;
      }
      dragging = true;
      setTransition(false);
    }
    const offset = (dx / viewport.clientWidth) * 100;
    track.style.transform = "translateX(" + (-position * 100 + offset) + "%)";
  });

  function endPointer(event) {
    if (pointerId == null || (event && event.pointerId !== pointerId)) return;
    const dx = lastX - startX;
    pointerId = null;
    dragging = false;
    setTransition(!reduceMotion.matches);
    if (dx <= -THRESHOLD) next();
    else if (dx >= THRESHOLD) prev();
    else translate(position, !reduceMotion.matches);
    play();
  }

  viewport.addEventListener("pointerup", endPointer);
  viewport.addEventListener("pointercancel", endPointer);

  reduceMotion.addEventListener("change", function () {
    translate(position, false);
    play();
  });

  translate(position, false);
  updateChrome();
  play();
})();
