const config = window.ILUSTRA_CONFIG?.payment || {};
const params = new URLSearchParams(window.location.search);
const transactionId = params.get("id") || "";
const registrationId = params.get("registration") || "";
const statusToken = params.get("token") || "";
const referenceBox = document.querySelector("#resultReference");
const title = document.querySelector("#resultTitle");
const kicker = document.querySelector("#resultKicker");
const message = document.querySelector("#resultMessage");
const help = document.querySelector("#resultHelp");
const summary = document.querySelector("#resultPaymentSummary");
const amount = document.querySelector("#resultAmount");
const balance = document.querySelector("#resultBalance");
const money = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

if (transactionId) {
  referenceBox.hidden = false;
  referenceBox.querySelector("strong").textContent = transactionId;
}

function showResult(result) {
  const approved = result.paymentStatus === "approved";
  const rejected = ["declined", "voided", "error"].includes(result.paymentStatus);
  if (approved) {
    document.body.dataset.paymentStatus = "approved";
    kicker.textContent = "Pago confirmado";
    title.textContent = result.registrationStatus === "paid" ? "Tu inscripción quedó pagada" : "Tu abono quedó registrado";
    message.textContent = "La operación fue validada y el listado de inscripciones ya fue actualizado.";
    help.textContent = `Wompi envió el comprobante a ${result.emailMasked || "tu correo registrado"}. Conserva la referencia de la operación.`;
  } else if (rejected) {
    document.body.dataset.paymentStatus = "rejected";
    kicker.textContent = "Pago sin completar";
    title.textContent = "La transacción no fue aprobada";
    message.textContent = "Tus datos de inscripción quedaron guardados. Puedes volver a intentarlo o solicitar ayuda por WhatsApp.";
    help.textContent = "No se registró ningún valor como pagado.";
  } else {
    document.body.dataset.paymentStatus = "pending";
    kicker.textContent = "Validación en curso";
    title.textContent = "Estamos verificando tu pago";
    message.textContent = "La operación todavía aparece pendiente. Esta página seguirá consultando durante unos segundos.";
  }
  summary.hidden = false;
  amount.textContent = money.format(result.paidAmountCop || 0);
  balance.textContent = money.format(result.balanceAmountCop || 0);
}

async function checkStatus() {
  if (!config.statusEndpoint || !registrationId || !statusToken) return false;
  const response = await fetch(config.statusEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ registrationId, statusToken, transactionId })
  });
  if (!response.ok) return false;
  const result = await response.json();
  showResult(result);
  return result.paymentStatus !== "pending";
}

(async () => {
  if (!config.statusEndpoint || !registrationId || !statusToken) {
    help.textContent = "Wompi enviará el comprobante al correo registrado. Si necesitas ayuda, conserva la referencia de la operación.";
    return;
  }
  for (let attempt = 0; attempt < 10; attempt += 1) {
    try {
      if (await checkStatus()) return;
    } catch (_) {
      // El comprobante por correo de Wompi sigue siendo la confirmación de respaldo.
    }
    await new Promise((resolve) => window.setTimeout(resolve, 2000));
  }
  help.textContent = "Wompi enviará el comprobante al correo registrado. Si necesitas ayuda, conserva la referencia de la operación.";
})();
