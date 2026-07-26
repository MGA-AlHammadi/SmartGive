import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import messageService from '../services/messageService';
import { useSocket } from '../context/SocketContext';

const Messages = () => {
    const location = useLocation();
    const socket = useSocket();
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    const currentUser = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        loadConversations();
        if (location.state?.startWith) {
            const startUser = location.state.startWith;
            setSelectedConversation({
                other_user_id: startUser.id,
                other_username: startUser.username,
                other_company_name: startUser.company_name,
                other_is_company: startUser.is_company
            });
        }
    }, [location.state]);

    useEffect(() => {
        if (selectedConversation) {
            loadMessages(selectedConversation.other_user_id);
        }
    }, [selectedConversation]);

    // Socket Listener für neue Nachrichten
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (msg) => {
            // Wenn die Nachricht zum aktuellen Chat gehört
            if (selectedConversation && 
                (msg.sender_id === selectedConversation.other_user_id || 
                 msg.receiver_id === selectedConversation.other_user_id)) {
                
                // Verhindere Duplikate, falls gerade gesendet wurde
                setMessages(prev => {
                    const exists = prev.find(m => m.id === msg.id);
                    return exists ? prev : [...prev, msg];
                });
            }
            // Konversationsliste immer aktualisieren für die Vorschau
            loadConversations();
        };

        socket.on('new_message', handleNewMessage);
        return () => socket.off('new_message');
    }, [socket, selectedConversation]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadConversations = async () => {
        try {
            const data = await messageService.getConversations();
            setConversations(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const loadMessages = async (otherUserId) => {
        try {
            const data = await messageService.getMessageHistory(otherUserId);
            setMessages(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConversation) return;

        try {
            const sentMsg = await messageService.sendMessage(selectedConversation.other_user_id, newMessage);
            setNewMessage('');
            // Wir fügen die gesendete Nachricht direkt hinzu für sofortiges Feedback
            setMessages(prev => [...prev, sentMsg]);
            loadConversations();
        } catch (err) {
            console.error(err);
        }
    };

    const handleUserSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.trim().length >= 1) {
            try {
                const results = await messageService.searchUsers(query);
                setSearchResults(results.filter(u => u.id !== currentUser.id));
            } catch (err) {
                console.error('Suchfehler:', err);
            }
        } else {
            setSearchResults([]);
        }
    };

    const startNewConversation = (user) => {
        const existing = conversations.find(c => c.other_user_id === user.id);
        if (existing) {
            setSelectedConversation(existing);
        } else {
            setSelectedConversation({
                other_user_id: user.id,
                other_username: user.username,
                other_company_name: user.company_name,
                other_is_company: user.is_company
            });
            setMessages([]);
        }
        setSearchQuery('');
        setSearchResults([]);
    };

    if (loading) return <div className="text-center p-10">Lade Nachrichten...</div>;

    return (
        <div className="container mx-auto p-4 flex flex-col md:flex-row h-[calc(100vh-100px)] gap-4">
            {/* Conversations Sidebar */}
            <div className="w-full md:w-1/3 bg-white shadow rounded-lg flex flex-col">
                <div className="p-4 border-b">
                    <h2 className="text-xl font-bold mb-4">Nachrichten</h2>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Suchen nach NGO oder Spender..."
                            className="w-full p-2 border rounded"
                            value={searchQuery}
                            onChange={handleUserSearch}
                        />
                        {searchResults.length > 0 && (
                            <div className="absolute z-10 w-full bg-white border mt-1 shadow-lg max-h-60 overflow-y-auto">
                                {searchResults.map(user => (
                                    <div
                                        key={user.id}
                                        className="p-3 hover:bg-gray-100 cursor-pointer border-b"
                                        onClick={() => startNewConversation(user)}
                                    >
                                        <div className="font-bold">{user.company_name || `${user.first_name} ${user.last_name}`}</div>
                                        <div className="text-sm text-gray-500">@{user.username} - {user.is_company ? 'NGO' : 'Spender'}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                        <p className="p-4 text-center text-gray-500">Noch keine Gespräche.</p>
                    ) : (
                        conversations.map(conv => (
                            <div
                                key={conv.other_user_id}
                                className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${selectedConversation?.other_user_id === conv.other_user_id ? 'bg-blue-50' : ''}`}
                                onClick={() => setSelectedConversation(conv)}
                            >
                                <div className="font-bold">{conv.other_company_name || conv.other_username}</div>
                                <div className="text-sm text-gray-600 truncate">{conv.content}</div>
                                <div className="text-xs text-gray-400 text-right">{new Date(conv.created_at).toLocaleString()}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Window */}
            <div className="w-full md:w-2/3 bg-white shadow rounded-lg flex flex-col">
                {selectedConversation ? (
                    <>
                        <div className="p-4 border-b bg-gray-50 rounded-t-lg">
                            <h3 className="font-bold">{selectedConversation.other_company_name || selectedConversation.other_username}</h3>
                            <span className="text-xs text-gray-500">{selectedConversation.other_is_company ? 'NGO' : 'Spender'}</span>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto bg-gray-100">
                            {messages.map((m, idx) => {
                                const isMe = m.sender_id === currentUser.id;
                                return (
                                    <div key={idx} className={`mb-4 flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] p-3 rounded-lg shadow-sm ${isMe ? 'bg-blue-600 text-white' : 'bg-white text-gray-800'}`}>
                                            <p>{m.content}</p>
                                            <div className={`text-[10px] mt-1 ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                                                {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                        <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
                            <input
                                type="text"
                                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Nachricht schreiben..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                            >
                                Senden
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500 flex-col gap-2">
                        <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        <p>Wähle einen Kontakt aus, um eine Unterhaltung zu beginnen.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messages;