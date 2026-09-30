window.ILUSTRA_CONFIG = {
  paymentUrl: "",
  faqVideoUrl: ""
};

const faqVideo = document.querySelector("#faqVideo");
const guideScreen = document.querySelector("#guideScreen");

if (window.ILUSTRA_CONFIG.faqVideoUrl) {
  faqVideo.src = window.ILUSTRA_CONFIG.faqVideoUrl;
  faqVideo.hidden = false;
  guideScreen.hidden = true;
}

const planButtons = [...document.querySelectorAll(".plan-option")];
const selectedPlan = document.querySelector("#selectedPlan");

planButtons.forEach((button) => {
  button.addEventListener("click", () => {
    planButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle("selected", active);
      item.setAttribute("aria-checked", String(active));
    });
    selectedPlan.textContent = `${button.dataset.plan.replace("-", " ")} · ${button.dataset.price}`;
  });
});

document.querySelectorAll(".faq-list details").forEach((item) => {
  item.addEventListener("toggle", () => {
    if (!item.open) return;
    document.querySelectorAll(".faq-list details").forEach((other) => {
      if (other !== item) other.open = false;
    });
  });
});

const guideSlides = [
  ["¿Es adecuado para su edad?", "Sí. Trabajamos en grupos separados de 11–13 y 14–18 años."],
  ["¿Solo aprenderá tecnología?", "No. Cada reto une inteligencia emocional, criterio humano y uso responsable de IA."],
  ["¿Qué recibe la familia?", "Un cierre familiar y un proyecto final para conversar sobre lo aprendido."],
  ["¿Cómo se reserva?", "El adulto responsable reserva con $200.000 COP y completa el saldo antes de iniciar."]
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
    if (index >= guideSlides.length) {
      clearInterval(guideTimer);
      return;
    }
    showGuideSlide(index);
  }, 3500);
});

const checkoutForm = document.querySelector("#checkoutForm");
const paymentDialog = document.querySelector("#paymentDialog");
const formError = document.querySelector("#formError");

checkoutForm.addEventListener("submit", (event) => {
  event.preventDefault();
  formError.textContent = "";
  if (!checkoutForm.checkValidity()) {
    checkoutForm.reportValidity();
    formError.textContent = "Completa los campos y confirma que eres el adulto responsable.";
    return;
  }
  if (window.ILUSTRA_CONFIG.paymentUrl) {
    window.location.href = window.ILUSTRA_CONFIG.paymentUrl;
    return;
  }
  paymentDialog.showModal();
});

document.querySelector(".dialog-close").addEventListener("click", () => paymentDialog.close());
document.querySelector("#dialogGuide").addEventListener("click", () => paymentDialog.close());
paymentDialog.addEventListener("click", (event) => {
  if (event.target === paymentDialog) paymentDialog.close();
});
