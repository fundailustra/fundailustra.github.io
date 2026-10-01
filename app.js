window.ILUSTRA_CONFIG = { paymentUrl: "", faqVideoUrl: "" };

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
const balanceText = document.querySelector("#balanceText");
const checkoutButton = document.querySelector("#checkoutButton");

function formatMoney(value) { return `$${money.format(value)}`; }
function paymentAmount() { return state.paymentMode === "full" ? state.total : Number(depositInput.value || 0); }

function updateCheckout() {
  const amount = paymentAmount();
  selectedPlan.textContent = `${state.plan} · ${formatMoney(state.total)} COP`;
  fullAmount.textContent = formatMoney(state.total);
  depositInput.max = String(state.total - 10000);
  depositField.hidden = state.paymentMode !== "deposit";
  balanceText.textContent = `Saldo pendiente: ${formatMoney(Math.max(state.total - amount, 0))} COP`;
  checkoutButton.textContent = state.paymentMode === "full" ? `Continuar al pago · ${formatMoney(state.total)}` : `Continuar con abono · ${formatMoney(amount)}`;
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
  });
});

paymentRadios.forEach((radio) => {
  radio.addEventListener("change", () => {
    state.paymentMode = radio.value;
    document.querySelectorAll(".choice-card").forEach((card) => card.classList.toggle("selected", card.contains(radio)));
    updateCheckout();
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
const formError = document.querySelector("#formError");

checkoutForm.addEventListener("submit", (event) => {
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
  if (window.ILUSTRA_CONFIG.paymentUrl) {
    window.location.href = window.ILUSTRA_CONFIG.paymentUrl;
    return;
  }
  const amount = paymentAmount();
  dialogSummary.textContent = `${state.plan}: pago de ${formatMoney(amount)} COP${state.paymentMode === "deposit" ? ` y saldo de ${formatMoney(state.total - amount)} COP` : ""}.`;
  paymentDialog.showModal();
});

document.querySelector(".dialog-close").addEventListener("click", () => paymentDialog.close());
document.querySelector("#dialogGuide").addEventListener("click", () => paymentDialog.close());
paymentDialog.addEventListener("click", (event) => { if (event.target === paymentDialog) paymentDialog.close(); });
updateCheckout();
