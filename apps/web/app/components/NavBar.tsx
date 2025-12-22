"use client";
import React, { useEffect, useRef, useState } from "react";
import InputBox from "./InputBox";
import Button from "./Button";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { useRouter } from "next/navigation";
import Logo from "./Logo";

const NavBar = () => {
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [isJoinRoomOpen, setIsJoinRoomOpen] = useState(false);
  const [isMeOpen, setIsMeOpen] = useState(false);
  const [roomName, setRoomName] = useState("");
  const createRoomRef = useRef<HTMLDivElement | null>(null);
  const joinRoomRef = useRef<HTMLDivElement | null>(null);
  const meRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  //MUST access localStorage inside useEffect, or store it into state
  const [token, setToken] = useState("");
  const [name, setName] = useState("");
  useEffect(() => {
    setToken(localStorage.getItem("token") || "");
    setName(localStorage.getItem("name") || "");

    // Listen for login/logout events to update state instantly
    const handleStorageUpdate = () => {
      setToken(localStorage.getItem("token") || "");
      setName(localStorage.getItem("name") || "");
    };

    window.addEventListener("login", handleStorageUpdate);
    window.addEventListener("logout", handleStorageUpdate);

    return () => {
      window.removeEventListener("login", handleStorageUpdate);
      window.removeEventListener("logout", handleStorageUpdate);
    };
  }, []);

  // close popup window if clicked outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        isCreateRoomOpen &&
        createRoomRef.current &&
        !createRoomRef.current.contains(e.target as Node)
      ) {
        setIsCreateRoomOpen(false);
      }
      if (
        joinRoomRef &&
        joinRoomRef.current &&
        !joinRoomRef.current.contains(e.target as Node)
      ) {
        setIsJoinRoomOpen(false);
      }

      if (
        isMeOpen &&
        meRef.current &&
        !meRef.current.contains(e.target as Node)
      ) {
        setIsMeOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isCreateRoomOpen, isJoinRoomOpen, isMeOpen]);

  // logic for creating room using room_name
  const handleCreateRoom = async () => {
    console.log(token);
    const final = `Bearer ${token}`;
    console.log("final", final);
    console.log(roomName);
    try {
      const res = await axios.post(
        `${BACKEND_URL}/room`,
        { name: roomName },
        {
          headers: {
            Authorization: final,
          },
        }
      );
      console.log("room is created", res.data);
      setIsCreateRoomOpen(false);
      setRoomName("");
    } catch (error) {
      console.log("error while creating room: ", error);
    }
  };
  // logic for creating room using room_name
  const handleJoinRoom = async () => {
    console.log(token);
    const final = `Bearer ${token}`;
    console.log("final", final);
    console.log(roomName);
    try {
      const res = await axios.get(`${BACKEND_URL}/room/${roomName}`);
      console.log("room is fetched successfully:", res.data);
      setIsJoinRoomOpen(false);
      setRoomName("");
      console.log("room id:", res.data.room.id);
      router.push(`/room/${res.data.room.id}`);
    } catch (error) {
      console.log("error while fetching room id: ", error);
    }
  };

  // handle logout functionality
  const handleLogout = () => {
    localStorage.clear();
    setToken("");
    setName("");
    router.push("/");
    window.dispatchEvent(new Event("logout")); // notify other components if needed
  };

  return (
    <>
      <div className="bg-[var(--color-tertiary)] px-8 py-3 shadow-xl sticky flex justify-between">
        <Logo />
        <div className="flex justify-between items-center gap-8 font-semibold">
          {/* create room  */}
          <div className="relative">
            <span
              className="cursor-pointer hover:scale-105 transition duration-150 ease-in-out"
              onClick={() => {
                setIsCreateRoomOpen(!isCreateRoomOpen);
                setIsJoinRoomOpen(false);
                setIsMeOpen(false);
              }}
            >
              Create Room
            </span>
            {isCreateRoomOpen && (
              <div
                ref={createRoomRef}
                className="absolute right-20 top-15 p-4 bg-gray-200 shadow-xl rounded-xl  z-50"
              >
                {/* TODO: USE RECOIL STATE MGMT */}
                {token ? (
                  <div className="p-5 flex flex-col flex-start gap-5 justify-between items-center ">
                    <InputBox
                      label="Enter Room Name"
                      type="text"
                      placeholder="room_name"
                      onchange={(e) => setRoomName(e.target.value)}
                    />
                    <div className="flex gap-10 ">
                      <Button
                        label="Submit"
                        onclick={handleCreateRoom}
                        type="secondary"
                      ></Button>
                      <button
                        className="text-gray font-bold bg-red-300 px-4 py-2 rounded-lg transition duration-150 hover:scale-105"
                        onClick={() => setIsCreateRoomOpen(false)}
                      >
                        close
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    className="px-3 py-2 cursor-pointer transition duration-150 ease-in-out hover:scale-105 "
                    onClick={() => {
                      router.push("/signin");
                      setIsCreateRoomOpen(false);
                    }}
                  >
                    Please Signin
                  </button>
                )}
              </div>
            )}
          </div>

          {/* join room  */}
          <div className="relative">
            <span
              className="cursor-pointer hover:scale-105 transition duration-150 ease-in-out"
              onClick={() => {
                setIsJoinRoomOpen(!isJoinRoomOpen);
                setIsCreateRoomOpen(false);
                setIsMeOpen(false);
              }}
            >
              Join Room
            </span>
            {isJoinRoomOpen && (
              <div
                ref={joinRoomRef}
                className="absolute right-20 top-15 p-4 bg-gray-200 shadow-xl rounded-xl  z-50"
              >
                {/* TODO: USE RECOIL STATE MGMT */}
                {token ? (
                  <div className="p-5 flex flex-col flex-start gap-5 justify-between items-center ">
                    <InputBox
                      label="Enter Room Name"
                      type="text"
                      placeholder="room_name"
                      onchange={(e) => setRoomName(e.target.value)}
                    />
                    <div className="flex gap-10 ">
                      <Button
                        label="Submit"
                        onclick={handleJoinRoom}
                        type="secondary"
                      ></Button>
                      <button
                        className="text-gray font-bold bg-red-300 px-4 py-2 rounded-lg transition duration-150 hover:scale-105"
                        onClick={() => setIsJoinRoomOpen(false)}
                      >
                        close
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    className="px-3 py-2 cursor-pointer transition duration-150 ease-in-out hover:scale-105 "
                    onClick={() => {
                      router.push("/signin");
                      setIsJoinRoomOpen(false);
                    }}
                  >
                    Please Signin
                  </button>
                )}
              </div>
            )}
          </div>

          {/* me secion  */}
          <div className="relative">
            <span
              className="cursor-pointer"
              onClick={() => {
                setIsMeOpen(!isMeOpen);
                setIsCreateRoomOpen(false);
                setIsJoinRoomOpen(false);
              }}
            >
              {token ? (
                <span>{name || "Me"}</span>
              ) : (
                <div className="">
                  <span className="mr-3" onClick={() => router.push("/signin")}>
                    Signin
                  </span>
                  <span onClick={() => router.push("/signup")}>Signup</span>
                </div>
              )}
            </span>
            {isMeOpen && token && (
              <div
                ref={meRef}
                className="absolute p-3 right-0 top-10 bg-white shadow-xl rounded-xl p-4 z-50"
              >
                <div className="flex flex-col gap-3">
                  {localStorage.getItem("token") && (
                    <button
                      className="text-red-500 px-5 py-2 cursor-pointer hover:scale-105"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default NavBar;
