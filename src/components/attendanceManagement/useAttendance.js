// src/hooks/useAttendance.js
import { useState, useEffect, useMemo } from 'react';
import { format, isSameDay } from 'date-fns';
import { API_BASE_URL } from '../../config';

// APIからデータを取得する関数 (フックの外に定義)
const fetchAttendanceApi = async (studentId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/attendances?student_number=${studentId}`);
        if (!response.ok) throw new Error('API request failed');
        const data = await response.json();
        // APIからの文字列をDateオブジェクトに変換
        return data.map(record => ({
            ...record,
            timestamp: new Date(record.timestamp)
        }));
    } catch (error) {
        console.error("Failed to fetch attendance data:", error);
        throw error;
    }
};

export const useAttendance = (authInfo) => {
    const [allRecords, setAllRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!authInfo?.studentId) {
            setError('認証情報がありません。');
            setIsLoading(false);
            return;
        }

        const loadData = async () => {
            try {
                const data = await fetchAttendanceApi(authInfo.studentId);
                setAllRecords(data);
            } catch (err) {
                setError('履歴の取得に失敗しました。');
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [authInfo]);

    const highlightedDays = useMemo(() => {
        const days = new Set();
        allRecords.forEach(record => {
            days.add(format(record.timestamp, 'yyyy-MM-dd'));
        });
        return days;
    }, [allRecords]);

    const getRecordsForDate = (date) => {
        if (!date) return [];
        return allRecords
            .filter(record => isSameDay(record.timestamp, date))
            .sort((a, b) => a.timestamp - b.timestamp);
    };

    return { isLoading, error, highlightedDays, getRecordsForDate };
};