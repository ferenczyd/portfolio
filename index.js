const express = require('express')
const path = require('path')

const PORT = process.env.PORT || 5001
const SITE_NAME = 'Dominic Ferenczy Portfolio'
const SITE_DESCRIPTION = 'Portfolio of Dominic Ferenczy, Manager - Artificial Intelligence & Automation, focused on AI, analytics, digital supply chain, and business intelligence leadership.'

const app = express()

app
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => {
    const baseUrl = `${req.protocol}://${req.get('host')}`
    const pageUrl = `${baseUrl}/`
    const imageUrl = `${baseUrl}/dom.png`
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Dominic Ferenczy',
      jobTitle: 'Manager - Artificial Intelligence & Automation',
      description: SITE_DESCRIPTION,
      url: pageUrl,
      email: 'mailto:dominic.ferenczy@outlook.com',
      sameAs: ['https://www.linkedin.com/in/dominic-ferenczy'],
      image: imageUrl
    }

    res.render('pages/index', {
      seo: {
        title: SITE_NAME,
        description: SITE_DESCRIPTION,
        url: pageUrl,
        image: imageUrl
      },
      structuredData: JSON.stringify(structuredData)
    })
  })
  .get('/robots.txt', (req, res) => {
    const baseUrl = `${req.protocol}://${req.get('host')}`
    res.type('text/plain').send(`User-agent: *\nAllow: /\nSitemap: ${baseUrl}/sitemap.xml\n`)
  })
  .get('/sitemap.xml', (req, res) => {
    const baseUrl = `${req.protocol}://${req.get('host')}`
    const today = new Date().toISOString().split('T')[0]
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`

    res.type('application/xml').send(xml)
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
