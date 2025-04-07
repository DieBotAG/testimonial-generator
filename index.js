const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const multer = require('multer');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('.'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post('/generate', upload.single('photo'), async (req, res) => {
  const { quote, name, info } = req.body;
  const photoPath = path.join(__dirname, req.file.path);

  // 🧠 Bild als Base64 einbetten (funktioniert mit JPG & PNG)
  const mimeType = req.file.mimetype; // z. B. image/jpeg oder image/png
  const base64Image = fs.readFileSync(photoPath, 'base64');
  const photoDataURL = `data:${mimeType};base64,${base64Image}`;
	onsole.log("📸 Bilddaten geladen:");
console.log("🧾 MIME-Typ:", mimeType);
console.log("📂 Foto-Pfad:", photoPath);
console.log("🔠 Base64-Vorschau:", base64Image.slice(0, 100)); // Nur Anfang zeigen

  // 💡 HTML-Template laden und Variablen ersetzen
  const htmlTemplate = fs.readFileSync('template.html', 'utf8')
    .replace('„Zitat kommt hier rein.“', `„${quote}“`)
    .replace('Name<br/>Partei / Funktion', `${name}<br/>${info}`)
    .replace('src=""', `src="${photoDataURL}"`);

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  await page.setContent(htmlTemplate, { waitUntil: 'networkidle0' });
  await page.setViewport({ width: 1080, height: 1350 });

  const filename = `output/testimonial-${Date.now()}.png`;
  await page.screenshot({ path: filename });

  await browser.close();

  res.sendFile(path.resolve(__dirname, filename));
});

app.listen(3000, () => {
  console.log('✅ Server läuft auf http://localhost:3000');
});