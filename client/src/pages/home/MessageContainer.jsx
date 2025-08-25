import { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import Message from "./Message.jsx";
import SendMsg from "./SendMsg.jsx";
import TopContainer from "./TopContainer.jsx";
import MessageSkeleton from "../skeletons/MessageSkeleton.jsx";
import NoChatSelected from "./NoChatSelected.jsx";
import ClearingChatSkeleton from "../skeletons/ClearingChatSkeleton.jsx";
import NoMessages from "../skeletons/NoMessages.jsx";
import { format } from "date-fns";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchMessages } from "../../api/messageApi.js";
import { resetLiveMessages } from "../../store/slice/message/messageSlice.js";

const MessageContainer = () => {
  const { selectedUser, userProfile } = useSelector(
    (state) => state.userReducer
  );
  const { socket } = useSelector((state) => state.socketReducer);
  const { liveMessages, screenLoading, clearChatLoading } = useSelector(
    (state) => state.messageReducer
  );

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status, error, isLoading, isError } =
    useInfiniteQuery({
      queryKey: ["messages", selectedUser?._id],
      queryFn: ({ pageParam = null }) =>
        fetchMessages({ receiverId: selectedUser?._id, cursor: pageParam }),
      enabled: !!selectedUser?._id,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    });

  // Replace Redux messages with data from React Query:
  // Note: Server sends messages in descending order (newest first) for pagination,
  // We need to reverse each page and then reverse the pages order for correct display
  const allPages = data?.pages || [];
  const oldMessages = allPages
    .slice()
    .reverse() // Reverse page order (oldest pages first)
    .flatMap((page) => page.messages.slice().reverse()) // Reverse messages in each page (oldest first)
    ?? [];

  const allMessages = [...oldMessages, ...liveMessages];
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const previousScrollHeight = useRef(0);

  const dispatch = useDispatch();

  // Infinite scroll handler
  const handleScroll = useCallback(async () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    // Check if user scrolled to the top (with a small buffer)
    if (container.scrollTop <= 50 && hasNextPage && !isFetchingNextPage) {
      setIsLoadingMore(true);
      // Store current scroll height before loading more messages
      previousScrollHeight.current = container.scrollHeight;
      
      try {
        await fetchNextPage();
      } finally {
        // Small delay to ensure smooth UX
        setTimeout(() => {
          setIsLoadingMore(false);
        }, 300);
      }
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Maintain scroll position after loading new messages
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container || !previousScrollHeight.current) return;

    // Calculate new scroll position to maintain user's view
    const newScrollHeight = container.scrollHeight;
    const heightDifference = newScrollHeight - previousScrollHeight.current;
    
    if (heightDifference > 0) {
      container.scrollTop = heightDifference;
      previousScrollHeight.current = 0; // Reset after adjusting
    }
  }, [allMessages]);

  // Add scroll event listener
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Clear live messages when switching chat:
  useEffect(() => {
    dispatch(resetLiveMessages());
    // Scroll to bottom when switching to a new chat
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "auto" });
      }
    }, 100);
  }, [selectedUser?._id]);

  useEffect(() => {
    if (socket) {
      socket.on("typing", ({ senderId }) => {
        if (senderId === selectedUser?._id) {
          setIsTyping(true);
        }
      });

      socket.on("stopTyping", ({ senderId }) => {
        if (senderId === selectedUser?._id) {
          setIsTyping(false);
        }
      });

      return () => {
        socket.off("typing");
        socket.off("stopTyping");
      };
    }
  }, [socket, selectedUser]);

  // Scroll to bottom when new live messages arrive or typing state changes
  useEffect(() => {
    if (messagesEndRef.current && !isLoadingMore) {
      // Only auto-scroll if user is near the bottom (to avoid interrupting reading older messages)
      const container = messagesContainerRef.current;
      if (container) {
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
        if (isNearBottom || liveMessages.length > 0) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  }, [liveMessages, isTyping, isLoadingMore]);

  // Centralized typing functions to pass down to SendMsg
  const handleTyping = () => {
    if (socket && selectedUser && userProfile) {
      socket.emit("typing", {
        senderId: userProfile._id,
        receiverId: selectedUser._id,
      });
    }
  };

  const handleStopTyping = () => {
    if (socket && selectedUser && userProfile) {
      socket.emit("stopTyping", {
        senderId: userProfile._id,
        receiverId: selectedUser._id,
      });
    }
  };

  const groupMessagesByDate = (allMessages) => {
    if (!Array.isArray(allMessages)) return {};

    const groups = {};
    allMessages.forEach((message) => {
      const date = format(new Date(message.createdAt), "yyyy-MM-dd");
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  if (screenLoading || isLoading) return <MessageSkeleton />;
  if (clearChatLoading) return <ClearingChatSkeleton />;
  if (isError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-red-500 mb-2">Failed to load messages</div>
          <div className="text-sm text-gray-500">{error?.message}</div>
        </div>
      </div>
    );
  }

  const groupedMessages = groupMessagesByDate(allMessages || []);

  return (
    <>
      {!selectedUser ? (
        <NoChatSelected />
      ) : (
        <div className="w-full h-full flex flex-col pb-10">
          <div className="px-2 py-2 border-b border-b-primary/30 sticky top-0 bg-base-100 z-10">
            <TopContainer userDetails={selectedUser} />
          </div>
          <div
            ref={messagesContainerRef}
            className={`overflow-y-auto p-3 transition-all duration-300 ease-in-out relative ${
              isTyping ? "h-[calc(100%-2rem)] pb-6" : "h-full pb-3"
            }`}
          >
            {/* Sticky loading overlay at the top */}
            {(isFetchingNextPage || isLoadingMore) && (
              <div className="sticky top-0 z-20 bg-gradient-to-b from-base-100 via-base-100/95 to-transparent pb-2 mb-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-lg mx-2 animate-pulse">
                  <div className="loading loading-spinner loading-sm text-primary"></div>
                  <span className="text-sm font-medium text-primary">Loading older messages...</span>
                </div>
              </div>
            )}
            
            {/* No more messages indicator */}
            {!hasNextPage && allMessages && allMessages.length > 0 && (
              <div className="flex justify-center py-2">
                <div className="text-xs text-gray-500 italic">
                  No more messages
                </div>
              </div>
            )}
            
            {!allMessages || allMessages.length === 0 ? (
              <NoMessages />
            ) : (
              Object.entries(groupedMessages).map(([date, dateMessages]) => (
                <div key={date} className="mb-4">
                  <div className="text-center text-xs text-gray-500 mb-2">
                    {format(new Date(date), "MMMM d, yyyy")}
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
            {isTyping && (
              <div className="text-xs text-gray-500 italic animate-pulse flex gap-2 mb-2 items-center">
                <div className="chat-image avatar">
                  <div className="w-10 rounded-full">
                    <img
                      alt="Tailwind CSS chat bubble component"
                      src={selectedUser.avatar || "/avatar.png"}
                    />
                  </div>
                </div>
                {selectedUser?.fullName} is typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <SendMsg onTyping={handleTyping} onStopTyping={handleStopTyping} />
        </div>
      )}
    </>
  );
};

export default MessageContainer;
