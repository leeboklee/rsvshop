import puppeteer from 'puppeteer'

const url = process.argv[2] || 'http://localhost:4900/admin'

const delay = (ms) => new Promise((res) => setTimeout(res, ms))

;(async () => {
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()

  const consoleMessages = []
  const requestFailures = []
  const badResponses = []

  page.on('console', (msg) => {
    consoleMessages.push({ type: msg.type(), text: msg.text() })
  })

  page.on('requestfailed', (req) => {
    requestFailures.push({ url: req.url(), error: req.failure()?.errorText })
  })

  page.on('response', async (res) => {
    const status = res.status()
    if (status >= 400) {
      badResponses.push({ url: res.url(), status })
    }
  })

  const res = await page.goto(url, { waitUntil: 'load', timeout: 60000 })
  const status = res?.status()

  await delay(3000)

  await browser.close()

  const summary = {
    url,
    status,
    console: consoleMessages,
    requestFailures,
    badResponses,
  }

  console.log(JSON.stringify(summary, null, 2))
})().catch((err) => {
  console.error('browser-check-error', err)
  process.exit(1)
})
