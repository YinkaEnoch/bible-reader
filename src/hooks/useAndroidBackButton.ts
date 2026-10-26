import { useEffect } from "react";
import { App } from "@capacitor/app";

/**
 * Intercepts the Android hardware back button via the Capacitor App plugin.
 *
 * `onBack` is called when the back button is pressed. It should return `true`
 * if the event was handled (prevents the default "exit app" behaviour), or
 * `false` / `undefined` to let Capacitor exit the app normally.
 *
 * On non-Capacitor platforms (web) the listener is registered but the event
 * will simply never fire, so there is no side-effect.
 */
export function useAndroidBackButton(onBack: () => boolean | void) {
	useEffect(() => {
		let listenerHandle: Awaited<ReturnType<typeof App.addListener>> | null =
			null;

		App.addListener("backButton", ({ canGoBack }) => {
			const handled = onBack();
			if (!handled && !canGoBack) {
				// Nothing to go back to — exit the app gracefully
				App.exitApp();
			}
		}).then((handle) => {
			listenerHandle = handle;
		});

		return () => {
			listenerHandle?.remove();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [onBack]);
}
