"use client";
import { useState, useEffect } from 'react';
import { useUser } from "@clerk/nextjs";
import Header from "../_components/Header";
import { db } from "@/utils/db";
import { MockInterview, UserAnswer } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { 
  User, Mail, Calendar, Award, Clock, 
  Briefcase, Star, BarChart2, Settings 
} from "lucide-react";
import Image from "next/image";

export default function ProfilePage() {
  const { user } = useUser();
  const [stats, setStats] = useState({
    totalInterviews: 0,
    avgScore: 0,
    totalTime: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user?.emailAddresses?.[0]?.emailAddress) return;

      try {
        // Fetch interviews
        const interviews = await db
          .select()
          .from(MockInterview)
          .where(eq(MockInterview.createdBy, user.emailAddresses[0].emailAddress));

        // Fetch answers
        const answers = await db
          .select()
          .from(UserAnswer)
          .where(eq(UserAnswer.userEmail, user.emailAddresses[0].emailAddress));

        // Calculate stats
        const totalInterviews = interviews.length;
        
        // Calculate average score
        const scores = answers
          .map(answer => parseInt(answer.rating || '0', 10))
          .filter(score => !isNaN(score));
        const avgScore = scores.length 
          ? scores.reduce((a, b) => a + b, 0) / scores.length 
          : 0;

        // Estimate total time (assuming 15 minutes per interview)
        const totalTime = totalInterviews * 15;

        setStats({
          totalInterviews,
          avgScore: Math.round(avgScore),
          totalTime,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching user stats:', error);
        setStats(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load user statistics'
        }));
      }
    };

    fetchUserStats();
  }, [user]);

  const StatCard = ({ icon: Icon, title, value }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center space-x-3">
        <div className="bg-primary/10 p-3 rounded-lg">
          <Icon className="text-primary" size={24} />
        </div>
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-xl font-semibold mt-1">{value}</p>
        </div>
      </div>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <Header />
        <main className="pt-24 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center">
            <p className="text-gray-500">Please sign in to view your profile</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header />
      <main className="pt-24 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8">
            <div className="relative w-32 h-32">
              {user.imageUrl ? (
                <Image
                  src={user.imageUrl}
                  alt="Profile"
                  fill
                  className="rounded-full object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center">
                  <User size={48} className="text-primary" />
                </div>
              )}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold">{user.fullName}</h1>
              <p className="text-gray-500 mt-1">{user.emailAddresses[0].emailAddress}</p>
              <div className="mt-4 flex flex-wrap gap-3 justify-center md:justify-start">
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                  Professional
                </span>
                {stats.totalInterviews >= 10 && (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                    Experienced
                  </span>
                )}
                {stats.avgScore >= 80 && (
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                    Top Performer
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        {stats.loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="bg-gray-200 p-3 rounded-lg h-12 w-12"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    <div className="h-6 w-16 bg-gray-300 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={Briefcase}
              title="Total Interviews"
              value={stats.totalInterviews}
            />
            <StatCard
              icon={Star}
              title="Average Score"
              value={`${stats.avgScore}%`}
            />
            <StatCard
              icon={Clock}
              title="Total Time"
              value={`${stats.totalTime} mins`}
            />
            <StatCard
              icon={Award}
              title="Level"
              value={stats.totalInterviews >= 10 ? "Advanced" : "Beginner"}
            />
          </div>
        )}

        {/* Account Details */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-semibold mb-6">Account Details</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <User className="text-gray-400" size={20} />
              <span className="text-gray-600">{user.fullName}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="text-gray-400" size={20} />
              <span className="text-gray-600">{user.emailAddresses[0].emailAddress}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="text-gray-400" size={20} />
              <span className="text-gray-600">
                Joined {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
