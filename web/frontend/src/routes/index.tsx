import { component$, useSignal } from "@builder.io/qwik";
import {
  type DocumentHead,
  Form,
  routeAction$,
  routeLoader$,
} from "@builder.io/qwik-city";
import { fetchTimeApi } from "~/api/fetchTimeApi";
import { timeApi } from "~/api/routes";

const apiBaseUrl = "http://localhost:3042";

// SSR: qwik-server calls backend
export const useTime = routeLoader$(async (requestEvent) => {
  try {
    const response = await fetchTimeApi(`${apiBaseUrl}${timeApi}`);
    if (response.ok) {
      const json = await response.json();

      if ("error" in json) {
        const t = requestEvent.fail(json.statusCode, {
          errorMessage: json.error,
        });
        return t;
      }

      return {
        now: json.now,
      };
    }
  } catch (error) {
    // e.g. message "AbortError: signal is aborted without reason"
    console.error(error);
  }

  return {
    now: null,
  };
});

// client calls qwik server side to fetch the backend server
export const useGetTimeAction = routeAction$(async () => {
  try {
    const response = await fetchTimeApi(`${apiBaseUrl}${timeApi}`);
    if (response.ok) {
      const json = await response.json();
      return {
        now: json.now,
      };
    }
  } catch (error) {
    // e.g. message "AbortError: signal is aborted without reason"
    console.error(error);
  }

  return {
    now: null,
  };
});

export default component$(() => {
  const getTimeAction = useGetTimeAction();
  const t = useTime();
  if (t.value.failed) {
    console.error(t.value.errorMessage); // logs on the server
    return <div>API is not available</div>;
  }

  const serverTime = useSignal(t.value.now);

  if (getTimeAction.value?.now) {
    serverTime.value = getTimeAction.value.now;
  }

  return (
    <div class="wrapper">
      <h1>Platformatic demo with Nest and Qwik</h1>

      <div>Time</div>
      <span class="time">{new Date(serverTime.value).toLocaleString()}</span>

      <h2>Client-side API fetch</h2>
      <div>usecase - scalable client network connections</div>
      <button
        onClick$={async () => {
          try {
            const response = await fetchTimeApi();
            if (response.ok) {
              const json = await response.json();
              serverTime.value = json.now;
            }
          } catch (error) {
            // e.g. message "AbortError: signal is aborted without reason"
            console.error(error);
          }
        }}
      >
        refresh
      </button>

      <h2>Qwik server-side API fetch</h2>
      <div>
        usecase - protect credentials (e.g. database) or as BFF or when
        JavaScript is disabled, see doc{" "}
        <a href="https://qwik.dev/docs/action/">Actions</a>
      </div>
      <div>
        This demo Qwik component uses also the routeLoader$ so that the time API
        is called twiced. Remove it to prevent that behaviour.
      </div>
      <Form action={getTimeAction}>
        <button>refresh</button>
      </Form>
    </div>
  );
});

export const head: DocumentHead = () => {
  return {
    title: "Platformatic demo with Nest and Qwik",
    meta: [
      {
        name: "description",
        content:
          "Platformatic demo with modern tech stack. Nest as a great backend and Qwik as the awesome frontend developer experience",
      },
    ],
  };
};
