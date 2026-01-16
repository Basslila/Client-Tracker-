
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/cn";
import { IndianRupee, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

// --- TYPE DEFINITIONS ---
export interface Project {
  id: string;
  name: string;
  clients: { name: string } | { name: string }[] | null;
  progress: number | null;
  budget: number | null;
  amount_paid: number | null;
  status: string | null;
  created_at: string;
  start_date?: string | null;
}

export interface ProjectListProps {
  projects: Project[];
  showMoney: boolean;
  canEdit?: boolean;
  onProjectsChange?: () => void;
  statusFilter?: string;
  setStatusFilter?: (filter: string) => void;
  showFilterDropdown?: boolean;
  setShowFilterDropdown?: (show: boolean) => void;
}

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
export const ProjectList = ({ 
  projects, 
  showMoney, 
  canEdit = false, 
  onProjectsChange,
  statusFilter = 'All',
  setStatusFilter,
  showFilterDropdown = false,
  setShowFilterDropdown
}: ProjectListProps) => {
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null);

  const handleStatusChange = async (projectId: string, newStatus: string) => {
    const { error } = await supabase
      .from('projects')
      .update({ status: newStatus })
      .eq('id', projectId);

    if (error) {
      console.error('Error updating status:', error);
      alert('Error updating status');
      return;
    }

    setEditingStatusId(null);
    onProjectsChange?.();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Project Name</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Client</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">%</th>
              {showMoney && <th className="px-6 py-4 text-sm font-semibold text-gray-600">Budget</th>}
              {showMoney && <th className="px-6 py-4 text-sm font-semibold text-gray-600">Advance Payment</th>}
              {showMoney && <th className="px-6 py-4 text-sm font-semibold text-gray-600">Money to Receive</th>}
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                <div className="flex items-center gap-2 relative">
                  <span>Status</span>
                  {setStatusFilter && setShowFilterDropdown && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowFilterDropdown(!showFilterDropdown);
                        }}
                        className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                          statusFilter !== 'All' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'
                        }`}
                      >
                        <Filter size={16} />
                      </button>
                      {showFilterDropdown && (
                        <>
                          <div 
                            className="fixed inset-0 z-40" 
                            onClick={() => setShowFilterDropdown(false)}
                          />
                          <div className="absolute top-full right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                            {['All', 'Active', 'On Hold', 'Cancelled', 'Completed'].map((status) => (
                              <button
                                key={status}
                                onClick={() => {
                                  setStatusFilter(status)
                                  setShowFilterDropdown(false)
                                }}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                                  statusFilter === status ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                                }`}
                              >
                                {status}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Start Date</th>
            </tr>
          </thead>
          <motion.tbody
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="divide-y divide-gray-100"
          >
            <AnimatePresence mode="wait">
              {projects.map((project) => {
                const budget = project.budget ? Number(project.budget) : 0;
                const advancePayment = project.amount_paid ? Number(project.amount_paid) : 0;
                const moneyLeft = budget - advancePayment;
                // @ts-ignore
                const clientName = project.clients?.name || (Array.isArray(project.clients) ? project.clients[0]?.name : '');

                return (
                  <motion.tr 
                    key={project.id} 
                    variants={itemVariants}
                    className="hover:bg-gray-50 transition-colors group"
                    layout
                  >
                    <td className="px-6 py-4">
                      <Link to={`/projects/${project.id}`} className="font-medium text-gray-900 hover:text-blue-600 transition-colors">
                        {project.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {clientName}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-blue-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${project.progress || 0}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                          />
                        </div>
                        <span className="text-sm text-gray-500">{project.progress || 0}%</span>
                      </div>
                    </td>
                    {showMoney && (
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {project.budget ? `₹${Number(project.budget).toLocaleString()}` : '-'}
                      </td>
                    )}
                    {showMoney && (
                      <td className="px-6 py-4 text-sm text-green-600 font-medium">
                        {project.amount_paid ? `₹${Number(project.amount_paid).toLocaleString()}` : '-'}
                      </td>
                    )}
                    {showMoney && (
                      <td className="px-6 py-4">
                        <span className={cn(
                          "text-sm font-medium flex items-center gap-1",
                          moneyLeft >= 0 ? 'text-orange-600' : 'text-red-600'
                        )}>
                          <IndianRupee size={14} />
                          {moneyLeft.toLocaleString()}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4">
                      {editingStatusId === project.id && canEdit ? (
                        <select
                          value={project.status || 'Active'}
                          onChange={(e) => handleStatusChange(project.id, e.target.value)}
                          onBlur={() => setEditingStatusId(null)}
                          autoFocus
                          className="px-2.5 py-0.5 text-xs font-medium rounded-full border focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700 border-gray-200"
                        >
                          <option value="Active">Active</option>
                          <option value="On Hold">On Hold</option>
                          <option value="Cancelled">Cancelled</option>
                          <option value="Completed">Completed</option>
                        </select>
                      ) : (
                        <span 
                          onClick={() => canEdit && setEditingStatusId(project.id)}
                          className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                            canEdit ? 'cursor-pointer hover:opacity-80' : '',
                            project.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 
                            project.status === 'On Hold' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                            project.status === 'Completed' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                            project.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200' : 
                            'bg-gray-100 text-gray-800 border-gray-200'
                          )}
                        >
                          {project.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {project.start_date ? new Date(project.start_date).toLocaleDateString() : '-'}
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </motion.tbody>
        </table>
      </div>
    </div>
  );
};
