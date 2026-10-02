# Natural Choice Landscaping website

A static site made of plain HTML, CSS, and JavaScript. There's no build step and no dependencies. It runs on any static host (GitHub Pages, Netlify, Cloudflare Pages, or regular shared hosting).

## Pages

| File | Page |
|---|---|
| `index.html` | Home: hero, trust bar, services, how it works, before and after, reviews, Meet Jim, consultation form |
| `gallery.html` | Filterable masonry gallery with lightbox. Link straight to a filter with `gallery.html?cat=patios` |
| `services.html` | One section per service (anchor links like `services.html#retaining-walls`) |
| `about.html` | Company story, Jim, credentials, service area map |
| `reviews.html` | Review cards and links out to Google, Houzz, Facebook |
| `faq.html` | FAQ and warranty accordions, plus the "what to ask any contractor" checklist |
| `contact.html` | Form, free services list, map, phone, email |

## Before launch: fill in the placeholders

Search the HTML for `[` to find every placeholder. All of them are labeled.

1. **Photos.** Each placeholder is an `<img src="img/placeholder.svg">` followed by a `<span class="ph__label">`. To use a real photo:
   - Export it as a JPG or WebP about 1600px wide (hero images about 2400px), under 300 KB if you can.
   - Put it in `img/`, change the `src`, rewrite the `alt` so it describes that exact photo, and delete the `ph__label` span.
   - Gallery photos live in `js/gallery-data.js`. Add `src: "img/gallery/your-photo.jpg"` to an item. The label is hidden automatically once `src` is set.
2. **Reviews.** Paste real reviews word for word, with the reviewer's permission and source. Don't edit them, and don't add star ratings or review counts unless they come straight from the source.
3. **Warranty, financing, timeline, scheduling.** Confirm each with Jim before the site goes live.
4. **Company history and Jim bio** on `about.html`.
5. **Before and after projects** on `index.html`: 3 pairs, shot from the same angle.
6. **Social links.** The Facebook, Houzz, and Google review links are `href="#"` with an HTML comment above each one. Search for `data-todo` to find them. Instagram is already linked. Once you have the Facebook and Houzz URLs, also add them to the `sameAs` list in the JSON-LD block at the top of every page.
7. **Contact form.** GitHub Pages can't receive form posts, so connect a form service:
   - Create a free form at formspree.io (or a similar service) that sends to paverslaver@yahoo.com.
   - Replace `YOUR_FORM_ID` in the form `action` on `index.html` and `contact.html`.
   - Until you do that, submitting the form opens the visitor's email app with the request filled in, so no lead is lost. The success message still states the 48 to 72 hour response time.
8. **Domain and SEO.** When the domain is live, add a canonical link and an `og:image` to each page (there's a comment in each `<head>`), add the site `url` to the JSON-LD, and submit a `sitemap.xml` in Google Search Console. Make sure the Google Business Profile shows the same name, address, and phone as the site.

## Notes

- **ICPA** is used exactly as given. If the certification is actually from ICPI (Interlocking Concrete Pavement Institute), update the wording site-wide.
- **Header and footer** are repeated on each page. If you change one, change it on all 7.
- **Brand colors** are set at the top of `css/styles.css`: bluestone `#6B7780`, charcoal `#24282B`, off-white `#F6F4EF`, evergreen `#1E4636`.
- **Fonts:** Source Serif 4 (headlines) and Public Sans (body), loaded from Google Fonts.
