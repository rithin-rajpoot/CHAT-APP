import { useSelector } from "react-redux";
import SendMsg from "../home/SendMsg";
import TopContainer from "../home/TopContainer";

const ClearingChatSkeleton = () => {
  const {selectedUser} = useSelector((state) => state.userReducer);
  return (
    <div className="w-full h-screen flex flex-col">
      <div className="px-2 py-2 border-b border-b-primary/30">
        <TopContainer userDetails={selectedUser} />
      </div>
      <div className="text-center w-full h-screen text-gray-500 mt-4 font-semibold flex items-center justify-center">
          Clearing chat, please wait...
        </div>
      <SendMsg />
    </div>
  );
};

export default ClearingChatSkeleton;
