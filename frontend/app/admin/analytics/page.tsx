'use client';

import { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line 
} from 'recharts';
import { getAccident } from '@/services/report';

interface Accident {
  _id: string;
  description: string;
  contactNumber: string;
  location: {
    latitude: number;
    longitude: number;
    source?: string;
  };
  images: { url: string }[];
  createdAt: string;
  status?: 'pending' | 'accepted' | 'rejected';
}

interface AnalyticsData {
  statusCounts: { name: string; value: number; color: string }[];
  dailyReports: { date: string; count: number }[];
  monthlyTrend: { month: string; count: number }[];
  recentAccidents: Accident[];
  stats: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await getAccident();
        const accidents: Accident[] = res.data || [];
        
        // Process data for analytics
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Calculate status counts
        const statusCounts = [
          { name: 'Pending', value: accidents.filter(a => a.status === 'pending' || !a.status).length, color: '#FFBB28' },
          { name: 'Accepted', value: accidents.filter(a => a.status === 'accepted').length, color: '#00C49F' },
          { name: 'Rejected', value: accidents.filter(a => a.status === 'rejected').length, color: '#FF8042' },
        ];

        // Group by date
        const dailyReports = accidents.reduce((acc, accident) => {
          const date = new Date(accident.createdAt).toLocaleDateString();
          if (!acc[date]) {
            acc[date] = 0;
          }
          acc[date]++;
          return acc;
        }, {} as Record<string, number>);

        const dailyArray = Object.entries(dailyReports)
          .map(([date, count]) => ({ date, count }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(-7); // Last 7 days

        // Monthly trend
        const monthlyData = accidents.reduce((acc, accident) => {
          const month = new Date(accident.createdAt).toLocaleString('default', { month: 'short' });
          if (!acc[month]) {
            acc[month] = 0;
          }
          acc[month]++;
          return acc;
        }, {} as Record<string, number>);

        const monthlyArray = Object.entries(monthlyData)
          .map(([month, count]) => ({ month, count }));

        // Calculate stats
        const stats = {
          total: accidents.length,
          today: accidents.filter(a => new Date(a.createdAt) >= today).length,
          thisWeek: accidents.filter(a => new Date(a.createdAt) >= oneWeekAgo).length,
          thisMonth: accidents.filter(a => new Date(a.createdAt) >= oneMonthAgo).length,
        };

        setAnalyticsData({
          statusCounts,
          dailyReports: dailyArray,
          monthlyTrend: monthlyArray,
          recentAccidents: accidents.slice(0, 5), // Get 5 most recent
          stats,
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  if (loading) return <p className="p-6 text-center">Loading analytics...</p>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">📊 Accident Reports Analytics</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-4 py-2 rounded-lg ${timeRange === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-4 py-2 rounded-lg ${timeRange === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
          >
            Month
          </button>
          <button
            onClick={() => setTimeRange('year')}
            className={`px-4 py-2 rounded-lg ${timeRange === 'year' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
          >
            Year
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg mr-4">
              <span className="text-2xl">📈</span>
            </div>
            <div>
              <p className="text-gray-500">Total Reports</p>
              <p className="text-3xl font-bold">{analyticsData?.stats.total || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg mr-4">
              <span className="text-2xl">📅</span>
            </div>
            <div>
              <p className="text-gray-500">Today</p>
              <p className="text-3xl font-bold">{analyticsData?.stats.today || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg mr-4">
              <span className="text-2xl">📆</span>
            </div>
            <div>
              <p className="text-gray-500">This Week</p>
              <p className="text-3xl font-bold">{analyticsData?.stats.thisWeek || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg mr-4">
              <span className="text-2xl">🗓️</span>
            </div>
            <div>
              <p className="text-gray-500">This Month</p>
              <p className="text-3xl font-bold">{analyticsData?.stats.thisMonth || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Status Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analyticsData?.statusCounts}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analyticsData?.statusCounts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Reports */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Daily Reports (Last 7 Days)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData?.dailyReports}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" name="Number of Reports" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Monthly Trend</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analyticsData?.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#8884d8" 
                activeDot={{ r: 8 }}
                name="Reports"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4">Recent Accident Reports</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analyticsData?.recentAccidents.map((accident) => (
                <tr key={accident._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(accident.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {accident.description.length > 50 
                        ? `${accident.description.substring(0, 50)}...` 
                        : accident.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {accident.phoneNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${accident.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                        accident.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                      {accident.status || 'pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}