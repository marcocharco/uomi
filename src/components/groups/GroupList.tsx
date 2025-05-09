"use client";

import React from "react";
import GroupCard from "./GroupCard";
import { GroupsPageProps } from "@/types";

// const groupList = [
//   {
//     id: "Roomates",
//     name: "Roomates",
//     members: [
//       {
//         id: "1",
//         name: "Bob",
//       },
//       {
//         id: "2",
//         name: "Rick",
//       },
//       {
//         id: "3",
//         name: "Jack",
//       },
//       {
//         id: "4",
//         name: "Dave",
//       },
//     ],
//   },
//   {
//     id: "Cottage",
//     name: "Cottage Trip",
//     members: [
//       {
//         id: "1",
//         name: "Bob",
//       },
//     ],
//   },
// ];

const GroupList = ({ groups }: GroupsPageProps) => {
  return (
    <div className="flex w-full flex-col gap-4">
      {groups.map((group) => (
        <GroupCard
          key={group.id}
          $id={group.id}
          name={group.name}
          // members={group.members}
        />
      ))}
    </div>
  );
};

export default GroupList;
