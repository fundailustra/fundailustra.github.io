const suppliedConfig = window.ILUSTRA_CONFIG || {};
window.ILUSTRA_CONFIG = {
  faqVideoUrl: suppliedConfig.faqVideoUrl || "",
  payment: {
    provider: "wompi",
    environment: "sandbox",
    enabled: false,
    publicKey: "",
    signatureEndpoint: "",
    redirectUrl: `${window.location.origin}${window.location.pathname.replace(/[^/]*$/, "")}pago.html`,
    ...(suppliedConfig.payment || {})
  }
};

const money = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 });
const faqVideo = document.querySelector("#faqVideo");
const guideScreen = document.querySelector("#guideScreen");

if (window.ILUSTRA_CONFIG.faqVideoUrl) {
  faqVideo.src = window.ILUSTRA_CONFIG.faqVideoUrl;
  faqVideo.hidden = false;
  guideScreen.hidden = true;
}

const state = { plan: "2 semanas", total: 860000, paymentMode: "full" };
const passButtons = [...document.querySelectorAll(".pass-option")];
const paymentRadios = [...document.querySelectorAll('input[name="paymentMode"]')];
const selectedPlan = document.querySelector("#selectedPlan");
const fullAmount = document.querySelector("#fullAmount");
const depositField = document.querySelector("#depositField");
const depositInput = document.querySelector('input[name="depositAmount"]');
const weekField = document.querySelector("#weekField");
const weekInputs = [...document.querySelectorAll('input[name="weekChoice"]')];
const balanceText = document.querySelector("#balanceText");
const checkoutButton = document.querySelector("#checkoutButton");
const mascotGuide = document.querySelector(".payment-mascot-guide");
const mascotGuideTitle = document.querySelector("#mascotGuideTitle");
const mascotGuideText = document.querySelector("#mascotGuideText");

function formatMoney(value) { return `$${money.format(value)}`; }
function paymentAmount() { return state.paymentMode === "full" ? state.total : Number(depositInput.value || 0); }

function updateCheckout() {
  const amount = paymentAmount();
  selectedPlan.textContent = `${state.plan} · ${formatMoney(state.total)} COP`;
  fullAmount.textContent = formatMoney(state.total);
  depositInput.max = String(state.total - 10000);
  depositField.hidden = state.paymentMode !== "deposit";
  weekField.hidden = state.plan !== "1 semana";
  weekInputs.forEach((input) => {
    input.disabled = state.plan !== "1 semana";
    input.required = state.plan === "1 semana";
  });
  balanceText.textContent = `Saldo pendiente: ${formatMoney(Math.max(state.total - amount, 0))} COP`;
  checkoutButton.textContent = state.paymentMode === "full" ? `Continuar al pago · ${formatMoney(state.total)}` : `Continuar con abono · ${formatMoney(amount)}`;
}

function updateMascotGuide(animate = true) {
  if (state.paymentMode === "deposit") {
    mascotGuideTitle.textContent = "Asegura el cupo con tu abono";
    mascotGuideText.textContent = `Escribe cuánto deseas abonar desde $200.000. La página calculará el saldo de ${state.plan}.`;
  } else if (state.plan === "2 semanas") {
    mascotGuideTitle.textContent = "Vive la experiencia completa";
    mascotGuideText.textContent = "Las dos semanas están seleccionadas. El pago completo deja la inscripción sin saldo pendiente.";
  } else {
    mascotGuideTitle.textContent = "Tu semana está seleccionada";
    mascotGuideText.textContent = "Puedes pagar los $560.000 completos o elegir un abono para asegurar el cupo.";
  }

  if (!animate) return;
  mascotGuide.classList.remove("is-updated");
  requestAnimationFrame(() => mascotGuide.classList.add("is-updated"));
}

passButtons.forEach((button) => {
  button.addEventListener("click", () => {
    passButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle("selected", active);
      item.setAttribute("aria-checked", String(active));
    });
    state.plan = button.dataset.plan;
    state.total = Number(button.dataset.price);
    updateCheckout();
    updateMascotGuide();
  });
});

paymentRadios.forEach((radio) => {
  radio.addEventListener("change", () => {
    state.paymentMode = radio.value;
    document.querySelectorAll(".choice-card").forEach((card) => card.classList.toggle("selected", card.contains(radio)));
    updateCheckout();
    updateMascotGuide();
  });
});
depositInput.addEventListener("input", updateCheckout);

document.querySelectorAll(".faq-list details").forEach((item) => {
  item.addEventListener("toggle", () => {
    if (!item.open) return;
    document.querySelectorAll(".faq-list details").forEach((other) => { if (other !== item) other.open = false; });
  });
});

const guideSlides = [
  ["¿Necesita saber de tecnología?", "No. Se aprende haciendo, desde cero y en equipo."],
  ["¿Las semanas son iguales?", "No. Cada semana tiene una programación distinta; se puede vivir una o las dos."],
  ["¿El reto de hielo es obligatorio?", "No. Es voluntario, adaptado por edad y requiere autorización y formulario de salud."],
  ["¿Cómo se paga?", "El valor completo aparece primero. También se puede asegurar el cupo con un abono desde $200.000."]
];
const guidePlay = document.querySelector("#guidePlay");
const guideTitle = document.querySelector("#guideTitle");
const guideText = document.querySelector("#guideText");
const guideStep = document.querySelector("#guideStep");
const guideProgress = document.querySelector("#guideProgress");
const guideDots = [...document.querySelectorAll(".guide-dots span")];
let guideTimer;

function showGuideSlide(index) {
  const [title, text] = guideSlides[index];
  guideTitle.textContent = title;
  guideText.textContent = text;
  guideStep.textContent = `GUÍA PARA FAMILIAS · 0${index + 1}/04`;
  guideProgress.style.width = `${(index + 1) * 25}%`;
  guideDots.forEach((dot, dotIndex) => dot.classList.toggle("active", dotIndex === index));
}

guidePlay.addEventListener("click", () => {
  if (window.ILUSTRA_CONFIG.faqVideoUrl) {
    faqVideo.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }
  clearInterval(guideTimer);
  let index = 0;
  showGuideSlide(index);
  guidePlay.textContent = "Reproducir de nuevo";
  guideTimer = setInterval(() => {
    index += 1;
    if (index >= guideSlides.length) return clearInterval(guideTimer);
    showGuideSlide(index);
  }, 3500);
});

const checkoutForm = document.querySelector("#checkoutForm");
const paymentDialog = document.querySelector("#paymentDialog");
const dialogSummary = document.querySelector("#dialogSummary");
const dialogPlan = document.querySelector("#dialogPlan");
const dialogAmount = document.querySelector("#dialogAmount");
const dialogBalance = document.querySelector("#dialogBalance");
const dialogAdult = document.querySelector("#dialogAdult");
const wompiPreviewMain = document.querySelector("#wompiPreviewMain");
const wompiPreviewSuccess = document.querySelector("#wompiPreviewSuccess");
const simulatePayment = document.querySelector("#simulatePayment");
const testReference = document.querySelector("#testReference");
const formError = document.querySelector("#formError");
let wompiScriptPromise;

function selectedWeekLabel() {
  const selectedWeek = weekInputs.find((input) => input.checked);
  if (!selectedWeek) return "Semana por seleccionar";
  const label = selectedWeek.closest("label");
  return `${label.querySelector("b").textContent} · ${label.querySelector("small").textContent}`;
}

function paymentPayload() {
  const form = new FormData(checkoutForm);
  return {
    plan: state.plan,
    week: state.plan === "1 semana" ? form.get("weekChoice") : "ambas-semanas",
    total: state.total,
    paymentMode: state.paymentMode,
    amount: paymentAmount(),
    customer: {
      name: String(form.get("adultName") || "").trim(),
      email: String(form.get("email") || "").trim(),
      phone: String(form.get("phone") || "").trim(),
      ageGroup: String(form.get("ageGroup") || "")
    }
  };
}

function loadWompiScript() {
  if (window.WidgetCheckout) return Promise.resolve();
  if (wompiScriptPromise) return wompiScriptPromise;
  wompiScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.wompi.co/widget.js";
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error("No fue posible cargar el checkout de Wompi."));
    document.head.appendChild(script);
  });
  return wompiScriptPromise;
}

async function openWompiSandbox(payload) {
  const config = window.ILUSTRA_CONFIG.payment;
  const response = await fetch(config.signatureEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error("No fue posible preparar la referencia de pago.");
  const order = await response.json();
  if (!order.reference || !order.integrity) throw new Error("La respuesta de pago está incompleta.");
  await loadWompiScript();
  const phoneDigits = payload.customer.phone.replace(/\D/g, "").replace(/^57/, "");
  const checkout = new window.WidgetCheckout({
    currency: "COP",
    amountInCents: payload.amount * 100,
    reference: order.reference,
    publicKey: config.publicKey,
    signature: { integrity: order.integrity },
    redirectUrl: config.redirectUrl,
    customerData: {
      email: payload.customer.email,
      fullName: payload.customer.name,
      phoneNumber: phoneDigits,
      phoneNumberPrefix: "+57"
    }
  });
  checkout.open(() => {});
}

function openPaymentPreview(payload) {
  wompiPreviewMain.hidden = false;
  wompiPreviewSuccess.hidden = true;
  const planLabel = state.plan === "1 semana" ? `${state.plan} · ${selectedWeekLabel()}` : "Experiencia completa · ambas semanas";
  dialogPlan.textContent = planLabel;
  dialogAmount.textContent = `${formatMoney(payload.amount)} COP`;
  dialogBalance.textContent = state.paymentMode === "deposit" ? `Abono · saldo pendiente ${formatMoney(state.total - payload.amount)} COP` : "Pago total · sin saldo pendiente";
  dialogAdult.textContent = `Responsable: ${payload.customer.name}`;
  paymentDialog.showModal();
}

checkoutForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  formError.textContent = "";
  if (state.paymentMode === "deposit") {
    const deposit = Number(depositInput.value);
    if (deposit < 200000 || deposit >= state.total) {
      formError.textContent = `El abono debe estar entre $200.000 y ${formatMoney(state.total - 10000)}.`;
      depositInput.focus();
      return;
    }
  }
  if (!checkoutForm.checkValidity()) {
    checkoutForm.reportValidity();
    formError.textContent = "Completa los campos y confirma que eres el adulto responsable.";
    return;
  }
  const payload = paymentPayload();
  const paymentConfig = window.ILUSTRA_CONFIG.payment;
  if (!paymentConfig.enabled || !paymentConfig.publicKey || !paymentConfig.signatureEndpoint) {
    openPaymentPreview(payload);
    return;
  }
  checkoutButton.disabled = true;
  checkoutButton.setAttribute("aria-busy", "true");
  const originalText = checkoutButton.textContent;
  checkoutButton.textContent = "Abriendo Wompi…";
  try {
    await openWompiSandbox(payload);
  } catch (error) {
    formError.textContent = `${error.message} Intenta nuevamente o comunícate por WhatsApp.`;
  } finally {
    checkoutButton.disabled = false;
    checkoutButton.removeAttribute("aria-busy");
    checkoutButton.textContent = originalText;
  }
});

document.querySelector(".dialog-close").addEventListener("click", () => paymentDialog.close());
document.querySelector("#previewBack").addEventListener("click", () => paymentDialog.close());
simulatePayment.addEventListener("click", () => {
  const payload = paymentPayload();
  const previewMethod = document.querySelector('input[name="previewPaymentMethod"]:checked').value;
  wompiPreviewMain.hidden = true;
  wompiPreviewSuccess.hidden = false;
  testReference.textContent = `2MINDS-TEST-${Date.now().toString().slice(-6)}`;
  dialogSummary.textContent = `${state.plan}: pago simulado por ${previewMethod} de ${formatMoney(payload.amount)} COP${state.paymentMode === "deposit" ? ` y saldo de ${formatMoney(state.total - payload.amount)} COP` : ""}.`;
});
document.querySelector("#restartPreview").addEventListener("click", () => {
  wompiPreviewSuccess.hidden = true;
  wompiPreviewMain.hidden = false;
});
paymentDialog.addEventListener("click", (event) => { if (event.target === paymentDialog) paymentDialog.close(); });
updateCheckout();
updateMascotGuide(false);
