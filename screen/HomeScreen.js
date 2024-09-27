import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, Button, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [editingTask, setEditingTask] = useState(null);

  // Load tasks from AsyncStorage
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const savedTasks = await AsyncStorage.getItem('tasks');
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const saveTasks = async (tasks) => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error(error);
    }
  };

  const addTask = () => {
    if (!newTask.trim()) {
      Alert.alert('Validation', 'Task description cannot be empty.');
      return;
    }
    const newTasks = [...tasks, { id: Date.now().toString(), text: newTask, completed: false }];
    setTasks(newTasks);
    setNewTask('');
    saveTasks(newTasks);
  };

  const editTask = (task) => {
    setNewTask(task.text);
    setEditingTask(task);
  };

  const updateTask = () => {
    const updatedTasks = tasks.map((task) => (task.id === editingTask.id ? { ...task, text: newTask } : task));
    setTasks(updatedTasks);
    setNewTask('');
    setEditingTask(null);
    saveTasks(updatedTasks);
  };

  const deleteTask = (taskId) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        onPress: () => {
          const remainingTasks = tasks.filter((task) => task.id !== taskId);
          setTasks(remainingTasks);
          saveTasks(remainingTasks);
        },
      },
    ]);
  };

  const markTaskAsCompleted = (taskId) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Todo List</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter new task"
        value={newTask}
        onChangeText={setNewTask}
      />
      <Button
        title={editingTask ? 'Update Task' : 'Add Task'}
        onPress={editingTask ? updateTask : addTask}
      />
      {tasks.length === 0 ? (
        <Text style={styles.noTasks}>No tasks available</Text>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.taskContainer}>
              <TouchableOpacity onPress={() => markTaskAsCompleted(item.id)}>
                <Text style={[styles.taskText, item.completed && styles.completedTask]}>
                  {item.text}
                </Text>
              </TouchableOpacity>
              <Button title="Edit" onPress={() => editTask(item)} />
              <Button title="Delete" color="red" onPress={() => deleteTask(item.id)} />
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  noTasks: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 18,
    color: '#888',
  },
  taskContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
  },
  taskText: {
    fontSize: 18,
  },
  completedTask: {
    textDecorationLine: 'line-through',
    color: 'green',
  },
});
