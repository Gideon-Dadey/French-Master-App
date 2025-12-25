import React, { createContext, useState, useContext, useEffect } from 'react';
import { instructorStudentsAPI } from '../services/api';
import { useAuth } from './AuthContext';

const InstructorStudentContext = createContext();

export const useInstructorStudent = () => {
  const context = useContext(InstructorStudentContext);
  if (!context) {
    throw new Error('useInstructorStudent must be used within InstructorStudentProvider');
  }
  return context;
};

export const InstructorStudentProvider = ({ children }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState(null);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {

    if (isAuthenticated && (user?.role === 'instructor' || user?.role === 'admin')) {
      loadStudents();
    } else {

      setStudents([]);
      setLoading(false);
      setPagination(null);
    }
  }, [isAuthenticated, user?.role]);

  const loadStudents = async (params = {}) => {

    if (!isAuthenticated || (user?.role !== 'instructor' && user?.role !== 'admin')) {
      setStudents([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await instructorStudentsAPI.getAll(params);
      setStudents(response.data.data || []);
      setPagination(response.data.pagination || null);
    } catch (error) {

      if (error.response?.status === 401) {
        setStudents([]);
        return;
      }

      console.error('Failed to load instructor students:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const getStudentById = async (studentId) => {
    try {
      const response = await instructorStudentsAPI.getById(studentId);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get student'
      };
    }
  };

  const value = {
    students,
    loading,
    pagination,
    loadStudents,
    getStudentById,
  };

  return <InstructorStudentContext.Provider value={value}>{children}</InstructorStudentContext.Provider>;
};

