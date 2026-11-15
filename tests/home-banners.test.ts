import assert from "node:assert/strict";
import test from "node:test";

import {
  getBannerHref,
  getPhoneImageFromContent,
  postsToSlides,
} from "../src/lib/home-banners";

const UPLOADS = "https://api.thesharifstore.in/wp-content/uploads/2026/11";

test("a banner post becomes a slide with its title, image and link", () => {
  const [slide] = postsToSlides([
    {
      title: { rendered: "Bags under &#8377;500" },
      excerpt: { rendered: "<p>/category/bags-and-fashion</p>\n" },
      content: {
        rendered: `<figure><img decoding="async" width="1080" height="1350" src="${UPLOADS}/bags-phone.jpg" alt="" /></figure>`,
      },
      _embedded: {
        "wp:featuredmedia": [
          {
            source_url: `${UPLOADS}/bags-pc.jpg`,
            media_details: { width: 1800, height: 900 },
          },
        ],
      },
    },
  ]);

  assert.deepEqual(slide, {
    alt: "Bags under ₹500",
    desktopImage: { src: `${UPLOADS}/bags-pc.jpg`, width: 1800, height: 900 },
    mobileImage: { src: `${UPLOADS}/bags-phone.jpg`, width: 1080, height: 1350 },
    href: "/category/bags-and-fashion",
  });
});

test("the phone banner is optional", () => {
  const [slide] = postsToSlides([
    {
      title: { rendered: "Jewellery" },
      content: { rendered: "<p>No image here</p>" },
      _embedded: {
        "wp:featuredmedia": [
          {
            source_url: `${UPLOADS}/jewellery.jpg`,
            media_details: { width: 1800, height: 900 },
          },
        ],
      },
    },
  ]);

  assert.equal(slide.mobileImage, undefined);
  assert.equal(slide.href, "/");
});

test("posts without a usable featured image are skipped", () => {
  assert.deepEqual(
    postsToSlides([
      { title: { rendered: "No image" } },
      {
        title: { rendered: "Other site" },
        _embedded: {
          "wp:featuredmedia": [
            {
              source_url: "https://example.com/wp-content/uploads/a.jpg",
              media_details: { width: 1800, height: 900 },
            },
          ],
        },
      },
    ]),
    [],
  );
});

test("phone images from other sites or without a size are ignored", () => {
  assert.equal(
    getPhoneImageFromContent('<img src="https://example.com/a.jpg" width="10" height="10">'),
    null,
  );
  assert.equal(getPhoneImageFromContent(`<img src="${UPLOADS}/a.jpg">`), null);
});

test("banner links stay on this store", () => {
  assert.equal(getBannerHref("<p>/best-deals</p>"), "/best-deals");
  assert.equal(
    getBannerHref("<p>https://thesharifstore.in/category/jwellery?sort=newest</p>"),
    "/category/jwellery?sort=newest",
  );
  assert.equal(getBannerHref("<p>https://example.com/scam</p>"), "/");
  assert.equal(getBannerHref("<p>//example.com</p>"), "/");
  assert.equal(getBannerHref(""), "/");
});
