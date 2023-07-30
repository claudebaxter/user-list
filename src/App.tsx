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
        const response = await fetch('https://gist.githubusercontent.com/claudebaxter/03ba51b04fe8a04f398bcbd1a0e7d45c/raw/1cd8a6e94d2bf56cc75161fe8a7bdbc9286c1fc6/gistfile1.json');
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Fetch Error:', error);
      }
    }

    fetchUsersData();
  }, []);

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
  }

  function filterUsers(user: User): boolean {
    if (!searchQuery.trim()) {
      return true;
    }

    const query = searchQuery.toLowerCase().trim();

    const isMatch = (
      user.name.toLowerCase().includes(query) ||
      user.id.toLowerCase().includes(query) || 
      user.friends.some((friendId) => {
        const friend = users.find((u) => u.id === friendId);
        return friend ? friend.name.toLowerCase().includes(query) : false;
      })
    );

    return isMatch;
  }

  const MemoizedUser = React.memo(User);

  const filteredUsers = users.filter(filterUsers).map(formatUser);

  return (
    <>
      <input
        className="input"
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search Users..."
      />
    <div className="users-container">
      {filteredUsers.map((user) => (
        <MemoizedUser
          key={user.id}
          user={user}
          onClick={handleUserClick}
          isSelected={selectedUser === user.id}
        />
      ))}
    </div>
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
      
      
      <div className="info">
        <img src={user.image} alt={name} />
        <div className="name-email">
          <p className="name">{name}</p>
          <p>{email}</p>
        </div>
        <p className="rank">Rank: {rank}</p>
        
      </div>

      <div className="friends">
          <p>Friends: {friendNames.join(', ')}</p>
      </div>
    </div>
  );
}