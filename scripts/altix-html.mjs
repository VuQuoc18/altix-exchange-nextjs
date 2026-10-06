function decodeHtml(str) {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

export function rewriteHref(href) {
  if (!href) return href;
  if (
    href.startsWith("mailto:") ||
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("#")
  ) {
    return href;
  }
  let next = href.replace(/^\.\//, "/");
  if (!next.startsWith("/")) next = `/${next}`;
  next = next.replace(/\.html$/, "");
  next = next.replace(/\/index$/, "");
  return next;
}

function stripTags(html) {
  return decodeHtml(
    html
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function extractMain(html) {
  const m = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  return m ? m[1] : html;
}

function first(html, re) {
  const m = html.match(re);
  return m ? m[1] : "";
}

function ptBlock(style, text) {
  if (!text) return null;
  return {
    _type: "block",
    style,
    children: [{ _type: "span", text }],
  };
}

export function parseInnerPage(html, slug) {
  const headTitle = stripTags(first(html, /<title>([\s\S]*?)<\/title>/i));
  const metaDesc = first(html, /<meta\s+name="description"\s+content="([^"]*)"/i);
  const main = extractMain(html).replace(/<form\b[\s\S]*?<\/form>/gi, "");

  const eyebrow = stripTags(first(main, /<span class="eyebrow[^"]*">([\s\S]*?)<\/span>/));
  const title = stripTags(first(main, /<h1\b[^>]*>([\s\S]*?)<\/h1>/));
  const lead = stripTags(first(main, /<p class="hero-lead">([\s\S]*?)<\/p>/));

  const sections = [];
  const cardRe = /<article class="card">([\s\S]*?)<\/article>/g;
  let card;
  while ((card = cardRe.exec(main))) {
    const block = card[1];
    const cardTitle = stripTags(first(block, /<h3\b[^>]*>([\s\S]*?)<\/h3>/));
    const cardBody = stripTags(first(block, /<p\b[^>]*>([\s\S]*?)<\/p>/));
    if (cardTitle) sections.push({ title: cardTitle, body: cardBody });
  }

  const content = [];
  const withoutHero = main.replace(/<section class="hero"[\s\S]*?<\/section>/i, "");
  const withoutCards = withoutHero.replace(/<div class="card-grid">[\s\S]*?<\/div>/i, "");
  const chunks = [...withoutCards.matchAll(/<(h2|h3|p)\b[^>]*>([\s\S]*?)<\/\1>/gi)];
  for (const m of chunks) {
    const tag = m[1].toLowerCase();
    const text = stripTags(m[2]);
    if (!text) continue;
    if (text === lead || text === title) continue;
    const style = tag === "h2" ? "h2" : tag === "h3" ? "h3" : "normal";
    const block = ptBlock(style, text);
    if (block) content.push(block);
  }

  const data = {
    title: title || slug,
    eyebrow: eyebrow || undefined,
    lead: lead || undefined,
    content: content.length ? content : undefined,
    sections: sections.length ? sections : undefined,
  };

  const legal = ["privacy", "terms", "cookies", "disclosures", "security", "complaints"];
  if (legal.includes(slug)) {
    const hay = stripTags(main);
    const noticeMatch = hay.match(/([^.]*?(Production note|Pre-launch legal task)[^.]*\.)/i);
    data.notice = noticeMatch
      ? noticeMatch[1].trim()
      : "This page is a temporary scaffold. For questions or policy details, please contact info@altix.exchange.";
    data.contact = "info@altix.exchange";
  }

  if (headTitle) data.seoTitle = headTitle;
  if (metaDesc) data.seoDescription = metaDesc;
  return data;
}

export function htmlFileForSlug(slug) {
  if (slug === "about-leadership") return "about/leadership/elke-biechele.html";
  return `${slug}.html`;
}
