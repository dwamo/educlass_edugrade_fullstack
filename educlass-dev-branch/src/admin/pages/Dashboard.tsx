import {
  FiUsers,
  FiBook,
  FiClipboard,
  FiBarChart2,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi";
import { getGeneralStats } from "../data/analytics";
import StatCard from "../../components/StatCard";

const Dashboard = () => {
  const stats = getGeneralStats();

  const getIcon = (type: 'warning' | 'success' | 'info') => {
    switch (type) {
      case 'warning':
        return FiAlertCircle;
      case 'success':
        return FiCheckCircle;
      case 'info':
        return FiClock;
      default:
        return FiAlertCircle;
    }
  };

  return (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Users"
          value={stats.totalUsers}
          trend={`+${stats.userGrowth}%`}
          tone="blue"
          icon={<FiUsers />}
        />
        <StatCard
          label="Active Users"
          value={stats.activeUsers}
          trend={`+${stats.userGrowth}%`}
          tone="emerald"
          icon={<FiBook />}
        />
        <StatCard
          label="New Users"
          value={stats.newUsers}
          trend={`+${stats.userGrowth}%`}
          tone="amber"
          icon={<FiClipboard />}
        />
        <StatCard
          label="System Health"
          value={`${stats.systemHealth}%`}
          trend={`+${stats.userGrowth}%`}
          tone="purple"
          icon={<FiBarChart2 />}
        />
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Activities</h2>
        <div className="flow-root">
          <ul role="list" className="-mb-8">
            {stats.recentActivities.map((activity, activityIdx) => {
              const Icon = getIcon(activity.type);
              return (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {activityIdx !== stats.recentActivities.length - 1 ? (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200"
                        aria-hidden="true"
                      />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span
                          className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                            activity.type === "warning"
                              ? "bg-amber-100"
                              : activity.type === "success"
                              ? "bg-emerald-100"
                              : "bg-primary/10"
                          }`}
                        >
                          <Icon
                            className={`h-5 w-5 ${
                              activity.type === "warning"
                                ? "text-amber-600"
                                : activity.type === "success"
                                ? "text-emerald-600"
                                : "text-primary"
                            }`}
                            aria-hidden="true"
                          />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-slate-600">{activity.message}</p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-slate-500">
                          <time dateTime={activity.time}>{activity.time}</time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );
};

export default Dashboard; 