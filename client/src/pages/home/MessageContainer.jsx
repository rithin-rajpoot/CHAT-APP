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
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
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

  const queryClient = useQueryClient();
  
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
  const [justLoadedOlderMessages, setJustLoadedOlderMessages] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const previousScrollHeight = useRef(0);
  const previousScrollTop = useRef(0);
  const previousLiveMessagesLength = useRef(0);

  const dispatch = useDispatch();

  // Infinite scroll handler
  const handleScroll = useCallback(async () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    // Check if user scrolled to the top (with a small buffer)
    if (container.scrollTop <= 50 && hasNextPage && !isFetchingNextPage) {
      setIsLoadingMore(true);
      setJustLoadedOlderMessages(true);
      // Store current scroll height and position before loading more messages
      previousScrollHeight.current = container.scrollHeight;
      previousScrollTop.current = container.scrollTop;
      
      try {
        await fetchNextPage();
      } finally {
        // Small delay to ensure smooth UX
        setTimeout(() => {
          setIsLoadingMore(false);
          // Reset the flag after a short delay to allow scroll position to settle
          setTimeout(() => {
            setJustLoadedOlderMessages(false);
          }, 100);
        }, 300);
      }
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Maintain scroll position after loading new messages
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container || !previousScrollHeight.current || !justLoadedOlderMessages) return;

    // Calculate new scroll position to maintain user's view
    const newScrollHeight = container.scrollHeight;
    const heightDifference = newScrollHeight - previousScrollHeight.current;
    
    if (heightDifference > 0) {
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        // Maintain the user's position by adding the height difference to their previous scroll position
        container.scrollTop = previousScrollTop.current + heightDifference;
        previousScrollHeight.current = 0; // Reset after adjusting
        previousScrollTop.current = 0; // Reset after adjusting
      });
    }
  }, [allMessages, justLoadedOlderMessages]);

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
    previousLiveMessagesLength.current = 0; // Reset the ref when switching users
  }, [selectedUser?._id]);

  // Scroll to bottom when messages finish loading initially (only for first load, not pagination)
  useEffect(() => {
    if (!isLoading && !isFetchingNextPage && selectedUser && !justLoadedOlderMessages && status === 'success') {
      // Only scroll on initial load, not when loading more messages
      const isInitialLoad = data?.pages?.length === 1; // First page loaded
      if (isInitialLoad) {
        setTimeout(() => {
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "auto" });
          }
        }, 100);
      }
    }
  }, [isLoading, selectedUser?._id, status, data?.pages?.length, justLoadedOlderMessages]);

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

      // Listen for chat cleared event
      socket.on("clearedChat", () => {
        // Clear live messages immediately
        dispatch(resetLiveMessages());
        
        // Reset React Query cache to empty state immediately
        if (selectedUser?._id) {
          queryClient.setQueryData(["messages", selectedUser._id], {
            pages: [{ messages: [], nextCursor: null }],
            pageParams: [null]
          });
          
          // Invalidate to ensure fresh data on next load
          queryClient.invalidateQueries({
            queryKey: ["messages", selectedUser._id]
          });
        }
      });

      return () => {
        socket.off("typing");
        socket.off("stopTyping");
        socket.off("clearedChat");
      };
    }
  }, [socket, selectedUser, queryClient, dispatch]);

  // Scroll to bottom when new live messages arrive or typing state changes
  useEffect(() => {
    if (messagesEndRef.current && !isLoadingMore && !justLoadedOlderMessages) {
      const container = messagesContainerRef.current;
      if (container) {
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
        
        // Check if new live messages were actually added (not just existing ones)
        const hasNewLiveMessages = liveMessages.length > previousLiveMessagesLength.current;
        const latestMessage = liveMessages[liveMessages.length - 1];
        const isOwnMessage = hasNewLiveMessages && latestMessage && latestMessage.senderId === userProfile?._id;
        
        // Always scroll for own messages, or scroll for received messages only if near bottom
        if (isOwnMessage || (isNearBottom && hasNewLiveMessages) || isTyping) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
        
        // Update the previous length
        previousLiveMessagesLength.current = liveMessages.length;
      }
    } else {
      // Still update the ref even when not scrolling to keep it in sync
      previousLiveMessagesLength.current = liveMessages.length;
    }
  }, [liveMessages, isTyping, isLoadingMore, justLoadedOlderMessages, userProfile?._id]);

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
        <div className="w-full h-full flex flex-col">
          <div className="px-2 py-2 border-b border-b-primary/30 bg-base-100 z-10">
            <TopContainer userDetails={selectedUser} />
          </div>
          <div
            ref={messagesContainerRef}
            className={`overflow-y-auto p-3 transition-all duration-300 ease-in-out relative h-full ${
              isTyping ? "pb-6" : "pb-3"
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
