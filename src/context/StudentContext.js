import React, { createContext, useState, useContext, useEffect } from 'react';
import { studentsAPI } from '../services/api';
import { useAuth } from './AuthContext';

const StudentContext = createContext();

export const useStudent = () => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudent must be used within StudentProvider');
  }
  return context;
};

export const StudentProvider = ({ children }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState(null);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {

    if (isAuthenticated && user?.role === 'admin') {
      loadStudents();
    } else {

      setStudents([]);
      setLoading(false);
      setPagination(null);
    }
  }, [isAuthenticated, user?.role]);

  const loadStudents = async (params = {}) => {

    if (!isAuthenticated || user?.role !== 'admin') {
      setStudents([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await studentsAPI.getAll(params);
      setStudents(response.data.data || []);
      setPagination(response.data.pagination || null);
    } catch (error) {

      if (error.response?.status === 401) {
        setStudents([]);
        return;
      }

      console.error('Failed to load students:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const getStudentById = async (studentId) => {
    try {
      const response = await studentsAPI.getById(studentId);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get student'
      };
    }
  };

  const updateStudent = async (studentId, data) => {
    try {
      const response = await studentsAPI.update(studentId, data);

      await loadStudents();
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update student'
      };
    }
  };

  const deleteStudent = async (studentId) => {
    try {
      await studentsAPI.delete(studentId);

      await loadStudents();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete student'
      };
    }
  };

  const value = {
    students,
    loading,
    pagination,
    loadStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
  };

  return <StudentContext.Provider value={value}>{children}</StudentContext.Provider>;
};

