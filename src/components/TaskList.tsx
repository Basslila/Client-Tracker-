import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";
import { Calendar, CheckCircle2, Circle, Pencil, Trash2 } from "lucide-react";

// --- TYPE DEFINITIONS ---
export type TaskStatus = "To Do" | "In Progress" | "Completed" | string;

export interface Task {
  id: string;
  title: string;
  status: TaskStatus | null;
  due_date: string | null;
  project_id?: string;
}

export interface TaskListProps {
  tasks: Task[];
  projectId?: string;
}

// --- STATUS BADGE SUBCOMPONENT ---
const StatusBadge = ({ status }: { status: TaskStatus | null }) => {
  const baseClasses = "px-2.5 py-0.5 text-xs font-medium rounded-full inline-flex items-center border";
  
  let statusClasses = "bg-gray-50 text-gray-700 border-gray-200";
  
  if (status === "Completed") {
    statusClasses = "bg-green-50 text-green-700 border-green-200";
  } else if (status === "In Progress") {
    statusClasses = "bg-blue-50 text-blue-700 border-blue-200";
  } else if (status === "To Do") {
    statusClasses = "bg-gray-50 text-gray-700 border-gray-200";
  }

  return <span className={cn(baseClasses, statusClasses)}>{status || 'Unknown'}</span>;
};


// --- FRAMER MOTION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 14,
    }
  },
};

// --- MAIN COMPONENT ---
export const TaskList = ({ tasks }: TaskListProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          {/* Table Header */}
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Task</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Due Date</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>

          {/* Table Body with Animations */}
          <motion.tbody
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="divide-y divide-gray-100"
          >
            <AnimatePresence mode="wait">
              {tasks.length === 0 ? (
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    No tasks yet. Add one to get started.
                  </td>
                </motion.tr>
              ) : (
                tasks.map((task) => (
                  <motion.tr 
                    key={task.id} 
                    variants={itemVariants}
                    className="hover:bg-gray-50 transition-colors group"
                    layout
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button className="text-gray-400 hover:text-blue-600 transition-colors">
                          {task.status === 'Completed' ? (
                            <CheckCircle2 size={20} className="text-green-500" />
                          ) : (
                            <Circle size={20} />
                          )}
                        </button>
                        <span className={cn(
                          "font-medium transition-all duration-200",
                          task.status === 'Completed' ? 'text-gray-400 line-through' : 'text-gray-900'
                        )}>
                          {task.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={task.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {task.due_date ? (
                        <div className="flex items-center gap-1">
                          <Calendar size={14} className="text-gray-400" />
                          <span>{new Date(task.due_date).toLocaleDateString()}</span>
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                          <Pencil size={16} />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </motion.tbody>
        </table>
      </div>
    </div>
  );
};
