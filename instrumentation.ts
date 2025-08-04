export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError = async (
  error: {
    digest: string;
  },
  request: {
    method: string;
    url: string;
    headers: { [key: string]: string };
  },
  context: {
    routerKind: string;
    routePath: string;
    routeType: string;
    renderSource: string;
  }
) => {
  const importStart = Date.now();
  const { captureException } = await import("@sentry/nextjs");

  const sentryPayload = {
    tags: {
      digest: error.digest,
    },
    extra: {
      request: {
        method: request.method,
        url: request.url,
      },
      nextjs: {
        routerKind: context.routerKind,
        routePath: context.routePath,
        routeType: context.routeType,
        renderSource: context.renderSource,
      },
    },
  };

  captureException(error, sentryPayload);
};
