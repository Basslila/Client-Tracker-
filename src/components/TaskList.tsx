import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";
import { Calendar, CheckCircle2, Circle, Trash2, Plus, Check, X } from "lucide-react";
import { supabase } from "../lib/supabase";

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
  projectId: string;
  onTasksChange?: () => void;
}

// --- MAIN COMPONENT ---
export const TaskList = ({ tasks, projectId, onTasksChange }: TaskListProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<{ title: string; status: string; due_date: string }>({ 
    title: '', 
    status: 'To Do', 
    due_date: '' 
  });
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', status: 'To Do', due_date: '' });

  const handleDoubleClick = (task: Task) => {
    setEditingId(task.id);
    setEditData({
      title: task.title,
      status: task.status || 'To Do',
      due_date: task.due_date || '',
    });
  };

  const handleSave = async (taskId: string) => {
    const { error } = await supabase
      .from('tasks')
      .update({
        title: editData.title,
        status: editData.status,
        due_date: editData.due_date || null,
      })
      .eq('id', taskId);

    if (error) {
      console.error('Error updating task:', error);
      alert('Error updating task');
      return;
    }

    setEditingId(null);
    onTasksChange?.();
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAddingNew(false);
    setNewTask({ title: '', status: 'To Do', due_date: '' });
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm('Delete this task?')) return;

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('Error deleting task:', error);
      alert('Error deleting task');
      return;
    }

    onTasksChange?.();
  };

  const handleToggleStatus = async (task: Task) => {
    const newStatus = task.status === 'Completed' ? 'To Do' : 'Completed';
    
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', task.id);

    if (error) {
      console.error('Error updating status:', error);
      return;
    }

    onTasksChange?.();
  };

  const handleAddTask = async () => {
    if (!newTask.title.trim()) return;

    const { error } = await supabase
      .from('tasks')
      .insert([{
        title: newTask.title,
        status: newTask.status,
        due_date: newTask.due_date || null,
        project_id: projectId,
      }]);

    if (error) {
      console.error('Error creating task:', error);
      alert('Error creating task');
      return;
    }

    setNewTask({ title: '', status: 'To Do', due_date: '' });
    setIsAddingNew(false);
    onTasksChange?.();
  };

  const StatusSelect = ({ value, onChange }: { value: string; onChange: (val: string) => void }) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-2.5 py-0.5 text-xs font-medium rounded-full border focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700 border-gray-200"
      onClick={(e) => e.stopPropagation()}
    >
      <option value="To Do">To Do</option>
      <option value="In Progress">In Progress</option>
      <option value="Completed">Completed</option>
    </select>
  );

  const StatusBadge = ({ status }: { status: TaskStatus | null }) => {
    const baseClasses = "px-2.5 py-0.5 text-xs font-medium rounded-full inline-flex items-center border";
    let statusClasses = "bg-gray-50 text-gray-700 border-gray-200";
    
    if (status === "Completed") {
      statusClasses = "bg-green-50 text-green-700 border-green-200";
    } else if (status === "In Progress") {
      statusClasses = "bg-blue-50 text-blue-700 border-blue-200";
    }

    return <span className={cn(baseClasses, statusClasses)}>{status || 'To Do'}</span>;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 w-12"></th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Task</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 w-48">Status</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 w-48">Due Date</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 w-24">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            <AnimatePresence mode="popLayout">
              {tasks.map((task) => (
                <motion.tr 
                  key={task.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={cn(
                    "hover:bg-gray-50 transition-colors group",
                    editingId === task.id && "bg-blue-50"
                  )}
                  onDoubleClick={() => handleDoubleClick(task)}
                >
                  <td className="px-6 py-3">
                    <button 
                      onClick={() => handleToggleStatus(task)}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      {task.status === 'Completed' ? (
                        <CheckCircle2 size={20} className="text-green-500" />
                      ) : (
                        <Circle size={20} />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-3">
                    {editingId === task.id ? (
                      <textarea
                        value={editData.title}
                        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                        className="w-full px-2 py-1 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none overflow-hidden min-h-[32px]"
                        autoFocus
                        rows={1}
                        onInput={(e) => {
                          const target = e.target as HTMLTextAreaElement;
                          target.style.height = 'auto';
                          target.style.height = target.scrollHeight + 'px';
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSave(task.id);
                          }
                          if (e.key === 'Escape') handleCancel();
                        }}
                      />
                    ) : (
                      <span className={cn(
                        "font-medium whitespace-pre-wrap break-words",
                        task.status === 'Completed' ? 'text-gray-400 line-through' : 'text-gray-900'
                      )}>
                        {task.title}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    {editingId === task.id ? (
                      <StatusSelect 
                        value={editData.status} 
                        onChange={(val) => setEditData({ ...editData, status: val })} 
                      />
                    ) : (
                      <StatusBadge status={task.status} />
                    )}
                  </td>
                  <td className="px-6 py-3">
                    {editingId === task.id ? (
                      <input
                        type="date"
                        value={editData.due_date}
                        onChange={(e) => setEditData({ ...editData, due_date: e.target.value })}
                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <div className="text-sm text-gray-600">
                        {task.due_date ? (
                          <div className="flex items-center gap-1">
                            <Calendar size={14} className="text-gray-400" />
                            <span>{new Date(task.due_date).toLocaleDateString()}</span>
                          </div>
                        ) : '-'}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    {editingId === task.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleSave(task.id)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                          title="Save"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={handleCancel}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Cancel"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}

              {/* Add New Task Row */}
              {isAddingNew ? (
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-blue-50"
                >
                  <td className="px-6 py-3">
                    <Circle size={20} className="text-gray-400" />
                  </td>
                  <td className="px-6 py-3">
                    <textarea
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      className="w-full px-2 py-1 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden min-h-[32px]"
                      placeholder="Task title..."
                      autoFocus
                      rows={1}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = target.scrollHeight + 'px';
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAddTask();
                        }
                        if (e.key === 'Escape') handleCancel();
                      }}
                    />
                  </td>
                  <td className="px-6 py-3">
                    <StatusSelect 
                      value={newTask.status} 
                      onChange={(val) => setNewTask({ ...newTask, status: val })} 
                    />
                  </td>
                  <td className="px-6 py-3">
                    <input
                      type="date"
                      value={newTask.due_date}
                      onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={handleAddTask}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                        title="Add"
                      >
                        <Check size={18} />
                      </button>
                      <button
                        onClick={handleCancel}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Cancel"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ) : (
                <tr
                  onClick={() => setIsAddingNew(true)}
                  className="hover:bg-gray-50 cursor-pointer group"
                >
                  <td colSpan={5} className="px-6 py-3 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <Plus size={16} />
                      <span className="group-hover:text-gray-600">Add a task...</span>
                    </div>
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
};
