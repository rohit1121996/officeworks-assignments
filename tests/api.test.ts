import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../server/app.js";
import { Catalogue, topRatedIds } from "../server/catalogue.js";
import type { Enquiry, Product } from "../shared/types.js";

const sent: Array<{ enquiry: Enquiry; product: Product }> = [];
let failMail = false;
const app = createApp({
  mailer: {
    async send(enquiry, product) {
      if (failMail) throw new Error("SMTP unavailable");
      sent.push({ enquiry, product });
    },
  },
});

test.after(async () => {
  await app.close();
});

test("home has five distinct editorial picks and every category has more products", async () => {
  const response = await app.inject("/api/home");
  assert.equal(response.statusCode, 200);
  const home = response.json();
  assert.deepEqual(
    home.topRated.map((item: Product) => item.id),
    topRatedIds,
  );
  assert.equal(new Set(topRatedIds).size, 5);
  for (const category of home.categories) {
    const result = await app.inject(`/api/categories/${category.slug}`);
    assert.equal(result.statusCode, 200);
    const body = result.json();
    assert.ok(body.topRated.length > 0);
    assert.ok(body.additional.length > 0);
    const ids = [...body.topRated, ...body.additional].map(
      (item: Product) => item.id,
    );
    assert.equal(ids.length, new Set(ids).size);
    assert.ok(
      [...body.topRated, ...body.additional].every(
        (item: Product) => item.categorySlug === category.slug,
      ),
    );
  }
});

test("search is trimmed, case-insensitive, and only returns matching products", async () => {
  const result = await app.inject("/api/products?q=%20LAMP%20");
  assert.equal(result.statusCode, 200);
  assert.deepEqual(
    result.json().products.map((item: Product) => item.id),
    ["t2"],
  );
  const blank = await app.inject("/api/products?q=%20%20");
  assert.deepEqual(blank.json().products, []);
  const tooLong = await app.inject(`/api/products?q=${"a".repeat(121)}`);
  assert.equal(tooLong.statusCode, 400);
});

test("product and category routes return 404 for unknown IDs", async () => {
  assert.equal((await app.inject("/api/products/missing")).statusCode, 404);
  assert.equal((await app.inject("/api/categories/missing")).statusCode, 404);
  assert.equal(new Catalogue().product("t1")?.title, "Arc Wireless Headphones");
});

test("enquiry rejects invalid input and unknown products", async () => {
  const invalid = await app.inject({
    method: "POST",
    url: "/api/enquiries",
    payload: { productId: "t1", name: "X", email: "bad" },
  });
  assert.equal(invalid.statusCode, 400);
  const unknown = await app.inject({
    method: "POST",
    url: "/api/enquiries",
    payload: {
      productId: "missing",
      name: "Jane Doe",
      email: "jane@example.com",
    },
  });
  assert.equal(unknown.statusCode, 404);
  assert.equal(sent.length, 0);
});

test("enquiry succeeds only after mail acceptance and resolves product server-side", async () => {
  const payload = {
    productId: "h1",
    name: "Jane Doe",
    email: "jane@example.com",
    message: "Please contact me.",
  };
  const success = await app.inject({
    method: "POST",
    url: "/api/enquiries",
    payload,
  });
  assert.equal(success.statusCode, 201);
  assert.equal(sent.length, 1);
  assert.equal(sent[0].product.title, "Solstice Ceramic Vase");
  failMail = true;
  const failure = await app.inject({
    method: "POST",
    url: "/api/enquiries",
    payload,
  });
  assert.equal(failure.statusCode, 503);
  assert.equal(sent.length, 1);
});
