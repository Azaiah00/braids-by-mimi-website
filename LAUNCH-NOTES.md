# Launch notes: Braids By Mimi

Everything below needs Mimi's confirmation or action before or at launch. Facts verified November 4, 2026 from her Google Business Profile, Instagram (@braid_by_mimi) and Facebook (Braids by micheline).

## Pitch points (why she needs this site)
- **Her booking link is dead.** The "Booking link" in her Instagram bio (braidbymimi.booksy.com/ig) now shows "Business Unavailable" on Booksy and sends visitors to a list of *other* Hyattsville braiders (Djam's Hair Braiding, Vavalocs, Emi's beauty empire, and more). Every tap from her bio is a lead handed to a competitor.
- **No website.** Google's website field points to instagram.com. Her menu and prices only live inside flyer images, which Google cannot read.
- **Clients are confused about booking.** On her Aug 18 2026 post a client asked "Do I have to download the app to book?" She answered twice: "no ma, text me." The site makes that answer the whole booking flow: pick a style, see the price, one tap opens a pre-written text to her.
- **Address is inconsistent across her profiles.** Instagram and Google say 6492 Landover Rd, Suite B, Room 6, Cheverly MD 20785. Facebook says "Dodge Park Road, Landover / Hyattsville, MD 20784" and an older flyer says "Dodge park road landover, Hyattsville MD". Those mismatches hurt local ranking.
- **Only 2 Google reviews** (both 5 stars). The site links straight to her Google profile to collect more.

## Facts to confirm with Mimi
1. **Address.** The site uses the Google and Instagram address (6492 Landover Rd, Suite B, Room 6, Landover Professional Building, Cheverly, MD 20785). Confirm, then update her Facebook "About" to match.
2. **Hours.** Site and schema use Google's hours: Mon to Sat 7 AM to 7 PM, Sun 7 AM to 6 PM. Other sources differ: an Aug 2026 caption says walk-ins "from 5am to 7pm", a summer flyer says "Mon-Sun 7AM-6PM", Facebook says "Always open". Get her real hours.
3. **Phone.** (469) 441-9208 is a Dallas-area code but appears on Google, Instagram, Facebook and every flyer. A July 2026 caption also lists (301) 674-5832. The site uses only 469-441-9208. Confirm it takes texts (the whole booking flow is built on texting).
4. **Prices** come from her "Back to School Exclusive Offers (hair included)" flyer posted Aug 18 2026. That flyer is the newest full menu, but it was a seasonal promo. Confirm every price is current. Notes:
   - The flyer image is cut off at the bottom: the last visible line is "Knotless jumbo ... $140 and up". There may be more lines. Ask for the full list.
   - "Stitch cornrows ($15) each" and "Zigzag cornrows ($20) each" are shown as "$15 each" / "$20 each". Ask what "each" means (per braid? add-on?).
   - Senegalese, spring and coco twists and crochet appear on her flyers without a current price, so the site says "Text for price". Get prices.
   - "Soft locs (hair excluded) $180 and up" is shown as hair not included.
   - Kids' styles "$100 and up" are listed; there are no photos of children on the site on purpose.
   - Durations are not shown anywhere because she has never published them.
5. **Deposit.** "$25 Deposit" (Instagram bio and Facebook). The site does not say whether it is applied to the total or refundable. Ask, and get her cancellation / late / no-show policy to add a Policies section.
6. **Name.** The site calls her "Mimi" and links the Facebook page "Braids by micheline". Confirm she is happy being called Micheline anywhere (only used as the Facebook link text and schema alternate name).
7. **French.** Facebook lists English and French, so the site says "English & French spoken · On parle français". Confirm.
8. **Her words used on the site** (from her logo, flyers and Facebook bio): "Neatness, Perfection", "Neat parts + luxury finishes", "Beauty in every braid", "Braids that speak confidence", "Healthy hair, happy you", "neat braids, fast service, affordable prices, neat + luxury finishing, VIP customer care always", "Walk-ins welcome". Emoji removed.
9. **Review.** The home page quotes her one written Google review exactly ("Excellent service, jovial, patient and extreme fast in braiding. Everyone loved my braids."), attributed to "Google review" without the reviewer's name. No rating markup is in schema (Google ignores self-hosted ratings). Ask for permission to add more reviews with first names.

## Photos
- 29 gallery photos are cover frames from her public Instagram posts/reels, chosen because they have no text overlay, no TikTok watermark, and no children's faces. **She must approve every photo** and confirm each client is fine being shown.
- Most are 640 px wide (Instagram reel covers). Ask her for the original photos from her phone for sharper images.
- No photo of Mimi herself is used (none without text overlays). The "Meet Mimi" section uses the line-art studio scene. Ask for a portrait to add.
- **Logo:** her circular logo (gold and pink "Braid_by_mimi", crown, comb, bow) was taken from her Instagram profile picture at 1080 px. Ask for the original file.

## Line art (Couture House original)
- Same "gold line" style as the Twelve:21 site, redrawn in Mimi's palette (gold foil + magenta pink on plum-black) with her logo's motifs: crown, pink bow, comb, double ring, heart. Generated with Kie.ai (Nano Banana Pro), graded so the background is exactly the page ink. Stylised, not portraits of Mimi or any client.
- Hero and studio loops: pending Frederick's approval of the stills. The site already references `assets/video/line-hero-desktop|line-hero-phone|line-studio|line-studio-sq.{webm,mp4}`; until those files exist, the posters show (no broken UI).

## Booking
- "Text Mimi this request" opens the phone's Messages app with the style, size, price, day, time, notes and name filled in (sms: link, works on iPhone and Android).
- "Send request online" posts to Netlify Forms (`booking-request`). After deploy: Site settings, Forms, turn on email notifications to Mimi's email (ask for it). Spam honeypot included.
- `/book` short link (netlify.toml) goes to the booking builder: use it on flyers and in her Instagram bio in place of the dead Booksy link.

## Domain
- Live preview (canonical everywhere): https://braids-by-mimi-website.netlify.app/
- Suggested custom domains: braidsbymimi.com or braidsbymimimd.com (availability not checked). When bought, replace the preview URL in canonical/og tags (tools/build.py BASE), sitemap.xml, robots.txt and llms.txt.

## Google Business Profile actions
- Change Website from instagram.com to the new site; add the booking URL (/book).
- Fix the Facebook address to match Google.
- Upload her best photos; ask happy clients for reviews (link is on the home page).
- Replace the Booksy link in her Instagram bio with the site's /book link.
