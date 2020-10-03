import { keys } from "ts-transformer-keys";

import PodcastIndexClient from "../index";
import { ApiResponse } from "../types";
import { assertObjectsHaveProperties, assertObjectHasProperties } from "./utils";

describe("categories api", () => {
  let client: PodcastIndexClient;
  beforeAll(() => {
    client = new PodcastIndexClient({
      key: process.env.API_KEY ?? "",
      secret: process.env.API_SECRET ?? "",
    });
  });

  it("response has known keys", async () => {
    const categoriesList = await client.categories();
    assertObjectHasProperties(keys<ApiResponse.Categories>(), categoriesList);
    assertObjectsHaveProperties(keys<ApiResponse.Category>(), categoriesList.feeds);
  });
});
