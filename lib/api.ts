export type ApiResponse<T = any> = {
	success: boolean;
	message: string;
	data?: T;
};

async function request<T>(input: RequestInfo, init?: RequestInit): Promise<ApiResponse<T>> {
	const res = await fetch(input, {
		...init,
		headers: {
			'Content-Type': 'application/json',
			...(init?.headers || {}),
		},
		credentials: 'include',
	});

	const json = (await res.json()) as ApiResponse<T>;
	return json;
}

export const api = {
	get: request,
	post: request,
	put: request,
	delete: request,
};

