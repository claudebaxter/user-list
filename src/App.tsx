import './App.css';
import React, { useEffect, useState } from 'react';

type User = {
  id: string;
  rank: number;
  name: string;
  email: string;
  friends: string[];
  image: string;
};

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    async function fetchUsersData() {
      try {
        const response = await fetch('https://gist.githubusercontent.com/claudebaxter/03ba51b04fe8a04f398bcbd1a0e7d45c/raw/36af91bea6013d7029b2b27a952b63c4591de16c/gistfile1.json');
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Fetch Error:', error);
      }
    }

    fetchUsersData();
  }, []);

  function handleUserClick(userId: string) {
    setSelectedUser(userId);
  }

  function filterUsers(user: User): boolean {
    return true;
  }

  const filteredUsers = users.filter(filterUsers);

  return (
    <>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search by name, ID, or friend's ID"
      />

      {filteredUsers.map((user) => (
        <User
          key={user.id}
          user={user}
          onClick={handleUserClick}
          isSelected={selectedUser === user.id}
        />
      ))}
    </>
  );
}

type UserProps = {
  user: User;
  onClick: (userId: string) => void;
  isSelected: boolean;
};

function User({ user, onClick, isSelected }: UserProps) {
  const { id, rank, name, email, friends, image } = user;

  return (
    <div onClick={() => onClick(id)} className={`user ${isSelected ? 'selected' : ''}`}>
      <img src={image} alt={name} />
      <div>
        <h2>{name}</h2>
        <p>Email: {email}</p>
      </div>
    </div>
  );
}