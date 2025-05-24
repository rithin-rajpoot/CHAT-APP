import { MessageSquare } from "lucide-react";

const NoMessages = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 px-4">
      <MessageSquare className="w-12 h-12 mb-4 text-primary" />
      <h2 className="text-xl font-semibold">No messages yet</h2>
      <p className="mt-2 text-sm">Start the conversation by sending a message!</p>
    </div>
  );
};

export default NoMessages;
