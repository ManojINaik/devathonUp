"use client";

import React, { useState } from "react";
import QuestionSection from "./QuestionSection";
import RecordAnswerSection from "./RecordAnswerSection";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function InterviewClient({ interviewData }) {
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 my-10">
        <QuestionSection
          mockInterviewQuestion={interviewData.questions}
          activeQuestionIndex={activeQuestionIndex}
        />
        <RecordAnswerSection
          mockInterviewQuestion={interviewData.questions}
          activeQuestionIndex={activeQuestionIndex}
          interviewData={interviewData.interview}
        />
      </div>
      <div className="flex justify-between mt-4">
        {activeQuestionIndex > 0 && (
          <Button
            onClick={() => setActiveQuestionIndex(activeQuestionIndex - 1)}
            className="bg-black"
          >
            Previous
          </Button>
        )}
        {activeQuestionIndex < interviewData.questions.length - 1 && (
          <Button
            onClick={() => setActiveQuestionIndex(activeQuestionIndex + 1)}
            className="bg-black"
          >
            Next
          </Button>
        )}
        {activeQuestionIndex === interviewData.questions.length - 1 && (
          <Link href={`/dashboard/interview/${interviewData.interview.mockId}/feedback`}>
            <Button>End Interview</Button>
          </Link>
        )}
      </div>
    </>
  );
}
