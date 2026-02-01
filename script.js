const video = document.getElementById("video");

const addressEl = document.getElementById("address");
const phoneEl = document.getElementById("phone");
const amountEl = document.getElementById("amount");

const callBtn = document.getElementById("callBtn");
const navBtn = document.getElementById("navBtn");

callBtn.disabled = true;
navBtn.disabled = true;

let lastData = null;

async function startScanner() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment" }
  });
  video.srcObject = stream;

  const detector = new BarcodeDetector({ formats: ["qr_code"] });

  async function scan() {
    const codes = await detector.detect(video);
    if (codes.length > 0) {
      handleQR(codes[0].rawValue);
      stream.getTracks().forEach(t => t.stop());
      return;
    }
    requestAnimationFrame(scan);
  }

  scan();
}

function handleQR(text) {
  // пример QR:
  // ADR=Berlin Musterstr 5;TEL=+491234567;AMOUNT=25.50

  const address = getValue(text, "ADR");
  const phone = getValue(text, "TEL");
  const amount = getValue(text, "AMOUNT");

  addressEl.textContent = address || "—";
  phoneEl.textContent = phone || "—";
  amountEl.textContent = amount || "—";

  lastData = { address, phone, amount };
  localStorage.setItem("qrData", JSON.stringify(lastData));

  callBtn.disabled = !phone;
  navBtn.disabled = !address;
}

function getValue(text, key) {
  const m = text.match(new RegExp(key + "=([^;]+)"));
  return m ? m[1] : "";
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

// загрузка сохранённых данных
const saved = localStorage.getItem("qrData");
if (saved) {
  lastData = JSON.parse(saved);
  addressEl.textContent = lastData.address || "—";
  phoneEl.textContent = lastData.phone || "—";
  amountEl.textContent = lastData.amount || "—";
  callBtn.disabled = !lastData.phone;
  navBtn.disabled = !lastData.address;
}

startScanner();