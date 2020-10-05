import Mixpanel from "mixpanel";

const mixpanel = Mixpanel.init("5d902b17d1120106ca34b0316abe979b");

const superProps = {};
let enableAnalytics = true;

export function track(
  event: string,
  props?: Record<string, string | number | Date>
): Promise<void> {
  if (!enableAnalytics) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) =>
    mixpanel.track(event, { ...superProps, ...props }, (err) => (err ? reject(err) : resolve()))
  );
}

export function register(newProps: Record<string, string | number | Date | undefined>): void {
  Object.assign(superProps, newProps);
}

export function init(apiKey: string, options: { enableAnalytics: boolean }): void {
  enableAnalytics = options.enableAnalytics;
  register({ distinct_id: apiKey, initializedAt: new Date() });
  track("Initialized");
}
