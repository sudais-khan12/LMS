"use client";

import * as React from 'react';
import { api, ApiResponse } from '@/lib/api';

export type AttendanceRecord = {
	id: string;
	studentId: string;
	courseId: string;
	status: 'PRESENT' | 'ABSENT' | 'LATE';
	date: string;
	student?: { user?: { id: string; name: string | null; email: string | null } };
	course?: { id: string; title: string; code: string };
};

export function useAttendance() {
	const [items, setItems] = React.useState<AttendanceRecord[]>([]);
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);

	const list = React.useCallback(async (params?: { courseId?: string; studentId?: string }) => {
		setLoading(true);
		setError(null);
		const qs = new URLSearchParams();
		if (params?.courseId) qs.set('courseId', params.courseId);
		if (params?.studentId) qs.set('studentId', params.studentId);
		const url = qs.toString() ? `/api/attendance?${qs}` : '/api/attendance';
		const res = await api.get<AttendanceRecord[]>(url);
		if (res.success) setItems(res.data ?? []);
		else setError(res.message);
		setLoading(false);
		return res;
	}, []);

	const create = React.useCallback(async (payload: { courseId: string; studentId: string; status: 'PRESENT' | 'ABSENT' | 'LATE'; date?: string }) => {
		const res = await api.post<AttendanceRecord>('/api/attendance', { method: 'POST', body: JSON.stringify(payload) });
		if (res.success && res.data) setItems((prev) => [res.data!, ...prev]);
		return res;
	}, []);

	const update = React.useCallback(async (id: string, payload: Partial<Pick<AttendanceRecord, 'status' | 'date'>>) => {
		const res = await api.put<AttendanceRecord>(`/api/attendance/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
		if (res.success && res.data) setItems((prev) => prev.map((i) => (i.id === id ? (res.data as AttendanceRecord) : i)));
		return res;
	}, []);

	const remove = React.useCallback(async (id: string) => {
		const res = await api.delete(`/api/attendance/${id}`, { method: 'DELETE' });
		if ((res as ApiResponse).success) setItems((prev) => prev.filter((i) => i.id !== id));
		return res;
	}, []);

	return { items, loading, error, list, create, update, remove };
}

