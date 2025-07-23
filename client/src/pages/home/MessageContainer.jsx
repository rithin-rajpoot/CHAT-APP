import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMessagesThunk } from "../../store/slice/message/messageThunk.js";
import Message from "./Message.jsx";
import SendMsg from "./SendMsg.jsx";
import TopContainer from "./TopContainer.jsx";
import MessageSkeleton from "../skeletons/MessageSkeleton.jsx";
import NoChatSelected from "./NoChatSelected.jsx";
import ClearingChatSkeleton from "../skeletons/ClearingChatSkeleton.jsx";
import NoMessages from "../skeletons/NoMessages.jsx";
import { format } from 'date-fns';
import toast from "react-hot-toast";

const MessageContainer = () => {
  const { messages, screenLoading, clearChatLoading } = useSelector(
    (state) => state.messageReducer
  );
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const observerRef = useRef(null);

  const { selectedUser, socket } = useSelector((state) => state.userReducer);
  const dispatch = useDispatch();

  useEffect(() => {
    if (selectedUser?._id) {
      setPage(1);
      setHasMore(true);
      dispatch(getMessagesThunk({ receiverId: selectedUser?._id, page: 1 }))
        .catch(error => {
          toast.error('Failed to load messages');
          console.error('Error loading messages:', error);
        });
    }
  }, [selectedUser?._id]);

  useEffect(() => {
    if (socket) {
      socket.on('typing', ({ senderId }) => {
        if (senderId === selectedUser?._id) {
          setIsTyping(true);
        }
      });

      socket.on('stopTyping', ({ senderId }) => {
        if (senderId === selectedUser?._id) {
          setIsTyping(false);
        }
      });

      return () => {
        socket.off('typing');
        socket.off('stopTyping');
      };
    }
  }, [socket, selectedUser]);

  const loadMoreMessages = async () => {
    if (!hasMore || screenLoading) return;
    try {
      const nextPage = page + 1;
      const response = await dispatch(getMessagesThunk({ 
        receiverId: selectedUser?._id, 
        page: nextPage 
      })).unwrap();

      if (!response?.messages || response.messages.length < 20) {
        setHasMore(false);
      }
      setPage(nextPage);
    } catch (error) {
      toast.error('Failed to load more messages');
      console.error('Error loading more messages:', error);
    }
  };

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 1.0
    };

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreMessages();
      }
    }, options);

    if (messagesEndRef.current) {
      observerRef.current.observe(messagesEndRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, screenLoading]);

  const groupMessagesByDate = (messages) => {
    if (!Array.isArray(messages)) return {};
    
    const groups = {};
    messages.forEach(message => {
      const date = format(new Date(message.createdAt), 'yyyy-MM-dd');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  if (screenLoading) return <MessageSkeleton />;
  if (clearChatLoading) return <ClearingChatSkeleton />;

  const groupedMessages = groupMessagesByDate(messages || []);

  return (
    <>
      {!selectedUser ? (
        <NoChatSelected />
      ) : (
        <div className="w-full h-screen flex flex-col">
          <div className="px-2 py-2 border-b border-b-primary/30 sticky top-0 bg-base-100 z-10">
            <TopContainer userDetails={selectedUser} />
          </div>
          <div className="h-full overflow-y-auto p-3">
            {!messages || messages.length === 0 ? (
              <NoMessages />
            ) : (
              Object.entries(groupedMessages).map(([date, dateMessages]) => (
                <div key={date} className="mb-4">
                  <div className="text-center text-xs text-gray-500 mb-2">
                    {format(new Date(date), 'MMMM d, yyyy')}
                  </div>
                  {dateMessages
                    .filter(
                      (message) =>
                        message?.senderId === selectedUser._id ||
                        message?.receiverId === selectedUser._id
                    )
                    .map((message) => (
                      <Message key={message?._id} messageDetails={message} />
                    ))}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
            {isTyping && (
              <div className="text-xs text-gray-500 italic">
                {selectedUser?.username} is typing...
              </div>
            )}
          </div>
          <SendMsg />
        </div>
      )}
    </>
  );
};

export default MessageContainer;
