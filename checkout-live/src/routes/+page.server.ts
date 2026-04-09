import { env as privateEnv } from '$env/dynamic/private';
import { createSession } from '$lib/helpers/session';

export async function load({}: any) {
	try {
		const session = await createSession(
			JSON.stringify({
				checkoutId: privateEnv.PRIVATE_CHECKOUT_ID,
				profileId: privateEnv.PRIVATE_PROFILE_ID,
				metadata: 'Test metadata',
				fields: ['cardField', 'cvvField'],
				amount: 1,
				products: [
					{
						name: 'Product 1',
						price: 1,
						quantity: 1,
						logoUrl:
							'https://d1csarkz8obe9u.cloudfront.net/posterpreviews/logo-organic-product-design-template-3abf71131287c02170f994587fb56eb1_screen.jpg?ts=1649667032'
					}
				]
			}),
			'form'
		);
		return {
			session
		};
	} catch (err) {
		console.error('Error: ', err);
		return {
			err: {
				message: err instanceof Error ? err.message : String(err),
				code: (err as any)?.code
			}
		};
	}
}
