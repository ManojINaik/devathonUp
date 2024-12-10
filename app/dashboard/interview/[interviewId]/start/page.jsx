import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { eq } from "drizzle-orm";
import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import InterviewClient from "./_components/InterviewClient";

async function getInterviewDetails(id) {
  try {
    const result = await db
      .select()
      .from(MockInterview)
      .where(eq(MockInterview.mockId, id));

    if (!result || result.length === 0) {
      throw new Error("Interview not found");
    }

    const jsonMockResp = JSON.parse(result[0].jsonMockResp);
    return { interview: result[0], questions: jsonMockResp };
  } catch (error) {
    console.error("Error fetching interview details:", error);
    throw error;
  }
}

export default async function StartInterview({ params }) {
  let interviewData;
  try {
    interviewData = await getInterviewDetails(params.interviewId);
  } catch (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
        <div className="text-destructive mb-4">⚠️ Failed to load interview</div>
        <Link href="/dashboard">
          <Button variant="outline">Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <InterviewClient interviewData={interviewData} />
    </div>
  );
}
