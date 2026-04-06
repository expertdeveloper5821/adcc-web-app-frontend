import React, { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { UserRole } from '../../App';
import api from '../../services/api';

interface ReportsProps {
  role: UserRole;
}

export function Reports({ role }: ReportsProps) {
  const [userGrowthData, setUserGrowthData] = useState<Array<{ month: string; users: number }>>([]);
  const [isLoadingGrowth, setIsLoadingGrowth] = useState<boolean>(true);
  const [growthError, setGrowthError] = useState<string | null>(null);
  const [completedEventData, setCompletedEventData] = useState<Array<{ month: string; events: number }>>([]);
  const [isLoadingCompletedEvents, setIsLoadingCompletedEvents] = useState<boolean>(true);
  const [completedEventsError, setCompletedEventsError] = useState<string | null>(null);
  const [completedEventsSummary, setCompletedEventsSummary] = useState<{
    totalCompletedEvents: number;
    rangeCompletedEvents: number;
  } | null>(null);

  const defaultRange = useMemo(() => {
    const today = new Date();
    const toDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const fromDate = new Date(today.getFullYear(), today.getMonth() - 11, 1);

    return {
      from: fromDate.toISOString().split('T')[0],
      to: toDate.toISOString().split('T')[0],
    };
  }, []);

  useEffect(() => {
    const fetchUserGrowth = async () => {
      try {
        setIsLoadingGrowth(true);
        setGrowthError(null);

        const response = await api.get('/v1/user/registration-stats', {
          params: {
            from: defaultRange.from,
            to: defaultRange.to,
            groupBy: 'month',
          },
        });

        const series = Array.isArray(response?.data?.data?.series)
          ? response.data.data.series
          : [];

        const countsByMonth = new Map<string, number>();
        for (const item of series as Array<{ label?: string; count?: number }>) {
          const label = typeof item?.label === 'string' ? item.label : '';
          if (!label) continue;
          countsByMonth.set(label, Number(item?.count ?? 0));
        }

        const normalized: Array<{ month: string; users: number }> = [];
        const now = new Date();
        for (let i = 11; i >= 0; i -= 1) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthLabel = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          normalized.push({
            month: monthLabel,
            users: countsByMonth.get(monthLabel) ?? 0,
          });
        }

        setUserGrowthData(normalized);
      } catch (error: unknown) {
        console.error('Failed to fetch user registration stats:', error);
        setGrowthError('Failed to load user growth data');
        setUserGrowthData([]);
      } finally {
        setIsLoadingGrowth(false);
      }
    };

    void fetchUserGrowth();
  }, [defaultRange.from, defaultRange.to]);

  useEffect(() => {
    const fetchCompletedEvents = async () => {
      try {
        setIsLoadingCompletedEvents(true);
        setCompletedEventsError(null);

        const response = await api.get('/v1/events/completed-stats', {
          params: {
            from: defaultRange.from,
            to: defaultRange.to,
            groupBy: 'month',
          },
        });

        const data = response?.data?.data ?? {};
        const series = Array.isArray(data?.series) ? data.series : [];

        const countsByMonth = new Map<string, number>();
        for (const item of series as Array<{ label?: string; count?: number }>) {
          const label = typeof item?.label === 'string' ? item.label : '';
          if (!label) continue;
          countsByMonth.set(label, Number(item?.count ?? 0));
        }

        const normalized: Array<{ month: string; events: number }> = [];
        const now = new Date();
        for (let i = 11; i >= 0; i -= 1) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthLabel = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          normalized.push({
            month: monthLabel,
            events: countsByMonth.get(monthLabel) ?? 0,
          });
        }

        setCompletedEventData(normalized);
        setCompletedEventsSummary({
          totalCompletedEvents: Number(data?.summary?.totalCompletedEvents ?? 0),
          rangeCompletedEvents: Number(data?.summary?.rangeCompletedEvents ?? 0),
        });
      } catch (error: unknown) {
        console.error('Failed to fetch completed event stats:', error);
        setCompletedEventsError('Failed to load completed event data');
        setCompletedEventData([]);
        setCompletedEventsSummary(null);
      } finally {
        setIsLoadingCompletedEvents(false);
      }
    };

    void fetchCompletedEvents();
  }, [defaultRange.from, defaultRange.to]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2" style={{ color: '#333' }}>Reports & Analytics</h1>
        <p style={{ color: '#666' }}>View insights and performance metrics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <h2 className="text-xl mb-6" style={{ color: '#333' }}>User Growth</h2>
          {isLoadingGrowth ? (
            <div className="flex items-center justify-center h-[300px]">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: '#C12D32' }} />
            </div>
          ) : growthError ? (
            <div className="flex items-center justify-center h-[300px]" style={{ color: '#C12D32' }}>
              {growthError}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fill: '#666', fontSize: 12 }} />
                <YAxis tick={{ fill: '#666', fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#C12D32" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="p-6 rounded-2xl shadow-sm bg-white">
          <div className="mb-6">
            <h2 className="text-xl" style={{ color: '#333' }}>Event Activity
            </h2>
            {/* {completedEventsSummary ? (
              <p className="text-sm mt-1" style={{ color: '#666' }}>
                In selected range: {completedEventsSummary.rangeCompletedEvents} | All time: {completedEventsSummary.totalCompletedEvents}
              </p>
            ) : null} */}
          </div>
          {isLoadingCompletedEvents ? (
            <div className="flex items-center justify-center h-[300px]">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: '#CF9F0C' }} />
            </div>
          ) : completedEventsError ? (
            <div className="flex items-center justify-center h-[300px]" style={{ color: '#C12D32' }}>
              {completedEventsError}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={completedEventData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fill: '#666', fontSize: 12 }} />
                <YAxis tick={{ fill: '#666', fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="events" fill="#CF9F0C" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
