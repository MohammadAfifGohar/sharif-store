import assert from "node:assert/strict";
import test from "node:test";

import { parseIndiaPostResponse, toStateCode } from "../src/lib/pincode";

test("reads town, district, state and places from India Post", () => {
  const body = [
    {
      Status: "Success",
      PostOffice: [
        { Name: "Ballur", Block: "Degloor", District: "Nanded", State: "Maharashtra" },
        { Name: "Degloor", Block: "Degloor", District: "Nanded", State: "Maharashtra" },
        { Name: "Ballur", Block: "NA", District: "Nanded", State: "Maharashtra" },
      ],
    },
  ];
  assert.deepEqual(parseIndiaPostResponse("431717", body), {
    pin: "431717",
    city: "Degloor",
    district: "Nanded",
    stateCode: "MH",
    stateName: "Maharashtra",
    places: ["Ballur", "Degloor"],
  });
});

test("falls back to the district and knows older state names", () => {
  const body = [{ Status: "Success", PostOffice: [{ Name: "GPO", Block: "NA", District: "Khordha", State: "Orissa" }] }];
  const info = parseIndiaPostResponse("751001", body);
  assert.equal(info?.city, "Khordha");
  assert.equal(info?.stateCode, "OD");
  assert.equal(toStateCode("Jammu & Kashmir"), "JK");
  assert.equal(toStateCode("Pondicherry"), "PY");
});

test("unknown PIN codes give nothing", () => {
  assert.equal(parseIndiaPostResponse("999999", [{ Status: "Error", PostOffice: null }]), null);
  assert.equal(parseIndiaPostResponse("999999", null), null);
});
