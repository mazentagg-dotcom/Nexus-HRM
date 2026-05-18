const { chromium } = require('playwright');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3050';
const SCENES_DIR = path.join(__dirname, 'scenes');
const FFMPEG = 'ffmpeg';

const SCENE_SCRIPT = JSON.parse(fs.readFileSync(path.join(__dirname, 'scripts', 'scenes.json'), 'utf8'));
const AUDIO_MANIFEST = JSON.parse(fs.readFileSync(path.join(__dirname, 'audio', 'manifest.json'), 'utf8'));

const CREDS = { email: 'admin@nexus-hrm.com', password: 'Admin@123' };

const ONLY_SCENES = process.argv.includes('--scenes')
  ? process.argv[process.argv.indexOf('--scenes') + 1].split(',').map(Number)
  : null;

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function login(page) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 15000 });
  await sleep(1000);
  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="mail"], input[placeholder*="Email"]').first();
  const passInput = page.locator('input[type="password"]').first();
  await emailInput.fill(CREDS.email);
  await passInput.fill(CREDS.password);
  await sleep(300);
  const submitBtn = page.locator('button[type="submit"]').first();
  await submitBtn.click();
  await sleep(4000);
  if (page.url().includes('/login')) {
    console.log('  Login may have failed, retrying with click on form...');
    await emailInput.fill(CREDS.email);
    await passInput.fill(CREDS.password);
    await submitBtn.click();
    await sleep(4000);
  }
  console.log(`  Current URL after login: ${page.url()}`);
}

async function navigateTo(page, pageKey) {
  const urlMap = {
    'login': '/login', 'dashboard': '/', 'employees': '/employees',
    'onboarding': '/onboarding', 'attendance': '/attendance', 'requests': '/requests',
    'documents': '/documents', 'payslip': '/payslip', 'payslip-payroll': '/payslip', 'payslip-deductions': '/payslip',
    'system-config': '/system-configuration',
    'config-branches': '/system-configuration',
    'config-attendance': '/system-configuration',
    'config-attendance-import': '/system-configuration',
    'config-attendance-policy': '/system-configuration',
    'config-attendance-deductions': '/system-configuration',
    'config-payroll': '/system-configuration',
    'config-company': '/system-configuration',
    'config-medical': '/system-configuration',
    'config-loans': '/system-configuration',
    'config-permissions': '/system-configuration',
  };

  await page.goto(`${BASE_URL}${urlMap[pageKey] || '/'}`, { waitUntil: 'networkidle', timeout: 15000 });
  await sleep(1000);

  // Ensure the page content has actually loaded (React SPA may need extra time on same-URL navigations)
  try {
    await page.waitForSelector('nav.flex, [class*="sidebar"], h1, h2', { timeout: 3000 });
  } catch (_) {}

  const clickMap = {
    'payslip-payroll': 'nav.flex button:has-text("Payroll")',
    'payslip-deductions': 'nav.flex button:has-text("Deductions")',
    'config-branches': 'button:has-text("Branches")',
    'config-attendance': 'button:has-text("Attendance")',
    'config-attendance-import': 'button:has-text("Attendance")',
    'config-attendance-policy': 'button:has-text("Attendance")',
    'config-attendance-deductions': 'button:has-text("Attendance")',
    'config-payroll': 'button:has-text("Payroll Rules")',
    'config-company': 'button:has-text("Company Deductions")',
    'config-medical': 'button:has-text("Medical Insurance")',
    'config-loans': 'button:has-text("Loans")',
    'config-permissions': 'button:has-text("Permissions")',
  };

  if (clickMap[pageKey]) {
    try {
      const loc = page.locator(clickMap[pageKey]).first();
      await loc.waitFor({ state: 'visible', timeout: 5000 });
      await loc.click();
      await sleep(800);
    } catch (e) { console.log(`  Click ${pageKey} failed, continuing...`); }
  }

  const subTabMap = {
    'config-attendance-import': 'text=Import Format',
    'config-attendance-policy': 'text=Policy Rules',
    'config-attendance-deductions': 'text=Deductions',
  };

  if (subTabMap[pageKey]) {
    try {
      await page.locator(subTabMap[pageKey]).first().click({ timeout: 3000 });
      await sleep(800);
    } catch (e) { console.log(`  Subtab click failed, continuing...`); }
  }
}

function getAudioDuration(i) {
  const audioPath = path.join(__dirname, 'audio', `scene_${String(i).padStart(3, '0')}.mp3`);
  if (!fs.existsSync(audioPath)) return 5;
  const out = execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${audioPath}"`).toString().trim();
  return parseFloat(out) || 5;
}

async function main() {
  fs.mkdirSync(SCENES_DIR, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();
  console.log('Logging in...');
  await login(page);
  console.log('Logged in.');

  for (let i = 0; i < SCENE_SCRIPT.length; i++) {
    if (ONLY_SCENES && !ONLY_SCENES.includes(i)) {
      console.log(`Scene ${i}: skipped (not in --scenes list)`);
      continue;
    }

    const scene = SCENE_SCRIPT[i];
    const audioDuration = getAudioDuration(i);
    const padDuration = scene.duration_pad || 2;
    const totalDuration = audioDuration + padDuration;

    console.log(`\nScene ${i}: ${scene.title} (${totalDuration.toFixed(1)}s audio+pad) -> ${scene.page}`);

    await navigateTo(page, scene.page);

    const tmpDir = `/tmp/hrm_scene_${i}`;
    if (fs.existsSync(tmpDir)) execSync(`rm -rf "${tmpDir}"`);
    fs.mkdirSync(tmpDir, { recursive: true });

    const screenshot = await page.screenshot({ type: 'png' });
    const ssPath = path.join(tmpDir, 'frame.png');
    fs.writeFileSync(ssPath, screenshot);

    const audioPath = path.join(__dirname, 'audio', `scene_${String(i).padStart(3, '0')}.mp3`);
    const videoPath = path.join(SCENES_DIR, `scene_${String(i).padStart(3, '0')}.mp4`);

    try {
      if (fs.existsSync(audioPath)) {
        execSync(
          `${FFMPEG} -y -loop 1 -i "${ssPath}" -i "${audioPath}" ` +
          `-c:v libx264 -tune stillimage -c:a aac -b:a 192k -pix_fmt yuv420p ` +
          `-t ${totalDuration} -shortest -movflags +faststart "${videoPath}"`,
          { timeout: 60000, stdio: ['pipe', 'pipe', 'pipe'] }
        );
      } else {
        execSync(
          `${FFMPEG} -y -loop 1 -i "${ssPath}" ` +
          `-c:v libx264 -tune stillimage -pix_fmt yuv420p -t ${totalDuration} "${videoPath}"`,
          { timeout: 60000, stdio: ['pipe', 'pipe', 'pipe'] }
        );
      }
      const size = fs.statSync(videoPath).size / 1024 / 1024;
      console.log(`  -> ${size.toFixed(1)} MB`);
    } catch (e) {
      console.log(`  ffmpeg error: ${e.stderr?.toString().slice(0, 200) || e.message}`);
    }

    execSync(`rm -rf "${tmpDir}"`);
  }

  await browser.close();
  console.log('\nAll scenes recorded.');
}

main().catch(err => { console.error(err); process.exit(1); });
