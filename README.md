# Sugar & Sound — website

A plain static site. No build step, no framework, no npm install. Every page is real HTML,
so it loads fast, ranks well, and you can edit it in any text editor.

```
index.html          Home
weddings.html       Ceremony / cocktail hour / reception
corporate.html      Marketing events, holiday parties, brand activations
schools.html        Fundraisers, auctions, formals, rallies, sports, daytime, family nights
celebrations.html   Birthdays, anniversaries, picnics, quinceañeras, mitzvahs
community.html      Farmers markets, skate parks, playgrounds, street fairs, civic events
mixes.html          Mix library + custom audio player
about.html          Story, standards, service area
book.html           Booking form (Netlify Forms) + FAQ
thanks.html         Form confirmation page
404.html            Not found

assets/css/site.css     All styling
assets/js/site.js       Nav, reveals, form helpers
assets/js/player.js     The mix player
assets/data/mixes.js    >>> YOUR MIX LIST — edit this one <<<
assets/img/             Logo, favicon, social share card
audio/                  >>> DROP YOUR MP3s HERE <<<
netlify.toml            Headers, caching, redirects
sitemap.xml, robots.txt SEO
```

---

## 1. Change these before you launch

Search and replace across all files (any editor's find-in-folder does this in one pass):

| Find | Replace with |
|---|---|
| `hello@sugarandsound.com` | your real email |
| `(415) 555-0147` and `+14155550147` | your real phone (the `tel:` one has no spaces) |
| `https://instagram.com/sugarandsound` | your real IG URL |
| `https://facebook.com/sugarandsound` | your real FB URL |
| `https://sugarandsound.com` | your real domain |

Then check these **placeholder numbers** on the home page and about page and make them true:
`15+ years`, `1,200+ events`, `9 counties`. Investors, planners and school admins do check.

Finally, the testimonials on every page are written as examples. Swap in real quotes from your
Google, Yelp, The Knot or WeddingWire reviews, with a first name and event type.

## 2. Deploy on Netlify

**Easiest (drag and drop):**
1. Go to app.netlify.com → Sites → *Add new site* → *Deploy manually*.
2. Drag this whole folder onto the drop zone.
3. Done. You get a `something-random.netlify.app` URL immediately.

**Better long term (Git):** push the folder to a GitHub repo, then in Netlify choose
*Import from Git*. Build command: leave empty. Publish directory: `.`
Now every edit you push goes live on its own.

## 3. Point the Porkbun domain at it

1. In Netlify: *Domain settings* → *Add a domain* → type your domain → Netlify shows you
   either an `A` record IP or a set of nameservers.
2. **Recommended — nameservers:** in Porkbun open your domain → *Authoritative Nameservers* →
   *Edit* → paste Netlify's four `dns1.p0x.nsone.net` style nameservers → save.
   Netlify then handles DNS and the SSL certificate for you.
3. **Or keep Porkbun DNS:** add an `A` record for `@` pointing at Netlify's load balancer IP,
   and a `CNAME` for `www` pointing at `your-site.netlify.app`.
4. Wait for propagation (usually minutes, up to 24h), then in Netlify turn on
   *Force HTTPS*. Free certificate, automatic renewal.

## 4. Turn on the booking form

The form on `book.html` already has `data-netlify="true"`, a honeypot, and a hidden
`form-name` field — that is everything Netlify needs.

After your first deploy: Netlify dashboard → **Forms** → you will see a form called `booking`.
Open *Settings → Form notifications* and add your email so every inquiry hits your inbox.
Submissions are also stored in the dashboard. Free tier covers 100 submissions/month.

## 5. Upload a mix

1. Export the mix as MP3, 128–192 kbps. Name it lowercase with dashes: `golden-hour.mp3`.
2. Put it in the `audio/` folder.
3. Open `assets/data/mixes.js` and copy an existing block:

```js
{
  id: "golden-hour",                       // used for the #link, keep it unique
  title: "Golden Hour",
  subtitle: "Cocktail hour in wine country",
  src: "audio/golden-hour.mp3",
  cover: "",                                // leave empty for the auto record label
  time: "58:12",
  tags: ["Weddings", "Cocktail Hour", "Soul"],   // these become the filter buttons
  notes: "One line of personality.",
  download: false                           // true adds a download link
}
```

4. Redeploy (drag the folder again, or `git push`). The player, the filter chips and the deep
   links (`mixes.html#mix-golden-hour`) all update themselves.

**Size note:** Netlify serves large files fine but each one counts toward bandwidth. Keep mixes
under ~90 MB. If you start posting a lot of long sets, move the audio to Bunny.net or Cloudflare
R2 and paste the full URL into `src` — the player does not care where the file lives.

## 6. Social

The share card at `assets/img/og-image.png` is what appears when someone posts a link on
Facebook, Instagram DMs, iMessage or LinkedIn. It is already wired into every page.
If you change the domain, also update the `og:image` path in each file's `<head>`.

## 7. Nice next steps

- Add a real photo gallery — the event pages have room for one between the cards and the FAQ.
- Add Google Analytics or Netlify Analytics to see which event page drives bookings.
- Claim a Google Business Profile for each metro you serve; the JSON-LD in every page's
  `<head>` already lists your service areas for search engines.
- Ask three past clients for reviews this week. Real quotes outperform every design choice here.
