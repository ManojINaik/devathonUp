import Header from "./_components/Header";
import AddNewInterview from "./_components/AddNewInterview";
import InterviewList from "./_components/InterviewList";
import DashboardAnalytics from "./_components/DashboardAnalytics";

function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header />
      <main className="pt-24 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Welcome Back!
          </h1>
          <p className="text-gray-600 mt-2">
            Practice and improve your interview skills with AI-powered mock interviews
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8">
          <DashboardAnalytics />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* New Interview Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-semibold mb-4">Start New Interview</h2>
              <AddNewInterview />
            </div>
          </div>

          {/* Interview List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-semibold mb-4">Recent Interviews</h2>
              <InterviewList />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;