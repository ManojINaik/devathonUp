"use client";
import { useEffect, useState } from 'react';
import { db } from "@/utils/db";
import { MockInterview, UserAnswer } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import { eq, desc } from "drizzle-orm";
import { Briefcase, Rocket, Star, Trophy } from "lucide-react";

const StatCard = ({ icon: Icon, title, value, trend }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md hover:scale-[1.02] border border-gray-100">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <h3 className="text-2xl font-bold mt-1">{value}</h3>
        {trend && (
          <p className={`text-sm mt-2 ${trend.type === 'up' ? 'text-green-500' : 'text-red-500'}`}>
            {trend.value} {trend.type === 'up' ? '↑' : '↓'}
          </p>
        )}
      </div>
      <div className="bg-primary/10 p-3 rounded-lg">
        <Icon className="text-primary" size={24} />
      </div>
    </div>
  </div>
);

export default function DashboardAnalytics() {
  const { user } = useUser();
  const [analytics, setAnalytics] = useState({
    totalInterviews: 0,
    avgScore: 0,
    bestPerformance: 0,
    improvement: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user?.emailAddresses?.[0]?.emailAddress) return;

      try {
        // Fetch all interviews for the user
        const interviews = await db
          .select()
          .from(MockInterview)
          .where(eq(MockInterview.createdBy, user.emailAddresses[0].emailAddress))
          .orderBy(desc(MockInterview.createdAt));

        // Fetch user answers for performance calculation
        const answers = await db
          .select()
          .from(UserAnswer)
          .where(eq(UserAnswer.userEmail, user.emailAddresses[0].emailAddress))
          .orderBy(desc(UserAnswer.createdAt));

        if (!interviews.length) {
          setAnalytics(prev => ({
            ...prev,
            loading: false
          }));
          return;
        }

        // Calculate total interviews
        const totalInterviews = interviews.length;

        // Calculate scores from user answers
        const interviewScores = new Map();
        answers.forEach(answer => {
          if (!answer.rating) return;
          
          const score = parseInt(answer.rating, 10);
          if (isNaN(score)) return;

          if (!interviewScores.has(answer.mockIdRef)) {
            interviewScores.set(answer.mockIdRef, []);
          }
          interviewScores.get(answer.mockIdRef).push(score);
        });

        // Calculate average scores for each interview
        const scores = Array.from(interviewScores.values()).map(scores => {
          const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
          return Math.round(avg);
        });

        // Calculate analytics
        const avgScore = scores.length ? 
          scores.reduce((a, b) => a + b, 0) / scores.length : 0;

        const bestPerformance = scores.length ? Math.max(...scores) : 0;

        // Calculate improvement (comparing last 3 interviews with previous 3)
        let improvement = 0;
        if (scores.length >= 6) {
          const recent = scores.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
          const previous = scores.slice(3, 6).reduce((a, b) => a + b, 0) / 3;
          improvement = previous > 0 ? ((recent - previous) / previous) * 100 : 0;
        }

        // Get trends by comparing with previous period
        const getTrend = (current, previous) => {
          if (!previous) return { type: 'up', value: '+0%' };
          const change = ((current - previous) / previous) * 100;
          return {
            type: change >= 0 ? 'up' : 'down',
            value: `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`
          };
        };

        // Previous period comparisons
        const prevTotalInterviews = Math.max(0, totalInterviews - 1);
        const prevAvgScore = scores.slice(1).reduce((a, b) => a + b, 0) / Math.max(1, scores.length - 1);
        const prevBestPerformance = scores.slice(1).length ? Math.max(...scores.slice(1)) : 0;

        setAnalytics({
          totalInterviews: {
            value: totalInterviews.toString(),
            trend: getTrend(totalInterviews, prevTotalInterviews)
          },
          avgScore: {
            value: avgScore.toFixed(1),
            trend: getTrend(avgScore, prevAvgScore)
          },
          bestPerformance: {
            value: `${bestPerformance}%`,
            trend: getTrend(bestPerformance, prevBestPerformance)
          },
          improvement: {
            value: `${improvement >= 0 ? '+' : ''}${improvement.toFixed(0)}%`,
            trend: { type: improvement >= 0 ? 'up' : 'down', value: `${Math.abs(improvement).toFixed(1)}%` }
          },
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
        setAnalytics(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load analytics'
        }));
      }
    };

    fetchAnalytics();
  }, [user]);

  if (analytics.loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                <div className="h-8 w-16 bg-gray-300 rounded"></div>
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
              </div>
              <div className="bg-gray-200 p-3 rounded-lg h-12 w-12"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (analytics.error) {
    return (
      <div className="text-center text-red-500 p-4">
        {analytics.error}
      </div>
    );
  }

  const stats = [
    {
      icon: Briefcase,
      title: "Total Interviews",
      ...analytics.totalInterviews
    },
    {
      icon: Star,
      title: "Avg. Score",
      ...analytics.avgScore
    },
    {
      icon: Trophy,
      title: "Best Performance",
      ...analytics.bestPerformance
    },
    {
      icon: Rocket,
      title: "Improvement",
      ...analytics.improvement
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}
