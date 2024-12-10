"use client";
import { useEffect, useState } from 'react';
import { db } from "@/utils/db";
import { MockInterview, UserAnswer } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import { eq, desc } from "drizzle-orm";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Header from "../_components/Header";

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

export default function AnalyticsPage() {
  const { user } = useUser();
  const [data, setData] = useState({
    performanceData: [],
    interviewsByDay: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user?.emailAddresses?.[0]?.emailAddress) return;

      try {
        // Fetch user answers for performance data
        const answers = await db
          .select()
          .from(UserAnswer)
          .where(eq(UserAnswer.userEmail, user.emailAddresses[0].emailAddress))
          .orderBy(desc(UserAnswer.createdAt));

        // Process performance data
        const performanceByInterview = new Map();
        answers.forEach(answer => {
          if (!answer.rating || !answer.createdAt) return;
          
          const score = parseInt(answer.rating, 10);
          if (isNaN(score)) return;

          if (!performanceByInterview.has(answer.mockIdRef)) {
            performanceByInterview.set(answer.mockIdRef, {
              date: answer.createdAt,
              scores: []
            });
          }
          performanceByInterview.get(answer.mockIdRef).scores.push(score);
        });

        // Calculate average scores and format data for charts
        const performanceData = Array.from(performanceByInterview.entries())
          .map(([mockId, data]) => ({
            date: formatDate(data.date),
            score: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
            mockId
          }))
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        // Calculate interviews by day
        const interviewsByDay = performanceData.reduce((acc, curr) => {
          const existingDay = acc.find(day => day.date === curr.date);
          if (existingDay) {
            existingDay.count += 1;
          } else {
            acc.push({ date: curr.date, count: 1 });
          }
          return acc;
        }, []);

        setData({
          performanceData,
          interviewsByDay,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
        setData(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load analytics data'
        }));
      }
    };

    fetchAnalytics();
  }, [user]);

  if (data.loading) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <Header />
        <main className="pt-24 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 w-64 bg-gray-200 rounded"></div>
            <div className="h-[400px] bg-gray-200 rounded"></div>
            <div className="h-[300px] bg-gray-200 rounded"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header />
      <main className="pt-24 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Performance Analytics
          </h1>
          <p className="text-gray-600 mt-2">
            Track your interview performance and progress over time
          </p>
        </div>

        {data.error ? (
          <div className="text-center text-red-500 p-4">
            {data.error}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Performance Over Time */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-4">Performance Over Time</h2>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#6366f1"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Score (%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Interviews by Day */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-4">Interviews by Day</h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.interviewsByDay}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="count"
                      fill="#6366f1"
                      name="Number of Interviews"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
