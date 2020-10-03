import { keys } from "ts-transformer-keys";

import { assertObjectsHaveProperties, assertObjectHasProperties } from "./utils";
import PodcastIndexClient from "../index";
import { ApiResponse } from "../types";

describe("search api", () => {
  let client: PodcastIndexClient;
  beforeAll(() => {
    client = new PodcastIndexClient({
      key: process.env.API_KEY ?? "",
      secret: process.env.API_SECRET ?? "",
    });
  });

  it("response has known keys", async () => {
    const searchResult = await client.search("javascript");

    assertObjectHasProperties<ApiResponse.Search>(keys<ApiResponse.Search>(), searchResult);
    assertObjectsHaveProperties<ApiResponse.PodcastFeed>(
      keys<ApiResponse.PodcastFeed>(),
      searchResult.feeds
    );
  });
});
