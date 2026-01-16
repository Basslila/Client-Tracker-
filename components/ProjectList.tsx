"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";
import { IndianRupee } from "lucide-react";
import Link from "next/link";

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
export const ProjectList = ({ projects, showMoney }: ProjectListProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
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
                      <Link href={`/projects/${project.id}`} className="font-medium text-gray-900 hover:text-blue-600 transition-colors">
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
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                        project.status === 'In Progress' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                        project.status === 'On Hold' ? 'bg-orange-50 text-orange-700 border-orange-200' : 
                        project.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' : 
                        project.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200' : 
                        'bg-gray-100 text-gray-800 border-gray-200'
                      )}>
                        {project.status}
                      </span>
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
