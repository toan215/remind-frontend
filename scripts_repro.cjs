const { chromium } = require('playwright-core');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = 'http://localhost:5173';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const logs = [];
  page.on('console', m => logs.push(`[${m.type()}] ${m.text()}`));
  page.on('pageerror', e => logs.push(`[pageerror] ${e.message}`));

  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await sleep(1500);
  await page.locator('.user-pill.guest-pill').first().click({ timeout: 5000 });
  await sleep(400);
  await page.locator('text=Đăng nhập tài khoản').first().click({ timeout: 5000 });
  await sleep(700);
  await page.locator('button:has-text("Đăng nhập ngay")').first().click({ timeout: 5000 });
  await sleep(1400);
  await page.fill('#login-identifier', 'student1@test.com');
  await page.fill('#login-password', 'test123');
  await page.click('#login-submit-btn');
  await sleep(2200);

  await page.evaluate(() => { window.location.hash = '#/expert'; });
  await sleep(2500);

  // open booking for first expert
  const bookBtn = page.locator('[id^="book-expert-"]').first();
  console.log('BOOK EXPERT BTN count:', await bookBtn.count());
  await bookBtn.click({ timeout: 6000 });
  await sleep(2500);

  // select a date (set the date input) and a slot
  const dateInput = page.locator('#booking-date-input');
  const dateVal = await dateInput.inputValue().catch(()=>'');
  console.log('DATE INPUT VALUE:', JSON.stringify(dateVal));
  // try to set a future date
  const future = new Date(Date.now() + 2*86400000).toISOString().slice(0,10);
  await dateInput.fill(future).catch(e=>console.log('date fill fail', e.message));
  await sleep(1500);
  const slotBtns = page.locator('.book-slot-btn');
  console.log('SLOT BTNS:', await slotBtns.count());
  await slotBtns.first().click({ timeout: 6000 }).catch(e=>console.log('slot click fail', e.message));
  await sleep(800);

  await page.locator('#book-modal-confirm').click({ timeout: 6000 }).catch(e=>console.log('confirm fail', e.message));
  await sleep(2500);
  console.log('URL after confirm:', page.url());

  // Payment screen: click pay
  const payBtn = page.locator('button:has-text("Thanh toán"), button:has-text("Xác nhận")').first();
  console.log('PAY BTN count:', await payBtn.count());
  await payBtn.click({ timeout: 6000 }).catch(e=>console.log('pay fail', e.message));
  await sleep(3500);
  console.log('URL after pay:', page.url());

  const chatBtn = page.locator('button:has-text("Nhắn tin")').first();
  console.log('CHAT BTN count:', await chatBtn.count());
  await chatBtn.click({ timeout: 6000 }).catch(e=>console.log('chat click fail', e.message));
  await sleep(4000);

  const msgRows = await page.locator('.chatbox-msg-row').count().catch(()=>0);
  console.log('=== MESSAGE ROWS RENDERED:', msgRows, '===');
  const chatHtml = await page.locator('.chatbox-container').first().innerHTML().catch(()=>'(none)');
  console.log('CHAT DOM:', chatHtml.slice(0, 1800));
  console.log('--- CONSOLE (last 25) ---');
  console.log(logs.slice(-25).join('\n'));
  await browser.close();
})().catch(e => { console.error('ERR', e); process.exit(1); });
