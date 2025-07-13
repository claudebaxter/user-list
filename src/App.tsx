import './App.css';
import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';

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

// Move UserProps and User component to the top, and memoize User outside App

type UserProps = {
  user: FormattedUser;
  onClick: (userId: string) => void;
  isSelected: boolean;
};

const User: React.FC<UserProps> = React.memo(function User({ user, onClick, isSelected }) {
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
});

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [visibleCount, setVisibleCount] = useState(25);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function fetchUsersData() {
      try {
        const response = await fetch('https://gist.githubusercontent.com/claudebaxter/d7e9c26e50b1d52f8f25564d18d5ae98/raw/48af1b5274f63fcefd64e8a68610e450d775fa79/users_150.json');
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Fetch Error:', error);
      }
    }
    fetchUsersData();
  }, []);

  // Memoize formatUser to avoid unnecessary recalculations
  const formatUser = useCallback((user: User): FormattedUser => {
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
  }, [users]);

  // Memoize filterUsers for performance
  const filterUsers = useCallback((user: User): boolean => {
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
  }, [searchQuery, users]);

  // Memoize filtered and formatted users
  const filteredUsers = useMemo(() => {
    return users.filter(filterUsers).map(formatUser);
  }, [users, filterUsers, formatUser]);

  // Reset visibleCount when searchQuery changes
  useEffect(() => {
    setVisibleCount(25);
  }, [searchQuery]);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 50) {
        setVisibleCount((prev) => {
          if (prev < filteredUsers.length) {
            return Math.min(prev + 25, filteredUsers.length);
          }
          return prev;
        });
      }
    };
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [filteredUsers.length]);

  const handleUserClick = useCallback((userId: string) => {
    setSelectedUser(userId);
  }, []);

  return (
    <>
      <input
        className="input"
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search Users..."
      />
      <div
        className="users-container"
        ref={containerRef}
        style={{ height: '80vh', overflowY: 'auto' }}
      >
        {filteredUsers.slice(0, visibleCount).map((user) => (
          <User
            key={user.id}
            user={user}
            onClick={handleUserClick}
            isSelected={selectedUser === user.id}
          />
        ))}
        {visibleCount < filteredUsers.length && (
          <div style={{ textAlign: 'center', padding: '1rem', color: '#888' }}>Loading more users...</div>
        )}
      </div>
    </>
  );
}