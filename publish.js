const puppeteer = require('puppeteer')
const ghpages = require('gh-pages')
const path = require('path')
const { exec } = require('child_process')

const config = require('./config')
const outputPath = path.resolve(__dirname, config.output)

function ghPagesPromise() {
  return new Promise((resolve, reject) => {
    ghpages.publish(outputPath, { dotfiles: true }, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    })
  })
}

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })
  const page = await browser.newPage()
  await page.goto(`http://${config.url}`)
  await page.waitFor(2000)

  // 网页快照
  await page.pdf({
    path: `${config.output}/resume.pdf`,
    printBackground: true,
    displayHeaderFooter: false,
    format: 'A4',
  })

  // 关闭浏览器
  await browser.close()

  // 静态资源发布
  await ghPagesPromise()

  exec(`rm -rf ${outputPath}`)
})()
