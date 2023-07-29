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

type FormattedUser = User & {
  friendNames: string[];
  highestRankingFriend: string | null;
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

  useEffect(() => {
    console.log('Selected user:', selectedUser);
  }, [selectedUser]);

  function formatUser(user: User): FormattedUser {
    const friendNames = user.friends.map((friendId) => {
      const friend = users.find((u) => u.id === friendId);
      return friend ? friend.name : 'Unknown Friend';
    });
    
    const highestRankingFriend = user.friends.reduce((highestFriendId, friendId) => {
      const friend = users.find((u) => u.id === friendId);
      const highestFriend = users.find((u) => u.id === highestFriendId);
      return (!highestFriendId || (friend && friend.rank > (highestFriend?.rank || -Infinity))) ? friendId : highestFriendId;
    }, '');
    
    return {
      ...user,
      friendNames,
      highestRankingFriend,
    };
  }
  
  function handleUserClick(userId: string) {
    setSelectedUser(userId);
    console.log('User clicked:', userId);
  }

  function filterUsers(user: User): boolean {
    return true;
  }

  const MemoizedUser = React.memo(User);

  const filteredUsers = users.filter(filterUsers).map(formatUser);

  return (
    <>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search by name, ID, or friend's ID"
      />
  
      {filteredUsers.map((user) => (
        <MemoizedUser
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
  user: FormattedUser; 
  onClick: (userId: string) => void;
  isSelected: boolean;
};

function User({ user, onClick, isSelected }: UserProps) {
  const { id, name, email, friendNames, rank } = user;

  return (
    <div onClick={() => onClick(id)} className={`user ${isSelected ? 'selected' : ''}`}>
      <img src={user.image} alt={name} />
      <div>
        <h2>{name}</h2>
        <p>Email: {email}</p>
        <p>Friends: {friendNames.join(', ')}</p>
        <p>Rank: {rank}</p>
      </div>
    </div>
  );
}