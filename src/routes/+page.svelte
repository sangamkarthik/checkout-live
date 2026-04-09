<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { onDestroy, onMount } from 'svelte';

	let checkoutInstance: any;
	let unsubscribePaymentComplete: (() => void) | undefined;
	let errorMessage = $state('');
	let sessionId = $state('');

	let { data }: any = $props();

	console.log(data.session);

	if (data && data.err) {
		console.error('Error getting session token:', data.err);
		errorMessage = JSON.stringify(data.err);
	} else if (data.session && data.session.error) {
		console.error('Error getting session token:', data.session.error);
		errorMessage = data.session.error;
	} else if (data.session && data.session.session) {
		console.log('Session id ' + data.session.session.requestId);
		sessionId = data.session.session.requestId;
	} else {
		console.error('No data returned from page.server.ts!!');
	}

	onMount(async () => {
		// If checkout-demo is loaded inside an iframe, it means PUBLIC_CHECKOUT_FORM_URL
		// is not set on checkout-js, so the iframe src resolved to checkout-demo instead
		// of checkout-form. Bail out to prevent a recursive iframe loop.
		if (window.self !== window.top) {
			errorMessage =
				'Recursive iframe detected: checkout-js PUBLIC_CHECKOUT_FORM_URL is not set. ' +
				'The iframe is loading checkout-demo instead of checkout-form.';
			console.error(errorMessage);
			return;
		}

		if (data && data.session && data.session.token) {
			try {
				// Mount component
				checkoutInstance = (window as any).checkout.mount(data.session.token, 'checkout-container');
				console.log('Checkout mounted!');

				// Register callback for payment completion
				unsubscribePaymentComplete = (window as any).checkout.onPaymentComplete((response: any) => {
					console.log('Payment completed! Response:', response);
				});
			} catch (error: any) {
				console.error('Failed to load Checkout-js', error);
				errorMessage =
					'Failed to load Checkout-js at this url ' + `${env.PUBLIC_CHECKOUT_JS_URL}/checkout.js`;
			}
		}
	});

	onDestroy(() => {
		if (unsubscribePaymentComplete) {
			unsubscribePaymentComplete();
		}
	});
</script>

<svelte:head>
	{#if data.session}
		<script type="text/javascript" src={`${env.PUBLIC_CHECKOUT_JS_URL}`}></script>
	{/if}
</svelte:head>

<div class="flex h-screen w-full flex-col">
	<div class="flex-shrink-0">
		<h3 class="pt-5 pl-5">Checkout Demo</h3>
		{#if errorMessage}
			<p class="error pl-5">{errorMessage}</p>
		{/if}
		{#if sessionId}
			<p class="pl-5">Session id: {sessionId}</p>
		{/if}
	</div>
	<div class="w-full flex-1 overflow-hidden" id="checkout-container"></div>
</div>

<style>
	.error {
		color: red;
		font-weight: bold;
	}
</style>
