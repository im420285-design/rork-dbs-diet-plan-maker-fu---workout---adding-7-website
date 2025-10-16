import { createTRPCReact } from "@trpc/react-query";
import { createTRPCClient, httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import { Platform } from "react-native";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  if (envUrl && envUrl.length > 0) {
    console.log("Using EXPO_PUBLIC_RORK_API_BASE_URL:", envUrl);
    return envUrl;
  }

  if (Platform.OS === "web") {
    console.log("Running on web - using relative base URL");
    return "";
  }

  console.log("Non-web environment - defaulting to http://localhost:8788 (ensure reachable on device)");
  return "http://localhost:8788";
};

export const trpcReactClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      async fetch(url, options) {
        console.log("tRPC React Request URL:", url);
        console.log("tRPC React Request method:", options?.method);
        console.log("tRPC React Request headers:", options?.headers);

        try {
          const controller = new AbortSignalController();
          const timeoutId = setTimeout(() => {
            console.log("Request timeout after 120s - aborting...");
            controller.abort();
          }, 120000);

          console.log("Sending fetch request...");
          const response = await fetch(url, {
            ...options,
            signal: controller.signal,
          });

          clearTimeout(timeoutId);
          console.log("tRPC React Response received - status:", response.status);
          console.log("tRPC React Response headers:", Object.fromEntries(response.headers.entries()));

          if (!response.ok) {
            const clonedResponse = response.clone();
            const text = await clonedResponse.text();
            console.error("tRPC Error Response body:", text);
          }

          return response as Response;
        } catch (error) {
          console.error("tRPC React Fetch Error:", error);
          if (error instanceof TypeError && (error as Error).message === "Failed to fetch") {
            throw new Error(
              "فشل الاتصال بالخادم. جرِّب تعطيل إضافات المتصفح التي تعترض الشبكة (مثل أدوات الـ AdBlock)، أو افتح التطبيق في نافذة خاصة، أو حدِّث الصفحة. إذا كنت تعمل محلياً فتأكّد من تشغيل الخادم وملاءمة العنوان."
            );
          }
          throw error;
        }
      },
    }),
  ],
});

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      async fetch(url, options) {
        console.log("tRPC Vanilla Request URL:", url);
        console.log("tRPC Vanilla Request method:", options?.method);
        console.log("tRPC Vanilla Request headers:", options?.headers);

        try {
          const controller = new AbortSignalController();
          const timeoutId = setTimeout(() => {
            console.log("Request timeout after 120s - aborting...");
            controller.abort();
          }, 120000);

          console.log("Sending fetch request...");
          const response = await fetch(url, {
            ...options,
            signal: controller.signal,
          });

          clearTimeout(timeoutId);
          console.log("tRPC Vanilla Response received - status:", response.status);
          console.log("tRPC Vanilla Response headers:", Object.fromEntries(response.headers.entries()));

          if (!response.ok) {
            const clonedResponse = response.clone();
            const text = await clonedResponse.text();
            console.error("tRPC Error Response body:", text);
          }

          return response as Response;
        } catch (error) {
          console.error("tRPC Vanilla Fetch Error:", error);
          if (error instanceof TypeError && (error as Error).message === "Failed to fetch") {
            throw new Error(
              "فشل الاتصال بالخادم. جرِّب تعطيل إضافات المتصفح التي تعترض الشبكة (مثل أدوات الـ AdBlock)، أو افتح التطبيق في نافذة خاصة، أو حدِّث الصفحة. إذا كنت تعمل محلياً فتأكّد من تشغيل الخادم وملاءمة العنوان."
            );
          }
          throw error;
        }
      },
    }),
  ],
});

class AbortSignalController {
  public controller: AbortController;
  constructor() {
    this.controller = new AbortController();
  }
  get signal() {
    return this.controller.signal;
  }
  abort() {
    this.controller.abort();
  }
}
