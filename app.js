(function () {
  const form = document.getElementById("lead-form");
  const statusEl = document.getElementById("form-status");
  const submitBtn = document.getElementById("submit-btn");
  if (!form) return;

  // Free shareable dump used when no same-host /api/leads server is available.
  // Inbox: https://webhook.site/#!/view/b044420a-e14f-4d6d-8ae1-3a5262be27e2
  const FALLBACK_WEBHOOK = "https://webhook.site/b044420a-e14f-4d6d-8ae1-3a5262be27e2";

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
      contactField.querySelector(".error-msg").textContent = "Please enter a valid email address.";
      ok = false;
    } else if ((method === "whatsapp" || method === "phone") && value && value.replace(/\D/g, "").length < 7) {
      contactField.classList.add("error");
      contactField.querySelector(".error-msg").textContent =
        "Please enter a fuller phone / WhatsApp number (include country code).";
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
      throw new Error((data && data.error) || "Submission failed (" + res.status + ")");
    }
    return data;
  }

  async function submitWebhook(payload) {
    const res = await fetch(FALLBACK_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new Error("Webhook submit failed (" + res.status + ")");
    }
    let data = {};
    try {
      data = await res.json();
    } catch (_) {}
    return {
      ok: true,
      lead_id: "WH-" + String(Date.now()).slice(-8),
      backend: "webhook_site",
      raw: data,
    };
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (!validate()) {
      setStatus("err", "Please fix the highlighted fields and try again.");
      const firstError = form.querySelector(".field.error");
      if (firstError) firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const payload = payloadFromForm();
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting…";
    setStatus("ok", "Sending your request…");

    try {
      const hasApi = await apiAvailable();
      const data = hasApi ? await submitLocalApi(payload) : await submitWebhook(payload);
      form.reset();
      form.elements.preferred_city.value = "Shanghai";
      clearErrors();
      setStatus(
        "ok",
        "Thank you. Your assessment request was received (ref " +
          (data.lead_id || "saved") +
          "). We aim to reply within 24 hours on business days via the contact method you provided."
      );
    } catch (err) {
      setStatus(
        "err",
        "We could not save your request right now. Please try again in a moment. (" +
          (err && err.message ? err.message : "network error") +
          ")"
      );
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit assessment request";
    }
  });
})();
