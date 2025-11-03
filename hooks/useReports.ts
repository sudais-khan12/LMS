"use client";

import * as React from 'react';
import { api } from '@/lib/api';

export type Report = {
	id: string;
	studentId: string;
	gpa: number;
	semester: number;
	remarks?: string | null;
};

export function useReports() {
	const [items, setItems] = React.useState<Report[]>([]);
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);

	const list = React.useCallback(async (params?: { studentId?: string; semester?: number }) => {
		setLoading(true);
		setError(null);
		const qs = new URLSearchParams();
		if (params?.studentId) qs.set('studentId', params.studentId);
		if (params?.semester) qs.set('semester', String(params.semester));
		const url = qs.toString() ? `/api/reports?${qs}` : '/api/reports';
		const res = await api.get<Report[]>(url);
		if (res.success) setItems(res.data ?? []);
		else setError(res.message);
		setLoading(false);
		return res;
	}, []);

	const generate = React.useCallback(async (payload: { studentId: string; semester: number; remarks?: string }) => {
		const res = await api.post<Report>('/api/reports', { method: 'POST', body: JSON.stringify(payload) });
		if (res.success && res.data) {
			setItems((prev) => {
				const exists = prev.find((r) => r.id === res.data!.id);
				if (exists) return prev.map((r) => (r.id === res.data!.id ? (res.data as Report) : r));
				return [res.data as Report, ...prev];
			});
		}
		return res;
	}, []);

	const update = React.useCallback(async (id: string, payload: Partial<Pick<Report, 'gpa' | 'remarks' | 'semester'>>) => {
		const res = await api.put<Report>(`/api/reports/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
		if (res.success && res.data) setItems((prev) => prev.map((r) => (r.id === id ? (res.data as Report) : r)));
		return res;
	}, []);

	const byStudent = React.useCallback(async (studentId: string, semester?: number) => {
		const qs = new URLSearchParams();
		if (semester) qs.set('semester', String(semester));
		const url = `/api/reports/student/${studentId}${qs.toString() ? `?${qs}` : ''}`;
		return api.get<any>(url);
	}, []);

	return { items, loading, error, list, generate, update, byStudent };
}

