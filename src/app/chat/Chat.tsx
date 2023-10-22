"use client";

import { isomorphicClient } from "@/lib/utils/isomorphic.client";
import ChatInput from "./ChatInput";
import ChatMessages, { Message } from "./ChatMessages";

const messages: Message[] = [
  { sender: "user", text: "Hello, AI. How are you today?" },
  {
    sender: "system",
    text: "I'm just a computer program, so I don't have feelings, but I'm here to help. How can I assist you?",
  },
  {
    sender: "user",
    text: "I have a question about programming. Can you explain the concept of object-oriented programming (OOP)?",
  },
  {
    sender: "system",
    text: "Certainly! Object-oriented programming (OOP) is a programming paradigm that organizes data and behavior into objects. It's based on the idea of modeling real-world entities as objects, each of which has attributes (data) and methods (functions). OOP promotes concepts like encapsulation, inheritance, and polymorphism to create modular and reusable code.",
  },
  {
    sender: "user",
    text: "Can you give an example of an object and how OOP works in a programming language?",
  },
  {
    sender: "system",
    text: "Sure! Let's take a simple example in JavaScript. Suppose we have a 'Car' class. Each car object can have attributes like 'make,' 'model,' and 'year.' Methods can include 'startEngine' and 'stopEngine.' You can create instances of the 'Car' class, set their attributes, and call methods to interact with them. OOP helps in organizing and reusing code by defining and working with these objects.",
  },
  {
    sender: "user",
    text: "Thanks for the explanation. It makes more sense now!",
  },
  {
    sender: "system",
    text: "You're welcome! If you have more questions or need help with anything else, feel free to ask.",
  },
];

export default function Chat() {
  const [isOpen] = isomorphicClient.useValue("isSidebarOpen");

  return (
    <div className="relative w-full">
      <ChatMessages messages={messages} />

      <div
        className={`fixed bottom-4 left-[calc(50%-16px)] w-[90%] -translate-x-1/2 transition-all duration-300 ${
          isOpen ? "sm:ml-[150px] ml-0" : "ml-0"
        }`}
      >
        <ChatInput />
      </div>
    </div>
  );
}
