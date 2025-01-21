import React, { createContext, useEffect, useState,useContext } from 'react';
import { GetUserAPI } from '../api/adminUsers';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await GetUserAPI();
        setUsers(response.data.items);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách người dùng:", error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <UserContext.Provider value={{ users }}>
      {children}
    </UserContext.Provider>
  );
};

const useUsers = () => {
    const { users } = useContext(UserContext);
    
    // Đảm bảo users luôn là một mảng
    return Array.isArray(users) ? users : [];
};

export default useUsers;
