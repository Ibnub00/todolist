'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  deadline: string;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState('');
  const [deadline, setDeadline] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const interval = setInterval(() => {
      const updatedTimes: { [key: string]: string } = {};
      tasks.forEach((task) => {
        updatedTimes[task.id] = calculateTimeRemaining(task.deadline);
      });
      setTimeRemaining(updatedTimes);
    }, 1000);

    return () => clearInterval(interval);
  }, [tasks]);

  const calculateTimeRemaining = (deadline: string) => {
    const now = new Date();
    const end = new Date(deadline);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'Waktu habis!';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hours}j ${minutes}m ${seconds}d`;
  };

  const addTask = () => {
    if (!input || !deadline) return;
    const newTask: Task = {
      id: uuidv4(),
      text: input,
      completed: false,
      deadline: deadline,
    };
    setTasks([...tasks, newTask]);
    setInput('');
    setDeadline('');
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const editTask = (id: string) => {
    const taskToEdit = tasks.find((task) => task.id === id);
    if (taskToEdit) {
      setInput(taskToEdit.text);
      setDeadline(taskToEdit.deadline);
      setEditingId(id);
    }
  };

  const updateTask = () => {
    if (!input || !deadline || !editingId) return;
    setTasks(
      tasks.map((task) =>
        task.id === editingId ? { ...task, text: input, deadline: deadline } : task
      )
    );
    setInput('');
    setDeadline('');
    setEditingId(null);
  };

  const toggleTask = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="bg-zinc-900 rounded-2xl shadow-lg p-8 w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">To-Do List</h1>
          <p className="text-white text-sm">Kelola semua tugas Anda dengan mudah.</p>
        </div>

        <div className="flex flex-col space-y-4">
          <input
            type="text"
            placeholder="Tambah tugas..."
            className="p-2 rounded-lg bg-black text-white border border-yellow-600 placeholder-yellow-600 focus:outline-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <input
            type="datetime-local"
            className="p-2 rounded-lg bg-black text-white border border-yellow-600 placeholder-yellow-600 focus:outline-none"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
          <button
            onClick={editingId ? updateTask : addTask}
            className="p-2 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-white font-semibold transition"
          >
            {editingId ? 'Update Tugas' : 'Tambah Tugas'}
          </button>
        </div>

        <ul className="w-full">
          <AnimatePresence>
            {tasks.map((task) => {
              const timeLeft = calculateTimeRemaining(task.deadline);
              const isExpired = timeLeft === 'Waktu habis!';

              let taskColor = 'bg-yellow-600 text-white'; // default aktif
              if (isExpired) {
                taskColor = 'bg-red-700 text-white'; // deadline lewat
              }
              if (task.completed) {
                taskColor = 'bg-yellow-600 bg-opacity-30 text-white'; // selesai
              }

              return (
                <motion.li
                  key={task.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`flex flex-col justify-between p-3 mb-3 rounded-lg ${taskColor}`}
                >
                  <div className="flex justify-between items-center">
                    <span
                      onClick={() => toggleTask(task.id)}
                      className={`cursor-pointer ${
                        task.completed ? 'line-through' : ''
                      }`}
                    >
                      {task.text}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => editTask(task.id)}
                        className="text-xs bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-xs bg-red-600 hover:bg-red-700 text-white py-1 px-2 rounded"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                  <p className="text-xs mt-1">
                    Deadline: {new Date(task.deadline).toLocaleString()}
                  </p>
                  <p className="text-xs font-semibold">
                    ⏳ {timeRemaining[task.id] || 'Menghitung...'}
                  </p>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      </div>
    </main>
  );
}
