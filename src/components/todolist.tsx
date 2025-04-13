'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../app/lib/firebase';

type Task = {
  id: string;
  text: string;
  completed: boolean;
  deadline: string;
};

export default function TodoList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<{ [key: string]: string }>(
    {}
  );

  useEffect(() => {
    const fetchTasks = async () => {
      const querySnapshot = await getDocs(collection(db, 'tasks'));
      const tasksData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Task[];
      setTasks(tasksData);
    };
    fetchTasks();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const newTimeRemaining: { [key: string]: string } = {};
      tasks.forEach((task) => {
        newTimeRemaining[task.id] = calculateTimeRemaining(task.deadline);
      });
      setTimeRemaining(newTimeRemaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [tasks]);

  const calculateTimeRemaining = (deadline: string): string => {
    const deadlineTime = new Date(deadline).getTime();
    const now = new Date().getTime();
    const difference = deadlineTime - now;

    if (difference <= 0) return 'Waktu habis!';

    const hours = Math.floor(difference / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return `${hours}j ${minutes}m ${seconds}d`;
  };

  const addTask = async (): Promise<void> => {
    const { value: formValues } = await Swal.fire({
      title: 'Tambahkan tugas baru',
      html:
        '<input id="swal-input1" class="swal2-input" placeholder="Nama tugas">' +
        '<input id="swal-input2" type="datetime-local" class="swal2-input">',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Tambah',
      cancelButtonText: 'Batal',
      preConfirm: () => {
        return [
          (document.getElementById('swal-input1') as HTMLInputElement)?.value,
          (document.getElementById('swal-input2') as HTMLInputElement)?.value,
        ];
      },
    });

    if (formValues && formValues[0] && formValues[1]) {
      const newTask: Omit<Task, 'id'> = {
        text: formValues[0],
        completed: false,
        deadline: formValues[1],
      };
      const docRef = await addDoc(collection(db, 'tasks'), newTask);
      setTasks([...tasks, { id: docRef.id, ...newTask }]);
    }
  };

  const toggleTask = async (id: string): Promise<void> => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    const taskRef = doc(db, 'tasks', id);
    await updateDoc(taskRef, {
      completed: updatedTasks.find((task) => task.id === id)?.completed,
    });
  };

  const deleteTask = async (id: string): Promise<void> => {
    await deleteDoc(doc(db, 'tasks', id));
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const editTask = async (id: string): Promise<void> => {
    const taskToEdit = tasks.find((task) => task.id === id);
    if (!taskToEdit) return;

    const { value: newText } = await Swal.fire({
      title: 'Edit Tugas',
      input: 'text',
      inputLabel: 'Tugas',
      inputValue: taskToEdit.text,
      showCancelButton: true,
      confirmButtonText: 'Simpan',
      cancelButtonText: 'Batal',
    });

    if (newText) {
      const updatedTasks = tasks.map((task) =>
        task.id === id ? { ...task, text: newText } : task
      );
      setTasks(updatedTasks);
      const taskRef = doc(db, 'tasks', id);
      await updateDoc(taskRef, { text: newText });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center py-10">
      <div className="bg-gray-900 border border-gray-700 p-8 rounded-lg w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-2 text-white text-center">To-Do List</h1>
        <p className="text-sm text-white mb-6 text-center">
          Kelola semua tugas Anda menjadi sangat mudah.
        </p>

        <div className="flex justify-center mb-6">
          <button
            onClick={addTask}
            className="bg-yellow-600 hover:bg-yellow-500 text-white font-semibold py-2 px-4 rounded-lg"
          >
            Tambah Tugas
          </button>
        </div>

        <ul className="w-full">
          <AnimatePresence>
            {tasks.map((task) => {
              const timeLeft = calculateTimeRemaining(task.deadline);
              const isExpired = timeLeft === 'Waktu habis!';

              let taskColor = 'bg-yellow-600 text-white'; // default kuning (seperti tombol edit lama)
              if (isExpired) {
                taskColor = 'bg-red-700 text-white'; // deadline lewat merah gelap
              }
              if (task.completed) {
                taskColor = 'bg-yellow-400 bg-opacity-60 text-white'; // selesai -> kuning cerah transparan
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
                        className="text-xs bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-1 px-2 rounded"
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
    </div>
  );
}
