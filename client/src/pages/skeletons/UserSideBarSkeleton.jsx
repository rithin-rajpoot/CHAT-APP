import { Users } from "lucide-react";

const UserSideBarSkeleton = () => {
  // Create 8 skeleton items
  const skeletonContacts = Array(8).fill(null);

  return (
    <div
      className="h-full w-full md:max-w-[20rem] border-r border-base-300 
    flex flex-col transition-all duration-200"
    >
      {/* Skeleton Contacts */}
      <div className="overflow-y-auto w-full py-3">
        {skeletonContacts.map((_, idx) => (
          <div key={idx} className="w-full p-3 flex items-center gap-3">
            {/* Avatar skeleton */}
            <div className="relative mx-auto lg:mx-0">
              <div className="skeleton size-12 rounded-full" />
            </div>

            {/* User info skeleton - only visible on larger screens */}
            <div className="text-left min-w-0 flex-1">
              <div className="skeleton h-4 w-full mb-2" />
              <div className="skeleton h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserSideBarSkeleton;