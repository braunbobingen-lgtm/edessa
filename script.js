const addressEl = document.getElementById("address");
const phoneEl = document.getElementById("phone");
const amountEl = document.getElementById("amount");

const callBtn = document.getElementById("callBtn");
const navBtn = document.getElementById("navBtn");

callBtn.disabled = true;
navBtn.disabled = true;

let lastData = null;

function parseQR(text) {
  // пример:
  // ADR=Berlin Musterstr 5;TEL=+491234567;AMOUNT=25.50

  const get = (key) => {
    const m = text.match(new RegExp(key + "=([^;]+)"));
    return m ? m[1] : "";
  };

  const address = get("ADR");
  const phone = get("TEL");
  const amount = get("AMOUNT");

  addressEl.textContent = address || "—";
  phoneEl.textContent = phone || "—";
  amountEl.textContent = amount || "—";

  lastData = { address, phone, amount };
  localStorage.setItem("qrData", JSON.stringify(lastData));

  callBtn.disabled = !phone;
  navBtn.disabled = !address;
}

// кнопки
callBtn.onclick = () => {
  if (lastData?.phone) {
    location.href = "tel:" + lastData.phone;
  }
};

navBtn.onclick = () => {
  if (lastData?.address) {
    location.href =
      "https://www.google.com/maps/search/?api=1&query=" +
      encodeURIComponent(lastData.address);
  }
};

// восстановление данных
const saved = localStorage.getItem("qrData");
if (saved) {
  lastData = JSON.parse(saved);
  addressEl.textContent = lastData.address || "—";
  phoneEl.textContent = lastData.phone || "—";
  amountEl.textContent = lastData.amount || "—";
  callBtn.disabled = !lastData.phone;
  navBtn.disabled = !lastData.address;
}

// 🔥 НАСТОЯЩИЙ QR-Сканер
const qr = new Html5Qrcode("reader");

qr.start(
  { facingMode: "environment" },
  { fps: 10, qrbox: 250 },
  (text) => {
    qr.stop();
    parseQR(text);
  }
);
