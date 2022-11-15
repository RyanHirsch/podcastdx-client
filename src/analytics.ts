import fetch from "isomorphic-fetch";

const superProps = {};
let enableAnalytics = true;

type MixpanelPropertyTypes =
  | string
  | number
  | Date
  | boolean
  | undefined
  | string[]
  | number[]
  | Array<string | number>;

function manualTrack(
  event: string,
  properties: Record<string, MixpanelPropertyTypes> | Array<Record<string, MixpanelPropertyTypes>>
) {
  const normalized = Array.isArray(properties) ? properties : [properties];
  const trackData = normalized.map((props) => ({
    event,
    properties: {
      app_name: "podcastdx-client",
      token: "5d902b17d1120106ca34b0316abe979b",
      ...superProps,
      ...props,
    },
  }));

  return fetch("https://api.mixpanel.com/track?strict=1&project_id=2235444", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(trackData),
  }).catch(() => {
    fetch("https://api.mixpanel.com/track?strict=1&project_id=2235444", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(trackData),
    }).catch(() => console.error("giving up manual mixpanel track due to 2 failures"));
  });
}

export function track(
  event: string,
  props: Record<string, MixpanelPropertyTypes> = {}
): Promise<void> {
  if (!enableAnalytics) {
    return Promise.resolve();
  }
  return manualTrack(event, props);
}

export function register(newProps: Record<string, string | number | Date | undefined>): void {
  Object.assign(superProps, newProps);
}

export function init(apiKey: string, options: { enableAnalytics: boolean }): void {
  enableAnalytics = options.enableAnalytics;
  register({ distinct_id: apiKey, initializedAt: new Date() });
  track("Initialized");
}
