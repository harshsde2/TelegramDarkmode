import React from "react";
import { Image } from "react-native";

import users from "./data/users.json";

interface AvatarProps {
  id: string;
  large?: boolean;
}

export const Avatar = ({ id, large }: AvatarProps) => {
  const size = large ? 60 : 40;

  console.log("id =>", id);
  const user = users.find((u) => u.id === id)!;

  // console.log(user);
  return (
    <Image
      source={{ uri: user?.picture }}
      style={{ width: size, height: size, borderRadius: size / 2 }}
    />
  );
};
